import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration — Defaults to SQLite locally, configurable for Cloud MySQL via env vars
const DB_DIALECT = process.env.DB_DIALECT || 'sqlite';
const DB_STORAGE = process.env.DB_STORAGE || path.join(__dirname, '../../database.db');
const DB_SOCKET = process.env.DB_SOCKET; // Unix socket path for Hostinger MySQL (e.g. /var/run/mysqld/mysqld.sock)

export const sequelize = new Sequelize({
  dialect: DB_DIALECT,
  storage: DB_DIALECT === 'sqlite' ? DB_STORAGE : undefined,
  host: DB_SOCKET ? null : process.env.DB_HOST,
  port: DB_SOCKET ? null : process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: false, // Set to console.log to see SQL queries during debugging
  dialectOptions: DB_SOCKET ? { socketPath: DB_SOCKET } : {},
});
