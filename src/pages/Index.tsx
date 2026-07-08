import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSessionByPin, joinSession } from "@/lib/quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import awsLogo from "@/assets/aws-cloud-clubs-logo.webp";

const Index = () => {
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
      <div className="w-full max-w-md text-center animate-slide-up">
        <img src={awsLogo} alt="AWS Cloud Clubs" className="w-32 h-32 mx-auto mb-4 object-contain" />
        <h1 className="text-5xl sm:text-6xl font-black text-glow mb-2">AWS Cloud Club</h1>
        <p className="text-2xl font-bold text-accent mb-8">⚡ QuizBlitz</p>
        
        {/* Player Join Section */}
        <div className="bg-card p-6 rounded-2xl shadow-lg mb-8 box-glow">
          <form onSubmit={handleJoin} className="space-y-4">
            <Input
              type="text"
              placeholder="Game PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              maxLength={6}
              className="h-16 text-3xl text-center font-black tracking-[0.3em] bg-background"
            />
            <Input
              type="text"
              placeholder="Your Nickname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={20}
              className="h-14 text-xl text-center font-bold bg-background"
            />
            <Button type="submit" disabled={loading || !pin || !name} className="w-full h-14 text-xl font-bold">
              {loading ? "Joining..." : "🎮 Join Game"}
            </Button>
          </form>
        </div>

        {/* Host Section */}
        <div className="pt-4 border-t border-border">
          <p className="text-muted-foreground mb-4">Want to run your own quiz?</p>
          <Button
            onClick={() => navigate("/host/auth")}
            variant="secondary"
            size="lg"
            className="w-full h-14 text-lg font-bold hover:scale-105 transition-transform"
          >
            🎯 Host a Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
