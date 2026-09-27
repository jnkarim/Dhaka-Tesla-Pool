import { Router } from "express";

import { joinPoolController } from "./pool.controller.js";

import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

router.post(
  "/join",

  authenticate,

  joinPoolController,
);

export default router;
