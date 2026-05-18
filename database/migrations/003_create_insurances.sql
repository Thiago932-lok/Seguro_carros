CREATE TABLE IF NOT EXISTS insurances (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  car_id TEXT NOT NULL,
  policy_number TEXT NOT NULL UNIQUE,
  covered_value REAL NOT NULL,
  monthly_premium REAL NOT NULL,
  franchise REAL NOT NULL,
  status TEXT DEFAULT 'ativo',
  valid_from TEXT NOT NULL,
  valid_until TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);
