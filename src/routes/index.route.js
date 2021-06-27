const express = require("express");
const indexRouter = new express.Router();

indexRouter.get("/", (req, res) => {
  res.send("Peekaboo Backend application");
});

module.exports = indexRouter;
