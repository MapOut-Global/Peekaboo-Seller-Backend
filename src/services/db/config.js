//DB CONNECTION CREDENTIALS
const db = require("mysql2/promise");

const pool = db.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DB,
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool
  .query("SELECT 1 AS value")
  .then((_) => {
    console.log("DB is connected");
  })
  .catch((error) => {
    console.error("DB failed to connect:", error.message);
  });

module.exports = pool;
