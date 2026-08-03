begin;

create extension if not exists pgcrypto;

create type public.school_role as enum ('owner', 'admin', 'teacher');
create type public.member_status as enum ('active', 'invited', 'suspended');
create type public.student_status as enum ('active', 'inactive', 'graduated', 'transferred');
create type public.attendance_status as enum ('present', 'sick', 'permission', 'absent', 'late');
create type public.record_state as enum ('draft', 'final');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 180),
  timezone text not null default 'Asia/Jakarta',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.school_members (
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.school_role not null default 'teacher',
  status public.member_status not null default 'active',
  joined_at timestamptz not null default now(),
  primary key (school_id, user_id)
);

create table public.academic_years (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null check (char_length(name) between 3 and 40),
  starts_on date not null,
  ends_on date not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  unique (school_id, name)
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  grade_level text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  unique (academic_year_id, name)
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 150),
  local_code text,
  status public.student_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (school_id, local_code)
);

create table public.class_students (
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  joined_on date,
  left_on date,
  primary key (class_id, student_id),
  check (left_on is null or joined_on is null or left_on >= joined_on)
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  code text,
  created_at timestamptz not null default now(),
  unique nulls not distinct (school_id, code)
);

create table public.teaching_assignments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id),
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (academic_year_id, teacher_id, class_id, subject_id)
);

create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  teaching_assignment_id uuid not null references public.teaching_assignments(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 1 and 7),
  starts_at time not null,
  ends_at time not null,
  room text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  teaching_assignment_id uuid not null references public.teaching_assignments(id) on delete cascade,
  session_date date not null,
  state public.record_state not null default 'draft',
  notes text check (char_length(notes) <= 2000),
  idempotency_key uuid not null default gen_random_uuid(),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (teaching_assignment_id, session_date),
  unique (school_id, idempotency_key)
);

create table public.attendance_records (
  attendance_session_id uuid not null references public.attendance_sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status public.attendance_status not null default 'present',
  note text check (char_length(note) <= 500),
  updated_at timestamptz not null default now(),
  primary key (attendance_session_id, student_id)
);

create table public.teaching_journals (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  teaching_assignment_id uuid not null references public.teaching_assignments(id) on delete cascade,
  attendance_session_id uuid references public.attendance_sessions(id) on delete set null,
  journal_date date not null,
  topic text not null check (char_length(topic) between 1 and 500),
  activity_summary text check (char_length(activity_summary) <= 5000),
  reflection text check (char_length(reflection) <= 5000),
  obstacle text check (char_length(obstacle) <= 3000),
  follow_up text check (char_length(follow_up) <= 3000),
  state public.record_state not null default 'draft',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (teaching_assignment_id, journal_date)
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  teaching_assignment_id uuid not null references public.teaching_assignments(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  category text not null default 'tugas',
  assessment_date date,
  max_score numeric(8,2) not null default 100 check (max_score > 0),
  weight numeric(6,3) not null default 1 check (weight >= 0),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.assessment_scores (
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  original_score numeric(8,2),
  final_score numeric(8,2),
  note text check (char_length(note) <= 1000),
  updated_by uuid not null references public.profiles(id),
  updated_at timestamptz not null default now(),
  primary key (assessment_id, student_id),
  check (original_score is null or original_score >= 0),
  check (final_score is null or final_score >= 0)
);

create table public.remedial_attempts (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  attempt_number smallint not null check (attempt_number > 0),
  score numeric(8,2) check (score is null or score >= 0),
  attempted_on date,
  note text check (char_length(note) <= 1000),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (assessment_id, student_id, attempt_number)
);

create index school_members_user_idx on public.school_members(user_id, status);
create index classes_school_year_idx on public.classes(school_id, academic_year_id);
create index students_school_name_idx on public.students(school_id, display_name);
create index teaching_assignments_teacher_idx on public.teaching_assignments(teacher_id, academic_year_id);
create index schedules_assignment_day_idx on public.schedules(teaching_assignment_id, day_of_week);
create index attendance_sessions_school_date_idx on public.attendance_sessions(school_id, session_date desc);
create index journals_school_date_idx on public.teaching_journals(school_id, journal_date desc);
create index assessments_assignment_date_idx on public.assessments(teaching_assignment_id, assessment_date desc);

create or replace function public.touch_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger students_touch before update on public.students for each row execute function public.touch_updated_at();
create trigger attendance_sessions_touch before update on public.attendance_sessions for each row execute function public.touch_updated_at();
create trigger attendance_records_touch before update on public.attendance_records for each row execute function public.touch_updated_at();
create trigger teaching_journals_touch before update on public.teaching_journals for each row execute function public.touch_updated_at();
create trigger assessment_scores_touch before update on public.assessment_scores for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1), 'Guru'));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

commit;
