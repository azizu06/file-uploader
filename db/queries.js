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

const editFolder = async (id, data) =>
  prisma.folder.update({ where: { id }, data });

const getFolder = async (id) => prisma.folder.findUnique({ where: { id } });

const deleteFolder = async (id) => prisma.folder.delete({ where: { id } });

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

const deleteFile = async (id) => prisma.file.delete({ where: { id } });

const getFile = async (id) => prisma.file.findUnique({ where: { id } });

const getCurDirectory = async (id, userId) =>
  prisma.folder.findUnique({
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
