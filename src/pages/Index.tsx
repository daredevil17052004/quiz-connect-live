import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center animate-slide-up">
        <h1 className="text-6xl sm:text-7xl font-black text-glow mb-4">⚡ QuizBlitz</h1>
        <p className="text-xl text-muted-foreground mb-12 max-w-md mx-auto">
          Real-time multiplayer quiz battles. Host a game or join with a PIN!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/join")}
            size="lg"
            className="h-16 px-10 text-xl font-bold box-glow hover:scale-105 transition-transform"
          >
            🎮 Join Game
          </Button>
          <Button
            onClick={() => navigate("/host/auth")}
            variant="secondary"
            size="lg"
            className="h-16 px-10 text-xl font-bold hover:scale-105 transition-transform"
          >
            🎯 Host a Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
