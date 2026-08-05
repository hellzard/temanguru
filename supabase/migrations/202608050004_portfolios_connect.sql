-- Wave 9: Connect and Portfolios
-- 1. Tables

CREATE TABLE public.portfolios_student (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'assignment',
  url text,
  document_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.portfolios_teacher (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.school_members(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'certificate' CHECK (category IN ('certificate', 'teaching_material', 'research', 'other')),
  date_obtained date,
  url text,
  document_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.supervision_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  supervisor_id uuid NOT NULL REFERENCES public.school_members(id) ON DELETE CASCADE,
  supervisee_id uuid NOT NULL REFERENCES public.school_members(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  date date NOT NULL,
  topic text NOT NULL,
  notes text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Indexes

CREATE INDEX idx_portfolios_student_school_id ON public.portfolios_student(school_id);
CREATE INDEX idx_portfolios_student_student_id ON public.portfolios_student(student_id);

CREATE INDEX idx_portfolios_teacher_school_id ON public.portfolios_teacher(school_id);
CREATE INDEX idx_portfolios_teacher_member_id ON public.portfolios_teacher(member_id);

CREATE INDEX idx_supervision_records_school_id ON public.supervision_records(school_id);
CREATE INDEX idx_supervision_records_supervisor ON public.supervision_records(supervisor_id);
CREATE INDEX idx_supervision_records_supervisee ON public.supervision_records(supervisee_id);

-- 3. Triggers for updated_at

CREATE TRIGGER update_portfolios_student_updated_at
  BEFORE UPDATE ON public.portfolios_student
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_teacher_updated_at
  BEFORE UPDATE ON public.portfolios_teacher
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supervision_records_updated_at
  BEFORE UPDATE ON public.supervision_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS Policies

ALTER TABLE public.portfolios_student ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios_teacher ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervision_records ENABLE ROW LEVEL SECURITY;

-- portfolios_student
CREATE POLICY "Users can view student portfolios of their school"
  ON public.portfolios_student FOR SELECT
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert student portfolios to their school"
  ON public.portfolios_student FOR INSERT
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update student portfolios of their school"
  ON public.portfolios_student FOR UPDATE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()))
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete student portfolios of their school"
  ON public.portfolios_student FOR DELETE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

-- portfolios_teacher
CREATE POLICY "Users can view teacher portfolios of their school"
  ON public.portfolios_teacher FOR SELECT
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert teacher portfolios to their school"
  ON public.portfolios_teacher FOR INSERT
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update teacher portfolios of their school"
  ON public.portfolios_teacher FOR UPDATE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()))
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete teacher portfolios of their school"
  ON public.portfolios_teacher FOR DELETE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

-- supervision_records
CREATE POLICY "Users can view supervision records of their school"
  ON public.supervision_records FOR SELECT
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert supervision records to their school"
  ON public.supervision_records FOR INSERT
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update supervision records of their school"
  ON public.supervision_records FOR UPDATE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()))
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete supervision records of their school"
  ON public.supervision_records FOR DELETE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));
