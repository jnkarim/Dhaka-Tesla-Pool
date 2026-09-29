import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate.js";

import {
  acceptPool,
  getActivePool,
  getAvailablePools,
  updateActivePoolStatus,
} from "./driver.service.js";

// Get available pools

export async function availablePoolsController(
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

    if (req.user.role !== "DRIVER") {
      return res.status(403).json({
        success: false,
        message: "Driver access only",
      });
    }

    const pools = await getAvailablePools(req.user.userId);

    return res.status(200).json({
      success: true,
      data: pools,
    });
  } catch (error) {
    const message = (error as Error).message;

    if (message === "VEHICLE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found for this driver",
      });
    }

    if (message === "DRIVER_OFFLINE") {
      return res.status(409).json({
        success: false,
        message: "Go online to view available pools",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// Get current active pool

export async function activePoolController(
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

    if (req.user.role !== "DRIVER") {
      return res.status(403).json({
        success: false,
        message: "Driver access only",
      });
    }

    const pool = await getActivePool(req.user.userId);

    return res.status(200).json({
      success: true,
      data: pool,
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

// Accept pool

export async function acceptPoolController(
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

    if (req.user.role !== "DRIVER") {
      return res.status(403).json({
        success: false,
        message: "Driver access only",
      });
    }

    const poolId = req.params.id;

    if (!poolId || Array.isArray(poolId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pool id",
      });
    }

    const pool = await acceptPool(req.user.userId, poolId);

    return res.status(200).json({
      success: true,
      data: pool,
    });
  } catch (error) {
    const message = (error as Error).message;

    if (message === "VEHICLE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found for this driver",
      });
    }

    if (message === "DRIVER_OFFLINE") {
      return res.status(409).json({
        success: false,
        message: "Go online before accepting a pool",
      });
    }

    if (message === "DRIVER_ALREADY_HAS_ACTIVE_POOL") {
      return res.status(409).json({
        success: false,
        message: "You already have an active pool",
      });
    }

    if (message === "POOL_NOT_AVAILABLE") {
      return res.status(409).json({
        success: false,
        message: "This pool is no longer available",
      });
    }

    if (message === "POOL_EMPTY") {
      return res.status(409).json({
        success: false,
        message: "This pool has no active ride requests",
      });
    }

    if (message === "POOL_CAPACITY_EXCEEDED") {
      return res.status(409).json({
        success: false,
        message: "This pool exceeds your Tesla capacity",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateActivePoolStatusController(
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

    const { status } = req.body;

    const allowedStatuses = ["DRIVER_ARRIVED", "STARTED", "COMPLETED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pool status",
      });
    }

    const pool = await updateActivePoolStatus(req.user.userId, status);

    return res.status(200).json({
      success: true,
      data: pool,
    });
  } catch (error) {
    const message = (error as Error).message;

    if (message === "ACTIVE_POOL_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Active pool not found",
      });
    }

    if (message === "INVALID_POOL_TRANSITION") {
      return res.status(409).json({
        success: false,
        message: "Invalid ride lifecycle transition",
      });
    }

    return res.status(500).json({
      success: false,
      message,
    });
  }
}
