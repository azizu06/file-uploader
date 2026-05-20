import multer from "multer";
import { controller, requireLogin } from "../controllers/index.js";
import { Router } from "express";
const router = Router();

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.get("/folders/:id", requireLogin, controller.homeGet);

router.get("/login", controller.loginGet);
router.post("/login", controller.loginPost);

router.get("/sign-up", controller.signUpGet);
router.post("/sign-up", controller.signUpPost);

router.post("/folders/:id/edit", requireLogin, controller.editFolderPost);
router.post("/:type/:id/delete", requireLogin, controller.deleteItemPost);
router.post("/folders/new", requireLogin, controller.addFolderPost);
router.post(
  "/files/new",
  requireLogin,
  upload.single("file"),
  controller.addFilePost,
);

export { router };
