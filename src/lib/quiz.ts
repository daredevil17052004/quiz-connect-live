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

export async function getPlayers(sessionId: string) {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("session_id", sessionId)
    .order("total_score", { ascending: false });
  if (error) throw error;
  return data ?? [];
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

  // Update total score
  const { data: player } = await supabase
    .from("players")
    .select("total_score")
    .eq("id", playerId)
    .single();

  if (player) {
    await supabase
      .from("players")
      .update({ total_score: player.total_score + score })
      .eq("id", playerId);
  }
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
  return 500 + timeBonus; // Base 500 + up to 500 speed bonus
}
