import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import awsLogo from "@/assets/aws-cloud-clubs-logo.webp";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center animate-slide-up">
        <img src={awsLogo} alt="AWS Cloud Clubs" className="w-32 h-32 mx-auto mb-4 object-contain" />
        <h1 className="text-5xl sm:text-6xl font-black text-glow mb-2">AWS Cloud Club</h1>
        <p className="text-2xl font-bold text-accent mb-1">⚡ QuizBlitz</p>
        <p className="text-lg text-muted-foreground mb-12 max-w-md mx-auto">
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
