import { db } from "../db/queries.js";
import { renderFolderErrorPage } from "./helpers.js";

const deleteItemPost = async (req, res) => {
  const { id, type } = req.params;
  if (type === "folders") {
    const folder = await db.getFolder(Number(id), req.user.id);
    if (!folder) {
      return renderFolderErrorPage(req, res, {
        folder: null,
        status: 404,
        errors: [{ msg: "Folder does not exist." }],
        openModal: null,
      });
    }
    await db.deleteFolder(Number(id), req.user.id);
    const rootFolder = await db.getRoot(req.user.id);
    return res.redirect(`/folders/${rootFolder.id}`);
  }

  const file = await db.getFile(Number(id), req.user.id);
  if (!file) {
    return renderFolderErrorPage(req, res, {
      folder: null,
      status: 404,
      errors: [{ msg: "File does not exist." }],
      openModal: null,
    });
  }
  await db.deleteFile(Number(id), req.user.id);
  res.redirect(`/folders/${file.folderId}`);
};

export const itemController = {
  deleteItemPost,
};
