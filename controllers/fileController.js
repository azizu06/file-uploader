import { db } from "../db/queries.js";
import { renderFolderErrorPage } from "./helpers.js";

const fileGet = async (req, res) => {
  const { id } = req.params;
  const file = await db.getFile(Number(id), req.user.id);
  if (!file) {
    return renderFolderErrorPage(req, res, {
      folder: null,
      status: 404,
      errors: [{ msg: "File does not exist." }],
      openModal: null,
    });
  }
  res.render("fileDetail", { file });
};

const addFilePost = async (req, res) => {
  if (!req.file) {
    const { id } = req.params;
    const folder = await db.getCurDirectory(Number(id), req.user.id);
    return renderFolderErrorPage(req, res, {
      folder,
      status: 400,
      errors: [{ msg: "No file uploaded" }],
      openModal: "addFile",
    });
  }
  const { id } = req.params;
  const fileData = {
    name: req.file.originalname,
    storageKey: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    folderId: Number(id),
  };
  const folder = await db.getFolder(Number(id), req.user.id);
  if (!folder) {
    return renderFolderErrorPage(req, res, {
      folder: null,
      status: 404,
      errors: [{ msg: "Folder does not exist." }],
      openModal: "addFile",
    });
  }
  await db.addFile(fileData);
  res.redirect(`/folders/${id}`);
};

export const fileController = {
  fileGet,
  addFilePost,
};
