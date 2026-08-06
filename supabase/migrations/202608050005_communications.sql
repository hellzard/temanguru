begin;

create type public.communication_status as enum ('draft', 'sent');

create table public.communication_drafts (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  subject text,
  message text not null,
  status public.communication_status not null default 'draft',
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.communication_drafts enable row level security;

commit;
