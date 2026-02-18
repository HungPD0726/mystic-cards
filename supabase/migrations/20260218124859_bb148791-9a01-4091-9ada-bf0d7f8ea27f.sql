
-- Create readings table to store tarot reading history per user
CREATE TABLE IF NOT EXISTS public.readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  spread_type TEXT NOT NULL,
  spread_name TEXT NOT NULL,
  drawn_cards JSONB NOT NULL DEFAULT '[]',
  ai_interpretation TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.readings ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only access their own readings
CREATE POLICY "Users can view their own readings"
  ON public.readings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own readings"
  ON public.readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own readings"
  ON public.readings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own readings"
  ON public.readings FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_readings_updated_at
  BEFORE UPDATE ON public.readings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
