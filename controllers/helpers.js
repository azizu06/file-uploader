import { db } from "../db/queries.js";

export const buildPath = async (folder, userId) => {
  const path = [];
  let curFolder = folder;
  while (curFolder.parentId) {
    path.push(curFolder);
    curFolder = await db.getFolder(curFolder.parentId, userId);
  }
  return path.reverse();
};

export const renderFolderErrorPage = async (
  req,
  res,
  { folder, status, errors, openModal = null, old },
) => {
  const pageFolder = folder || (await db.getRoot(req.user.id));
  const path = folder ? await buildPath(folder, req.user.id) : [];

  return res.status(status).render("index", {
    folder: pageFolder,
    path,
    errors,
    old,
    openModal,
  });
};
