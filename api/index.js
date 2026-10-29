import { handleRequest } from '../src/app.js';
import { initDb } from '../src/db.js';

let ready;
function boot() {
  if (!ready) ready = initDb().catch((err) => console.warn('[db] init failed', err.message));
  return ready;
}

export default async function handler(req, res) {
  await boot();
  return handleRequest(req, res);
}
