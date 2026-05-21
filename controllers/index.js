export { buildPath, renderFolderErrorPage } from "./helpers.js";
export { requireLogin } from "./authController.js";

import { authController } from "./authController.js";
import { fileController } from "./fileController.js";
import { folderController } from "./folderController.js";
import { itemController } from "./itemController.js";

export const controller = {
  ...folderController,
  ...fileController,
  ...authController,
  ...itemController,
};
