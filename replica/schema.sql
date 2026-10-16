-- CouchParty — persistent schema (SQLite via better-sqlite3; swappable to Postgres/Turso later)
-- Room / Player / live Match state live in server memory — NOT here.
-- Access rules: none (no auth, ephemeral rooms). Anonymous display names only.

create table if not exists games (
  id            text primary key,              -- slug, e.g. 'reaction-duel'
  title         text not null,
  genre         text not null
                  check (genre in ('party','quiz','word','drawing','racing','action','sports','board','puzzle')),
  players_min   integer not null check (players_min >= 1),
  players_max   integer not null check (players_max >= players_min),
  has_solo      integer not null default 0 check (has_solo in (0,1)),
  controls      text not null
                  check (controls in ('stick','dpad','text','draw','tapGrid','reaction','sequence','triviaGrid','none')),
  description   text not null,
  cover_emoji   text not null,
  cover_gradient text not null,                -- tailwind gradient classes, e.g. 'from-rose-500 to-orange-500'
  created_at    text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

create table if not exists matches (
  id          text primary key,                -- uuid issued by server
  room_code   text not null,                   -- historical, may no longer be live
  game_id     text not null references games(id) on delete restrict,
  started_at  text not null,                   -- ISO-8601 UTC
  ended_at    text not null,
  duration_s  integer not null check (duration_s >= 0),
  config      text not null default '{}',      -- json: rounds, timeLimit, etc.
  created_at  text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
create index if not exists idx_matches_game_id   on matches (game_id);
create index if not exists idx_matches_ended_at  on matches (ended_at desc);

create table if not exists scores (
  id          text primary key,
  match_id    text not null references matches(id) on delete cascade,
  player_id   text not null,                   -- anonymous UUID from the room, no FK (player is ephemeral)
  name        text not null,                   -- denormalized display name at time of match
  avatar_id   text not null,
  value       integer not null,                -- final score, game-defined units
  rank        integer not null check (rank >= 1),
  meta        text not null default '{}',      -- json: per-round breakdown, stats
  created_at  text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
create index if not exists idx_scores_match_id on scores (match_id);
create index if not exists idx_scores_player   on scores (player_id);

-- Seed: the original mini-game catalog (kept in sync with src/games/registry.ts).
-- Insert-or-replace idempotently at boot from the registry, so this file stays the source of truth for shape.
