import { Router } from "express";

import {
  confirmDriverPaymentController,
  confirmPassengerPaymentController,
  createRideController,
  getCurrentRideController,
  getPassengerRideHistoryController,
  updateRideStatusController,
  cancelRideController,
} from "./ride.controller.js";

import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

// Create new ride
router.post("/", authenticate, createRideController);

// Current passenger ride
router.get("/current", authenticate, getCurrentRideController);

// Passenger ride history
router.get("/history", authenticate, getPassengerRideHistoryController);

// Update ride status
router.patch("/:id/status", authenticate, updateRideStatusController);

// Passenger confirms cash payment
router.patch(
  "/:id/payment/passenger",
  authenticate,
  confirmPassengerPaymentController,
);

// Driver confirms cash received
router.patch(
  "/:id/payment/driver",
  authenticate,
  confirmDriverPaymentController,
);

router.patch("/:id/cancel", authenticate, cancelRideController);

export default router;
