
-- Create atomic score increment function (bypasses RLS safely)
CREATE OR REPLACE FUNCTION public.increment_player_score(p_player_id uuid, p_score integer)
RETURNS void AS $$
BEGIN
  UPDATE public.players
  SET total_score = total_score + p_score
  WHERE id = p_player_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix RLS: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Anyone can join as player" ON public.players;
DROP POLICY IF EXISTS "Anyone can read players in a session" ON public.players;
DROP POLICY IF EXISTS "Hosts can manage players" ON public.players;

CREATE POLICY "Anyone can join as player" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Anyone can update players" ON public.players FOR UPDATE USING (true);

-- Also fix player_responses policies
DROP POLICY IF EXISTS "Anyone can read responses" ON public.player_responses;
DROP POLICY IF EXISTS "Anyone can submit responses" ON public.player_responses;
DROP POLICY IF EXISTS "Hosts can manage responses" ON public.player_responses;

CREATE POLICY "Anyone can read responses" ON public.player_responses FOR SELECT USING (true);
CREATE POLICY "Anyone can submit responses" ON public.player_responses FOR INSERT WITH CHECK (true);
