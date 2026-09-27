import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate.js";

import { updateVehicleStatus } from "./vehicle.service.js";

export async function updateOnlineStatusController(
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

    const { isOnline } = req.body;

    const vehicle = await updateVehicleStatus(
      req.user.userId,

      isOnline,
    );

    return res.status(200).json({
      success: true,

      data: vehicle,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,

      message: (error as Error).message,
    });
  }
}
