-- Create the quiz_sessions table
CREATE TABLE quiz_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pin TEXT NOT NULL,
    host_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting',
    current_question INTEGER DEFAULT 0 NOT NULL,
    question_start_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create the players table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    total_score INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create the player_responses table
CREATE TABLE player_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_index INTEGER NOT NULL,
    selected_answer INTEGER NOT NULL,
    is_correct BOOLEAN DEFAULT false NOT NULL,
    score INTEGER DEFAULT 0 NOT NULL,
    response_time_ms INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create the increment_player_score function
CREATE OR REPLACE FUNCTION increment_player_score(p_player_id UUID, p_score INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE players
    SET total_score = total_score + p_score
    WHERE id = p_player_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS) but allow anonymous access for the app to function easily.
-- (Note: If you want to secure this app further later, you can modify these policies)
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read/write to quiz_sessions" ON quiz_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous read/write to players" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous read/write to player_responses" ON player_responses FOR ALL USING (true) WITH CHECK (true);
