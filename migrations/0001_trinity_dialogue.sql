-- Deploy review and conversation state. No real deployment is triggered here.
CREATE TABLE IF NOT EXISTS trinity_chat_turns (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_trinity_chat_owner_conv ON trinity_chat_turns(owner,conversation_id,created_at);
CREATE TABLE IF NOT EXISTS trinity_deployment_approvals (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  label TEXT NOT NULL,
  target TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('production','staging')),
  version TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','approved','rejected','executed','expired')),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  decided_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_trinity_approval_pending ON trinity_deployment_approvals(owner,conversation_id,status,expires_at);
