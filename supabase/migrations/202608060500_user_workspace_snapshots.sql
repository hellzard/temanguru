begin;

create table if not exists public.user_workspace_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  device_id text,
  updated_at timestamptz not null default now(),
  constraint user_workspace_payload_object check (jsonb_typeof(payload) = 'object'),
  constraint user_workspace_payload_size check (octet_length(payload::text) <= 10485760)
);

alter table public.user_workspace_snapshots enable row level security;

create policy "workspace owner can read snapshot"
  on public.user_workspace_snapshots for select
  to authenticated
  using (user_id = auth.uid());

create policy "workspace owner can create snapshot"
  on public.user_workspace_snapshots for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "workspace owner can update snapshot"
  on public.user_workspace_snapshots for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "workspace owner can delete snapshot"
  on public.user_workspace_snapshots for delete
  to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on public.user_workspace_snapshots to authenticated;
revoke all on public.user_workspace_snapshots from anon;

create index if not exists user_workspace_snapshots_updated_at_idx
  on public.user_workspace_snapshots(updated_at desc);

commit;
