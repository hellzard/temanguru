begin;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

alter table public.profiles
  add column if not exists active_school_id uuid references public.schools(id) on delete set null;

create or replace function private.is_active_school_member(target_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.school_members sm
    where sm.school_id = target_school_id
      and sm.user_id = (select auth.uid())
      and sm.status = 'active'
  );
$$;


create or replace function private.try_uuid(value text)
returns uuid
language plpgsql
immutable
security definer
set search_path = ''
as $$
begin
  return value::uuid;
exception when others then
  return null;
end;
$$;

create or replace function private.has_school_role(
  target_school_id uuid,
  allowed_roles public.school_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.school_members sm
    where sm.school_id = target_school_id
      and sm.user_id = (select auth.uid())
      and sm.status = 'active'
      and sm.role = any(allowed_roles)
  );
$$;

create or replace function private.current_member_id(target_school_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select sm.id
  from public.school_members sm
  where sm.school_id = target_school_id
    and sm.user_id = (select auth.uid())
    and sm.status = 'active'
  limit 1;
$$;

create or replace function private.is_assignment_teacher(target_assignment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.teaching_assignments ta
    join public.school_members sm
      on sm.school_id = ta.school_id
     and sm.user_id = ta.teacher_id
     and sm.status = 'active'
    where ta.id = target_assignment_id
      and ta.teacher_id = (select auth.uid())
  );
$$;

create or replace function private.is_student_teacher(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.class_students cs
    join public.classes c on c.id = cs.class_id
    join public.teaching_assignments ta on ta.class_id = c.id
    where cs.student_id = target_student_id
      and ta.teacher_id = (select auth.uid())
      and private.is_active_school_member(c.school_id)
  );
$$;

grant execute on all functions in schema private to authenticated;
revoke execute on all functions in schema private from anon, public;

create or replace function private.validate_active_school()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.active_school_id is not null
     and new.active_school_id is distinct from old.active_school_id
     and not private.is_active_school_member(new.active_school_id) then
    raise exception 'Active school must be an active membership';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_validate_active_school on public.profiles;
create trigger profiles_validate_active_school
before update of active_school_id on public.profiles
for each row execute function private.validate_active_school();

create or replace function public.set_active_school(target_school_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;
  if not private.is_active_school_member(target_school_id) then
    raise exception 'Active membership required';
  end if;

  update public.profiles
  set active_school_id = target_school_id,
      updated_at = now()
  where id = (select auth.uid());
end;
$$;

revoke all on function public.set_active_school(uuid) from public, anon;
grant execute on function public.set_active_school(uuid) to authenticated;

create or replace function public.create_school_with_owner(
  school_name text,
  school_timezone text default 'Asia/Jakarta'
)
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
  values (
    trim(school_name),
    coalesce(nullif(trim(school_timezone), ''), 'Asia/Jakarta'),
    (select auth.uid())
  )
  returning id into new_school_id;

  insert into public.school_members (school_id, user_id, role, status)
  values (new_school_id, (select auth.uid()), 'owner', 'active');

  update public.profiles
  set active_school_id = new_school_id,
      updated_at = now()
  where id = (select auth.uid());

  return new_school_id;
end;
$$;

revoke all on function public.create_school_with_owner(text, text) from public, anon;
grant execute on function public.create_school_with_owner(text, text) to authenticated;

-- Trigger/helper functions must not be callable through PostgREST.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.is_school_member(uuid) from public, anon, authenticated;
revoke all on function public.has_school_role(uuid, public.school_role[]) from public, anon, authenticated;
revoke all on function public.is_assignment_teacher(uuid) from public, anon, authenticated;

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  school_id uuid references public.schools(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null check (char_length(event_type) between 3 and 120),
  entity_type text not null check (char_length(entity_type) between 2 and 120),
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_school_created_idx
  on public.audit_events (school_id, created_at desc);

alter table public.audit_events enable row level security;
drop policy if exists "audit_select_admin" on public.audit_events;
create policy "audit_select_admin"
on public.audit_events for select to authenticated
using (
  private.has_school_role(
    school_id,
    array['owner','admin']::public.school_role[]
  )
);

create table if not exists private.idempotency_operations (
  user_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key uuid not null,
  operation text not null,
  school_id uuid not null references public.schools(id) on delete cascade,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, idempotency_key, operation)
);

-- ---------------------------------------------------------------------------
-- Core RLS: command-specific policies, active memberships only.
-- ---------------------------------------------------------------------------

drop policy if exists "schools_select_member" on public.schools;
drop policy if exists "schools_insert_owner" on public.schools;
drop policy if exists "schools_update_admin" on public.schools;
create policy "schools_select_active_member" on public.schools
for select to authenticated using (private.is_active_school_member(id));
create policy "schools_insert_creator" on public.schools
for insert to authenticated with check (created_by = (select auth.uid()));
create policy "schools_update_admin" on public.schools
for update to authenticated
using (private.has_school_role(id, array['owner','admin']::public.school_role[]))
with check (private.has_school_role(id, array['owner','admin']::public.school_role[]));

drop policy if exists "members_select_member" on public.school_members;
drop policy if exists "members_insert_admin" on public.school_members;
drop policy if exists "members_update_admin" on public.school_members;
drop policy if exists "members_delete_owner" on public.school_members;
create policy "members_select_active_member" on public.school_members
for select to authenticated using (
  user_id = (select auth.uid()) or private.is_active_school_member(school_id)
);
create policy "members_insert_admin" on public.school_members
for insert to authenticated with check (
  private.has_school_role(school_id, array['owner','admin']::public.school_role[])
);
create policy "members_update_admin" on public.school_members
for update to authenticated
using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]))
with check (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "members_delete_owner" on public.school_members
for delete to authenticated
using (private.has_school_role(school_id, array['owner']::public.school_role[]));

drop policy if exists "academic_years_member_all" on public.academic_years;
drop policy if exists "academic_years_admin_write" on public.academic_years;
create policy "academic_years_member_select" on public.academic_years
for select to authenticated using (private.is_active_school_member(school_id));
create policy "academic_years_admin_insert" on public.academic_years
for insert to authenticated with check (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "academic_years_admin_update" on public.academic_years
for update to authenticated
using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]))
with check (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "academic_years_admin_delete" on public.academic_years
for delete to authenticated using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));

