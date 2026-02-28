import { supabase } from "@/integrations/supabase/client";

export function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createSession(hostId: string) {
  const pin = generatePin();
  const { data, error } = await supabase
    .from("quiz_sessions")
    .insert({ host_id: hostId, pin, status: "waiting", current_question: 0 })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getSessionByPin(pin: string) {
  const { data, error } = await supabase
    .from("quiz_sessions")
    .select("*")
    .eq("pin", pin)
    .single();
  if (error) throw error;
  return data;
}

export async function updateSession(sessionId: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from("quiz_sessions")
    .update(updates)
    .eq("id", sessionId);
  if (error) throw error;
}

export async function joinSession(sessionId: string, playerName: string) {
  const { data, error } = await supabase
    .from("players")
    .insert({ session_id: sessionId, name: playerName })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPlayers(sessionId: string, limit = 1000) {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("session_id", sessionId)
    .order("total_score", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getPlayerCount(sessionId: string): Promise<number> {
  const { count, error } = await supabase
    .from("players")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId);
  if (error) throw error;
  return count ?? 0;
}

export async function submitAnswer(
  playerId: string,
  sessionId: string,
  questionIndex: number,
  selectedAnswer: number,
  isCorrect: boolean,
  responseTimeMs: number,
  score: number
) {
  const { error } = await supabase.from("player_responses").insert({
    player_id: playerId,
    session_id: sessionId,
    question_index: questionIndex,
    selected_answer: selectedAnswer,
    is_correct: isCorrect,
    response_time_ms: responseTimeMs,
    score,
  });
  if (error) throw error;

  // Atomically increment total score
  if (score > 0) {
    await supabase.rpc("increment_player_score", {
      p_player_id: playerId,
      p_score: score,
    });
  }
}

export async function getResponseCount(sessionId: string, questionIndex: number): Promise<number> {
  const { count, error } = await supabase
    .from("player_responses")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("question_index", questionIndex);
  if (error) throw error;
  return count ?? 0;
}

export async function getResponses(sessionId: string, questionIndex: number) {
  const { data, error } = await supabase
    .from("player_responses")
    .select("*, players(name)")
    .eq("session_id", sessionId)
    .eq("question_index", questionIndex);
  if (error) throw error;
  return data ?? [];
}

export function calculateScore(isCorrect: boolean, responseTimeMs: number, timeLimitMs: number = 20000): number {
  if (!isCorrect) return 0;
  const timeBonus = Math.max(0, Math.round((1 - responseTimeMs / timeLimitMs) * 500));
  return 500 + timeBonus;
}
