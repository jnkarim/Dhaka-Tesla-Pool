import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate.js";

import { createRide, updateRideStatus } from "./ride.service.js";

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

export async function updateRideStatusController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const rideId = req.params.id;

    if (!rideId || Array.isArray(rideId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ride id",
      });
    }

    const { status } = req.body;

    const ride = await updateRideStatus(rideId, status);

    return res.status(200).json({
      success: true,

      data: ride,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,

      message: (error as Error).message,
    });
  }
}
