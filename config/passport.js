const passport = require("passport");
const { Strategy } = require("passport-local");
const bcrypt = require("bcryptjs");
const db = require("../db/queries");

passport.use(
  new Strategy(async (username, password, done) => {
    try {
      const user = await db.getUser(username);
      if (!user) return done(null, false, { message: "Incorrect username" });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: "Incorrect password" });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }),
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.getUser(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
