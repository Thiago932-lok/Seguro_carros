CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  insurance_id TEXT NOT NULL,
  car_id TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  incident_date TEXT NOT NULL,
  status TEXT DEFAULT 'aberto',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (insurance_id) REFERENCES insurances(id) ON DELETE CASCADE,
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);
