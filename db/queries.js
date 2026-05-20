import { prisma } from "../lib/prisma.js";

const getUserByUsername = async (username) =>
  prisma.user.findUnique({
    where: { username },
  });

const getUserById = async (id) => prisma.user.findUnique({ where: { id } });

const addUser = async (data, password) => prisma.create({ data, password });

const addFolder = async (data) => prisma.folder.create({ data });

const editFolder = async (id, data) =>
  prisma.folder.update({ where: { id }, data });

const getFolder = async (id) => prisma.folder.findUnique({ where: { id } });

const deleteFolder = async (id) => prisma.folder.delete({ where: { id } });

const addFile = async (data, folderId) =>
  prisma.file.create({ data, folderId });

const deleteFile = async (id) => prisma.file.delete({ where: { id } });

const getCurDirectory = async (id, userId) =>
  prisma.folder.findUnique({
    where: { id },
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
  addFolder,
  editFolder,
  deleteFile,
  deleteFolder,
  getUserById,
  getUserByUsername,
  addUser,
};
