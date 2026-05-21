import { db } from "../db/queries.js";
import { renderFolderErrorPage } from "./helpers.js";
import { supabase, supabaseBucket } from "../lib/supabase.js";

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
    let deleteIds = new Set([folder.id]);
    let found = true;
    const allFolders = await db.getAllFoldersWithFiles(req.user.id);
    while (found) {
      found = false;
      allFolders.forEach((folder) => {
        if (deleteIds.has(folder.parentId) && !deleteIds.has(folder.id)) {
          found = true;
          deleteIds.add(folder.id);
        }
      });
    }
    const storageKeys = allFolders
      .filter((folder) => deleteIds.has(folder.id))
      .flatMap((folder) => folder.files)
      .map((file) => file.storageKey);

    if (storageKeys.length > 0) {
      const { error } = await supabase.storage
        .from(supabaseBucket)
        .remove(storageKeys);
      if (error)
        return renderFolderErrorPage(req, res, {
          folder: null,
          status: 500,
          errors: [{ msg: "File removal failed." }],
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
  const { error } = await supabase.storage
    .from(supabaseBucket)
    .remove([file.storageKey]);
  if (error)
    return renderFolderErrorPage(req, res, {
      folder: null,
      status: 500,
      errors: [{ msg: "File removal failed." }],
      openModal: null,
    });
  await db.deleteFile(Number(id), req.user.id);
  res.redirect(`/folders/${file.folderId}`);
};

export const itemController = {
  deleteItemPost,
};
