import { Router } from "express";

import { createRideController } from "./ride.controller.js";

import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

router.post("/", authenticate, createRideController);

export default router;