drop policy if exists "classes_member_select" on public.classes;
drop policy if exists "classes_admin_write" on public.classes;
create policy "classes_member_select" on public.classes
for select to authenticated using (private.is_active_school_member(school_id));
create policy "classes_admin_insert" on public.classes
for insert to authenticated with check (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "classes_admin_update" on public.classes
for update to authenticated
using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]))
with check (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "classes_admin_delete" on public.classes
for delete to authenticated using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));

drop policy if exists "students_member_select" on public.students;
drop policy if exists "students_member_insert" on public.students;
drop policy if exists "students_member_update" on public.students;
drop policy if exists "students_admin_delete" on public.students;
create policy "students_member_select" on public.students
for select to authenticated using (private.is_active_school_member(school_id));
create policy "students_member_insert" on public.students
for insert to authenticated with check (private.is_active_school_member(school_id));
create policy "students_member_update" on public.students
for update to authenticated
using (private.is_active_school_member(school_id))
with check (private.is_active_school_member(school_id));
create policy "students_admin_delete" on public.students
for delete to authenticated using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));

drop policy if exists "class_students_member_select" on public.class_students;
drop policy if exists "class_students_member_write" on public.class_students;
create policy "class_students_member_select" on public.class_students
for select to authenticated using (
  exists (
    select 1 from public.classes c
    where c.id = class_id and private.is_active_school_member(c.school_id)
  )
);
create policy "class_students_authorized_insert" on public.class_students
for insert to authenticated with check (
  exists (
    select 1 from public.classes c
    where c.id = class_id
      and (
        private.has_school_role(c.school_id, array['owner','admin']::public.school_role[])
        or exists (
          select 1 from public.teaching_assignments ta
          where ta.class_id = c.id and ta.teacher_id = (select auth.uid())
        )
      )
  )
);
create policy "class_students_authorized_update" on public.class_students
for update to authenticated
using (
  exists (
    select 1 from public.classes c
    where c.id = class_id
      and (
        private.has_school_role(c.school_id, array['owner','admin']::public.school_role[])
        or exists (
          select 1 from public.teaching_assignments ta
          where ta.class_id = c.id and ta.teacher_id = (select auth.uid())
        )
      )
  )
)
with check (
  exists (
    select 1 from public.classes c
    where c.id = class_id and private.is_active_school_member(c.school_id)
  )
);
create policy "class_students_admin_delete" on public.class_students
for delete to authenticated using (
  exists (
    select 1 from public.classes c
    where c.id = class_id
      and private.has_school_role(c.school_id, array['owner','admin']::public.school_role[])
  )
);

