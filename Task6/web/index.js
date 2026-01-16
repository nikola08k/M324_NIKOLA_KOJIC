const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

const DB_CONFIG = {
  host: process.env.DB_HOST || 'mysql',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'demo',
  password: process.env.DB_PASSWORD || 'demo',
  database: process.env.DB_NAME || 'demo',
};

let pool;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function waitForDb(maxRetries = 30) {
  for (let i = 1; i <= maxRetries; i += 1) {
    try {
      const testConn = await mysql.createConnection(DB_CONFIG);
      await testConn.query('SELECT 1');
      await testConn.end();
      return;
    } catch {
      console.log(`DB not ready (try ${i}/${maxRetries})...`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error('Database not reachable after retries');
}

async function init() {
  await waitForDb();

  pool = mysql.createPool({
    ...DB_CONFIG,
    connectionLimit: 10,
  });

  app.get('/', async (_req, res) => {
    try {
      const [rows] = await pool.query('SELECT id, name FROM test_table ORDER BY id');

      const tableRows = rows
        .map((r) => `<tr><td>${escapeHtml(r.id)}</td><td>${escapeHtml(r.name)}</td></tr>`)
        .join('');

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(`<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Task6 - Web</title>
  <style>
    body { font-family: system-ui, Arial, sans-serif; padding: 24px; }
    h1 { margin: 0 0 16px; }
    table { border-collapse: collapse; width: 100%; max-width: 720px; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background: #f5f5f5; }
  </style>
</head>
<body>
  <h1>Inhalt von <code>test_table</code></h1>
  <table>
    <thead>
      <tr><th>ID</th><th>Name</th></tr>
    </thead>
    <tbody>
      ${tableRows || '<tr><td colspan="2">Keine Daten</td></tr>'}
    </tbody>
  </table>
</body>
</html>`);
    } catch (err) {
      res.status(500).send(`Fehler: ${escapeHtml(err.message)}`);
    }
  });

  app.listen(PORT, () => console.log(`Web running on port ${PORT}`));
}

init().catch((err) => {
  console.error(err);
  process.exit(1);
});
