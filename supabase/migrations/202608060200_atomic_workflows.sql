begin;

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

  if not v_item.is_available
     or exists (
       select 1 from public.inventory_loans
       where item_id = p_item_id and status = 'active'
     ) then
    raise exception 'Barang sedang tidak tersedia';
  end if;

  insert into public.inventory_loans (
    school_id,
    item_id,
    borrower_id,
    status,
    due_date
  )
  values (
    v_item.school_id,
    p_item_id,
    v_member_id,
    'active',
    p_due_date
  )
  returning id into v_loan_id;

  update public.inventory_items
  set is_available = false,
      updated_at = now()
  where id = p_item_id;

  insert into private.idempotency_operations (
    user_id,
    idempotency_key,
    operation,
    school_id,
    result
  )
  values (
    v_user_id,
    p_idempotency_key,
    'borrow_inventory_item',
    v_item.school_id,
    jsonb_build_object('loan_id', v_loan_id)
  );

  insert into public.audit_events (
    school_id,
    actor_id,
    event_type,
    entity_type,
    entity_id,
    metadata
  )
  values (
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

revoke all on function public.borrow_inventory_item(uuid, uuid, timestamptz) from public, anon;
grant execute on function public.borrow_inventory_item(uuid, uuid, timestamptz) to authenticated;

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
  set status = 'returned',
      returned_at = now(),
      updated_at = now()
  where id = p_loan_id;

  update public.inventory_items
  set is_available = true,
      updated_at = now()
  where id = v_loan.item_id;

  insert into public.audit_events (
    school_id,
    actor_id,
    event_type,
    entity_type,
    entity_id,
    metadata
  )
  values (
    v_loan.school_id,
    v_user_id,
    'inventory.returned',
    'inventory_loan',
    p_loan_id::text,
    jsonb_build_object('item_id', v_loan.item_id)
  );
end;
$$;

revoke all on function public.return_inventory_item(uuid) from public, anon;
grant execute on function public.return_inventory_item(uuid) to authenticated;

create or replace function public.save_class_record_transaction(
  p_school_id uuid,
  p_assignment_id uuid,
  p_session_date date,
  p_attendance jsonb,
  p_topic text,
  p_activity_summary text default null,
  p_reflection text default null,
  p_obstacle text default null,
  p_follow_up text default null,
  p_idempotency_key uuid default gen_random_uuid()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_assignment public.teaching_assignments%rowtype;
  v_existing jsonb;
  v_session_id uuid;
  v_journal_id uuid;
  v_result jsonb;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(v_user_id::text || p_idempotency_key::text || 'save_class_record', 0)
  );

  if jsonb_typeof(p_attendance) <> 'array' then
    raise exception 'Attendance must be an array';
  end if;

  if char_length(trim(p_topic)) < 1 or char_length(p_topic) > 500 then
    raise exception 'Topik tidak valid';
  end if;

  select result into v_existing
  from private.idempotency_operations
  where user_id = v_user_id
    and idempotency_key = p_idempotency_key
    and operation = 'save_class_record';

  if v_existing is not null then
    return v_existing;
  end if;

  select * into v_assignment
  from public.teaching_assignments
  where id = p_assignment_id
    and school_id = p_school_id;

  if not found then
    raise exception 'Penugasan tidak ditemukan';
  end if;

  -- Serialize all edits for the same class session, even when their content
  -- produces different idempotency keys.
  perform pg_advisory_xact_lock(
    hashtextextended(p_assignment_id::text || p_session_date::text || 'class_session', 0)
  );

  if not private.is_active_school_member(p_school_id) then
    raise exception 'Keanggotaan aktif diperlukan';
  end if;

  if v_assignment.teacher_id <> v_user_id
     and not private.has_school_role(
       p_school_id,
       array['owner','admin']::public.school_role[]
     ) then
    raise exception 'Tidak memiliki izin pada penugasan ini';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_attendance) as entry(student_id uuid, status text)
    left join public.class_students cs
      on cs.class_id = v_assignment.class_id
     and cs.student_id = entry.student_id
    left join public.students s
      on s.id = entry.student_id
     and s.school_id = p_school_id
    where cs.student_id is null
       or s.id is null
       or entry.status not in ('present','sick','permission','absent','late')
  ) then
    raise exception 'Presensi memuat murid atau status yang tidak valid';
  end if;

  insert into public.attendance_sessions (
    school_id,
    teaching_assignment_id,
    session_date,
    state,
    created_by,
    idempotency_key
  )
  values (
    p_school_id,
    p_assignment_id,
    p_session_date,
    'final',
    v_user_id,
    p_idempotency_key
  )
  on conflict (teaching_assignment_id, session_date)
  do update set
    state = 'final',
    updated_at = now()
  returning id into v_session_id;

  delete from public.attendance_records existing
  where existing.attendance_session_id = v_session_id
    and not exists (
      select 1
      from jsonb_to_recordset(p_attendance) as entry(student_id uuid, status text)
      where entry.student_id = existing.student_id
    );

  insert into public.attendance_records (
    attendance_session_id,
    student_id,
    status,
    updated_at
  )
  select
    v_session_id,
    entry.student_id,
    entry.status::public.attendance_status,
    now()
  from jsonb_to_recordset(p_attendance) as entry(student_id uuid, status text)
  on conflict (attendance_session_id, student_id)
  do update set
    status = excluded.status,
    updated_at = now();

  insert into public.teaching_journals (
    school_id,
    teaching_assignment_id,
    attendance_session_id,
    journal_date,
    topic,
    activity_summary,
    reflection,
    obstacle,
    follow_up,
    state,
    created_by
  )
  values (
    p_school_id,
    p_assignment_id,
    v_session_id,
    p_session_date,
    trim(p_topic),
    nullif(p_activity_summary, ''),
    nullif(p_reflection, ''),
    nullif(p_obstacle, ''),
    nullif(p_follow_up, ''),
    'final',
    v_user_id
  )
  on conflict (teaching_assignment_id, journal_date)
  do update set
    attendance_session_id = excluded.attendance_session_id,
    topic = excluded.topic,
    activity_summary = excluded.activity_summary,
    reflection = excluded.reflection,
    obstacle = excluded.obstacle,
    follow_up = excluded.follow_up,
    state = 'final',
    updated_at = now()
  returning id into v_journal_id;

  v_result := jsonb_build_object(
    'attendance_session_id', v_session_id,
    'journal_id', v_journal_id,
    'idempotency_key', p_idempotency_key
  );

  insert into private.idempotency_operations (
    user_id,
    idempotency_key,
    operation,
    school_id,
    result
  )
  values (
    v_user_id,
    p_idempotency_key,
    'save_class_record',
    p_school_id,
    v_result
  );

  insert into public.audit_events (
    school_id,
    actor_id,
    event_type,
    entity_type,
    entity_id,
    metadata
  )
  values (
    p_school_id,
    v_user_id,
    'class_record.saved',
    'teaching_journal',
    v_journal_id::text,
    jsonb_build_object(
      'attendance_session_id', v_session_id,
      'assignment_id', p_assignment_id,
      'session_date', p_session_date
    )
  );

  return v_result;
end;
$$;

revoke all on function public.save_class_record_transaction(
  uuid, uuid, date, jsonb, text, text, text, text, text, uuid
) from public, anon;
grant execute on function public.save_class_record_transaction(
  uuid, uuid, date, jsonb, text, text, text, text, text, uuid
) to authenticated;

commit;