drop policy if exists "subjects_member_select" on public.subjects;
drop policy if exists "subjects_admin_write" on public.subjects;
create policy "subjects_member_select" on public.subjects
for select to authenticated using (private.is_active_school_member(school_id));
create policy "subjects_admin_insert" on public.subjects
for insert to authenticated with check (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "subjects_admin_update" on public.subjects
for update to authenticated
using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]))
with check (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "subjects_admin_delete" on public.subjects
for delete to authenticated using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));

drop policy if exists "assignments_member_select" on public.teaching_assignments;
drop policy if exists "assignments_admin_write" on public.teaching_assignments;
create policy "assignments_member_select" on public.teaching_assignments
for select to authenticated using (private.is_active_school_member(school_id));
create policy "assignments_admin_insert" on public.teaching_assignments
for insert to authenticated with check (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "assignments_admin_update" on public.teaching_assignments
for update to authenticated
using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]))
with check (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "assignments_admin_delete" on public.teaching_assignments
for delete to authenticated using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));

drop policy if exists "schedules_member_select" on public.schedules;
drop policy if exists "schedules_admin_write" on public.schedules;
create policy "schedules_member_select" on public.schedules
for select to authenticated using (private.is_active_school_member(school_id));
create policy "schedules_admin_insert" on public.schedules
for insert to authenticated with check (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "schedules_admin_update" on public.schedules
for update to authenticated
using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]))
with check (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "schedules_admin_delete" on public.schedules
for delete to authenticated using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));

drop policy if exists "attendance_member_select" on public.attendance_sessions;
drop policy if exists "attendance_teacher_insert" on public.attendance_sessions;
drop policy if exists "attendance_teacher_update" on public.attendance_sessions;
drop policy if exists "attendance_admin_delete" on public.attendance_sessions;
create policy "attendance_member_select" on public.attendance_sessions
for select to authenticated using (private.is_active_school_member(school_id));
create policy "attendance_teacher_insert" on public.attendance_sessions
for insert to authenticated with check (
  created_by = (select auth.uid())
  and private.is_active_school_member(school_id)
  and (
    private.is_assignment_teacher(teaching_assignment_id)
    or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
  )
);
create policy "attendance_teacher_update" on public.attendance_sessions
for update to authenticated
using (
  created_by = (select auth.uid())
  or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
)
with check (private.is_active_school_member(school_id));
create policy "attendance_admin_delete" on public.attendance_sessions
for delete to authenticated using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));

drop policy if exists "attendance_records_member_select" on public.attendance_records;
drop policy if exists "attendance_records_teacher_write" on public.attendance_records;
create policy "attendance_records_member_select" on public.attendance_records
for select to authenticated using (
  exists (
    select 1 from public.attendance_sessions s
    where s.id = attendance_session_id and private.is_active_school_member(s.school_id)
  )
);
create policy "attendance_records_teacher_insert" on public.attendance_records
for insert to authenticated with check (
  exists (
    select 1 from public.attendance_sessions s
    where s.id = attendance_session_id
      and (
        s.created_by = (select auth.uid())
        or private.has_school_role(s.school_id, array['owner','admin']::public.school_role[])
      )
  )
);
create policy "attendance_records_teacher_update" on public.attendance_records
for update to authenticated
using (
  exists (
    select 1 from public.attendance_sessions s
    where s.id = attendance_session_id
      and (
        s.created_by = (select auth.uid())
        or private.has_school_role(s.school_id, array['owner','admin']::public.school_role[])
      )
  )
)
with check (
  exists (
    select 1 from public.attendance_sessions s
    where s.id = attendance_session_id and private.is_active_school_member(s.school_id)
  )
);
create policy "attendance_records_admin_delete" on public.attendance_records
for delete to authenticated using (
  exists (
    select 1 from public.attendance_sessions s
    where s.id = attendance_session_id
      and private.has_school_role(s.school_id, array['owner','admin']::public.school_role[])
  )
);

