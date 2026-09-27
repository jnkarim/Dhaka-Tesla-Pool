import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate.js";

import { joinPoolSafely } from "./pool.service.js";

export async function joinPoolController(
  req: AuthenticatedRequest,

  res: Response,
) {
  try {
    const { poolId, rideRequestId, seats } = req.body;

    const member = await joinPoolSafely(
      poolId,

      rideRequestId,

      seats,
    );

    return res.status(201).json({
      success: true,

      data: member,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,

      message: (error as Error).message,
    });
  }
}
