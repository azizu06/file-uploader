require("dotenv").config();
const path = require("node:path");
const express = require("express");
const passport = require("./config/passport");
const session = require("express-session");
const indexRouter = require("./routes/index");
const pool = require("./db/pool");
const connectPg = require("connect-pg-simple");
const pgSession = connectPg(session);

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(
  session({
    store: new pgSession({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_PASS,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use("/", indexRouter);

module.exports = app;
