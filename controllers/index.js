import { body, validationResult } from "express-validator";
import { db } from "../db/queries.js";
import bcrypt from "bcryptjs";
import { passport } from "../config/passport.js";
import { validateLogin, validateSignUp, validateFolder } from "./validators.js";

const buildPath = async (folder) => {
  if (!folder) return null;
  let path = [];
  let curFolder = folder;
  while (curFolder.parentId) {
    path.push(curFolder);
    curFolder = await db.getFolder(curFolder.parentId);
  }
  return path.reverse();
};

const homeGet = async (req, res) => {
  const { id } = req.params;
  const folder = await db.getCurDirectory(Number(id), req.user.id);
  if (!folder) {
    const rootFolder = await db.getRoot(req.user.id);
    return res.status(404).render("index", {
      folder: rootFolder,
      errors: [{ msg: "Folder does not exist." }],
      path: [],
      openModal: null,
    });
  }
  const path = await buildPath(folder);
  res.render("index", { folder, path, openModal: null });
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
      return res
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
    res.redirect("login");
  });
};

const addFilePost = async (req, res) => {
  const { id } = req.params;
  const fileData = {
    name: req.file.originalname,
    storageKey: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    folderId: Number(id),
  };
  await db.addFile(fileData);
  res.redirect(`/folders/${id}`);
};

const addFolderPost = [
  validateFolder,
  async (req, res) => {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const folder = await db.getCurDirectory(Number(id), req.user.id);
      const path = await buildPath(folder);
      return res.status(400).render("index", {
        errors: errors.array(),
        old: req.body,
        folder,
        path,
        openModal: "addFolder",
      });
    }
    const folderData = {
      name: req.body.name,
      userId: req.user.id,
      parentId: Number(id),
    };
    await db.addFolder(folderData);
    res.redirect(`/folders/${id}`);
  },
];

const editFolderPost = [
  validateFolder,
  async (req, res) => {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const folder = await db.getCurDirectory(Number(id), req.user.id);
      const path = await buildPath(folder);
      return res.status(400).render("index", {
        errors: errors.array(),
        old: req.body,
        folder,
        path,
        openModal: "editFolder",
      });
    }
    const folder = await db.editFolder(Number(id), req.body);
    const parentFolder = await db.getFolder(folder.parentId);
    res.redirect(`/folders/${parentFolder.id}`);
  },
];

const deleteItemPost = async (req, res) => {
  const { id, type } = req.params;
  if (type === "folders") {
    await db.deleteFolder(Number(id));
    const folder = await db.getRoot(req.user.id);
    return res.redirect(`/folders/${folder.id}`);
  }
  const file = await db.getFile(id);
  await db.deleteFile(id);
  res.redirect(`/folders/${file.folderId}`);
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
  addFolderPost,
  deleteItemPost,
};
