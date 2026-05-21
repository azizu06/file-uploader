import { prisma } from "../lib/prisma.js";

const getUserByUsername = async (username) =>
  prisma.user.findUnique({
    where: { username },
  });

const getAllFolders = async (userId) =>
  prisma.folder.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

const getAllFoldersWithFiles = async (userId) =>
  prisma.folder.findMany({
    where: { userId },
    include: { files: true },
    orderBy: { createdAt: "asc" },
  });

const getUserById = async (id) =>
  prisma.user.findUnique({
    where: { id },
  });

const addUser = async (username, password) => {
  const user = await prisma.user.create({ data: { username, password } });
  const folder = await prisma.folder.create({
    data: { userId: user.id, name: username },
  });
  return folder;
};

const addFolder = async ({ name, userId, parentId }) =>
  prisma.folder.create({
    data: {
      name,
      userId,
      parentId,
    },
  });

const editFolder = async (id, userId, data) =>
  prisma.folder.updateMany({ where: { id, userId }, data });

const getFolder = async (id, userId) =>
  prisma.folder.findFirst({ where: { id, userId } });

const deleteFolder = async (id, userId) =>
  prisma.folder.deleteMany({ where: { id, userId } });

const addFile = async ({ name, storageKey, mimeType, size, folderId }) =>
  prisma.file.create({
    data: {
      name,
      storageKey,
      mimeType,
      size,
      folderId,
    },
  });

const deleteFile = async (id, userId) =>
  prisma.file.deleteMany({ where: { id, folder: { userId } } });

const getFile = async (id, userId) =>
  prisma.file.findFirst({ where: { id, folder: { userId } } });

const getCurDirectory = async (id, userId, sort, dir) => {
  const fileSortFields = {
    name: "name",
    size: "size",
    date: "createdAt",
  };
  const fileSort = fileSortFields[sort] || "name";
  const sortDir = dir === "desc" ? "desc" : "asc";
  const folderSort = sort === "date" ? "createdAt" : "name";
  return prisma.folder.findFirst({
    where: { id, userId },
    include: {
      children: {
        orderBy: {
          [folderSort]: sortDir,
        },
      },
      files: {
        orderBy: {
          [fileSort]: sortDir,
        },
      },
    },
  });
};

const getRoot = async (userId) =>
  prisma.folder.findFirst({
    where: { userId, parentId: null },
    include: {
      children: true,
      files: true,
    },
  });

const ensureRoot = async (userId, name) => {
  const root = await getRoot(userId);
  if (root) return root;

  return prisma.folder.create({
    data: { userId, name },
  });
};

export const db = {
  getRoot,
  ensureRoot,
  getCurDirectory,
  getFolder,
  getAllFolders,
  addFile,
  getFile,
  addFolder,
  editFolder,
  deleteFile,
  deleteFolder,
  getUserById,
  getUserByUsername,
  addUser,
  getAllFoldersWithFiles,
};
