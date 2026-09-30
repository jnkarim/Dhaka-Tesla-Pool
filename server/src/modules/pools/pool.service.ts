import prisma from "../../lib/prisma.js";

import { isCompatibleRoute } from "./matching.js";
import { calculateFare, type DhakaZone } from "../fares/fare.service.js";

const TESLA_CAPACITY = 3;

// Find an existing compatible open pool
export async function findCompatiblePool(pickup: string, destination: string) {
  // New request itself must be a valid route
  if (!isCompatibleRoute(pickup, destination)) {
    return null;
  }

  const pools = await prisma.pool.findMany({
    where: {
      status: "OPEN",
      vehicleId: null,
    },

    include: {
      members: {
        include: {
          rideRequest: true,
        },
      },
    },

    orderBy: {
      createdAt: "asc",
    },
  });

  for (const pool of pools) {
    const existingRide = pool.members[0]?.rideRequest;

    if (!existingRide) {
      continue;
    }

    // MVP matching rule:
    // passengers must start from the same pickup zone
    if (existingRide.pickup !== pickup) {
      continue;
    }

    const existingRouteCompatible = isCompatibleRoute(
      existingRide.pickup,
      existingRide.destination,
    );

    const newRouteCompatible = isCompatibleRoute(pickup, destination);

    if (existingRouteCompatible && newRouteCompatible) {
      return pool;
    }
  }

  return null;
}

// Create an unassigned open pool
export async function createPool() {
  return prisma.pool.create({
    data: {
      vehicleId: null,
      status: "OPEN",
    },
  });
}

// Check pool capacity
export async function hasAvailableSeats(
  poolId: string,
  requestedSeats: number,
) {
  const pool = await prisma.pool.findUnique({
    where: {
      id: poolId,
    },

    include: {
      members: true,
      vehicle: true,
    },
  });

  if (!pool) {
    return false;
  }

  if (pool.status !== "OPEN") {
    return false;
  }

  const occupiedSeats = pool.members.reduce(
    (total, member) => total + member.seatsReserved,
    0,
  );

  const capacity = pool.vehicle?.capacity ?? TESLA_CAPACITY;

  return occupiedSeats + requestedSeats <= capacity;
}

// Add first ride request to a newly created pool
export async function addPoolMember(
  poolId: string,
  rideRequestId: string,
  seats: number,
) {
  return prisma.poolMember.create({
    data: {
      poolId,
      rideRequestId,
      seatsReserved: seats,

      // No final pooled fare yet.
      // Passenger is currently alone.
      finalFarePoisha: null,
    },
  });
}

// Join an existing open pool safely
export async function joinPoolSafely(
  poolId: string,
  rideRequestId: string,
  seats: number,
) {
  return prisma.$transaction(async (tx) => {
    const pool = await tx.pool.findUnique({
      where: {
        id: poolId,
      },

      include: {
        members: {
          include: {
            rideRequest: true,
          },
        },

        vehicle: true,
      },
    });

    if (!pool) {
      throw new Error("POOL_NOT_FOUND");
    }

    if (pool.status !== "OPEN") {
      throw new Error("POOL_NOT_AVAILABLE");
    }

    const occupiedSeats = pool.members.reduce(
      (total, member) => total + member.seatsReserved,
      0,
    );

    const capacity = pool.vehicle?.capacity ?? TESLA_CAPACITY;

    if (occupiedSeats + seats > capacity) {
      throw new Error("NO_AVAILABLE_SEATS");
    }

    const rideRequest = await tx.rideRequest.findUnique({
      where: {
        id: rideRequestId,
      },
    });

    if (!rideRequest) {
      throw new Error("RIDE_REQUEST_NOT_FOUND");
    }

    // If somebody is already in the pool,
    // adding this passenger makes it a real shared pool.
    const willBePooled = pool.members.length > 0;

    const newFare = calculateFare(
      rideRequest.pickup as DhakaZone,
      rideRequest.destination as DhakaZone,
      willBePooled,
    );

    const member = await tx.poolMember.create({
      data: {
        poolId,
        rideRequestId,
        seatsReserved: seats,
        finalFarePoisha: willBePooled ? newFare : null,
      },
    });

    // Once a second passenger joins,
    // apply pool discount to everyone already inside.
    if (willBePooled) {
      for (const existingMember of pool.members) {
        const ride = existingMember.rideRequest;

        const pooledFare = calculateFare(
          ride.pickup as DhakaZone,
          ride.destination as DhakaZone,
          true,
        );

        await tx.rideRequest.update({
          where: {
            id: ride.id,
          },

          data: {
            estimatedFarePoisha: pooledFare,
          },
        });

        await tx.poolMember.update({
          where: {
            id: existingMember.id,
          },

          data: {
            finalFarePoisha: pooledFare,
          },
        });
      }
    }

    const updatedRideRequest = await tx.rideRequest.update({
      where: {
        id: rideRequestId,
      },

      data: {
        estimatedFarePoisha: newFare,
      },
    });

    return {
      member,
      rideRequest: updatedRideRequest,
    };
  });
}
