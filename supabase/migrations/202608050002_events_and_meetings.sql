-- Wave 7: Events and Meetings
-- 1. Tables

CREATE TABLE public.events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'proposed', 'approved', 'completed', 'cancelled')),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.event_committees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.school_members(id) ON DELETE CASCADE,
  role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, member_id)
);

CREATE TABLE public.event_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  assignee_id uuid REFERENCES public.school_members(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.event_budgets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  category text NOT NULL DEFAULT 'expense' CHECK (category IN ('income', 'expense')),
  planned_amount integer NOT NULL DEFAULT 0,
  actual_amount integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.meetings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  date date NOT NULL,
  location text,
  notes text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.meeting_attendees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  meeting_id uuid NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.school_members(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'excused')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(meeting_id, member_id)
);

CREATE TABLE public.meeting_decisions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  meeting_id uuid NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  decision text NOT NULL,
  pic_id uuid REFERENCES public.school_members(id) ON DELETE SET NULL,
  due_date date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Indexes

CREATE INDEX idx_events_school_id ON public.events(school_id);
CREATE INDEX idx_event_committees_event_id ON public.event_committees(event_id);
CREATE INDEX idx_event_tasks_event_id ON public.event_tasks(event_id);
CREATE INDEX idx_event_budgets_event_id ON public.event_budgets(event_id);
CREATE INDEX idx_meetings_school_id ON public.meetings(school_id);
CREATE INDEX idx_meeting_attendees_meeting_id ON public.meeting_attendees(meeting_id);
CREATE INDEX idx_meeting_decisions_meeting_id ON public.meeting_decisions(meeting_id);

-- 3. Triggers for updated_at

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_tasks_updated_at
  BEFORE UPDATE ON public.event_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_budgets_updated_at
  BEFORE UPDATE ON public.event_budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_decisions_updated_at
  BEFORE UPDATE ON public.meeting_decisions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS Policies

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_decisions ENABLE ROW LEVEL SECURITY;

-- events
CREATE POLICY "Users can view events of their school"
  ON public.events FOR SELECT
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert events to their school"
  ON public.events FOR INSERT
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update events of their school"
  ON public.events FOR UPDATE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()))
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete events of their school"
  ON public.events FOR DELETE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

-- event_committees
CREATE POLICY "Users can view event_committees of their school"
  ON public.event_committees FOR SELECT
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert event_committees to their school"
  ON public.event_committees FOR INSERT
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update event_committees of their school"
  ON public.event_committees FOR UPDATE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()))
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete event_committees of their school"
  ON public.event_committees FOR DELETE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

-- event_tasks
CREATE POLICY "Users can view event_tasks of their school"
  ON public.event_tasks FOR SELECT
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert event_tasks to their school"
  ON public.event_tasks FOR INSERT
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update event_tasks of their school"
  ON public.event_tasks FOR UPDATE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()))
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete event_tasks of their school"
  ON public.event_tasks FOR DELETE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

-- event_budgets
CREATE POLICY "Users can view event_budgets of their school"
  ON public.event_budgets FOR SELECT
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert event_budgets to their school"
  ON public.event_budgets FOR INSERT
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update event_budgets of their school"
  ON public.event_budgets FOR UPDATE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()))
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete event_budgets of their school"
  ON public.event_budgets FOR DELETE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

-- meetings
CREATE POLICY "Users can view meetings of their school"
  ON public.meetings FOR SELECT
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert meetings to their school"
  ON public.meetings FOR INSERT
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update meetings of their school"
  ON public.meetings FOR UPDATE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()))
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete meetings of their school"
  ON public.meetings FOR DELETE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

-- meeting_attendees
CREATE POLICY "Users can view meeting_attendees of their school"
  ON public.meeting_attendees FOR SELECT
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert meeting_attendees to their school"
  ON public.meeting_attendees FOR INSERT
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update meeting_attendees of their school"
  ON public.meeting_attendees FOR UPDATE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()))
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete meeting_attendees of their school"
  ON public.meeting_attendees FOR DELETE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

-- meeting_decisions
CREATE POLICY "Users can view meeting_decisions of their school"
  ON public.meeting_decisions FOR SELECT
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert meeting_decisions to their school"
  ON public.meeting_decisions FOR INSERT
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update meeting_decisions of their school"
  ON public.meeting_decisions FOR UPDATE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()))
  WITH CHECK (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete meeting_decisions of their school"
  ON public.meeting_decisions FOR DELETE
  USING (school_id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));
