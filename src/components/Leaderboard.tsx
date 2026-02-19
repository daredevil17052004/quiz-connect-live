interface Player {
  id: string;
  name: string;
  total_score: number;
}

interface LeaderboardProps {
  players: Player[];
  highlightId?: string;
}

const Leaderboard = ({ players, highlightId }: LeaderboardProps) => {
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="rounded-2xl bg-card p-4 space-y-2">
      {players.map((player, index) => {
        const isHighlighted = player.id === highlightId;
        return (
          <div
            key={player.id}
            className={`flex items-center justify-between p-3 rounded-xl transition-all ${
              isHighlighted ? "bg-primary/20 ring-2 ring-primary" : "bg-secondary"
            } ${index < 3 ? "animate-slide-up" : ""}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl w-10 text-center">
                {index < 3 ? medals[index] : `#${index + 1}`}
              </span>
              <span className="font-bold text-lg">{player.name}</span>
            </div>
            <span className="font-black text-lg text-accent">{player.total_score}</span>
          </div>
        );
      })}
      {players.length === 0 && (
        <p className="text-center text-muted-foreground py-4">No players yet</p>
      )}
    </div>
  );
};

export default Leaderboard;
