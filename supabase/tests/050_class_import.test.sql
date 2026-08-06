begin;
create extension if not exists pgtap with schema extensions;
select plan(3);

select ok(
  to_regprocedure('public.import_class_students(uuid,jsonb)') is not null,
  'class import RPC exists'
);
select ok(
  has_function_privilege('authenticated', 'public.import_class_students(uuid,jsonb)', 'EXECUTE'),
  'authenticated can execute class import RPC'
);
select ok(
  not has_function_privilege('anon', 'public.import_class_students(uuid,jsonb)', 'EXECUTE'),
  'anonymous users cannot execute class import RPC'
);

select * from finish();
rollback;
