begin;

-- `unique nulls not distinct` allowed only one NULL code per school. Codes are
-- optional, so uniqueness must apply only when a code is actually provided.
alter table public.students
  drop constraint if exists students_school_id_local_code_key;
alter table public.subjects
  drop constraint if exists subjects_school_id_code_key;
alter table public.school_documents
  drop constraint if exists school_documents_school_id_document_number_key;

create unique index if not exists students_school_local_code_uidx
  on public.students (school_id, local_code)
  where local_code is not null;

create unique index if not exists subjects_school_code_uidx
  on public.subjects (school_id, code)
  where code is not null;

create unique index if not exists school_documents_number_uidx
  on public.school_documents (school_id, document_number)
  where document_number is not null;

commit;
