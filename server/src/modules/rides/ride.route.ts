import { Router } from "express";

import { createRideController, updateRideStatusController } from "./ride.controller.js";

import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

router.post("/", authenticate, createRideController);

router.patch("/:id/status", authenticate, updateRideStatusController);

export default router;
