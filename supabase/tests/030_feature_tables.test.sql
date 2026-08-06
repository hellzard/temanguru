begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

select ok(to_regclass('public.school_documents') is not null, 'school_documents exists');
select ok(to_regclass('public.events') is not null, 'events exists');
select ok(to_regclass('public.meetings') is not null, 'meetings exists');
select ok(to_regclass('public.inventory_items') is not null, 'inventory exists');
select ok(to_regclass('public.maintenance_tickets') is not null, 'maintenance exists');
select ok(to_regclass('public.duty_schedules') is not null, 'duty exists');
select ok(to_regclass('public.portfolios_student') is not null, 'student portfolio exists');
select ok(to_regclass('public.communication_drafts') is not null, 'communication drafts exist');
select ok((select relrowsecurity from pg_class where oid = 'public.events'::regclass), 'events RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.visual_assets'::regclass), 'visual asset RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.communication_drafts'::regclass), 'communication RLS enabled');
select ok(not has_schema_privilege('authenticated', 'private', 'CREATE'), 'authenticated cannot create in private schema');

select * from finish();
rollback;
