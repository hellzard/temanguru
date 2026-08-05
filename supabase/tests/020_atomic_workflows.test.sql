begin;
create extension if not exists pgtap with schema extensions;
select plan(5);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values
('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000001','authenticated','authenticated','owner@example.test','',now(),now(),now(),'','','','');

insert into public.profiles (id, display_name)
values ('30000000-0000-0000-0000-000000000001','Owner')
on conflict (id) do nothing;

insert into public.schools (id, name, created_by)
values ('c0000000-0000-0000-0000-000000000001','Atomic School','30000000-0000-0000-0000-000000000001');

insert into public.school_members (school_id, user_id, role, status)
values ('c0000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','owner','active');

insert into public.inventory_items (id, school_id, code, name)
values ('c1000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','C-1','Atomic Item');

insert into public.academic_years (id, school_id, name, starts_on, ends_on, is_active)
values ('c2000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','2026/2027','2026-07-01','2027-06-30',true);

insert into public.classes (id, school_id, academic_year_id, name)
values ('c3000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','c2000000-0000-0000-0000-000000000001','VII A');

insert into public.subjects (id, school_id, name)
values ('c4000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','Matematika');

insert into public.students (id, school_id, display_name, local_code)
values ('c5000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','Murid A','001');

insert into public.class_students (class_id, student_id)
values ('c3000000-0000-0000-0000-000000000001','c5000000-0000-0000-0000-000000000001');

insert into public.teaching_assignments (
  id, school_id, academic_year_id, class_id, subject_id, teacher_id
)
values (
  'c6000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'c2000000-0000-0000-0000-000000000001',
  'c3000000-0000-0000-0000-000000000001',
  'c4000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001'
);

set local role authenticated;
select set_config('request.jwt.claim.sub','30000000-0000-0000-0000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"30000000-0000-0000-0000-000000000001","role":"authenticated"}',true);

create temporary table first_loan as
select public.borrow_inventory_item(
  'c1000000-0000-0000-0000-000000000001',
  'c7000000-0000-0000-0000-000000000001',
  null
) as id;

select is(
  public.borrow_inventory_item(
    'c1000000-0000-0000-0000-000000000001',
    'c7000000-0000-0000-0000-000000000001',
    null
  ),
  (select id from first_loan),
  'same borrow idempotency key returns same loan'
);
select throws_ok(
  $$select public.borrow_inventory_item(
    'c1000000-0000-0000-0000-000000000001',
    'c7000000-0000-0000-0000-000000000002',
    null
  )$$,
  'Barang sedang tidak tersedia',
  'second active loan is rejected'
);
select is((select count(*) from public.inventory_loans where status = 'active'), 1::bigint, 'only one active loan exists');

create temporary table first_record as
select public.save_class_record_transaction(
  'c0000000-0000-0000-0000-000000000001',
  'c6000000-0000-0000-0000-000000000001',
  '2026-08-06',
  '[{"student_id":"c5000000-0000-0000-0000-000000000001","status":"present"}]'::jsonb,
  'Bilangan bulat',
  'Latihan',
  null,
  null,
  null,
  'c8000000-0000-0000-0000-000000000001'
) as result;

select is(
  public.save_class_record_transaction(
    'c0000000-0000-0000-0000-000000000001',
    'c6000000-0000-0000-0000-000000000001',
    '2026-08-06',
    '[{"student_id":"c5000000-0000-0000-0000-000000000001","status":"present"}]'::jsonb,
    'Bilangan bulat',
    'Latihan',
    null,
    null,
    null,
    'c8000000-0000-0000-0000-000000000001'
  ),
  (select result from first_record),
  'class record retry returns same result'
);
select is((select count(*) from public.teaching_journals), 1::bigint, 'class record retry does not duplicate journal');

select * from finish();
rollback;
