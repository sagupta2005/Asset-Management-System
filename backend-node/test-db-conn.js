// Simple MySQL connection test using environment variables
require('dotenv').config();
const mysql = require('mysql2/promise');

function firstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return undefined;
}

const hasMysqlEnv = Boolean(
  process.env.MYSQL_HOST
  || process.env.MYSQL_PORT
  || process.env.MYSQL_DATABASE
  || process.env.MYSQL_USER
  || process.env.MYSQL_PASSWORD
);

async function testConnection() {
  const host = process.env.MYSQL_HOST || (hasMysqlEnv ? 'db' : firstDefined(process.env.DB_HOST, 'localhost'));
  const port = parseInt(firstDefined(process.env.MYSQL_PORT, process.env.DB_PORT) || '3306', 10);
  const user = hasMysqlEnv
    ? (firstDefined(process.env.MYSQL_USER, process.env.DB_USERNAME, process.env.DB_USER) || 'root')
    : (firstDefined(process.env.DB_USERNAME, process.env.DB_USER, process.env.MYSQL_USER) || 'root');
  const password = hasMysqlEnv
    ? (process.env.MYSQL_PASSWORD ?? process.env.DB_PASSWORD ?? '')
    : (process.env.DB_PASSWORD ?? process.env.MYSQL_PASSWORD ?? '');
  const database = hasMysqlEnv
    ? (firstDefined(process.env.MYSQL_DATABASE, process.env.DB_NAME) || 'asset_management_db')
    : (firstDefined(process.env.DB_NAME, process.env.MYSQL_DATABASE) || 'asset_management_db');

  console.log(`Testing DB connection to ${host}:${port} (database=${database})`);
  try {
    const adminConn = await mysql.createConnection({ host, port, user, password });
    const escapedDatabase = database.replace(/`/g, '``');
    await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${escapedDatabase}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await adminConn.end();

    const conn = await mysql.createConnection({ host, port, user, password, database, connectTimeout: 10000 });
    console.log('✅ Connected to MySQL successfully');
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ DB connection error:');
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
  }
}

testConnection();
