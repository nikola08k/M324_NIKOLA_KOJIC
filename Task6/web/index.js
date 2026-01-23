const express = require("express");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

// MySQL Verbindung (kommt aus docker-compose / .env)
const db = mysql.createConnection({
  host: process.env.DB_HOST || "mysql",
  user: process.env.DB_USER || "demo",
  password: process.env.DB_PASSWORD || "demo",
  database: process.env.DB_NAME || "demo",
});

// Verbindung testen
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    return;
  }
  console.log("✅ Connected to MySQL database");
});

// Route: Daten aus Tabelle anzeigen
app.get("/", (req, res) => {
  db.query("SELECT * FROM test_table", (err, results) => {
    if (err) {
      return res.status(500).send("Database error");
    }

    let html = `
      <html>
        <head>
          <title>Task 6 – Web App</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { border-collapse: collapse; }
            td, th { border: 1px solid #333; padding: 8px; }
          </style>
        </head>
        <body>
          <h1>Daten aus der Datenbank</h1>
          <table>
            <tr>
              <th>ID</th>
              <th>Name</th>
            </tr>
    `;

    results.forEach((row) => {
      html += `
        <tr>
          <td>${row.id}</td>
          <td>${row.name}</td>
        </tr>
      `;
    });

    html += `
          </table>
        </body>
      </html>
    `;

    res.send(html);
  });
});

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});
