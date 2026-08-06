begin;

-- Signatures are private to their owner. School stamps are restricted to
-- owner/admin. School logos may be read by active members for document output.
drop policy if exists "visual_assets_authorized_select" on public.visual_assets;
drop policy if exists "visual_assets_authorized_insert" on public.visual_assets;
drop policy if exists "visual_assets_authorized_update" on public.visual_assets;
drop policy if exists "visual_assets_authorized_delete" on public.visual_assets;

create policy "visual_assets_authorized_select" on public.visual_assets
for select to authenticated using (
  is_active
  and (
    (asset_type = 'signature' and owner_id = (select auth.uid()))
    or (asset_type = 'stamp' and owner_id is null and private.has_school_role(school_id, array['owner','admin']::public.school_role[]))
    or (asset_type = 'logo' and owner_id is null and private.is_active_school_member(school_id))
  )
);

create policy "visual_assets_authorized_insert" on public.visual_assets
for insert to authenticated with check (
  created_by = (select auth.uid())
  and (
    (asset_type = 'signature' and owner_id = (select auth.uid()) and private.is_active_school_member(school_id))
    or (asset_type in ('stamp','logo') and owner_id is null and private.has_school_role(school_id, array['owner','admin']::public.school_role[]))
  )
);

create policy "visual_assets_authorized_update" on public.visual_assets
for update to authenticated
using (
  (asset_type = 'signature' and owner_id = (select auth.uid()))
  or (asset_type in ('stamp','logo') and owner_id is null and private.has_school_role(school_id, array['owner','admin']::public.school_role[]))
)
with check (
  (asset_type = 'signature' and owner_id = (select auth.uid()))
  or (asset_type in ('stamp','logo') and owner_id is null and private.has_school_role(school_id, array['owner','admin']::public.school_role[]))
);

create policy "visual_assets_authorized_delete" on public.visual_assets
for delete to authenticated using (
  (asset_type = 'signature' and owner_id = (select auth.uid()))
  or (asset_type in ('stamp','logo') and owner_id is null and private.has_school_role(school_id, array['owner','admin']::public.school_role[]))
);

drop policy if exists "assets_authorized_select" on storage.objects;
drop policy if exists "assets_authorized_delete" on storage.objects;

create policy "assets_authorized_select" on storage.objects
for select to authenticated using (
  bucket_id = 'teman-guru-assets'
  and exists (
    select 1 from public.visual_assets va
    where va.storage_path = storage.objects.name
      and va.is_active
      and (
        (va.asset_type = 'signature' and va.owner_id = (select auth.uid()))
        or (va.asset_type = 'stamp' and va.owner_id is null and private.has_school_role(va.school_id, array['owner','admin']::public.school_role[]))
        or (va.asset_type = 'logo' and va.owner_id is null and private.is_active_school_member(va.school_id))
      )
  )
);

create policy "assets_authorized_delete" on storage.objects
for delete to authenticated using (
  bucket_id = 'teman-guru-assets'
  and exists (
    select 1 from public.visual_assets va
    where va.storage_path = storage.objects.name
      and (
        (va.asset_type = 'signature' and va.owner_id = (select auth.uid()))
        or (va.asset_type in ('stamp','logo') and va.owner_id is null and private.has_school_role(va.school_id, array['owner','admin']::public.school_role[]))
      )
  )
);

commit;
