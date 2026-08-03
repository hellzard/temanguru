begin;

create or replace function public.create_school_with_owner(school_name text, school_timezone text default 'Asia/Jakarta')
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_school_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;
  if char_length(trim(school_name)) < 2 then
    raise exception 'School name is too short';
  end if;

  insert into public.schools (name, timezone, created_by)
  values (trim(school_name), coalesce(nullif(trim(school_timezone), ''), 'Asia/Jakarta'), (select auth.uid()))
  returning id into new_school_id;

  insert into public.school_members (school_id, user_id, role, status)
  values (new_school_id, (select auth.uid()), 'owner', 'active');

  return new_school_id;
end;
$$;

grant execute on function public.create_school_with_owner(text, text) to authenticated;

commit;
