const { Router } = require("express");
const router = Router();
const controller = require("../controllers");

router.get("/", controller.homeGet);

router.get("/login", controller.loginGet);
router.post("/login", controller.loginPost);

router.get("/sign-up", controller.singUpGet);
router.post("/sign-up", controller.singUpPost);

router.post("/logout", controller.logOutPost);

router.get("/join", controller.requireLogin, controller.joinGet);
router.post("/member", controller.requireLogin, controller.memberPost);
router.post("/admin", controller.requireLogin, controller.adminPost);

router.get("/add-msg", controller.requireLogin, controller.addMsgGet);
router.post("/add-msg", controller.requireLogin, controller.addMsgPost);

router.post(
  "/msg/:id/delete",
  controller.requireLogin,
  controller.deleteMsgPost,
);

module.exports = router;
