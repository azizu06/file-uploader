import { body, validationResult, matchedData } from "express-validator";
import { db } from "../db/queries.js";
import bcrypt from "bcryptjs";
import passport from "../config/passport.js";
import { validateLogin, validateSignUp, validateFolder } from "./validators.js";

const homeGet = async (req, res) => {
  const { id } = req.params;
  const folder = await db.getFolder(id);
  let path = [];
  let curFolder = folder;
  while (curFolder.parentId) {
    path.append(curFolder);
    curFolder = await db.getFolder(curFolder.parentId);
  }
  path.reverse();
  res.render("index", { folder, path });
};

const signUpGet = async (req, res) => res.render("login");
const signUpPost = [
  validateSignUp,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res
        .status(400)
        .render("signUp", { errors: errors.array(), old: req.body });
    }
    try {
      const { password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.addUser(req.body, password);
    } catch (err) {
      if (err.code === "23505")
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
      res
        .status(400)
        .render("signUp", { errors: errors.array(), old: req.body });
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
        return (res, redirect("/"));
      });
    })(req, res, next);
  },
];

const logoutPost = async (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("login");
  });
};

const addFilePost = async (req, res) => {
  const { folderId: id } = req.params;
  await db.addFolder(req.file, folderId);
};

const addFolderPost = [
  validateFolder,
  async (req, res) => {
    db.addFolder(req.body);
  },
];

const editFolderPost = [
  validateFolder,
  async (req, res) => {
    const { id } = req.params;
    await db.editFolder(id, req.body);
  },
];

const deleteItemPost = async (req, res) => {
  const { id, type } = req.params;
  if (type === "folders") {
    await db.deleteFolder(id);
    return;
  }
  await db.deleteFile(id);
};

export const requireLogin = async (req, res, next) => {
  if (!req.user)
    return res
      .status(401)
      .render("login", { errors: [{ msg: "Go login first." }] });
  next();
};

export const controller = {
  homeGet,
  signUpGet,
  signUpPost,
  loginGet,
  loginPost,
  logoutPost,
  addFilePost,
  editFolderPost,
  addFolder,
  deleteItemPost,
};
