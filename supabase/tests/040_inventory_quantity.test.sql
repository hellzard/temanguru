begin;
create extension if not exists pgtap with schema extensions;
select plan(5);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  '40000000-0000-0000-0000-000000000001',
  'authenticated','authenticated','quantity@example.test','',now(),now(),now(),'','','',''
);
insert into public.profiles (id, display_name)
values ('40000000-0000-0000-0000-000000000001','Quantity Owner') on conflict do nothing;
insert into public.schools (id, name, created_by)
values ('d0000000-0000-0000-0000-000000000001','Quantity School','40000000-0000-0000-0000-000000000001');
insert into public.school_members (school_id, user_id, role, status)
values ('d0000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','owner','active');
insert into public.inventory_items (id, school_id, code, name, quantity)
values ('d1000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000001','D-1','Two Units',2);

set local role authenticated;
select set_config('request.jwt.claim.sub','40000000-0000-0000-0000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"40000000-0000-0000-0000-000000000001","role":"authenticated"}',true);

create temporary table loans as
select public.borrow_inventory_item('d1000000-0000-0000-0000-000000000001','d2000000-0000-0000-0000-000000000001',null) first_id,
       public.borrow_inventory_item('d1000000-0000-0000-0000-000000000001','d2000000-0000-0000-0000-000000000002',null) second_id;

select isnt((select first_id from loans), (select second_id from loans), 'two units create two distinct loans');
select is((select count(*) from public.inventory_loans where status='active'), 2::bigint, 'two active loans allowed');
select throws_ok(
  $$select public.borrow_inventory_item('d1000000-0000-0000-0000-000000000001','d2000000-0000-0000-0000-000000000003',null)$$,
  'Barang sedang tidak tersedia',
  'third loan is rejected'
);
select is((select is_available from public.inventory_items where id='d1000000-0000-0000-0000-000000000001'), false, 'aggregate item unavailable at capacity');
select lives_ok($$select public.return_inventory_item((select first_id from loans))$$, 'return succeeds and releases capacity');

select * from finish();
rollback;
