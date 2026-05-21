import { prisma } from "../lib/prisma.js";

const getUserByUsername = async (username) =>
  prisma.user.findUnique({
    where: { username },
  });

const getUserById = async (id) => prisma.user.findUnique({ where: { id } });

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

const getCurDirectory = async (id, userId) =>
  prisma.folder.findFirst({
    where: { id, userId },
    include: {
      children: true,
      files: true,
    },
  });

const getRoot = async (userId) =>
  prisma.folder.findFirst({
    where: { userId, parentId: null },
  });

export const db = {
  getRoot,
  getCurDirectory,
  getFolder,
  addFile,
  getFile,
  addFolder,
  editFolder,
  deleteFile,
  deleteFolder,
  getUserById,
  getUserByUsername,
  addUser,
};
