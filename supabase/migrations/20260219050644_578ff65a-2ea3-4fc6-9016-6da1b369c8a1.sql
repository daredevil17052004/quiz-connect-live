
-- Quiz sessions table
CREATE TABLE public.quiz_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pin TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'paused', 'finished')),
  current_question INTEGER NOT NULL DEFAULT 0,
  question_start_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Players table (anonymous guests)
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Player responses
CREATE TABLE public.player_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  selected_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  response_time_ms INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(player_id, session_id, question_index)
);

-- Enable RLS
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_responses ENABLE ROW LEVEL SECURITY;

-- Quiz sessions policies
CREATE POLICY "Hosts can manage their sessions" ON public.quiz_sessions
  FOR ALL TO authenticated USING (auth.uid() = host_id) WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Anyone can read sessions by pin" ON public.quiz_sessions
  FOR SELECT TO anon USING (true);

-- Players policies (anonymous players need to join/read)
CREATE POLICY "Anyone can join as player" ON public.players
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anyone can read players in a session" ON public.players
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Hosts can manage players" ON public.players
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Player responses policies
CREATE POLICY "Anyone can submit responses" ON public.player_responses
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anyone can read responses" ON public.player_responses
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Hosts can manage responses" ON public.player_responses
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_responses;
