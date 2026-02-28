import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { submitAnswer, calculateScore, getPlayers } from "@/lib/quiz";
import { quizQuestions } from "@/data/quizData";
import Leaderboard from "@/components/Leaderboard";
import confetti from "canvas-confetti";
import awsLogo from "@/assets/aws-cloud-clubs-logo.webp";

interface Player {
  id: string;
  name: string;
  total_score: number;
  session_id: string;
  created_at: string;
}

const PlayerGame = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const playerId = sessionStorage.getItem("playerId");
  const [session, setSession] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [answerResult, setAnswerResult] = useState<{ correct: boolean; score: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [lastQuestion, setLastQuestion] = useState(-1);

  // Load session
  const fetchSession = useCallback(async () => {
    if (!sessionId) return;
    const { data } = await supabase
      .from("quiz_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();
    if (data) {
      setSession(data);
      // Reset state when question changes
      if (data.current_question !== lastQuestion && data.status === "active") {
        setAnswered(false);
        setSelectedAnswer(null);
        setAnswerResult(null);
        setShowLeaderboard(false);
        setQuestionStartTime(Date.now());
        setTimeLeft(20);
        setLastQuestion(data.current_question);
      }
    }
  }, [sessionId, lastQuestion]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Realtime session updates
  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase
      .channel(`player-${sessionId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "quiz_sessions", filter: `id=eq.${sessionId}` }, (payload) => {
        const newSession = payload.new as any;
        setSession(newSession);
        if (newSession.current_question !== lastQuestion && newSession.status === "active") {
          setAnswered(false);
          setSelectedAnswer(null);
          setAnswerResult(null);
          setShowLeaderboard(false);
          setQuestionStartTime(Date.now());
          setTimeLeft(20);
          setLastQuestion(newSession.current_question);
        }
        if (newSession.status === "finished") {
          getPlayers(sessionId).then(setPlayers);
          confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId, lastQuestion]);

  // Timer
  useEffect(() => {
    if (!session || session.status !== "active" || answered) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
      const remaining = Math.max(0, 20 - elapsed);
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        handleAutoSubmit();
      }
    }, 100);
    return () => clearInterval(interval);
  }, [session?.status, questionStartTime, answered]);

  const handleAutoSubmit = async () => {
    if (answered || !playerId || !sessionId || !session) return;
    setAnswered(true);
    setAnswerResult({ correct: false, score: 0 });
    await submitAnswer(playerId, sessionId, session.current_question, -1, false, 20000, 0);
  };

  const handleAnswer = async (answerIndex: number) => {
    if (answered || !playerId || !sessionId || !session) return;
    setSelectedAnswer(answerIndex);
    setAnswered(true);

    const responseTimeMs = Date.now() - questionStartTime;
    const currentQ = quizQuestions[session.current_question];
    const isCorrect = answerIndex === currentQ.correctAnswer;
    const score = calculateScore(isCorrect, responseTimeMs);

    setAnswerResult({ correct: isCorrect, score });
    await submitAnswer(playerId, sessionId, session.current_question, answerIndex, isCorrect, responseTimeMs, score);
  };

  if (!session || !playerId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl animate-pulse-glow">Connecting...</p>
      </div>
    );
  }

  // Waiting
  if (session.status === "waiting") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center animate-slide-up">
          <img src={awsLogo} alt="AWS Cloud Clubs" className="w-16 h-16 mx-auto mb-2 object-contain" />
          <h1 className="text-3xl font-black text-glow mb-1">AWS Cloud Club</h1>
          <p className="text-lg font-bold text-accent mb-2">⚡ QuizBlitz</p>
          <div className="text-6xl mb-6 animate-pulse-glow">⏳</div>
          <p className="text-xl text-muted-foreground">Waiting for host to start...</p>
        </div>
      </div>
    );
  }

  // Paused
  if (session.status === "paused") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center animate-slide-up">
          <div className="text-6xl mb-6">⏸️</div>
          <p className="text-xl text-muted-foreground">Quiz Paused</p>
        </div>
      </div>
    );
  }

  // Finished
  if (session.status === "finished") {
    const myRank = players.findIndex((p) => p.id === playerId) + 1;
    const myPlayer = players.find((p) => p.id === playerId);
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-lg text-center animate-slide-up">
          <h1 className="text-4xl font-black text-glow mb-4">🏆 Game Over!</h1>
          {myPlayer && (
            <div className="my-6 animate-bounce-in">
              <p className="text-2xl font-bold">{myPlayer.name}</p>
              <p className="text-accent text-4xl font-black">{myPlayer.total_score} pts</p>
              <p className="text-muted-foreground text-lg mt-2">Rank #{myRank}</p>
            </div>
          )}
          <Leaderboard players={players} highlightId={playerId} />
        </div>
      </div>
    );
  }

  // Active - answering
  const currentQ = quizQuestions[session.current_question];
  const colors = ["answer-red", "answer-blue", "answer-green", "answer-orange"];
  const icons = ["▲", "◆", "●", "■"];

  return (
    <div className="min-h-screen p-4 flex flex-col">
      {/* Timer bar */}
      <div className="mb-4">
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-200 rounded-full"
            style={{ width: `${(timeLeft / 20) * 100}%` }}
          />
        </div>
        <div className="text-center mt-2">
          <span className={`text-2xl font-black ${timeLeft <= 5 ? "text-destructive animate-pulse-glow" : "text-accent"}`}>
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="text-center mb-4">
        <span className="text-sm text-muted-foreground">
          Question {session.current_question + 1} / {quizQuestions.length}
        </span>
        <h2 className="text-xl font-black mt-2">{currentQ?.question}</h2>
      </div>

      {/* Answer result or answer buttons */}
      {answered ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center animate-bounce-in">
            <div className={`text-7xl mb-4 ${answerResult?.correct ? "" : ""}`}>
              {answerResult?.correct ? "✅" : "❌"}
            </div>
            <p className="text-2xl font-bold">
              {answerResult?.correct ? "Correct!" : "Wrong!"}
            </p>
            <p className="text-accent text-3xl font-black mt-2">+{answerResult?.score}</p>
            <p className="text-muted-foreground mt-4">Waiting for next question...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-2 gap-3">
          {currentQ?.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className={`answer-btn ${colors[i]} p-4 flex flex-col items-center justify-center gap-2 min-h-[120px]`}
            >
              <span className="text-3xl">{icons[i]}</span>
              <span className="text-sm sm:text-base leading-tight">{opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerGame;
