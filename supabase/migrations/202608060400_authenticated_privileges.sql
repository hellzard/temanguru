begin;

-- PostgreSQL privileges and RLS are separate. These grants allow PostgREST to
-- reach public tables; row-level policies still decide every permitted row and
-- operation. Private-schema tables and auth tables are not granted here.
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant usage, select on sequences to authenticated;

revoke truncate, references, trigger on all tables in schema public from authenticated;

commit;
