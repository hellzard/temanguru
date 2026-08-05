begin;

-- Composite uniqueness required by same-tenant foreign keys.
create unique index if not exists academic_years_id_school_uidx on public.academic_years(id, school_id);
create unique index if not exists classes_id_school_uidx on public.classes(id, school_id);
create unique index if not exists students_id_school_uidx on public.students(id, school_id);
create unique index if not exists subjects_id_school_uidx on public.subjects(id, school_id);
create unique index if not exists assignments_id_school_uidx on public.teaching_assignments(id, school_id);
create unique index if not exists attendance_sessions_id_school_uidx on public.attendance_sessions(id, school_id);
create unique index if not exists assessments_id_school_uidx on public.assessments(id, school_id);
create unique index if not exists school_members_id_school_uidx on public.school_members(id, school_id);
create unique index if not exists events_id_school_uidx on public.events(id, school_id);
create unique index if not exists meetings_id_school_uidx on public.meetings(id, school_id);
create unique index if not exists inventory_items_id_school_uidx on public.inventory_items(id, school_id);

-- Feature-table tenant constraints. NOT VALID still protects new writes while
-- allowing old rows to be audited before validation.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'classes_year_same_school_fk') then
    alter table public.classes
      add constraint classes_year_same_school_fk
      foreign key (academic_year_id, school_id)
      references public.academic_years(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'assignments_year_same_school_fk') then
    alter table public.teaching_assignments
      add constraint assignments_year_same_school_fk
      foreign key (academic_year_id, school_id)
      references public.academic_years(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'assignments_class_same_school_fk') then
    alter table public.teaching_assignments
      add constraint assignments_class_same_school_fk
      foreign key (class_id, school_id)
      references public.classes(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'assignments_subject_same_school_fk') then
    alter table public.teaching_assignments
      add constraint assignments_subject_same_school_fk
      foreign key (subject_id, school_id)
      references public.subjects(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'schedules_assignment_same_school_fk') then
    alter table public.schedules
      add constraint schedules_assignment_same_school_fk
      foreign key (teaching_assignment_id, school_id)
      references public.teaching_assignments(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'attendance_assignment_same_school_fk') then
    alter table public.attendance_sessions
      add constraint attendance_assignment_same_school_fk
      foreign key (teaching_assignment_id, school_id)
      references public.teaching_assignments(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'journals_assignment_same_school_fk') then
    alter table public.teaching_journals
      add constraint journals_assignment_same_school_fk
      foreign key (teaching_assignment_id, school_id)
      references public.teaching_assignments(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'journals_session_same_school_fk') then
    alter table public.teaching_journals
      add constraint journals_session_same_school_fk
      foreign key (attendance_session_id, school_id)
      references public.attendance_sessions(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'assessments_assignment_same_school_fk') then
    alter table public.assessments
      add constraint assessments_assignment_same_school_fk
      foreign key (teaching_assignment_id, school_id)
      references public.teaching_assignments(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'remedial_assessment_same_school_fk') then
    alter table public.remedial_attempts
      add constraint remedial_assessment_same_school_fk
      foreign key (assessment_id, school_id)
      references public.assessments(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'remedial_student_same_school_fk') then
    alter table public.remedial_attempts
      add constraint remedial_student_same_school_fk
      foreign key (student_id, school_id)
      references public.students(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'event_committees_event_same_school_fk') then
    alter table public.event_committees
      add constraint event_committees_event_same_school_fk
      foreign key (event_id, school_id)
      references public.events(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'event_committees_member_same_school_fk') then
    alter table public.event_committees
      add constraint event_committees_member_same_school_fk
      foreign key (member_id, school_id)
      references public.school_members(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'event_tasks_event_same_school_fk') then
    alter table public.event_tasks
      add constraint event_tasks_event_same_school_fk
      foreign key (event_id, school_id)
      references public.events(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'event_tasks_assignee_same_school_fk') then
    alter table public.event_tasks
      add constraint event_tasks_assignee_same_school_fk
      foreign key (assignee_id, school_id)
      references public.school_members(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'event_budgets_event_same_school_fk') then
    alter table public.event_budgets
      add constraint event_budgets_event_same_school_fk
      foreign key (event_id, school_id)
      references public.events(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'meeting_attendees_meeting_same_school_fk') then
    alter table public.meeting_attendees
      add constraint meeting_attendees_meeting_same_school_fk
      foreign key (meeting_id, school_id)
      references public.meetings(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'meeting_attendees_member_same_school_fk') then
    alter table public.meeting_attendees
      add constraint meeting_attendees_member_same_school_fk
      foreign key (member_id, school_id)
      references public.school_members(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'meeting_decisions_meeting_same_school_fk') then
    alter table public.meeting_decisions
      add constraint meeting_decisions_meeting_same_school_fk
      foreign key (meeting_id, school_id)
      references public.meetings(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'meeting_decisions_pic_same_school_fk') then
    alter table public.meeting_decisions
      add constraint meeting_decisions_pic_same_school_fk
      foreign key (pic_id, school_id)
      references public.school_members(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'inventory_loans_item_same_school_fk') then
    alter table public.inventory_loans
      add constraint inventory_loans_item_same_school_fk
      foreign key (item_id, school_id)
      references public.inventory_items(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'inventory_loans_borrower_same_school_fk') then
    alter table public.inventory_loans
      add constraint inventory_loans_borrower_same_school_fk
      foreign key (borrower_id, school_id)
      references public.school_members(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'maintenance_reporter_same_school_fk') then
    alter table public.maintenance_tickets
      add constraint maintenance_reporter_same_school_fk
      foreign key (reporter_id, school_id)
      references public.school_members(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'maintenance_item_same_school_fk') then
    alter table public.maintenance_tickets
      add constraint maintenance_item_same_school_fk
      foreign key (item_id, school_id)
      references public.inventory_items(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'duty_member_same_school_fk') then
    alter table public.duty_schedules
      add constraint duty_member_same_school_fk
      foreign key (member_id, school_id)
      references public.school_members(id, school_id) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'duty_swap_member_same_school_fk') then
    alter table public.duty_schedules
      add constraint duty_swap_member_same_school_fk
      foreign key (swap_requested_with, school_id)
      references public.school_members(id, school_id) not valid;
  end if;
