import { Router } from "express";

import {
  acceptPoolController,
  activePoolController,
  availablePoolsController,
  driverHistoryController,
  updateActivePoolStatusController,
} from "./driver.controller.js";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

// Available pools

router.get(
  "/pools",
  authenticate,
  authorize("DRIVER"),
  availablePoolsController,
);

// Accept a pool

router.patch(
  "/pools/:id/accept",
  authenticate,
  authorize("DRIVER"),
  acceptPoolController,
);

// Driver ride history

router.get(
  "/history",
  authenticate,
  authorize("DRIVER"),
  driverHistoryController,
);

// Current active pool

router.get(
  "/active-pool",
  authenticate,
  authorize("DRIVER"),
  activePoolController,
);

// Update active pool lifecycle
router.patch(
  "/active-pool/status",
  authenticate,
  authorize("DRIVER"),
  updateActivePoolStatusController,
);

export default router;
