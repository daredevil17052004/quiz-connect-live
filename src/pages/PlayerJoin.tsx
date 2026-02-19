import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSessionByPin, joinSession } from "@/lib/quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const PlayerJoin = () => {
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const session = await getSessionByPin(pin.trim());
      if (session.status === "finished") {
        toast.error("This quiz has already ended!");
        return;
      }
      const player = await joinSession(session.id, name.trim());
      // Store player ID in sessionStorage for this tab
      sessionStorage.setItem("playerId", player.id);
      sessionStorage.setItem("sessionId", session.id);
      navigate(`/play/${session.id}`);
    } catch (err: any) {
      toast.error("Invalid PIN or couldn't join. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-black text-glow mb-2">⚡ QuizBlitz</h1>
          <p className="text-muted-foreground text-lg">Enter the Game PIN to join</p>
        </div>
        <form onSubmit={handleJoin} className="space-y-4">
          <Input
            type="text"
            placeholder="Game PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
            maxLength={6}
            className="h-16 text-3xl text-center font-black tracking-[0.3em] bg-card"
          />
          <Input
            type="text"
            placeholder="Your Nickname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={20}
            className="h-14 text-xl text-center font-bold bg-card"
          />
          <Button type="submit" disabled={loading || !pin || !name} className="w-full h-14 text-xl font-bold">
            {loading ? "Joining..." : "🎮 Join Game"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PlayerJoin;
