begin;
create extension if not exists pgtap with schema extensions;
select plan(3);

select ok(
  exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'students_school_local_code_uidx'),
  'student code partial unique index exists'
);
select ok(
  exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'subjects_school_code_uidx'),
  'subject code partial unique index exists'
);
select ok(
  exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'school_documents_number_uidx'),
  'document number partial unique index exists'
);

select * from finish();
rollback;
