import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { createSession } from "@/lib/quiz";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const HostDashboard = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/host/auth");
      else setUserId(session.user.id);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/host/auth");
      else setUserId(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleCreate = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const session = await createSession(userId);
      navigate(`/host/game/${session.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/host/auth");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg text-center animate-slide-up">
        <h1 className="text-5xl font-black text-glow mb-2">⚡ QuizBlitz</h1>
        <p className="text-muted-foreground text-lg mb-12">Host Dashboard</p>

        <Button
          onClick={handleCreate}
          disabled={loading}
          size="lg"
          className="w-full max-w-sm h-16 text-xl font-bold box-glow hover:scale-105 transition-transform"
        >
          {loading ? "Creating..." : "🎮 Create New Quiz"}
        </Button>

        <button
          onClick={handleLogout}
          className="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default HostDashboard;
