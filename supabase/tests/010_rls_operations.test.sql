begin;
create extension if not exists pgtap with schema extensions;
select plan(8);


insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values
('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000001','authenticated','authenticated','owner-a@example.test','',now(),now(),now(),'','','',''),
('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000002','authenticated','authenticated','teacher-a@example.test','',now(),now(),now(),'','','',''),
('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000003','authenticated','authenticated','suspended-a@example.test','',now(),now(),now(),'','','',''),
('00000000-0000-0000-0000-000000000000','20000000-0000-0000-0000-000000000001','authenticated','authenticated','owner-b@example.test','',now(),now(),now(),'','','','');

insert into public.profiles (id, display_name)
values
('10000000-0000-0000-0000-000000000001','Owner A'),
('10000000-0000-0000-0000-000000000002','Teacher A'),
('10000000-0000-0000-0000-000000000003','Suspended A'),
('20000000-0000-0000-0000-000000000001','Owner B')
on conflict (id) do nothing;

insert into public.schools (id, name, created_by)
values
('a0000000-0000-0000-0000-000000000001','School A','10000000-0000-0000-0000-000000000001'),
('b0000000-0000-0000-0000-000000000001','School B','20000000-0000-0000-0000-000000000001');

insert into public.school_members (school_id, user_id, role, status)
values
('a0000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','owner','active'),
('a0000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','teacher','active'),
('a0000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000003','teacher','suspended'),
('b0000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','owner','active');

insert into public.inventory_items (id, school_id, code, name)
values
('a1000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','A-1','Projector A'),
('b1000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001','B-1','Projector B');

set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000002',true);
select set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}',true);

select is((select count(*) from public.inventory_items), 1::bigint, 'teacher sees only own school inventory');
select is((select name from public.inventory_items limit 1), 'Projector A', 'teacher cannot see school B item');
delete from public.inventory_items where id = 'a1000000-0000-0000-0000-000000000001';
select is((select count(*) from public.inventory_items where id = 'a1000000-0000-0000-0000-000000000001'), 1::bigint, 'teacher cannot delete inventory');

update public.inventory_items set name = 'Changed' where id = 'a1000000-0000-0000-0000-000000000001';
select is((select name from public.inventory_items where id = 'a1000000-0000-0000-0000-000000000001'), 'Projector A', 'teacher cannot update inventory');

select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000003',true);
select set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated"}',true);
select is((select count(*) from public.inventory_items), 0::bigint, 'suspended member sees no inventory');

select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
update public.inventory_items set name = 'Updated by owner' where id = 'a1000000-0000-0000-0000-000000000001';
select is((select name from public.inventory_items where id = 'a1000000-0000-0000-0000-000000000001'), 'Updated by owner', 'owner can update inventory');
select lives_ok(
  $$select public.set_active_school('a0000000-0000-0000-0000-000000000001')$$,
  'active member can select active school'
);
select throws_ok(
  $$select public.set_active_school('b0000000-0000-0000-0000-000000000001')$$,
  'Active membership required',
  'cannot select another school'
);

select * from finish();
rollback;
