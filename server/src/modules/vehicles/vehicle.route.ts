import { Router } from "express";

import { updateOnlineStatusController } from "./vehicle.controller.js";

import { authenticate } from "../../middleware/authenticate.js";

import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.patch(
  "/online-status",

  authenticate,

  authorize("DRIVER"),

  updateOnlineStatusController,
);

export default router;
