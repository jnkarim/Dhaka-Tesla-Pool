import prisma from "../../lib/prisma.js";

export async function getAvailablePools(driverId: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      driverId,
    },
  });

  if (!vehicle) {
    throw new Error("VEHICLE_NOT_FOUND");
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
  });

  return pools;
}

export async function acceptPool(
  driverId: string,

  poolId: string,
) {
  return await prisma.$transaction(async (tx) => {
    // Find driver's vehicle

    const vehicle = await tx.vehicle.findUnique({
      where: {
        driverId,
      },
    });

    if (!vehicle) {
      throw new Error("VEHICLE_NOT_FOUND");
    }

    // Check pool is still available

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

    // Assign vehicle and accept pool

    const updatedPool = await tx.pool.update({
      where: {
        id: poolId,
      },

      data: {
        vehicleId: vehicle.id,

        status: "ACCEPTED",
      },
    });

    return updatedPool;
  });
}
