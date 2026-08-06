begin;

create or replace function public.import_class_students(
  p_class_id uuid,
  p_rows jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_class public.classes%rowtype;
  v_row jsonb;
  v_name text;
  v_code text;
  v_student_id uuid;
  v_inserted_students integer := 0;
  v_linked_students integer := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) < 1 then
    raise exception 'Rows must be a non-empty array';
  end if;

  if jsonb_array_length(p_rows) > 500 then
    raise exception 'Maksimal 500 murid per impor';
  end if;

  select * into v_class
  from public.classes
  where id = p_class_id
  for update;

  if not found then
    raise exception 'Kelas tidak ditemukan';
  end if;

  if not (
    private.has_school_role(v_class.school_id, array['owner','admin']::public.school_role[])
    or exists (
      select 1
      from public.teaching_assignments assignment
      where assignment.class_id = p_class_id
        and assignment.school_id = v_class.school_id
        and assignment.teacher_id = v_user_id
    )
  ) then
    raise exception 'Tidak memiliki izin mengelola murid kelas ini';
  end if;

  for v_row in select value from jsonb_array_elements(p_rows)
  loop
    v_name := trim(coalesce(v_row ->> 'display_name', ''));
    v_code := nullif(trim(coalesce(v_row ->> 'local_code', '')), '');

    if char_length(v_name) < 1 or char_length(v_name) > 150 then
      raise exception 'Nama murid tidak valid';
    end if;
    if v_code is not null and char_length(v_code) > 50 then
      raise exception 'Kode murid terlalu panjang';
    end if;

    v_student_id := null;
    if v_code is not null then
      select id into v_student_id
      from public.students
      where school_id = v_class.school_id
        and local_code = v_code
      limit 1;

      if v_student_id is null then
        insert into public.students (school_id, display_name, local_code, status)
        values (v_class.school_id, v_name, v_code, 'active')
        on conflict (school_id, local_code) where local_code is not null
        do update set
          display_name = excluded.display_name,
          status = 'active',
          updated_at = now()
        returning id into v_student_id;
        v_inserted_students := v_inserted_students + 1;
      else
        update public.students
        set display_name = v_name,
            status = 'active',
            updated_at = now()
        where id = v_student_id;
      end if;
    else
      insert into public.students (school_id, display_name, local_code, status)
      values (v_class.school_id, v_name, null, 'active')
      returning id into v_student_id;
      v_inserted_students := v_inserted_students + 1;
    end if;

    insert into public.class_students (class_id, student_id)
    values (p_class_id, v_student_id)
    on conflict (class_id, student_id) do nothing;

    if found then
      v_linked_students := v_linked_students + 1;
    end if;
  end loop;

  insert into public.audit_events (
    school_id,
    actor_id,
    event_type,
    entity_type,
    entity_id,
    metadata
  ) values (
    v_class.school_id,
    v_user_id,
    'class.students_imported',
    'class',
    p_class_id::text,
    jsonb_build_object(
      'submitted_rows', jsonb_array_length(p_rows),
      'new_students', v_inserted_students,
      'new_class_links', v_linked_students
    )
  );

  return jsonb_build_object(
    'submitted_rows', jsonb_array_length(p_rows),
    'new_students', v_inserted_students,
    'new_class_links', v_linked_students
  );
end;
$$;

revoke all on function public.import_class_students(uuid, jsonb) from public, anon;
grant execute on function public.import_class_students(uuid, jsonb) to authenticated;

commit;
