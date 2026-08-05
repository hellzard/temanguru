-- Wave 8: School Operations
-- 1. Tables

CREATE TABLE public.inventory_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'other' CHECK (category IN ('electronics', 'furniture', 'sports', 'books', 'other')),
  location text,
  condition text NOT NULL DEFAULT 'good' CHECK (condition IN ('good', 'fair', 'damaged')),
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(school_id, code)
);

CREATE TABLE public.inventory_loans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  borrower_id uuid NOT NULL REFERENCES public.school_members(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue')),
  borrowed_at timestamptz NOT NULL DEFAULT now(),
  due_date timestamptz,
  returned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.maintenance_tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES public.school_members(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.duty_schedules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.school_members(id) ON DELETE CASCADE,
  date date NOT NULL,
  duty_type text NOT NULL CHECK (duty_type IN ('morning_gate', 'break_time', 'after_school')),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'swapped')),
  swap_requested_with uuid REFERENCES public.school_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Indexes

CREATE INDEX idx_inventory_items_school_id ON public.inventory_items(school_id);
CREATE INDEX idx_inventory_loans_item_id ON public.inventory_loans(item_id);
CREATE INDEX idx_inventory_loans_borrower_id ON public.inventory_loans(borrower_id);
CREATE INDEX idx_maintenance_tickets_school_id ON public.maintenance_tickets(school_id);
CREATE INDEX idx_duty_schedules_member_id ON public.duty_schedules(member_id);
CREATE INDEX idx_duty_schedules_date ON public.duty_schedules(date);

-- 3. Triggers for updated_at

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_loans_updated_at
  BEFORE UPDATE ON public.inventory_loans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_tickets_updated_at
  BEFORE UPDATE ON public.maintenance_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_duty_schedules_updated_at
  BEFORE UPDATE ON public.duty_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS Policies

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duty_schedules ENABLE ROW LEVEL SECURITY;

-- inventory_items
CREATE POLICY "Users can view inventory of their school"
  ON public.inventory_items FOR SELECT
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert inventory to their school"
  ON public.inventory_items FOR INSERT
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update inventory of their school"
  ON public.inventory_items FOR UPDATE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()))
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete inventory of their school"
  ON public.inventory_items FOR DELETE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

-- inventory_loans
CREATE POLICY "Users can view loans of their school"
  ON public.inventory_loans FOR SELECT
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert loans to their school"
  ON public.inventory_loans FOR INSERT
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update loans of their school"
  ON public.inventory_loans FOR UPDATE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()))
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete loans of their school"
  ON public.inventory_loans FOR DELETE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

-- maintenance_tickets
CREATE POLICY "Users can view maintenance_tickets of their school"
  ON public.maintenance_tickets FOR SELECT
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert maintenance_tickets to their school"
  ON public.maintenance_tickets FOR INSERT
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update maintenance_tickets of their school"
  ON public.maintenance_tickets FOR UPDATE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()))
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete maintenance_tickets of their school"
  ON public.maintenance_tickets FOR DELETE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

-- duty_schedules
CREATE POLICY "Users can view duty_schedules of their school"
  ON public.duty_schedules FOR SELECT
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert duty_schedules to their school"
  ON public.duty_schedules FOR INSERT
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update duty_schedules of their school"
  ON public.duty_schedules FOR UPDATE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()))
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete duty_schedules of their school"
  ON public.duty_schedules FOR DELETE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));
