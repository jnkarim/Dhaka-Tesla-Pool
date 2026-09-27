import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate.js";

import { createRide } from "./ride.service.js";

export async function createRideController(
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

    const { pickup, destination, seats } = req.body;

    const ride = await createRide(
      req.user.userId,

      pickup,

      destination,

      seats,
    );

    return res.status(201).json({
      success: true,

      data: ride,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: "Server Error",
    });
  }
}
