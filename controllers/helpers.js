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
  { folder, status, errors, openModal = null, old, getNextDir = () => "asc" },
) => {
  const { sort, dir } = req.query;
  const pageFolder = folder
    ? await db.getCurDirectory(folder.id, req.user.id, sort, dir)
    : await db.getRoot(req.user.id);
  const path = folder ? await buildPath(folder, req.user.id) : [];
  const root = await buildTree(req.user.id);

  return res.status(status).render("index", {
    folder: pageFolder,
    path,
    errors,
    old,
    openModal,
    root,
    getNextDir,
  });
};

export const buildTree = async (userId) => {
  const rootFolder = await db.getRoot(userId);
  if (!rootFolder) return [];

  const allFolders = await db.getAllFolders(userId);
  let parentToChild = {};
  allFolders.forEach((folder) => {
    if (!(folder.parentId in parentToChild))
      parentToChild[folder.parentId] = [];
    parentToChild[folder.parentId].push(folder);
  });
  allFolders.forEach((folder) => {
    folder.children = parentToChild[folder.id] || [];
  });
  const root = allFolders.find((folder) => folder.id === rootFolder.id);
  return root ? [root] : [];
};
