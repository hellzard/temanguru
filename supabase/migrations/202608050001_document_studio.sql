begin;

create type public.document_status as enum ('draft', 'submitted', 'in_review', 'changes_requested', 'approved', 'finalized', 'archived', 'revoked');

create table public.brand_kits (
  school_id uuid primary key references public.schools(id) on delete cascade,
  logo_url text,
  primary_color text default '#4F46E5',
  letterhead_config jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_templates (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 180),
  category text,
  content_schema jsonb not null default '{}',
  is_active boolean not null default true,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.school_documents (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  template_id uuid references public.document_templates(id) on delete set null,
  title text not null check (char_length(title) between 2 and 255),
  document_number text,
  status public.document_status not null default 'draft',
  content_data jsonb not null default '{}',
  variables jsonb not null default '{}',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finalized_at timestamptz,
  sha256_hash text
);

create table public.visual_assets (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete cascade, -- null for school-wide stamps
  asset_type text not null check (asset_type in ('signature', 'stamp')),
  storage_path text not null,
  is_active boolean not null default true,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create trigger brand_kits_touch before update on public.brand_kits for each row execute function public.touch_updated_at();
create trigger document_templates_touch before update on public.document_templates for each row execute function public.touch_updated_at();
create trigger school_documents_touch before update on public.school_documents for each row execute function public.touch_updated_at();

-- RLS Policies
alter table public.brand_kits enable row level security;
alter table public.document_templates enable row level security;
alter table public.school_documents enable row level security;
alter table public.visual_assets enable row level security;

-- Brand Kits: Any member can read, only admin/owner can update
create policy "School members can view brand kits" on public.brand_kits
  for select using (
    exists (select 1 from public.school_members sm where sm.school_id = brand_kits.school_id and sm.user_id = auth.uid())
  );
create policy "Admins can update brand kits" on public.brand_kits
  for all using (
    exists (select 1 from public.school_members sm where sm.school_id = brand_kits.school_id and sm.user_id = auth.uid() and sm.role in ('admin', 'owner'))
  );

-- Templates: Any member can read, admins can manage
create policy "School members can view active templates" on public.document_templates
  for select using (
    exists (select 1 from public.school_members sm where sm.school_id = document_templates.school_id and sm.user_id = auth.uid())
  );
create policy "Admins can manage templates" on public.document_templates
  for all using (
    exists (select 1 from public.school_members sm where sm.school_id = document_templates.school_id and sm.user_id = auth.uid() and sm.role in ('admin', 'owner'))
  );

-- Documents: Members can read finalized, creator can manage drafts, admins can manage all
create policy "Members can read documents" on public.school_documents
  for select using (
    exists (select 1 from public.school_members sm where sm.school_id = school_documents.school_id and sm.user_id = auth.uid())
  );
create policy "Creator can manage their documents" on public.school_documents
  for all using (
    created_by = auth.uid() or
    exists (select 1 from public.school_members sm where sm.school_id = school_documents.school_id and sm.user_id = auth.uid() and sm.role in ('admin', 'owner'))
  );

-- Visual Assets: Owner can manage their own, Admins can manage school stamps
create policy "Owner can manage own assets" on public.visual_assets
  for all using (
    owner_id = auth.uid() or
    (owner_id is null and exists (select 1 from public.school_members sm where sm.school_id = visual_assets.school_id and sm.user_id = auth.uid() and sm.role in ('admin', 'owner')))
  );
create policy "Members can view active assets" on public.visual_assets
  for select using (
    is_active = true and
    exists (select 1 from public.school_members sm where sm.school_id = visual_assets.school_id and sm.user_id = auth.uid())
  );

-- Create Storage Bucket for Document Studio
insert into storage.buckets (id, name, public) 
values ('teman-guru-assets', 'teman-guru-assets', false)
on conflict (id) do nothing;

create policy "School members can view assets" on storage.objects
  for select using (
    bucket_id = 'teman-guru-assets' and
    exists (select 1 from public.school_members sm where sm.school_id::text = (storage.foldername(name))[1] and sm.user_id = auth.uid())
  );
  
create policy "Admins can upload assets" on storage.objects
  for insert with check (
    bucket_id = 'teman-guru-assets' and
    exists (select 1 from public.school_members sm where sm.school_id::text = (storage.foldername(name))[1] and sm.user_id = auth.uid() and sm.role in ('admin', 'owner'))
  );

commit;
