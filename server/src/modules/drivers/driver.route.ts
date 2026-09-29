import { Router } from "express";

import {
  acceptPoolController,
  activePoolController,
  availablePoolsController,
  updateActivePoolStatusController,
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

router.get(
  "/active-pool",
  authenticate,
  authorize("DRIVER"),
  activePoolController,
);

router.patch(
  "/active-pool/status",
  authenticate,
  authorize("DRIVER"),
  updateActivePoolStatusController,
);

export default router;
