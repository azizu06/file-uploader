import passport from "passport";
import { Strategy } from "passport-local";
import bcrypt from "bcryptjs";

passport.use(new Strategy(async (username, password, done) => {}));