end $$;

create unique index if not exists inventory_loans_one_active_per_item_uidx
  on public.inventory_loans(item_id)
  where status = 'active';

-- Foreign-key indexes reported by Supabase Advisor.
create index if not exists assessment_scores_student_idx on public.assessment_scores(student_id);
create index if not exists assessment_scores_updated_by_idx on public.assessment_scores(updated_by);
create index if not exists assessments_created_by_idx on public.assessments(created_by);
create index if not exists assessments_school_idx on public.assessments(school_id);
create index if not exists attendance_records_student_idx on public.attendance_records(student_id);
create index if not exists attendance_sessions_created_by_idx on public.attendance_sessions(created_by);
create index if not exists class_students_student_idx on public.class_students(student_id);
create index if not exists remedial_created_by_idx on public.remedial_attempts(created_by);
create index if not exists remedial_school_idx on public.remedial_attempts(school_id);
create index if not exists remedial_student_idx on public.remedial_attempts(student_id);
create index if not exists schedules_school_idx on public.schedules(school_id);
create index if not exists schools_created_by_idx on public.schools(created_by);
create index if not exists assignments_class_idx on public.teaching_assignments(class_id);
create index if not exists assignments_school_idx on public.teaching_assignments(school_id);
create index if not exists assignments_subject_idx on public.teaching_assignments(subject_id);
create index if not exists journals_session_idx on public.teaching_journals(attendance_session_id);
create index if not exists journals_created_by_idx on public.teaching_journals(created_by);

-- Cross-school validation for junction tables that do not carry school_id.
create or replace function private.enforce_class_student_tenant()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_class_school uuid;
  v_student_school uuid;
begin
  select school_id into v_class_school from public.classes where id = new.class_id;
  select school_id into v_student_school from public.students where id = new.student_id;
  if v_class_school is null or v_student_school is null or v_class_school <> v_student_school then
    raise exception 'Class and student must belong to the same school';
  end if;
  return new;
end;
$$;

drop trigger if exists class_students_tenant_guard on public.class_students;
create trigger class_students_tenant_guard
before insert or update on public.class_students
for each row execute function private.enforce_class_student_tenant();

create or replace function private.enforce_attendance_record_tenant()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session_school uuid;
  v_student_school uuid;
begin
  select school_id into v_session_school
  from public.attendance_sessions
  where id = new.attendance_session_id;

  select school_id into v_student_school
  from public.students
  where id = new.student_id;

  if v_session_school is null or v_student_school is null or v_session_school <> v_student_school then
    raise exception 'Attendance session and student must belong to the same school';
  end if;
  return new;
end;
$$;

drop trigger if exists attendance_records_tenant_guard on public.attendance_records;
create trigger attendance_records_tenant_guard
before insert or update on public.attendance_records
for each row execute function private.enforce_attendance_record_tenant();

create or replace function private.enforce_assessment_score_tenant()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assessment_school uuid;
  v_student_school uuid;
begin
  select school_id into v_assessment_school
  from public.assessments
  where id = new.assessment_id;

  select school_id into v_student_school
  from public.students
  where id = new.student_id;

  if v_assessment_school is null or v_student_school is null or v_assessment_school <> v_student_school then
    raise exception 'Assessment and student must belong to the same school';
  end if;
  return new;
end;
$$;

drop trigger if exists assessment_scores_tenant_guard on public.assessment_scores;
create trigger assessment_scores_tenant_guard
before insert or update on public.assessment_scores
for each row execute function private.enforce_assessment_score_tenant();

commit;
