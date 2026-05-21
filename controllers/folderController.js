import { validationResult } from "express-validator";
import { db } from "../db/queries.js";
import { buildPath, renderFolderErrorPage } from "./helpers.js";
import { validateFolder } from "./validators.js";

const homeGet = async (req, res) => {
  const { id } = req.params;
  const folder = await db.getCurDirectory(Number(id), req.user.id);
  if (!folder) {
    return renderFolderErrorPage(req, res, {
      folder: null,
      status: 404,
      errors: [{ msg: "Folder does not exist." }],
      openModal: null,
    });
  }
  const path = await buildPath(folder, req.user.id);
  res.render("index", { folder, path, openModal: null });
};

const addFolderPost = [
  validateFolder,
  async (req, res) => {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const folder = await db.getCurDirectory(Number(id), req.user.id);
      return renderFolderErrorPage(req, res, {
        folder,
        status: 400,
        errors: errors.array(),
        old: req.body,
        openModal: "addFolder",
      });
    }
    const folderData = {
      name: req.body.name,
      userId: req.user.id,
      parentId: Number(id),
    };
    const folder = await db.getFolder(Number(id), req.user.id);
    if (!folder) {
      return renderFolderErrorPage(req, res, {
        folder: null,
        status: 404,
        errors: [{ msg: "Folder does not exist." }],
        openModal: "addFolder",
      });
    }
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
      return renderFolderErrorPage(req, res, {
        folder,
        status: 400,
        errors: errors.array(),
        old: req.body,
        openModal: "editFolder",
      });
    }
    const folder = await db.getFolder(Number(id), req.user.id);
    if (!folder) {
      return renderFolderErrorPage(req, res, {
        folder: null,
        status: 404,
        errors: [{ msg: "Folder does not exist." }],
        openModal: "editFolder",
      });
    }
    await db.editFolder(Number(id), req.user.id, req.body);
    res.redirect(`/folders/${id}`);
  },
];

export const folderController = {
  homeGet,
  addFolderPost,
  editFolderPost,
};
