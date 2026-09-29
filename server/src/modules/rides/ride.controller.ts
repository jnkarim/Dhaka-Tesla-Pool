import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate.js";

import {
  confirmDriverPayment,
  confirmPassengerPayment,
  createRide,
  getCurrentRide,
  getPassengerRideHistory,
  updateRideStatus,
  cancelRide
} from "./ride.service.js";

// Create ride

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

    if (req.user.role !== "PASSENGER") {
      return res.status(403).json({
        success: false,
        message: "Passenger access only",
      });
    }

    const { pickup, destination, seats } = req.body;

    if (!pickup || !destination || !seats) {
      return res.status(400).json({
        success: false,
        message: "Pickup, destination and seats are required",
      });
    }

    const ride = await createRide(req.user.userId, pickup, destination, seats);

    return res.status(201).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    const message = (error as Error).message;

    if (
      message === "PICKUP_DESTINATION_SAME" ||
      message === "INVALID_SEAT_COUNT"
    ) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    if (message === "ACTIVE_RIDE_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "You already have an active ride",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// Get current passenger ride

export async function getCurrentRideController(
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

    if (req.user.role !== "PASSENGER") {
      return res.status(403).json({
        success: false,
        message: "Passenger access only",
      });
    }

    const ride = await getCurrentRide(req.user.userId);

    return res.status(200).json({
      success: true,
      data: ride,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// Passenger ride history

export async function getPassengerRideHistoryController(
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

    if (req.user.role !== "PASSENGER") {
      return res.status(403).json({
        success: false,
        message: "Passenger access only",
      });
    }

    const rides = await getPassengerRideHistory(req.user.userId);

    return res.status(200).json({
      success: true,
      data: rides,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// Update ride status

export async function updateRideStatusController(
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

    const rideId = req.params.id;

    if (!rideId || Array.isArray(rideId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ride id",
      });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const ride = await updateRideStatus(rideId, status);

    return res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    const message = (error as Error).message;

    if (message === "RIDE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    if (message === "INVALID_TRANSITION") {
      return res.status(400).json({
        success: false,
        message: "Invalid ride status transition",
      });
    }

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

// Passenger confirms cash payment

export async function confirmPassengerPaymentController(
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

    if (req.user.role !== "PASSENGER") {
      return res.status(403).json({
        success: false,
        message: "Passenger access only",
      });
    }

    const rideId = req.params.id;

    if (!rideId || Array.isArray(rideId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ride id",
      });
    }

    const ride = await confirmPassengerPayment(rideId, req.user.userId);

    return res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    const message = (error as Error).message;

    if (message === "RIDE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    if (message === "UNAUTHORIZED") {
      return res.status(403).json({
        success: false,
        message: "You cannot update this ride",
      });
    }

    if (message === "RIDE_NOT_COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Payment can only be confirmed after ride completion",
      });
    }

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

// Driver confirms cash received

export async function confirmDriverPaymentController(
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

    const rideId = req.params.id;

    if (!rideId || Array.isArray(rideId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ride id",
      });
    }

    const ride = await confirmDriverPayment(rideId, req.user.userId);

    return res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    const message = (error as Error).message;

    if (message === "RIDE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    if (message === "UNAUTHORIZED") {
      return res.status(403).json({
        success: false,
        message: "You cannot update this ride",
      });
    }

    if (message === "RIDE_NOT_COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Cash can only be confirmed after ride completion",
      });
    }

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function cancelRideController(
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

    if (req.user.role !== "PASSENGER") {
      return res.status(403).json({
        success: false,
        message: "Passenger access only",
      });
    }

    const rideId = req.params.id;

    if (!rideId || Array.isArray(rideId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ride id",
      });
    }

    const ride = await cancelRide(rideId, req.user.userId);

    return res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    const message = (error as Error).message;

    if (message === "RIDE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    if (message === "UNAUTHORIZED") {
      return res.status(403).json({
        success: false,
        message: "You cannot cancel this ride",
      });
    }

    if (message === "RIDE_CANNOT_BE_CANCELLED") {
      return res.status(409).json({
        success: false,
        message: "This ride can no longer be cancelled",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
