// SQLite via node:sqlite (Node 24). Persistent: games catalog + finished matches. Rooms live in memory.
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { GameMeta, MatchResults } from '../shared/protocol'

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = process.env.DATA_DIR ?? join(here, '..', 'data')
mkdirSync(dataDir, { recursive: true })
const db = new DatabaseSync(join(dataDir, 'gleelounge.db'))

db.exec(`
  create table if not exists games (
    id text primary key,
    title text not null,
    genre text not null,
    players_min integer not null,
    players_max integer not null,
    has_solo integer not null default 0,
    controls text not null,
    description text not null,
    cover_emoji text not null,
    cover_gradient text not null,
    created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  create table if not exists matches (
    id text primary key,
    room_code text not null,
    game_id text not null references games(id),
    started_at text not null,
    ended_at text not null,
    duration_s integer not null,
    config text not null default '{}',
    created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  create index if not exists idx_matches_game_id on matches (game_id);
  create index if not exists idx_matches_ended_at on matches (ended_at desc);
  create table if not exists scores (
    id text primary key,
    match_id text not null references matches(id) on delete cascade,
    player_id text not null,
    name text not null,
    avatar_id text not null,
    value integer not null,
    rank integer not null,
    meta text not null default '{}',
    created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  create index if not exists idx_scores_match_id on scores (match_id);
  create index if not exists idx_scores_player on scores (player_id);
`)

export function seedGames(games: GameMeta[]): void {
  const stmt = db.prepare(`
    insert into games (id, title, genre, players_min, players_max, has_solo, controls, description, cover_emoji, cover_gradient)
    values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    on conflict(id) do update set
      title=excluded.title, genre=excluded.genre, players_min=excluded.players_min,
      players_max=excluded.players_max, has_solo=excluded.has_solo, controls=excluded.controls,
      description=excluded.description, cover_emoji=excluded.cover_emoji, cover_gradient=excluded.cover_gradient
  `)
  for (const g of games) {
    stmt.run(
      g.id,
      g.title,
      g.genre,
      g.playersMin,
      g.playersMax,
      g.hasSolo ? 1 : 0,
      g.controls,
      g.description,
      g.coverEmoji,
      g.coverGradient,
    )
  }
}

export function saveMatch(
  matchId: string,
  roomCode: string,
  gameId: string,
  startedAt: string,
  endedAt: string,
  durationS: number,
  results: MatchResults,
): void {
  db.prepare(
    `insert into matches (id, room_code, game_id, started_at, ended_at, duration_s) values (?, ?, ?, ?, ?, ?)`,
  ).run(matchId, roomCode, gameId, startedAt, endedAt, durationS)
  const scoreStmt = db.prepare(
    `insert into scores (id, match_id, player_id, name, avatar_id, value, rank) values (?, ?, ?, ?, ?, ?, ?)`,
  )
  for (const e of results.entries) {
    scoreStmt.run(
      `${matchId}-${e.playerId}`,
      matchId,
      e.playerId,
      e.name,
      e.avatarId,
      e.value,
      e.rank,
    )
  }
}

export interface RecentMatch {
  id: string
  gameId: string
  title: string
  endedAt: string
  entries: { name: string; avatarId: string; value: number; rank: number }[]
}

export function recentMatches(limit = 10): RecentMatch[] {
  const rows = db
    .prepare(
      `select m.id, m.game_id as gameId, m.ended_at as endedAt, g.title
       from matches m join games g on g.id = m.game_id
       order by m.ended_at desc limit ?`,
    )
    .all(limit) as { id: string; gameId: string; endedAt: string; title: string }[]
  return rows.map((r) => ({
    ...r,
    entries: db
      .prepare(
        `select name, avatar_id as avatarId, value, rank from scores where match_id = ? order by rank`,
      )
      .all(r.id) as RecentMatch['entries'],
  }))
}
