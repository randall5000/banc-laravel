import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'banconaut_user',
  password: '86a@PPLES*',
  database: 'banconaut',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;