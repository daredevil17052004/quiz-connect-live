import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Player {
  id: string;
  name: string;
  total_score: number;
}

interface LeaderboardProps {
  players: Player[];
  highlightId?: string;
  initialCount?: number;
}

const PAGE_SIZE = 20;

const Leaderboard = ({ players, highlightId, initialCount = 10 }: LeaderboardProps) => {
  const medals = ["🥇", "🥈", "🥉"];
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const visible = players.slice(0, visibleCount);
  const hasMore = visibleCount < players.length;

  // If highlighted player is not visible, show their position
  const highlightedIndex = highlightId ? players.findIndex((p) => p.id === highlightId) : -1;
  const highlightedOutOfView = highlightedIndex >= visibleCount;

  return (
    <div className="rounded-2xl bg-card p-4 space-y-2">
      {visible.map((player, index) => {
        const isHighlighted = player.id === highlightId;
        return (
          <div
            key={player.id}
            className={`flex items-center justify-between p-3 rounded-xl transition-all ${
              isHighlighted ? "bg-primary/20 ring-2 ring-primary" : "bg-secondary"
            } ${index < 3 ? "animate-slide-up" : ""}`}
            style={index < 3 ? { animationDelay: `${index * 0.1}s` } : undefined}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl w-10 text-center">
                {index < 3 ? medals[index] : `#${index + 1}`}
              </span>
              <span className="font-bold text-lg truncate max-w-[180px]">{player.name}</span>
            </div>
            <span className="font-black text-lg text-accent">{player.total_score}</span>
          </div>
        );
      })}

      {/* Show highlighted player's position if scrolled out of view */}
      {highlightedOutOfView && highlightedIndex >= 0 && (
        <>
          <div className="text-center text-muted-foreground text-sm py-1">···</div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-primary/20 ring-2 ring-primary">
            <div className="flex items-center gap-3">
              <span className="text-2xl w-10 text-center">#{highlightedIndex + 1}</span>
              <span className="font-bold text-lg truncate max-w-[180px]">{players[highlightedIndex].name}</span>
            </div>
            <span className="font-black text-lg text-accent">{players[highlightedIndex].total_score}</span>
          </div>
        </>
      )}

      {hasMore && (
        <div className="text-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVisibleCount((c) => Math.min(c + PAGE_SIZE, players.length))}
          >
            Show more ({players.length - visibleCount} remaining)
          </Button>
        </div>
      )}

      {players.length === 0 && (
        <p className="text-center text-muted-foreground py-4">No players yet</p>
      )}
    </div>
  );
};

export default Leaderboard;
