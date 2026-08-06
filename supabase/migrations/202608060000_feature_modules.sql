begin;

-- A stable member id makes cross-module references safer while preserving the
-- original (school_id, user_id) uniqueness used by the first migration.
alter table public.school_members
  add column if not exists id uuid default gen_random_uuid();
update public.school_members set id = gen_random_uuid() where id is null;
alter table public.school_members alter column id set not null;
create unique index if not exists school_members_id_uidx on public.school_members(id);

-- Document Studio -----------------------------------------------------------
create type public.document_status as enum ('draft', 'in_review', 'changes_requested', 'finalized', 'archived');
create type public.visual_asset_type as enum ('signature', 'stamp', 'logo');

create table public.brand_kits (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null unique references public.schools(id) on delete cascade,
  school_name text,
  address text,
  phone text,
  email text,
  website text,
  primary_color text not null default '#4f46e5' check (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_color text not null default '#0ea5e9' check (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  logo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_templates (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 160),
  category text not null default 'general',
  description text,
  body_template text not null default '',
  variables jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, name)
);

create table public.school_documents (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  template_id uuid references public.document_templates(id) on delete set null,
  title text not null check (char_length(title) between 2 and 220),
  document_number text,
  status public.document_status not null default 'draft',
  content jsonb not null default '{}'::jsonb,
  rendered_html text,
  finalized_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (school_id, document_number)
);

create table public.visual_assets (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete cascade,
  asset_type public.visual_asset_type not null,
  label text not null check (char_length(label) between 1 and 120),
  storage_path text not null unique,
  mime_type text not null check (mime_type in ('image/png','image/jpeg','image/webp')),
  is_active boolean not null default true,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  check (
    (asset_type = 'signature' and owner_id is not null)
    or (asset_type in ('stamp','logo'))
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'teman-guru-assets',
  'teman-guru-assets',
  false,
  5242880,
  array['image/png','image/jpeg','image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Events and meetings -------------------------------------------------------
create type public.event_status as enum ('draft', 'proposed', 'approved', 'ongoing', 'completed', 'cancelled');
create type public.task_status as enum ('todo', 'doing', 'blocked', 'done');
create type public.meeting_status as enum ('scheduled', 'ongoing', 'completed', 'cancelled');
create type public.decision_status as enum ('open', 'in_progress', 'done', 'cancelled');

create table public.events (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 220),
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status public.event_status not null default 'draft',
  budget_limit numeric(14,2) check (budget_limit is null or budget_limit >= 0),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);

create table public.event_committees (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  member_id uuid not null references public.school_members(id) on delete cascade,
  role_name text not null check (char_length(role_name) between 1 and 120),
  notes text,
  created_at timestamptz not null default now(),
  unique (event_id, member_id, role_name)
);

create table public.event_tasks (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 220),
  description text,
  assignee_id uuid references public.school_members(id) on delete set null,
  due_at timestamptz,
  status public.task_status not null default 'todo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_budgets (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  category text not null check (char_length(category) between 1 and 120),
  description text,
  planned_amount numeric(14,2) not null default 0 check (planned_amount >= 0),
  actual_amount numeric(14,2) not null default 0 check (actual_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 220),
  agenda text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status public.meeting_status not null default 'scheduled',
  minutes text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);

create table public.meeting_attendees (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  member_id uuid not null references public.school_members(id) on delete cascade,
  attendance_status text not null default 'invited' check (attendance_status in ('invited','present','absent','excused')),
  created_at timestamptz not null default now(),
  unique (meeting_id, member_id)
);

create table public.meeting_decisions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  decision text not null check (char_length(decision) between 2 and 2000),
  pic_id uuid references public.school_members(id) on delete set null,
  due_on date,
  status public.decision_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- School operations ---------------------------------------------------------
create type public.inventory_condition as enum ('good', 'fair', 'damaged', 'retired');
create type public.loan_status as enum ('active', 'returned', 'overdue', 'cancelled');
create type public.ticket_status as enum ('open', 'triaged', 'in_progress', 'resolved', 'cancelled');
create type public.ticket_priority as enum ('low', 'normal', 'high', 'urgent');
create type public.duty_status as enum ('scheduled', 'completed', 'absent', 'swap_requested', 'swapped');

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  code text not null check (char_length(code) between 1 and 100),
  name text not null check (char_length(name) between 1 and 180),
  category text not null default 'other',
  location text,
  condition public.inventory_condition not null default 'good',
  quantity integer not null default 1 check (quantity > 0),
  is_available boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, code)
);

