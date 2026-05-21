import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import { passport } from "../config/passport.js";
import { db } from "../db/queries.js";
import { validateLogin, validateSignUp } from "./validators.js";

const indexGet = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  const root = await db.getRoot(req.user.id);
  res.redirect(`/folders/${root.id}`);
};

const signUpGet = async (req, res) => res.render("signUp");

const signUpPost = [
  validateSignUp,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .render("signUp", { errors: errors.array(), old: req.body });
    }
    try {
      const { password, username } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const folder = await db.addUser(username, hashedPassword);
      res.redirect(`/folders/${folder.id}`);
    } catch (err) {
      if (err.code === "P2002")
        return res.status(409).render("signUp", {
          errors: [{ msg: "Username already exists" }],
          old: req.body,
        });
      next(err);
    }
  },
];

const loginGet = async (req, res) => res.render("login");

const loginPost = [
  validateLogin,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .render("login", { errors: errors.array(), old: req.body });
    }
    return passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user)
        return res.status(401).render("login", {
          errors: [{ msg: "Invalid username or password." }],
          old: req.body,
        });
      req.login(user, async (err) => {
        if (err) return next(err);
        const folder = await db.getRoot(user.id);
        return res.redirect(`/folders/${folder.id}`);
      });
    })(req, res, next);
  },
];

const logoutPost = async (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/login");
  });
};

export const requireLogin = async (req, res, next) => {
  if (!req.user)
    return res
      .status(401)
      .render("login", { errors: [{ msg: "Go login first." }] });
  next();
};

export const authController = {
  signUpGet,
  signUpPost,
  loginGet,
  loginPost,
  logoutPost,
  indexGet,
};
