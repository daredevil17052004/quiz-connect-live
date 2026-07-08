import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, KeyRound, Mail, Sparkles } from "lucide-react";
import awsLogo from "@/assets/aws-cloud-clubs-logo.webp";

const HostAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/host");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account!");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-card relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-background to-background pointer-events-none" />
        
        <div className="z-10 animate-slide-up">
          <Button variant="ghost" className="mb-8 hover:bg-white/5" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
          <img src={awsLogo} alt="AWS Cloud Clubs" className="w-16 h-16 mb-4 object-contain opacity-80" />
          <h1 className="text-4xl font-black text-glow mb-4">QuizBlitz Host Portal</h1>
          <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
            Create, manage, and host engaging real-time multiplayer quizzes. Elevate your community events with lightning-fast interactive experiences.
          </p>
        </div>
        
        <div className="z-10">
          <div className="flex items-center gap-2 text-muted-foreground font-semibold">
            <Sparkles className="w-5 h-5 text-accent" /> Powered by Supabase & React
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 animate-slide-up">
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 pb-6 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-4">
              <img src={awsLogo} alt="AWS" className="w-12 h-12 object-contain" />
            </div>
            <CardTitle className="text-3xl font-black">
              {isLogin ? "Welcome back" : "Create an account"}
            </CardTitle>
            <CardDescription className="text-base">
              {isLogin 
                ? "Enter your credentials to access your dashboard" 
                : "Sign up to start hosting your own QuizBlitz games"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 text-base bg-background/50 border-border/50 focus:bg-background"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 h-12 text-base bg-background/50 border-border/50 focus:bg-background"
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20">
                {loading ? "Authenticating..." : isLogin ? "Sign In" : "Sign Up"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-border/50 pt-6">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-semibold"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
            <div className="lg:hidden text-center mt-2">
              <Button variant="link" className="text-xs text-muted-foreground" onClick={() => navigate("/")}>
                Return to Home
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default HostAuth;
