import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorizeAdmin } from "../../middleware/authorizeAdmin.js";

import { transactionsController } from "./admin.controller.js";

const router = Router();

router.get(
  "/transactions",
  authenticate,
  authorizeAdmin,
  transactionsController,
);

export default router;
