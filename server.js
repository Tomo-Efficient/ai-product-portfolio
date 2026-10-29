import http from 'node:http';
import { PORT, HOST } from './src/config.js';
import { initDb } from './src/db.js';
import { getContent } from './src/content.js';
import { handleRequest } from './src/app.js';

await initDb();
const { profile, projects } = getContent();
console.log(`[content] ${projects.length} projects, ${projects.reduce((n, p) => n + p.docs.length, 0)} docs`);

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((err) => {
    console.error('[server]', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
    }
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  Port ${PORT} is already in use.\n  Try: PORT=3001 npm start\n`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, HOST, () => {
  console.log(`\n  石浩田 · Portfolio`);
  console.log(`  → http://localhost:${PORT}\n`);
});