drop policy if exists "journals_member_select" on public.teaching_journals;
drop policy if exists "journals_teacher_insert" on public.teaching_journals;
drop policy if exists "journals_teacher_update" on public.teaching_journals;
drop policy if exists "journals_admin_delete" on public.teaching_journals;
create policy "journals_member_select" on public.teaching_journals
for select to authenticated using (private.is_active_school_member(school_id));
create policy "journals_teacher_insert" on public.teaching_journals
for insert to authenticated with check (
  created_by = (select auth.uid())
  and private.is_active_school_member(school_id)
  and (
    private.is_assignment_teacher(teaching_assignment_id)
    or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
  )
);
create policy "journals_teacher_update" on public.teaching_journals
for update to authenticated
using (
  created_by = (select auth.uid())
  or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
)
with check (private.is_active_school_member(school_id));
create policy "journals_admin_delete" on public.teaching_journals
for delete to authenticated using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));

drop policy if exists "assessments_member_select" on public.assessments;
drop policy if exists "assessments_teacher_write" on public.assessments;
create policy "assessments_member_select" on public.assessments
for select to authenticated using (private.is_active_school_member(school_id));
create policy "assessments_teacher_insert" on public.assessments
for insert to authenticated with check (
  created_by = (select auth.uid())
  and private.is_active_school_member(school_id)
  and (
    private.is_assignment_teacher(teaching_assignment_id)
    or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
  )
);
create policy "assessments_teacher_update" on public.assessments
for update to authenticated
using (
  created_by = (select auth.uid())
  or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
)
with check (private.is_active_school_member(school_id));
create policy "assessments_admin_delete" on public.assessments
for delete to authenticated using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));

drop policy if exists "scores_member_select" on public.assessment_scores;
drop policy if exists "scores_teacher_write" on public.assessment_scores;
create policy "scores_member_select" on public.assessment_scores
for select to authenticated using (
  exists (
    select 1 from public.assessments a
    where a.id = assessment_id and private.is_active_school_member(a.school_id)
  )
);
create policy "scores_teacher_insert" on public.assessment_scores
for insert to authenticated with check (
  updated_by = (select auth.uid())
  and exists (
    select 1 from public.assessments a
    where a.id = assessment_id
      and (
        a.created_by = (select auth.uid())
        or private.has_school_role(a.school_id, array['owner','admin']::public.school_role[])
      )
  )
);
create policy "scores_teacher_update" on public.assessment_scores
for update to authenticated
using (
  exists (
    select 1 from public.assessments a
    where a.id = assessment_id
      and (
        a.created_by = (select auth.uid())
        or private.has_school_role(a.school_id, array['owner','admin']::public.school_role[])
      )
  )
)
with check (updated_by = (select auth.uid()));
create policy "scores_admin_delete" on public.assessment_scores
for delete to authenticated using (
  exists (
    select 1 from public.assessments a
    where a.id = assessment_id
      and private.has_school_role(a.school_id, array['owner','admin']::public.school_role[])
  )
);

drop policy if exists "remedial_member_select" on public.remedial_attempts;
drop policy if exists "remedial_teacher_write" on public.remedial_attempts;
create policy "remedial_member_select" on public.remedial_attempts
for select to authenticated using (private.is_active_school_member(school_id));
create policy "remedial_teacher_insert" on public.remedial_attempts
for insert to authenticated with check (
  created_by = (select auth.uid()) and private.is_active_school_member(school_id)
);
create policy "remedial_teacher_update" on public.remedial_attempts
for update to authenticated
using (
  created_by = (select auth.uid())
  or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
)
with check (private.is_active_school_member(school_id));
create policy "remedial_admin_delete" on public.remedial_attempts
for delete to authenticated using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));

-- ---------------------------------------------------------------------------
-- Document Studio
-- ---------------------------------------------------------------------------

drop policy if exists "School members can view brand kits" on public.brand_kits;
drop policy if exists "Admins can update brand kits" on public.brand_kits;
create policy "brand_kits_member_select" on public.brand_kits
for select to authenticated using (private.is_active_school_member(school_id));
create policy "brand_kits_admin_insert" on public.brand_kits
for insert to authenticated with check (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "brand_kits_admin_update" on public.brand_kits
for update to authenticated
using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]))
with check (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "brand_kits_admin_delete" on public.brand_kits
for delete to authenticated using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));

