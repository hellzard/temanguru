begin;

create or replace function public.is_school_member(target_school_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.school_members sm
    where sm.school_id = target_school_id
      and sm.user_id = (select auth.uid())
      and sm.status = 'active'
  );
$$;

create or replace function public.has_school_role(target_school_id uuid, allowed_roles public.school_role[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.school_members sm
    where sm.school_id = target_school_id
      and sm.user_id = (select auth.uid())
      and sm.status = 'active'
      and sm.role = any(allowed_roles)
  );
$$;

create or replace function public.is_assignment_teacher(target_assignment_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.teaching_assignments ta
    where ta.id = target_assignment_id and ta.teacher_id = (select auth.uid())
  );
$$;

alter table public.profiles enable row level security;
alter table public.schools enable row level security;
alter table public.school_members enable row level security;
alter table public.academic_years enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.class_students enable row level security;
alter table public.subjects enable row level security;
alter table public.teaching_assignments enable row level security;
alter table public.schedules enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.attendance_records enable row level security;
alter table public.teaching_journals enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_scores enable row level security;
alter table public.remedial_attempts enable row level security;

create policy "profiles_select_self" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "profiles_update_self" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "schools_select_member" on public.schools for select to authenticated using (public.is_school_member(id));
create policy "schools_insert_owner" on public.schools for insert to authenticated with check (created_by = (select auth.uid()));
create policy "schools_update_admin" on public.schools for update to authenticated using (public.has_school_role(id, array['owner','admin']::public.school_role[])) with check (public.has_school_role(id, array['owner','admin']::public.school_role[]));

create policy "members_select_member" on public.school_members for select to authenticated using (public.is_school_member(school_id));
create policy "members_insert_admin" on public.school_members for insert to authenticated with check (public.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "members_update_admin" on public.school_members for update to authenticated using (public.has_school_role(school_id, array['owner','admin']::public.school_role[])) with check (public.has_school_role(school_id, array['owner','admin']::public.school_role[]));
create policy "members_delete_owner" on public.school_members for delete to authenticated using (public.has_school_role(school_id, array['owner']::public.school_role[]));

create policy "academic_years_member_all" on public.academic_years for select to authenticated using (public.is_school_member(school_id));
create policy "academic_years_admin_write" on public.academic_years for all to authenticated using (public.has_school_role(school_id, array['owner','admin']::public.school_role[])) with check (public.has_school_role(school_id, array['owner','admin']::public.school_role[]));

create policy "classes_member_select" on public.classes for select to authenticated using (public.is_school_member(school_id));
create policy "classes_admin_write" on public.classes for all to authenticated using (public.has_school_role(school_id, array['owner','admin']::public.school_role[])) with check (public.has_school_role(school_id, array['owner','admin']::public.school_role[]));

create policy "students_member_select" on public.students for select to authenticated using (public.is_school_member(school_id));
create policy "students_member_insert" on public.students for insert to authenticated with check (public.is_school_member(school_id));
create policy "students_member_update" on public.students for update to authenticated using (public.is_school_member(school_id)) with check (public.is_school_member(school_id));
create policy "students_admin_delete" on public.students for delete to authenticated using (public.has_school_role(school_id, array['owner','admin']::public.school_role[]));

create policy "class_students_member_select" on public.class_students for select to authenticated using (exists (select 1 from public.classes c where c.id = class_id and public.is_school_member(c.school_id)));
create policy "class_students_member_write" on public.class_students for all to authenticated using (exists (select 1 from public.classes c where c.id = class_id and public.is_school_member(c.school_id))) with check (exists (select 1 from public.classes c where c.id = class_id and public.is_school_member(c.school_id)));

create policy "subjects_member_select" on public.subjects for select to authenticated using (public.is_school_member(school_id));
create policy "subjects_admin_write" on public.subjects for all to authenticated using (public.has_school_role(school_id, array['owner','admin']::public.school_role[])) with check (public.has_school_role(school_id, array['owner','admin']::public.school_role[]));

create policy "assignments_member_select" on public.teaching_assignments for select to authenticated using (public.is_school_member(school_id));
create policy "assignments_admin_write" on public.teaching_assignments for all to authenticated using (public.has_school_role(school_id, array['owner','admin']::public.school_role[])) with check (public.has_school_role(school_id, array['owner','admin']::public.school_role[]));

create policy "schedules_member_select" on public.schedules for select to authenticated using (public.is_school_member(school_id));
create policy "schedules_admin_write" on public.schedules for all to authenticated using (public.has_school_role(school_id, array['owner','admin']::public.school_role[])) with check (public.has_school_role(school_id, array['owner','admin']::public.school_role[]));

create policy "attendance_member_select" on public.attendance_sessions for select to authenticated using (public.is_school_member(school_id));
create policy "attendance_teacher_insert" on public.attendance_sessions for insert to authenticated with check (public.is_school_member(school_id) and created_by = (select auth.uid()) and (public.is_assignment_teacher(teaching_assignment_id) or public.has_school_role(school_id, array['owner','admin']::public.school_role[])));
create policy "attendance_teacher_update" on public.attendance_sessions for update to authenticated using (created_by = (select auth.uid()) or public.has_school_role(school_id, array['owner','admin']::public.school_role[])) with check (public.is_school_member(school_id));
create policy "attendance_admin_delete" on public.attendance_sessions for delete to authenticated using (public.has_school_role(school_id, array['owner','admin']::public.school_role[]));

create policy "attendance_records_member_select" on public.attendance_records for select to authenticated using (exists (select 1 from public.attendance_sessions s where s.id = attendance_session_id and public.is_school_member(s.school_id)));
create policy "attendance_records_teacher_write" on public.attendance_records for all to authenticated using (exists (select 1 from public.attendance_sessions s where s.id = attendance_session_id and (s.created_by = (select auth.uid()) or public.has_school_role(s.school_id, array['owner','admin']::public.school_role[])))) with check (exists (select 1 from public.attendance_sessions s where s.id = attendance_session_id and public.is_school_member(s.school_id)));

create policy "journals_member_select" on public.teaching_journals for select to authenticated using (public.is_school_member(school_id));
create policy "journals_teacher_insert" on public.teaching_journals for insert to authenticated with check (created_by = (select auth.uid()) and public.is_school_member(school_id) and (public.is_assignment_teacher(teaching_assignment_id) or public.has_school_role(school_id, array['owner','admin']::public.school_role[])));
create policy "journals_teacher_update" on public.teaching_journals for update to authenticated using (created_by = (select auth.uid()) or public.has_school_role(school_id, array['owner','admin']::public.school_role[])) with check (public.is_school_member(school_id));
create policy "journals_admin_delete" on public.teaching_journals for delete to authenticated using (public.has_school_role(school_id, array['owner','admin']::public.school_role[]));

create policy "assessments_member_select" on public.assessments for select to authenticated using (public.is_school_member(school_id));
create policy "assessments_teacher_write" on public.assessments for all to authenticated using (created_by = (select auth.uid()) or public.has_school_role(school_id, array['owner','admin']::public.school_role[])) with check (public.is_school_member(school_id) and (public.is_assignment_teacher(teaching_assignment_id) or public.has_school_role(school_id, array['owner','admin']::public.school_role[])));

create policy "scores_member_select" on public.assessment_scores for select to authenticated using (exists (select 1 from public.assessments a where a.id = assessment_id and public.is_school_member(a.school_id)));
create policy "scores_teacher_write" on public.assessment_scores for all to authenticated using (exists (select 1 from public.assessments a where a.id = assessment_id and (a.created_by = (select auth.uid()) or public.has_school_role(a.school_id, array['owner','admin']::public.school_role[])))) with check (updated_by = (select auth.uid()) and exists (select 1 from public.assessments a where a.id = assessment_id and public.is_school_member(a.school_id)));

create policy "remedial_member_select" on public.remedial_attempts for select to authenticated using (public.is_school_member(school_id));
create policy "remedial_teacher_write" on public.remedial_attempts for all to authenticated using (created_by = (select auth.uid()) or public.has_school_role(school_id, array['owner','admin']::public.school_role[])) with check (created_by = (select auth.uid()) and public.is_school_member(school_id));

commit;
