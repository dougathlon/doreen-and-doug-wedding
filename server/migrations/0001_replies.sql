CREATE TABLE responses (
  id TEXT PRIMARY KEY,
  submission_hash TEXT NOT NULL UNIQUE,
  creation_digest TEXT NOT NULL,
  name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 100),
  email TEXT NOT NULL DEFAULT '',
  friday TEXT NOT NULL CHECK(friday IN ('yes','no','unsure')),
  saturday TEXT NOT NULL CHECK(saturday IN ('yes','no')),
  allergies TEXT NOT NULL DEFAULT '' CHECK(length(allergies) <= 1000),
  source TEXT NOT NULL CHECK(source IN ('online','telephone','post')),
  version INTEGER NOT NULL DEFAULT 1,
  last_mutation TEXT NOT NULL,
  receipt_requested INTEGER NOT NULL DEFAULT 0,
  included INTEGER NOT NULL DEFAULT 1,
  link_generation TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  response_id TEXT NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE outbox (
  id TEXT PRIMARY KEY,
  response_id TEXT NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK(kind IN ('organiser','guest')),
  snapshot TEXT NOT NULL,
  created_at TEXT NOT NULL,
  first_attempt_at INTEGER,
  lease_until INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at INTEGER NOT NULL DEFAULT 0,
  sent_at TEXT,
  last_error TEXT
);
CREATE INDEX outbox_pending ON outbox(sent_at, next_attempt_at, lease_until);
CREATE TRIGGER response_created AFTER INSERT ON responses BEGIN
  INSERT INTO outbox (id,response_id,kind,snapshot,created_at) VALUES
    (NEW.id || ':' || NEW.version || ':organiser', NEW.id, 'organiser', '{}', NEW.updated_at);
  INSERT INTO outbox (id,response_id,kind,snapshot,created_at)
    SELECT NEW.id || ':' || NEW.version || ':guest', NEW.id, 'guest',
      json_object('name',NEW.name,'email',NEW.email,'friday',NEW.friday,'saturday',NEW.saturday,'generation',NEW.link_generation),NEW.updated_at
    WHERE NEW.receipt_requested = 1 AND NEW.email != '';
END;
CREATE TRIGGER response_updated AFTER UPDATE ON responses BEGIN
  INSERT INTO outbox (id,response_id,kind,snapshot,created_at) VALUES
    (NEW.id || ':' || NEW.version || ':organiser', NEW.id, 'organiser', '{}', NEW.updated_at);
  INSERT INTO outbox (id,response_id,kind,snapshot,created_at)
    SELECT NEW.id || ':' || NEW.version || ':guest', NEW.id, 'guest',
      json_object('name',NEW.name,'email',NEW.email,'friday',NEW.friday,'saturday',NEW.saturday,'generation',NEW.link_generation),NEW.updated_at
    WHERE NEW.receipt_requested = 1 AND NEW.email != '' AND NEW.included = 1;
END;