drop policy if exists "School members can view active templates" on public.document_templates;
drop policy if exists "Admins can manage templates" on public.document_templates;
create policy "templates_member_select" on public.document_templates
for select to authenticated using (is_active and private.is_active_school_member(school_id));
create policy "templates_admin_insert" on public.document_templates
for insert to authenticated with check (
  created_by = (select auth.uid())
  and private.has_school_role(school_id, array['owner','admin']::public.school_role[])
);
create policy "templates_admin_update" on public.document_templates
for update to authenticated
using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]))
with check (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "templates_admin_delete" on public.document_templates
for delete to authenticated using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));

drop policy if exists "Members can read documents" on public.school_documents;
drop policy if exists "Creator can manage their documents" on public.school_documents;
create policy "documents_authorized_select" on public.school_documents
for select to authenticated using (
  private.has_school_role(school_id, array['owner','admin']::public.school_role[])
  or created_by = (select auth.uid())
  or (
    status in ('finalized','archived')
    and private.is_active_school_member(school_id)
  )
);
create policy "documents_creator_insert" on public.school_documents
for insert to authenticated with check (
  created_by = (select auth.uid()) and private.is_active_school_member(school_id)
);
create policy "documents_creator_or_admin_update" on public.school_documents
for update to authenticated
using (
  private.has_school_role(school_id, array['owner','admin']::public.school_role[])
  or (
    created_by = (select auth.uid())
    and status in ('draft','changes_requested')
  )
)
with check (
  private.has_school_role(school_id, array['owner','admin']::public.school_role[])
  or created_by = (select auth.uid())
);
create policy "documents_creator_or_admin_delete" on public.school_documents
for delete to authenticated using (
  private.has_school_role(school_id, array['owner','admin']::public.school_role[])
  or (created_by = (select auth.uid()) and status = 'draft')
);

drop policy if exists "Owner can manage own assets" on public.visual_assets;
drop policy if exists "Members can view active assets" on public.visual_assets;
create policy "visual_assets_authorized_select" on public.visual_assets
for select to authenticated using (
  owner_id = (select auth.uid())
  or (
    owner_id is null
    and private.has_school_role(school_id, array['owner','admin']::public.school_role[])
  )
);
create policy "visual_assets_authorized_insert" on public.visual_assets
for insert to authenticated with check (
  (
    asset_type = 'signature'
    and owner_id = (select auth.uid())
    and created_by = (select auth.uid())
    and private.is_active_school_member(school_id)
  )
  or (
    asset_type = 'stamp'
    and owner_id is null
    and created_by = (select auth.uid())
    and private.has_school_role(school_id, array['owner','admin']::public.school_role[])
  )
);
create policy "visual_assets_authorized_update" on public.visual_assets
for update to authenticated
using (
  owner_id = (select auth.uid())
  or (
    owner_id is null
    and private.has_school_role(school_id, array['owner','admin']::public.school_role[])
  )
)
with check (
  owner_id = (select auth.uid())
  or (
    owner_id is null
    and private.has_school_role(school_id, array['owner','admin']::public.school_role[])
  )
);
create policy "visual_assets_authorized_delete" on public.visual_assets
for delete to authenticated using (
  owner_id = (select auth.uid())
  or (
    owner_id is null
    and private.has_school_role(school_id, array['owner','admin']::public.school_role[])
  )
);

drop policy if exists "School members can view assets" on storage.objects;
drop policy if exists "Admins can upload assets" on storage.objects;
create policy "assets_authorized_select" on storage.objects
for select to authenticated using (
  bucket_id = 'teman-guru-assets'
  and exists (
    select 1
    from public.visual_assets va
    where va.storage_path = storage.objects.name
      and (
        va.owner_id = (select auth.uid())
        or (
          va.owner_id is null
          and private.has_school_role(va.school_id, array['owner','admin']::public.school_role[])
        )
      )
  )
);
create policy "assets_authorized_insert" on storage.objects
for insert to authenticated with check (
  bucket_id = 'teman-guru-assets'
  and (
    (
      (storage.foldername(name))[2] = (select auth.uid())::text
      and private.is_active_school_member(private.try_uuid((storage.foldername(name))[1]))
    )
    or (
      (storage.foldername(name))[2] = 'school'
      and private.has_school_role(
        private.try_uuid((storage.foldername(name))[1]),
        array['owner','admin']::public.school_role[]
      )
    )
  )
);
create policy "assets_authorized_delete" on storage.objects
for delete to authenticated using (
  bucket_id = 'teman-guru-assets'
  and exists (
    select 1
    from public.visual_assets va
    where va.storage_path = storage.objects.name
      and (
        va.owner_id = (select auth.uid())
        or (
          va.owner_id is null
          and private.has_school_role(va.school_id, array['owner','admin']::public.school_role[])
        )
      )
  )
);

