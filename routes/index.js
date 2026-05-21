import multer from "multer";
import {
  controller,
  requireLogin,
  renderFolderErrorPage,
} from "../controllers/index.js";
import { Router } from "express";
const router = Router();
import { db } from "../db/queries.js";

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const uploadSingle = (req, res, next) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      const msg =
        err.code === "LIMIT_FILE_SIZE"
          ? "File has to be less than 10MB"
          : "File upload failed";
      const { id } = req.params;
      const folder = await db.getCurDirectory(Number(id), req.user.id);
      return renderFolderErrorPage(req, res, {
        folder,
        status: 400,
        errors: [{ msg }],
        openModal: "addFile",
      });
    }
    next();
  });
};

router.get("/folders/:id", requireLogin, controller.homeGet);
router.get("/files/:id", requireLogin, controller.fileGet);
router.get("/files/:id/download", requireLogin, controller.fileDownloadGet);

router.get("/login", controller.loginGet);
router.post("/login", controller.loginPost);

router.get("/sign-up", controller.signUpGet);
router.post("/sign-up", controller.signUpPost);

router.post("/folders/:id/edit", requireLogin, controller.editFolderPost);
router.post("/:type/:id/delete", requireLogin, controller.deleteItemPost);
router.post("/folders/:id/new-folder", requireLogin, controller.addFolderPost);
router.post(
  "/folders/:id/new-file",
  requireLogin,
  uploadSingle,
  controller.addFilePost,
);

export { router };
