CREATE TABLE IF NOT EXISTS completed_runs (
  run_id TEXT PRIMARY KEY,
  completed_at TEXT NOT NULL,
  correct INTEGER NOT NULL CHECK (correct BETWEEN 0 AND total),
  total INTEGER NOT NULL CHECK (total BETWEEN 1 AND 5),
  kind TEXT NOT NULL CHECK (kind IN ('practice', 'retry')),
  mode TEXT NOT NULL CHECK (mode IN ('timed', 'untimed')),
  finish TEXT NOT NULL CHECK (finish IN ('submitted', 'time_limit'))
);
