import prisma from "../../lib/prisma.js";

// Get available open pools for an online driver

export async function getAvailablePools(driverId: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      driverId,
    },

    select: {
      id: true,
      capacity: true,
      isOnline: true,
    },
  });

  if (!vehicle) {
    throw new Error("VEHICLE_NOT_FOUND");
  }

  if (!vehicle.isOnline) {
    throw new Error("DRIVER_OFFLINE");
  }

  const pools = await prisma.pool.findMany({
    where: {
      status: "OPEN",
      vehicleId: null,

      members: {
        some: {},
      },
    },

    include: {
      members: {
        include: {
          rideRequest: {
            select: {
              id: true,
              pickup: true,
              destination: true,
              seats: true,
              estimatedFarePoisha: true,
              status: true,
              createdAt: true,

              passenger: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "asc",
    },
  });

  return pools.map((pool) => {
    const occupiedSeats = pool.members.reduce(
      (total, member) => total + member.seatsReserved,
      0,
    );

    return {
      id: pool.id,

      status: pool.status,

      createdAt: pool.createdAt,

      capacity: vehicle.capacity,

      occupiedSeats,

      availableSeats: vehicle.capacity - occupiedSeats,

      members: pool.members.map((member) => ({
        id: member.id,

        seatsReserved: member.seatsReserved,

        joinedAt: member.joinedAt,

        ride: member.rideRequest,
      })),
    };
  });
}

// Accept pool
// This will be completed in the next logical feature.

export async function acceptPool(driverId: string, poolId: string) {
  return prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findUnique({
      where: {
        driverId,
      },
    });

    if (!vehicle) {
      throw new Error("VEHICLE_NOT_FOUND");
    }

    const pool = await tx.pool.findFirst({
      where: {
        id: poolId,
        status: "OPEN",
        vehicleId: null,
      },
    });

    if (!pool) {
      throw new Error("POOL_NOT_AVAILABLE");
    }

    return tx.pool.update({
      where: {
        id: poolId,
      },

      data: {
        vehicleId: vehicle.id,

        status: "ACCEPTED",
      },
    });
  });
}
