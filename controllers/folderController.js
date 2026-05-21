import { validationResult } from "express-validator";
import { db } from "../db/queries.js";
import { buildPath, renderFolderErrorPage, buildTree } from "./helpers.js";
import { validateFolder } from "./validators.js";

const homeGet = async (req, res) => {
  const { id } = req.params;
  const { sort, dir } = req.query;
  const getNextDir = (field) =>
    sort === field && dir === "asc" ? "desc" : "asc";

  const folder = await db.getCurDirectory(Number(id), req.user.id, sort, dir);
  if (!folder) {
    return renderFolderErrorPage(req, res, {
      folder: null,
      status: 404,
      errors: [{ msg: "Folder does not exist." }],
      openModal: null,
      getNextDir,
    });
  }
  const root = await buildTree(req.user.id);
  const path = await buildPath(folder, req.user.id);
  res.render("index", { folder, path, openModal: null, root, getNextDir });
};

const addFolderPost = [
  validateFolder,
  async (req, res, next) => {
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
    try {
      await db.addFolder(folderData);
      res.redirect(`/folders/${id}`);
    } catch (err) {
      if (err.code === "P2002")
        return renderFolderErrorPage(req, res, {
          folder,
          status: 400,
          errors: [{ msg: "A folder with that name already exists." }],
          old: req.body,
          openModal: "addFolder",
        });
      next(err);
    }
  },
];

const editFolderPost = [
  validateFolder,
  async (req, res, next) => {
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
    const root = await db.getRoot(req.user.id);
    const folder = await db.getFolder(Number(id), req.user.id);
    if (!folder) {
      return renderFolderErrorPage(req, res, {
        folder: null,
        status: 404,
        errors: [{ msg: "Folder does not exist." }],
        openModal: "editFolder",
      });
    }
    if (root && folder.id === root.id) {
      return renderFolderErrorPage(req, res, {
        folder,
        status: 400,
        errors: [{ msg: "The root folder cannot be renamed." }],
        openModal: null,
      });
    }
    try {
      await db.editFolder(Number(id), req.user.id, req.body);
      res.redirect(`/folders/${id}`);
    } catch (err) {
      if (err.code === "P2002")
        return renderFolderErrorPage(req, res, {
          folder,
          status: 400,
          errors: [{ msg: "A folder with that name already exists." }],
          old: req.body,
          openModal: "editFolder",
        });
      next(err);
    }
  },
];

export const folderController = {
  homeGet,
  addFolderPost,
  editFolderPost,
};
