const express = require("express");
const path = require("path");
require('dotenv').config({ path: './config/.env' });
const cookieParser = require('cookie-parser');

const connection = require("./Database/database");

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/user", require("./controller/user"));
app.use("/admin", require("./controller/admin"));



app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});


connection.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to MySQL database");
  app.listen(8080, () => {
    console.log(`The app is listening on port - ${8080}...`);
  });
});
