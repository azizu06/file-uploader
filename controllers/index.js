require("dotenv").config();
const db = require("../db/queries");
const { validationResult } = require("express-validator");
const {
  validateAddMsg,
  validateLogin,
  validateSignUp,
  validateSecret,
} = require("./validators");
const bcrypt = require("bcryptjs");
const passport = require("../config/passport");

exports.homeGet = async (req, res) => {
  const messages = await db.getAllMsgs();
  res.render("index", { messages });
};

exports.loginGet = async (req, res) => res.render("login");
exports.loginPost = [
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
      req.login(user, (err) => {
        if (err) return next(err);
        return res.redirect("/");
      });
    })(req, res, next);
  },
];

exports.singUpGet = async (req, res) => res.render("signUp");
exports.singUpPost = [
  validateSignUp,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .render("signUp", { errors: errors.array(), old: req.body });
    }
    try {
      const { password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.addUser(req.body, hashedPassword);
      res.redirect("/");
    } catch (err) {
      if (err.code === "23505")
        return res.status(409).render("signUp", {
          errors: [{ msg: "Username already exists." }],
          old: req.body,
        });
      next(err);
    }
  },
];

exports.joinGet = async (req, res) => res.render("join");
exports.adminPost = [
  validateSecret,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("join", { errors: errors.array() });
    }
    const { secret } = req.body;
    if (secret === process.env.ADMIN_PASS) {
      await db.makeAdmin(req.user.id);
      res.redirect("/");
    } else {
      return res
        .status(401)
        .render("join", { errors: [{ msg: "Incorrect password" }] });
    }
  },
];
exports.memberPost = [
  validateSecret,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("join", { errors: errors.array() });
    }
    const { secret } = req.body;
    if (secret === process.env.MEMBER_PASS) {
      await db.makeMember(req.user.id);
      res.redirect("/");
    } else {
      return res
        .status(401)
        .render("join", { errors: [{ msg: "Incorrect password" }] });
    }
  },
];

exports.logOutPost = async (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};

exports.addMsgGet = async (req, res) => res.render("addMsg");
exports.addMsgPost = [
  validateAddMsg,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .render("addMsg", { errors: errors.array(), old: req.body });
    }
    await db.addMsg(req.body, req.user);
    res.redirect("/");
  },
];

exports.deleteMsgPost = async (req, res) => {
  if (!req.user.is_admin) {
    const messages = await db.getAllMsgs();
    return res.status(403).render("index", {
      messages,
      errors: [{ msg: "You need admin permissions to delete messages." }],
    });
  }
  const { id } = req.params;
  await db.deleteMsg(id);
  res.redirect("/");
};

exports.requireLogin = (req, res, next) => {
  if (!req.user)
    return res
      .status(401)
      .render("login", { errors: [{ msg: "Go login first." }] });
  next();
};
