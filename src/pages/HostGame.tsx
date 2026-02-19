import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { updateSession, getPlayers, getResponses } from "@/lib/quiz";
import { quizQuestions } from "@/data/quizData";
import { Button } from "@/components/ui/button";
import Leaderboard from "@/components/Leaderboard";
import confetti from "canvas-confetti";
import { toast } from "sonner";

interface Player {
  id: string;
  name: string;
  total_score: number;
  session_id: string;
  created_at: string;
}

const HostGame = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [responseCount, setResponseCount] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const fetchPlayers = useCallback(async () => {
    if (!sessionId) return;
    const p = await getPlayers(sessionId);
    setPlayers(p);
  }, [sessionId]);

  const fetchResponses = useCallback(async (qIndex: number) => {
    if (!sessionId) return;
    const r = await getResponses(sessionId, qIndex);
    setResponseCount(r.length);
  }, [sessionId]);

  // Load session
  useEffect(() => {
    if (!sessionId) return;
    const load = async () => {
      const { data } = await supabase
        .from("quiz_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
      if (data) setSession(data);
      else navigate("/host");
    };
    load();
    fetchPlayers();
  }, [sessionId, navigate, fetchPlayers]);

  // Realtime subscriptions
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`host-${sessionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "players", filter: `session_id=eq.${sessionId}` }, () => {
        fetchPlayers();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "player_responses", filter: `session_id=eq.${sessionId}` }, () => {
        if (session) fetchResponses(session.current_question);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId, session?.current_question, fetchPlayers, fetchResponses, session]);

  // Refresh responses when question changes
  useEffect(() => {
    if (session?.status === "active") {
      setResponseCount(0);
      fetchResponses(session.current_question);
    }
  }, [session?.current_question, session?.status, fetchResponses]);

  const startQuiz = async () => {
    await updateSession(sessionId!, { status: "active", current_question: 0, question_start_time: new Date().toISOString() });
    setSession((s: any) => ({ ...s, status: "active", current_question: 0 }));
    setShowLeaderboard(false);
  };

  const nextQuestion = async () => {
    // First show leaderboard
    if (!showLeaderboard) {
      await fetchPlayers();
      setShowLeaderboard(true);
      return;
    }

    const next = session.current_question + 1;
    if (next >= quizQuestions.length) {
      await updateSession(sessionId!, { status: "finished" });
      setSession((s: any) => ({ ...s, status: "finished" }));
      await fetchPlayers();
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
      return;
    }
    await updateSession(sessionId!, { current_question: next, question_start_time: new Date().toISOString() });
    setSession((s: any) => ({ ...s, current_question: next }));
    setShowLeaderboard(false);
    setResponseCount(0);
  };

  const pauseResume = async () => {
    const newStatus = session.status === "paused" ? "active" : "paused";
    await updateSession(sessionId!, { status: newStatus });
    setSession((s: any) => ({ ...s, status: newStatus }));
  };

  const endQuiz = async () => {
    await updateSession(sessionId!, { status: "finished" });
    setSession((s: any) => ({ ...s, status: "finished" }));
    await fetchPlayers();
    confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
  };

  const exportCSV = () => {
    const header = "Rank,Name,Score\n";
    const rows = players.map((p, i) => `${i + 1},${p.name},${p.total_score}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz-results-${session?.pin}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Results exported!");
  };

  if (!session) return <div className="flex min-h-screen items-center justify-center"><p className="text-xl animate-pulse-glow">Loading...</p></div>;

  const currentQ = quizQuestions[session.current_question];

  // Waiting lobby
  if (session.status === "waiting") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-lg text-center animate-slide-up">
          <h1 className="text-4xl font-black text-glow mb-2">⚡ QuizBlitz</h1>
          <div className="my-8">
            <p className="text-muted-foreground text-lg mb-2">Game PIN</p>
            <div className="text-7xl font-black tracking-widest text-accent animate-pulse-glow">
              {session.pin}
            </div>
          </div>
          <div className="rounded-2xl bg-card p-6 mb-6">
            <p className="text-lg text-muted-foreground mb-4">
              {players.length} player{players.length !== 1 ? "s" : ""} joined
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {players.map((p) => (
                <span key={p.id} className="px-4 py-2 bg-secondary rounded-full font-bold animate-bounce-in">
                  {p.name}
                </span>
              ))}
            </div>
          </div>
          <Button onClick={startQuiz} disabled={players.length === 0} size="lg" className="h-14 px-12 text-xl font-bold">
            🚀 Start Quiz
          </Button>
        </div>
      </div>
    );
  }

  // Finished
  if (session.status === "finished") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-lg text-center animate-slide-up">
          <h1 className="text-4xl font-black text-glow mb-2">🏆 Final Results</h1>
          {players.length > 0 && (
            <div className="my-6 animate-bounce-in">
              <p className="text-accent text-6xl font-black mb-2">🎉</p>
              <p className="text-3xl font-bold">{players[0]?.name}</p>
              <p className="text-accent text-xl font-bold">{players[0]?.total_score} pts</p>
            </div>
          )}
          <Leaderboard players={players} />
          <div className="mt-6 flex gap-4 justify-center">
            <Button onClick={exportCSV} variant="secondary" size="lg">📊 Export CSV</Button>
            <Button onClick={() => navigate("/host")} size="lg">New Quiz</Button>
          </div>
        </div>
      </div>
    );
  }

  // Active/Paused game
  return (
    <div className="min-h-screen p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">PIN: <span className="font-bold text-accent">{session.pin}</span></span>
          <span className="text-sm text-muted-foreground">👥 {players.length}</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={pauseResume} variant="secondary" size="sm">
            {session.status === "paused" ? "▶️ Resume" : "⏸️ Pause"}
          </Button>
          <Button onClick={endQuiz} variant="destructive" size="sm">End Quiz</Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {showLeaderboard ? (
          <div className="w-full max-w-lg animate-slide-up">
            <h2 className="text-3xl font-black text-center mb-6 text-glow">Leaderboard</h2>
            <Leaderboard players={players} />
            <div className="text-center mt-6">
              <Button onClick={nextQuestion} size="lg" className="h-14 px-12 text-xl font-bold">
                {session.current_question + 1 >= quizQuestions.length ? "🏆 Final Results" : "➡️ Next Question"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl animate-slide-up">
            <div className="text-center mb-2">
              <span className="text-sm text-muted-foreground">
                Question {session.current_question + 1} of {quizQuestions.length}
              </span>
            </div>
            <h2 className="text-3xl font-black text-center mb-8">{currentQ?.question}</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {currentQ?.options.map((opt, i) => {
                const colors = ["answer-red", "answer-blue", "answer-green", "answer-orange"];
                const icons = ["▲", "◆", "●", "■"];
                return (
                  <div key={i} className={`answer-btn ${colors[i]} p-6 text-center flex items-center justify-center gap-3`}>
                    <span className="text-2xl">{icons[i]}</span>
                    <span>{opt}</span>
                  </div>
                );
              })}
            </div>
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-4">
                {responseCount} / {players.length} answered
              </p>
              <Button onClick={nextQuestion} size="lg" className="h-14 px-12 text-xl font-bold">
                📊 Show Leaderboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostGame;
