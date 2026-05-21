import multer from "multer";
import { controller, requireLogin, buildPath } from "../controllers/index.js";
import { Router } from "express";
const router = Router();
import { db } from "../db/queries.js";

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const uploadSingle = (req, res, next) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      const msg =
        err.code === "LIMIT_FILE_SIZE"
          ? "File has to be less than 5MB"
          : "File upload failed";
      const { id } = req.params;
      const folder = await db.getCurDirectory(Number(id), req.user.id);
      const path = await buildPath(folder, req.user.id);
      return res.status(400).render("index", {
        folder,
        path,
        errors: [{ msg }],
        openModal: "file",
      });
    }
    next();
  });
};

router.get("/folders/:id", requireLogin, controller.homeGet);

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
