import { prisma } from "../lib/prisma.js";

export const getUserByUsername = async (username) =>
  prisma.user.findUnique({
    where: { username },
  });

export const getUserById = async (id) =>
  prisma.user.findUnique({ where: { id } });

export const addUser = async (data) => prisma.user.create({ data });

export const addFolder = async (data) => prisma.folder.create({ data });

export const editFolder = async (id, data) =>
  prisma.folder.update({ where: { id }, data });

export const getFolder = async (id) =>
  prisma.folder.findUnique({ where: { id } });

export const deleteFolder = async (id) =>
  prisma.folder.delete({ where: { id } });

export const addFile = async (data) => prisma.file.create({ data });

export const deleteFile = async (id) => prisma.file.delete({ where: { id } });

export const getCurDirectory = async (id, userId) =>
  prisma.folder.findUnique({
    where: { id },
    include: {
      children: true,
      files: true,
    },
  });

export const getRoot = async (userId) =>
  prisma.folder.findFirst({
    where: { userId, parentId: null },
  });
