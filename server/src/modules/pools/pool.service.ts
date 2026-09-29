import prisma from "../../lib/prisma.js";

import { isCompatibleRoute } from "./matching.js";

const TESLA_CAPACITY = 3;

// Find an existing compatible open pool

export async function findCompatiblePool(pickup: string, destination: string) {
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

    const existingRouteCompatible = isCompatibleRoute(
      existingRide.pickup,
      existingRide.destination,
    );

    if (existingRouteCompatible) {
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

// Add ride request to pool

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
    },
  });
}

// Join an open pool with capacity validation

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
        members: true,
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

    return tx.poolMember.create({
      data: {
        poolId,
        rideRequestId,
        seatsReserved: seats,
      },
    });
  });
}
