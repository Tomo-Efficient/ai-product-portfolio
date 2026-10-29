import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL 未设置');
  process.exit(1);
}
const sql = neon(url);
const info = await sql`SELECT current_database() AS database, current_user AS "user", now() AS now`;
const tables = await sql`SELECT table_name FROM information_schema.tables
                         WHERE table_schema = 'public'
                         ORDER BY table_name`;
console.log(JSON.stringify({ connected: true, ...info[0], tables: tables.map((t) => t.table_name) }, null, 2));
