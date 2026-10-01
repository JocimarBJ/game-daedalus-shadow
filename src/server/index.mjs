import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import Database from "better-sqlite3";

const port = Number(process.env.API_PORT || 3001);
const database = new Database("./server/progress.sqlite");
database.pragma("journal_mode = WAL");
database.exec(`
  CREATE TABLE IF NOT EXISTS player_progress (
    user_id TEXT PRIMARY KEY,
    level INTEGER NOT NULL,
    seed TEXT NOT NULL,
    map_width INTEGER NOT NULL,
    map_height INTEGER NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

const getProgress = database.prepare(
  "SELECT user_id AS userId, level, seed, map_width AS mapWidth, map_height AS mapHeight, updated_at AS updatedAt FROM player_progress WHERE user_id = ?"
);
const saveProgress = database.prepare(`
  INSERT INTO player_progress (user_id, level, seed, map_width, map_height, updated_at)
  VALUES (@userId, @level, @seed, @mapWidth, @mapHeight, @updatedAt)
  ON CONFLICT(user_id) DO UPDATE SET
    level = excluded.level,
    seed = excluded.seed,
    map_width = excluded.map_width,
    map_height = excluded.map_height,
    updated_at = excluded.updated_at
`);

function mapSize(level) {
  const tier = Math.floor((level - 1) / 2);
  return {
    width: 43 + tier * 8,
    height: 29 + tier * 6,
  };
}

function createProgress(userId, level = 1) {
  const size = mapSize(level);
  const progress = {
    userId,
    level,
    seed: randomBytes(16).toString("hex"),
    mapWidth: size.width,
    mapHeight: size.height,
    updatedAt: new Date().toISOString(),
  };
  saveProgress.run(progress);
  return progress;
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) body += chunk;
  return body ? JSON.parse(body) : {};
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const match = url.pathname.match(/^\/api\/progress\/([^/]+)(\/advance)?$/);
  if (!match) {
    sendJson(response, 404, { error: "Rota não encontrada." });
    return;
  }

  const userId = decodeURIComponent(match[1]);

  try {
    if (request.method === "GET") {
      const progress = getProgress.get(userId) || createProgress(userId);
      sendJson(response, 200, progress);
      return;
    }

    if (request.method === "PUT") {
      const body = await readJson(request);
      const level = Number(body.level);
      if (!Number.isInteger(level) || level < 1) {
        sendJson(response, 400, { error: "O nível deve ser um inteiro positivo." });
        return;
      }

      const size = mapSize(level);
      const progress = {
        userId,
        level,
        seed: randomBytes(16).toString("hex"),
        mapWidth: size.width,
        mapHeight: size.height,
        updatedAt: new Date().toISOString(),
      };
      saveProgress.run(progress);
      sendJson(response, 200, progress);
      return;
    }

    if (request.method === "POST" && match[2] === "/advance") {
      const current = getProgress.get(userId) || createProgress(userId);
      const level = current.level + 1;
      const size = mapSize(level);
      const progress = {
        userId,
        level,
        seed: randomBytes(16).toString("hex"),
        mapWidth: size.width,
        mapHeight: size.height,
        updatedAt: new Date().toISOString(),
      };
      saveProgress.run(progress);
      sendJson(response, 200, progress);
      return;
    }

    sendJson(response, 405, { error: "Método não suportado." });
  } catch (error) {
    console.error(error);
    sendJson(response, 400, { error: "Não foi possível processar a requisição." });
  }
});

server.listen(port, () => {
  console.log(`Pseudo-backend SQLite disponível em http://localhost:${port}`);
});
