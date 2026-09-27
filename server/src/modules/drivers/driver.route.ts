import { Router } from "express";

import {
  availablePoolsController,
  acceptPoolController,
} from "./driver.controller.js";

import { authenticate } from "../../middleware/authenticate.js";

import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.get(
  "/pools",

  authenticate,

  authorize("DRIVER"),

  availablePoolsController,
);

router.patch(
  "/pools/:id/accept",

  authenticate,

  authorize("DRIVER"),

  acceptPoolController,
);

export default router;
