import multer from "multer";
import { controller } from "../controllers";
import { Router } from "express";
const router = Router();

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export { router };