-- ---------------------------------------------------------------------------
-- Events, meetings, operations, portfolios.
-- ---------------------------------------------------------------------------

drop policy if exists "Users can view events of their school" on public.events;
drop policy if exists "Users can insert events to their school" on public.events;
drop policy if exists "Users can update events of their school" on public.events;
drop policy if exists "Users can delete events of their school" on public.events;
create policy "events_member_select" on public.events
for select to authenticated using (private.is_active_school_member(school_id));
create policy "events_creator_insert" on public.events
for insert to authenticated with check (
  created_by = (select auth.uid()) and private.is_active_school_member(school_id)
);
create policy "events_creator_or_admin_update" on public.events
for update to authenticated
using (
  created_by = (select auth.uid())
  or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
)
with check (private.is_active_school_member(school_id));
create policy "events_admin_delete" on public.events
for delete to authenticated using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));

do $$
declare
  table_name text;
begin
  foreach table_name in array array['event_committees','event_budgets','meeting_attendees']
  loop
    execute format('drop policy if exists "Users can view %1$s of their school" on public.%1$I', table_name);
    execute format('drop policy if exists "Users can insert %1$s to their school" on public.%1$I', table_name);
    execute format('drop policy if exists "Users can update %1$s of their school" on public.%1$I', table_name);
    execute format('drop policy if exists "Users can delete %1$s of their school" on public.%1$I', table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated using (private.is_active_school_member(school_id))',
      table_name || '_member_select', table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (private.has_school_role(school_id, array[''owner'',''admin'']::public.school_role[]))',
      table_name || '_admin_insert', table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (private.has_school_role(school_id, array[''owner'',''admin'']::public.school_role[])) with check (private.has_school_role(school_id, array[''owner'',''admin'']::public.school_role[]))',
      table_name || '_admin_update', table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (private.has_school_role(school_id, array[''owner'',''admin'']::public.school_role[]))',
      table_name || '_admin_delete', table_name
    );
  end loop;
end $$;

drop policy if exists "Users can view event_tasks of their school" on public.event_tasks;
drop policy if exists "Users can insert event_tasks to their school" on public.event_tasks;
drop policy if exists "Users can update event_tasks of their school" on public.event_tasks;
drop policy if exists "Users can delete event_tasks of their school" on public.event_tasks;
create policy "event_tasks_member_select" on public.event_tasks
for select to authenticated using (private.is_active_school_member(school_id));
create policy "event_tasks_admin_insert" on public.event_tasks
for insert to authenticated with check (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "event_tasks_assignee_or_admin_update" on public.event_tasks
for update to authenticated
using (
  assignee_id = private.current_member_id(school_id)
  or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
)
with check (private.is_active_school_member(school_id));
create policy "event_tasks_admin_delete" on public.event_tasks
for delete to authenticated using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));

drop policy if exists "Users can view meetings of their school" on public.meetings;
drop policy if exists "Users can insert meetings to their school" on public.meetings;
drop policy if exists "Users can update meetings of their school" on public.meetings;
drop policy if exists "Users can delete meetings of their school" on public.meetings;
create policy "meetings_member_select" on public.meetings
for select to authenticated using (private.is_active_school_member(school_id));
create policy "meetings_creator_insert" on public.meetings
for insert to authenticated with check (created_by = (select auth.uid()) and private.is_active_school_member(school_id));
create policy "meetings_creator_or_admin_update" on public.meetings
for update to authenticated
using (
  created_by = (select auth.uid())
  or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
)
with check (private.is_active_school_member(school_id));
create policy "meetings_admin_delete" on public.meetings
for delete to authenticated using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));

