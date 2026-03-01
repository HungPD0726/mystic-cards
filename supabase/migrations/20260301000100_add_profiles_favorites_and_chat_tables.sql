-- Add user profile, favorite cards, and chat history tables.
-- This migration keeps data private per user using RLS.

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  birth_date DATE,
  zodiac_sign TEXT,
  preferred_spread TEXT,
  theme TEXT NOT NULL DEFAULT 'system',
  language TEXT NOT NULL DEFAULT 'vi',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.favorite_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_slug TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT favorite_cards_unique_user_card UNIQUE (user_id, card_slug),
  CONSTRAINT favorite_cards_card_slug_not_blank CHECK (char_length(trim(card_slug)) > 0)
);

CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT chat_messages_role_check CHECK (role IN ('user', 'assistant', 'system')),
  CONSTRAINT chat_messages_content_not_blank CHECK (char_length(trim(content)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_readings_user_created_at
  ON public.readings(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_favorite_cards_user_id
  ON public.favorite_cards(user_id);

CREATE INDEX IF NOT EXISTS idx_favorite_cards_card_slug
  ON public.favorite_cards(card_slug);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_last_message
  ON public.chat_sessions(user_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created
  ON public.chat_messages(session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created
  ON public.chat_messages(user_id, created_at);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'Users can manage their own profile'
  ) THEN
    CREATE POLICY "Users can manage their own profile"
      ON public.user_profiles
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'favorite_cards'
      AND policyname = 'Users can manage their own favorite cards'
  ) THEN
    CREATE POLICY "Users can manage their own favorite cards"
      ON public.favorite_cards
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'chat_sessions'
      AND policyname = 'Users can manage their own chat sessions'
  ) THEN
    CREATE POLICY "Users can manage their own chat sessions"
      ON public.chat_sessions
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'chat_messages'
      AND policyname = 'Users can manage their own chat messages'
  ) THEN
    CREATE POLICY "Users can manage their own chat messages"
      ON public.chat_messages
      FOR ALL
      USING (
        auth.uid() = user_id
        AND EXISTS (
          SELECT 1
          FROM public.chat_sessions cs
          WHERE cs.id = session_id
            AND cs.user_id = auth.uid()
        )
      )
      WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
          SELECT 1
          FROM public.chat_sessions cs
          WHERE cs.id = session_id
            AND cs.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_favorite_cards_updated_at ON public.favorite_cards;
CREATE TRIGGER update_favorite_cards_updated_at
  BEFORE UPDATE ON public.favorite_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON public.chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.touch_chat_session_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_sessions
  SET last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.session_id
    AND user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS touch_chat_session_last_message ON public.chat_messages;
CREATE TRIGGER touch_chat_session_last_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_chat_session_last_message();
