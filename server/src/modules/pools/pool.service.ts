import prisma from "../../lib/prisma.js";

import { isCompatibleRoute } from "./matching.js";

export async function findCompatiblePool(pickup: string, destination: string) {
  const pools = await prisma.pool.findMany({
    where: {
      status: "OPEN",
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

  for (const pool of pools) {
    const existingRide = pool.members[0]?.rideRequest;

    if (!existingRide) {
      continue;
    }

    const compatible = isCompatibleRoute(pickup, destination);

    if (compatible) {
      return pool;
    }
  }

  return null;
}

export async function createPool(vehicleId: string) {
  const pool = await prisma.pool.create({
    data: {
      vehicleId,

      status: "OPEN",
    },
  });

  return pool;
}

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

  const occupiedSeats = pool.members.reduce(
    (total, member) => {
      return total + member.seatsReserved;
    },

    0,
  );

  return occupiedSeats + requestedSeats <= pool.vehicle.capacity;
}

export async function addPoolMember(
  poolId: string,
  rideRequestId: string,
  seats: number,
) {
  const member = await prisma.poolMember.create({
    data: {
      poolId,

      rideRequestId,

      seatsReserved: seats,
    },
  });

  return member;
}

export async function joinPoolSafely(
  poolId: string,
  rideRequestId: string,
  seats: number,
) {
  return await prisma.$transaction(async (tx) => {
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

    const occupiedSeats = pool.members.reduce(
      (total, member) => {
        return total + member.seatsReserved;
      },

      0,
    );

    if (occupiedSeats + seats > pool.vehicle.capacity) {
      throw new Error("NO_AVAILABLE_SEATS");
    }

    const member = await tx.poolMember.create({
      data: {
        poolId,

        rideRequestId,

        seatsReserved: seats,
      },
    });

    return member;
  });
}