drop policy if exists "Users can view meeting_decisions of their school" on public.meeting_decisions;
drop policy if exists "Users can insert meeting_decisions to their school" on public.meeting_decisions;
drop policy if exists "Users can update meeting_decisions of their school" on public.meeting_decisions;
drop policy if exists "Users can delete meeting_decisions of their school" on public.meeting_decisions;
create policy "meeting_decisions_member_select" on public.meeting_decisions
for select to authenticated using (private.is_active_school_member(school_id));
create policy "meeting_decisions_admin_insert" on public.meeting_decisions
for insert to authenticated with check (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "meeting_decisions_pic_or_admin_update" on public.meeting_decisions
for update to authenticated
using (
  pic_id = private.current_member_id(school_id)
  or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
)
with check (private.is_active_school_member(school_id));
create policy "meeting_decisions_admin_delete" on public.meeting_decisions
for delete to authenticated using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));

drop policy if exists "Users can view inventory of their school" on public.inventory_items;
drop policy if exists "Users can insert inventory to their school" on public.inventory_items;
drop policy if exists "Users can update inventory of their school" on public.inventory_items;
drop policy if exists "Users can delete inventory of their school" on public.inventory_items;
create policy "inventory_member_select" on public.inventory_items
for select to authenticated using (private.is_active_school_member(school_id));
create policy "inventory_admin_insert" on public.inventory_items
for insert to authenticated with check (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "inventory_admin_update" on public.inventory_items
for update to authenticated
using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]))
with check (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "inventory_admin_delete" on public.inventory_items
for delete to authenticated using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));

drop policy if exists "Users can view loans of their school" on public.inventory_loans;
drop policy if exists "Users can insert loans to their school" on public.inventory_loans;
drop policy if exists "Users can update loans of their school" on public.inventory_loans;
drop policy if exists "Users can delete loans of their school" on public.inventory_loans;
create policy "loans_member_select" on public.inventory_loans
for select to authenticated using (private.is_active_school_member(school_id));
create policy "loans_admin_update" on public.inventory_loans
for update to authenticated
using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]))
with check (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "loans_admin_delete" on public.inventory_loans
for delete to authenticated using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));

drop policy if exists "Users can view maintenance_tickets of their school" on public.maintenance_tickets;
drop policy if exists "Users can insert maintenance_tickets to their school" on public.maintenance_tickets;
drop policy if exists "Users can update maintenance_tickets of their school" on public.maintenance_tickets;
drop policy if exists "Users can delete maintenance_tickets of their school" on public.maintenance_tickets;
create policy "maintenance_member_select" on public.maintenance_tickets
for select to authenticated using (private.is_active_school_member(school_id));
create policy "maintenance_reporter_insert" on public.maintenance_tickets
for insert to authenticated with check (
  reporter_id = private.current_member_id(school_id)
);
create policy "maintenance_reporter_or_admin_update" on public.maintenance_tickets
for update to authenticated
using (
  reporter_id = private.current_member_id(school_id)
  or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
)
with check (private.is_active_school_member(school_id));
create policy "maintenance_admin_delete" on public.maintenance_tickets
for delete to authenticated using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));

drop policy if exists "Users can view duty_schedules of their school" on public.duty_schedules;
drop policy if exists "Users can insert duty_schedules to their school" on public.duty_schedules;
drop policy if exists "Users can update duty_schedules of their school" on public.duty_schedules;
drop policy if exists "Users can delete duty_schedules of their school" on public.duty_schedules;
create policy "duty_member_select" on public.duty_schedules
for select to authenticated using (private.is_active_school_member(school_id));
create policy "duty_admin_insert" on public.duty_schedules
for insert to authenticated with check (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "duty_self_or_admin_update" on public.duty_schedules
for update to authenticated
using (
  member_id = private.current_member_id(school_id)
  or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
)
with check (private.is_active_school_member(school_id));
create policy "duty_admin_delete" on public.duty_schedules
for delete to authenticated using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));

alter table public.portfolios_student
  add column if not exists created_by uuid default auth.uid() references public.profiles(id) on delete set null;

