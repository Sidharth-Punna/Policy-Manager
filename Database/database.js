
const msql = require("mysql2");

const connection = msql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "sidharth",
});

module.exports = connection;
