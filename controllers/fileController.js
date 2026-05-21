import { db } from "../db/queries.js";
import { renderFolderErrorPage } from "./helpers.js";
import { supabase, supabaseBucket } from "../lib/supabase.js";
import fs from "node:fs/promises";

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

const addFilePost = async (req, res, next) => {
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
  const folder = await db.getFolder(Number(id), req.user.id);
  if (!folder) {
    return renderFolderErrorPage(req, res, {
      folder: null,
      status: 404,
      errors: [{ msg: "Folder does not exist." }],
      openModal: "addFile",
    });
  }
  const storagePath = `users/${req.user.id}/folders/${id}/${req.file.filename}`;
  const fileData = {
    name: req.file.originalname,
    storageKey: storagePath,
    mimeType: req.file.mimetype,
    size: req.file.size,
    folderId: Number(id),
  };
  const fileBuffer = await fs.readFile(req.file.path);
  const { error } = await supabase.storage
    .from(supabaseBucket)
    .upload(storagePath, fileBuffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });
  await fs.unlink(req.file.path).catch(() => {});
  if (error) {
    return renderFolderErrorPage(req, res, {
      folder,
      status: 500,
      errors: [{ msg: "File upload failed." }],
      openModal: "addFile",
    });
  }
  try {
    await db.addFile(fileData);
    res.redirect(`/folders/${id}`);
  } catch (err) {
    await supabase.storage.from(supabaseBucket).remove([storagePath]);
    if (err.code === "P2002")
      return renderFolderErrorPage(req, res, {
        folder,
        status: 400,
        errors: [{ msg: "A file with that name already exists." }],
        openModal: "addFile",
      });
    next(err);
  }
};

const fileDownloadGet = async (req, res) => {
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
  const folder = await db.getFolder(file.folderId, req.user.id);
  const { data, error } = await supabase.storage
    .from(supabaseBucket)
    .createSignedUrl(file.storageKey, 60);
  if (error) {
    return renderFolderErrorPage(req, res, {
      folder,
      status: 500,
      errors: [{ msg: "Download failed." }],
      openModal: null,
    });
  }
  res.redirect(data.signedUrl);
};

export const fileController = {
  fileGet,
  addFilePost,
  fileDownloadGet,
};
