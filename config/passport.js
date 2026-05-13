import passport from "passport";
import { Strategy } from "passport-local";
import bcrypt from "bcryptjs";
import { getUserByUsername, getUserById } from "../db/queries.js";

passport.use(
  new Strategy(async (username, password, done) => {
    try {
      const user = await getUserByUsername(username);
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
    const user = await getUserById(id);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});

export { passport };
