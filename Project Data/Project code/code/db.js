const mysql = require('mysql2')

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'onlineQuiz',
  password: 'manager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})


module.exports = pool