import prisma from "../../lib/prisma.js";

import { calculateFare, type DhakaZone } from "../fares/fare.service.js";

import { canTransition, type RideStatus } from "./ride.state.js";

// Create new ride request
export async function createRide(
  passengerId: string,
  pickup: DhakaZone,
  destination: DhakaZone,
  seats: number,
) {
  const fare = calculateFare(pickup, destination);

  const ride = await prisma.rideRequest.create({
    data: {
      passengerId,

      pickup,

      destination,

      seats,

      estimatedFarePoisha: fare,

      status: "REQUESTED",
    },
  });

  return ride;
}

// Update ride status
export async function updateRideStatus(
  rideId: string,

  nextStatus: RideStatus,
) {
  // Step 1:
  // Find current ride

  const ride = await prisma.rideRequest.findUnique({
    where: {
      id: rideId,
    },
  });

  if (!ride) {
    throw new Error("RIDE_NOT_FOUND");
  }

  // Step 2:
  // Check state transition

  const allowed = canTransition(
    ride.status as RideStatus,

    nextStatus,
  );

  if (!allowed) {
    throw new Error("INVALID_TRANSITION");
  }

  // Step 3:
  // Update ride + create history together

  const updatedRide = await prisma.$transaction(async (tx) => {
    const updated = await tx.rideRequest.update({
      where: {
        id: rideId,
      },

      data: {
        status: nextStatus,
      },
    });

    await tx.rideStatusHistory.create({
      data: {
        rideRequestId: rideId,

        status: nextStatus,
      },
    });

    return updated;
  });

  return updatedRide;
}

export async function cancelRide(rideId: string) {
  return updateRideStatus(rideId, "CANCELLED");
}
