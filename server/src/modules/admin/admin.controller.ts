import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate.js";

import { getAllTransactions } from "./admin.service.js";

export async function transactionsController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const transactions = await getAllTransactions();

    return res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Admin transactions error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not load transactions",
    });
  }
}
