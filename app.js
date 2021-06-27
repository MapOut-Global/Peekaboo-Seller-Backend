const cors = require("cors");
const path = require("path");
const express = require("express");
const indexRouter = require("./src/routes/index.route");

const app = express();

global.__basedir = __dirname;

app.use(express.static(path.join(__dirname, "resources")));

app.use(cors());
app.use(express.json());
app.use(indexRouter);

module.exports = app;
