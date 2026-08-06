begin;

-- Inventory rows may represent more than one interchangeable unit. The former
-- partial unique index allowed only one active loan regardless of quantity.
drop index if exists public.inventory_loans_one_active_per_item_uidx;

create index if not exists inventory_loans_item_status_idx
  on public.inventory_loans(item_id, status);

create or replace function public.borrow_inventory_item(
  p_item_id uuid,
  p_idempotency_key uuid,
  p_due_date timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_item public.inventory_items%rowtype;
  v_member_id uuid;
  v_existing jsonb;
  v_active_count integer;
  v_loan_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(v_user_id::text || p_idempotency_key::text || 'borrow_inventory_item', 0)
  );

  select result into v_existing
  from private.idempotency_operations
  where user_id = v_user_id
    and idempotency_key = p_idempotency_key
    and operation = 'borrow_inventory_item';

  if v_existing is not null then
    return (v_existing ->> 'loan_id')::uuid;
  end if;

  select * into v_item
  from public.inventory_items
  where id = p_item_id
  for update;

  if not found then
    raise exception 'Barang tidak ditemukan';
  end if;

  v_member_id := private.current_member_id(v_item.school_id);
  if v_member_id is null then
    raise exception 'Keanggotaan aktif diperlukan';
  end if;

  if v_item.condition in ('damaged', 'retired') then
    raise exception 'Barang sedang tidak tersedia';
  end if;

  select count(*)::integer into v_active_count
  from public.inventory_loans
  where item_id = p_item_id and status = 'active';

  if v_active_count >= v_item.quantity then
    raise exception 'Barang sedang tidak tersedia';
  end if;

  insert into public.inventory_loans (
    school_id, item_id, borrower_id, status, due_date
  ) values (
    v_item.school_id, p_item_id, v_member_id, 'active', p_due_date
  ) returning id into v_loan_id;

  update public.inventory_items
  set is_available = (v_active_count + 1) < quantity,
      updated_at = now()
  where id = p_item_id;

  insert into private.idempotency_operations (
    user_id, idempotency_key, operation, school_id, result
  ) values (
    v_user_id,
    p_idempotency_key,
    'borrow_inventory_item',
    v_item.school_id,
    jsonb_build_object('loan_id', v_loan_id)
  );

  insert into public.audit_events (
    school_id, actor_id, event_type, entity_type, entity_id, metadata
  ) values (
    v_item.school_id,
    v_user_id,
    'inventory.borrowed',
    'inventory_loan',
    v_loan_id::text,
    jsonb_build_object('item_id', p_item_id)
  );

  return v_loan_id;
end;
$$;

create or replace function public.return_inventory_item(p_loan_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_loan public.inventory_loans%rowtype;
  v_member_id uuid;
  v_active_count integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select * into v_loan
  from public.inventory_loans
  where id = p_loan_id
  for update;

  if not found then
    raise exception 'Peminjaman tidak ditemukan';
  end if;

  perform 1 from public.inventory_items where id = v_loan.item_id for update;

  v_member_id := private.current_member_id(v_loan.school_id);
  if v_member_id is null then
    raise exception 'Keanggotaan aktif diperlukan';
  end if;

  if v_loan.borrower_id <> v_member_id
     and not private.has_school_role(
       v_loan.school_id,
       array['owner','admin']::public.school_role[]
     ) then
    raise exception 'Tidak memiliki izin mengembalikan peminjaman ini';
  end if;

  if v_loan.status <> 'active' then
    return;
  end if;

  update public.inventory_loans
  set status = 'returned', returned_at = now(), updated_at = now()
  where id = p_loan_id;

  select count(*)::integer into v_active_count
  from public.inventory_loans
  where item_id = v_loan.item_id and status = 'active';

  update public.inventory_items
  set is_available = condition not in ('damaged', 'retired') and v_active_count < quantity,
      updated_at = now()
  where id = v_loan.item_id;

  insert into public.audit_events (
    school_id, actor_id, event_type, entity_type, entity_id, metadata
  ) values (
    v_loan.school_id,
    v_user_id,
    'inventory.returned',
    'inventory_loan',
    p_loan_id::text,
    jsonb_build_object('item_id', v_loan.item_id)
  );
end;
$$;

revoke all on function public.borrow_inventory_item(uuid, uuid, timestamptz) from public, anon;
grant execute on function public.borrow_inventory_item(uuid, uuid, timestamptz) to authenticated;
revoke all on function public.return_inventory_item(uuid) from public, anon;
grant execute on function public.return_inventory_item(uuid) to authenticated;

commit;
