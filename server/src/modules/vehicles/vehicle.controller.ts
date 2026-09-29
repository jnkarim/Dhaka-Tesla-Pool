import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate.js";

import { getDriverVehicle, updateVehicleStatus } from "./vehicle.service.js";

export async function getDriverVehicleController(
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

    const vehicle = await getDriverVehicle(req.user.userId);

    return res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    const message = (error as Error).message;

    if (message === "VEHICLE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found for this driver",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

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

    if (typeof isOnline !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isOnline must be a boolean",
      });
    }

    const vehicle = await updateVehicleStatus(req.user.userId, isOnline);

    return res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    const message = (error as Error).message;

    if (message === "VEHICLE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found for this driver",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
