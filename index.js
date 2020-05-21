// refactor this file to match the organization in refactored-example-*
//  the code works as it is now!
//  your goal is that it still works the same way after you refactor

"use strict";

const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

const api = require("./api");
const config = require("./config");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(
  morgan("combined", {
    stream: fs.createWriteStream(path.join(__dirname, "access.log"), {
      flags: "a",
    }),
  })
);
if (config.MODE === "development") {
  app.use(morgan("dev"));
}

app.use("/", express.static(path.join(__dirname, "client")));

app.use("/api", api);

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).end();
});

app.listen(config.PORT, () => {
  console.log(
    `listening at http://localhost:${config.PORT} (${config.MODE} mode)`
  );
});

//fs.inotify.max_user_watches = 524288;