drop policy if exists "Users can view student portfolios of their school" on public.portfolios_student;
drop policy if exists "Users can insert student portfolios to their school" on public.portfolios_student;
drop policy if exists "Users can update student portfolios of their school" on public.portfolios_student;
drop policy if exists "Users can delete student portfolios of their school" on public.portfolios_student;
create policy "student_portfolio_authorized_select" on public.portfolios_student
for select to authenticated using (
  private.has_school_role(school_id, array['owner','admin']::public.school_role[])
  or private.is_student_teacher(student_id)
);
create policy "student_portfolio_authorized_insert" on public.portfolios_student
for insert to authenticated with check (
  created_by = (select auth.uid())
  and (
    private.has_school_role(school_id, array['owner','admin']::public.school_role[])
    or private.is_student_teacher(student_id)
  )
);
create policy "student_portfolio_creator_or_admin_update" on public.portfolios_student
for update to authenticated
using (
  created_by = (select auth.uid())
  or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
)
with check (private.is_active_school_member(school_id));
create policy "student_portfolio_creator_or_admin_delete" on public.portfolios_student
for delete to authenticated using (
  created_by = (select auth.uid())
  or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
);

drop policy if exists "Users can view teacher portfolios of their school" on public.portfolios_teacher;
drop policy if exists "Users can insert teacher portfolios to their school" on public.portfolios_teacher;
drop policy if exists "Users can update teacher portfolios of their school" on public.portfolios_teacher;
drop policy if exists "Users can delete teacher portfolios of their school" on public.portfolios_teacher;
create policy "teacher_portfolio_member_select" on public.portfolios_teacher
for select to authenticated using (private.is_active_school_member(school_id));
create policy "teacher_portfolio_owner_insert" on public.portfolios_teacher
for insert to authenticated with check (
  member_id = private.current_member_id(school_id)
  or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
);
create policy "teacher_portfolio_owner_update" on public.portfolios_teacher
for update to authenticated
using (
  member_id = private.current_member_id(school_id)
  or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
)
with check (private.is_active_school_member(school_id));
create policy "teacher_portfolio_owner_delete" on public.portfolios_teacher
for delete to authenticated using (
  member_id = private.current_member_id(school_id)
  or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
);

drop policy if exists "Users can view supervision records of their school" on public.supervision_records;
drop policy if exists "Users can insert supervision records to their school" on public.supervision_records;
drop policy if exists "Users can update supervision records of their school" on public.supervision_records;
drop policy if exists "Users can delete supervision records of their school" on public.supervision_records;
create policy "supervision_participant_select" on public.supervision_records
for select to authenticated using (
  supervisor_id = private.current_member_id(school_id)
  or supervisee_id = private.current_member_id(school_id)
  or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
);
create policy "supervision_supervisor_insert" on public.supervision_records
for insert to authenticated with check (
  supervisor_id = private.current_member_id(school_id)
  or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
);
create policy "supervision_supervisor_update" on public.supervision_records
for update to authenticated
using (
  supervisor_id = private.current_member_id(school_id)
  or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
)
with check (private.is_active_school_member(school_id));
create policy "supervision_admin_delete" on public.supervision_records
for delete to authenticated using (private.has_school_role(school_id, array['owner','admin']::public.school_role[]));

-- Communication drafts stay private to their creator, with admin visibility for
-- school governance. Replace bootstrap policies that used public helpers.
drop policy if exists "communication_owner_select" on public.communication_drafts;
drop policy if exists "communication_owner_insert" on public.communication_drafts;
drop policy if exists "communication_owner_update" on public.communication_drafts;
drop policy if exists "communication_owner_delete" on public.communication_drafts;
create policy "communication_creator_select" on public.communication_drafts
for select to authenticated using (
  created_by = (select auth.uid())
  or private.has_school_role(school_id, array['owner','admin']::public.school_role[])
);
create policy "communication_creator_insert" on public.communication_drafts
for insert to authenticated with check (
  created_by = (select auth.uid())
  and private.is_active_school_member(school_id)
);
create policy "communication_creator_update" on public.communication_drafts
for update to authenticated
using (created_by = (select auth.uid()))
with check (created_by = (select auth.uid()) and private.is_active_school_member(school_id));
create policy "communication_creator_delete" on public.communication_drafts
for delete to authenticated using (created_by = (select auth.uid()));

commit;
