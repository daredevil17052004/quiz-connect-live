import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { createSession } from "@/lib/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, PlusCircle, LayoutDashboard, History, Sparkles } from "lucide-react";
import awsLogo from "@/assets/aws-cloud-clubs-logo.webp";

const HostDashboard = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) {
        navigate("/host/auth");
      } else {
        setUserId(session.user.id);
        setUserEmail(session.user.email ?? null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/host/auth");
      } else {
        setUserId(session.user.id);
        setUserEmail(session.user.email ?? null);
      }
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
    navigate("/");
  };

  if (!userId) return null; // Avoid flashing unstyled content before redirect

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={awsLogo} alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-black tracking-tight text-glow">QuizBlitz</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mr-4">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Logged in as <span className="font-bold text-foreground">{userEmail}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-border/50 hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl animate-slide-up">
        
        {/* Hero Section */}
        <div className="mb-12 mt-4 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-3xl bg-gradient-to-br from-card to-background border border-border/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          
          <div className="relative z-10 space-y-2">
            <h1 className="text-4xl md:text-5xl font-black">Welcome to Dashboard</h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Manage your live events, create new quiz rooms, and engage your audience instantly.
            </p>
          </div>

          <Button
            onClick={handleCreate}
            disabled={loading}
            size="lg"
            className="h-16 px-8 text-xl font-bold box-glow hover:scale-105 transition-transform shrink-0 relative z-10"
          >
            {loading ? (
              "Creating Room..."
            ) : (
              <>
                <PlusCircle className="mr-2 h-6 w-6" /> Create New Quiz
              </>
            )}
          </Button>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/50 bg-card/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <LayoutDashboard className="text-primary" /> Active Quizzes
              </CardTitle>
              <CardDescription>Rooms that are currently open or waiting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border/50 rounded-xl bg-background/50">
                <Sparkles className="w-10 h-10 text-muted-foreground mb-4 opacity-50" />
                <p className="font-semibold text-muted-foreground mb-1">No active quizzes</p>
                <p className="text-sm text-muted-foreground/70">Click 'Create New Quiz' above to start one.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <History className="text-accent" /> Recent Quizzes
              </CardTitle>
              <CardDescription>History of your previously hosted games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border/50 rounded-xl bg-background/50">
                <div className="bg-secondary/50 text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full mb-4">
                  COMING SOON
                </div>
                <p className="font-semibold text-muted-foreground mb-1">Quiz History Feature</p>
                <p className="text-sm text-muted-foreground/70">Soon you'll be able to view stats and download CSVs of past games.</p>
              </div>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
};

export default HostDashboard;