create table public.inventory_loans (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  item_id uuid not null references public.inventory_items(id) on delete cascade,
  borrower_id uuid not null references public.school_members(id) on delete cascade,
  status public.loan_status not null default 'active',
  borrowed_at timestamptz not null default now(),
  due_date timestamptz,
  returned_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.maintenance_tickets (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  item_id uuid references public.inventory_items(id) on delete set null,
  reporter_id uuid not null references public.school_members(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 220),
  description text not null check (char_length(description) between 2 and 3000),
  priority public.ticket_priority not null default 'normal',
  status public.ticket_status not null default 'open',
  resolution_note text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.duty_schedules (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  member_id uuid not null references public.school_members(id) on delete cascade,
  duty_date date not null,
  shift_name text not null check (char_length(shift_name) between 1 and 120),
  location text,
  status public.duty_status not null default 'scheduled',
  swap_requested_with uuid references public.school_members(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, member_id, duty_date, shift_name)
);

-- Portfolios, supervision, and parent communication -------------------------
create type public.portfolio_visibility as enum ('private', 'school', 'public_link');
create type public.supervision_status as enum ('planned', 'in_progress', 'completed', 'cancelled');

create table public.portfolios_student (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 220),
  description text,
  evidence_url text,
  evidence_date date,
  tags text[] not null default '{}',
  visibility public.portfolio_visibility not null default 'school',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolios_teacher (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  member_id uuid not null references public.school_members(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 220),
  description text,
  category text not null default 'achievement',
  evidence_url text,
  achieved_on date,
  tags text[] not null default '{}',
  visibility public.portfolio_visibility not null default 'school',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.supervision_records (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  supervisor_id uuid not null references public.school_members(id) on delete cascade,
  supervisee_id uuid not null references public.school_members(id) on delete cascade,
  scheduled_at timestamptz not null,
  status public.supervision_status not null default 'planned',
  focus_area text,
  observation_note text,
  feedback text,
  follow_up text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (supervisor_id <> supervisee_id)
);

create table public.communication_drafts (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  channel text not null default 'whatsapp' check (channel in ('whatsapp','sms','email','other')),
  subject text,
  message text not null check (char_length(message) between 1 and 4000),
  status text not null default 'draft' check (status in ('draft','copied','opened')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Consistent updated_at behavior.
create trigger brand_kits_touch before update on public.brand_kits for each row execute function public.touch_updated_at();
create trigger document_templates_touch before update on public.document_templates for each row execute function public.touch_updated_at();
create trigger school_documents_touch before update on public.school_documents for each row execute function public.touch_updated_at();
create trigger events_touch before update on public.events for each row execute function public.touch_updated_at();
create trigger event_tasks_touch before update on public.event_tasks for each row execute function public.touch_updated_at();
create trigger event_budgets_touch before update on public.event_budgets for each row execute function public.touch_updated_at();
create trigger meetings_touch before update on public.meetings for each row execute function public.touch_updated_at();
create trigger meeting_decisions_touch before update on public.meeting_decisions for each row execute function public.touch_updated_at();
create trigger inventory_items_touch before update on public.inventory_items for each row execute function public.touch_updated_at();
create trigger inventory_loans_touch before update on public.inventory_loans for each row execute function public.touch_updated_at();
create trigger maintenance_tickets_touch before update on public.maintenance_tickets for each row execute function public.touch_updated_at();
create trigger duty_schedules_touch before update on public.duty_schedules for each row execute function public.touch_updated_at();
create trigger portfolios_student_touch before update on public.portfolios_student for each row execute function public.touch_updated_at();
create trigger portfolios_teacher_touch before update on public.portfolios_teacher for each row execute function public.touch_updated_at();
create trigger supervision_records_touch before update on public.supervision_records for each row execute function public.touch_updated_at();
create trigger communication_drafts_touch before update on public.communication_drafts for each row execute function public.touch_updated_at();

-- Every tenant table starts locked. The following hardening migration adds
-- command-specific policies with active-membership and role checks.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'brand_kits','document_templates','school_documents','visual_assets',
    'events','event_committees','event_tasks','event_budgets',
    'meetings','meeting_attendees','meeting_decisions',
    'inventory_items','inventory_loans','maintenance_tickets','duty_schedules',
    'portfolios_student','portfolios_teacher','supervision_records','communication_drafts'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

-- Communication drafts are deliberately private to their creator or admins.
create policy "communication_owner_select" on public.communication_drafts
for select to authenticated using (
  created_by = (select auth.uid())
  or public.has_school_role(school_id, array['owner','admin']::public.school_role[])
);
create policy "communication_owner_insert" on public.communication_drafts
for insert to authenticated with check (
  created_by = (select auth.uid())
  and public.is_school_member(school_id)
);
create policy "communication_owner_update" on public.communication_drafts
for update to authenticated
using (created_by = (select auth.uid()))
with check (created_by = (select auth.uid()));
create policy "communication_owner_delete" on public.communication_drafts
for delete to authenticated using (created_by = (select auth.uid()));

commit;
