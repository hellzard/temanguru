begin;
create extension if not exists pgtap with schema extensions;
select plan(15);

select ok(to_regclass('public.audit_events') is not null, 'audit_events exists');
select ok(to_regclass('private.idempotency_operations') is not null, 'idempotency table exists');
select ok(to_regprocedure('public.borrow_inventory_item(uuid,uuid,timestamptz)') is not null, 'borrow RPC exists');
select ok(to_regprocedure('public.return_inventory_item(uuid)') is not null, 'return RPC exists');
select ok(
  to_regprocedure('public.save_class_record_transaction(uuid,uuid,date,jsonb,text,text,text,text,text,uuid)') is not null,
  'class record RPC exists'
);
select ok(to_regprocedure('public.set_active_school(uuid)') is not null, 'active school RPC exists');

select ok(
  not has_function_privilege('anon', 'public.create_school_with_owner(text,text)', 'EXECUTE'),
  'anon cannot create school through RPC'
);
select ok(
  has_function_privilege('authenticated', 'public.create_school_with_owner(text,text)', 'EXECUTE'),
  'authenticated can create school'
);
select ok(
  not has_function_privilege('anon', 'public.borrow_inventory_item(uuid,uuid,timestamptz)', 'EXECUTE'),
  'anon cannot borrow'
);
select ok(
  has_function_privilege('authenticated', 'public.borrow_inventory_item(uuid,uuid,timestamptz)', 'EXECUTE'),
  'authenticated can call borrow RPC'
);
select ok(
  not has_function_privilege('anon', 'public.handle_new_user()', 'EXECUTE'),
  'anon cannot execute auth trigger helper'
);
select ok(
  not has_function_privilege('authenticated', 'public.handle_new_user()', 'EXECUTE'),
  'authenticated cannot execute auth trigger helper'
);
select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'inventory_loans_one_active_per_item_uidx'
  ),
  'active inventory loan unique index exists'
);
select ok(
  exists (
    select 1 from pg_constraint
    where conname = 'inventory_loans_item_same_school_fk'
  ),
  'inventory item tenant FK exists'
);
select ok(
  exists (
    select 1 from pg_trigger
    where tgname = 'attendance_records_tenant_guard'
      and not tgisinternal
  ),
  'attendance tenant trigger exists'
);

select * from finish();
rollback;
