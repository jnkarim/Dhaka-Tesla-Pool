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
        some: {
          rideRequest: {
            status: "REQUESTED",
          },
        },
      },
    },

    include: {
      members: {
        where: {
          rideRequest: {
            status: "REQUESTED",
          },
        },

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

  return pools
    .map((pool) => {
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
    })
    .filter(
      (pool) =>
        pool.occupiedSeats > 0 && pool.occupiedSeats <= vehicle.capacity,
    );
}

// Get driver's current active pool

export async function getActivePool(driverId: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      driverId,
    },

    select: {
      id: true,
      name: true,
      plateNumber: true,
      capacity: true,
      isOnline: true,
    },
  });

  if (!vehicle) {
    throw new Error("VEHICLE_NOT_FOUND");
  }

  const pool = await prisma.pool.findFirst({
    where: {
      vehicleId: vehicle.id,

      OR: [
        {
          status: {
            in: ["ACCEPTED", "DRIVER_ARRIVED", "STARTED"],
          },
        },

        {
          status: "COMPLETED",

          members: {
            some: {
              rideRequest: {
                driverReceived: false,
              },
            },
          },
        },
      ],
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
              paymentStatus: true,
              passengerPaid: true,
              driverReceived: true,
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
      updatedAt: "desc",
    },
  });

  if (!pool) {
    return null;
  }

  const occupiedSeats = pool.members.reduce(
    (total, member) => total + member.seatsReserved,
    0,
  );

  return {
    id: pool.id,
    status: pool.status,
    createdAt: pool.createdAt,
    updatedAt: pool.updatedAt,

    vehicle,

    capacity: vehicle.capacity,
    occupiedSeats,
    availableSeats: vehicle.capacity - occupiedSeats,

    members: pool.members.map((member) => ({
      id: member.id,
      seatsReserved: member.seatsReserved,
      finalFarePoisha: member.finalFarePoisha,
      joinedAt: member.joinedAt,
      ride: member.rideRequest,
    })),
  };
}

// Accept an available pool

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

    if (!vehicle.isOnline) {
      throw new Error("DRIVER_OFFLINE");
    }

    const activePool = await tx.pool.findFirst({
      where: {
        vehicleId: vehicle.id,

        status: {
          in: ["ACCEPTED", "DRIVER_ARRIVED", "STARTED"],
        },
      },
    });

    if (activePool) {
      throw new Error("DRIVER_ALREADY_HAS_ACTIVE_POOL");
    }

    const pool = await tx.pool.findFirst({
      where: {
        id: poolId,
        status: "OPEN",
        vehicleId: null,
      },

      include: {
        members: {
          where: {
            rideRequest: {
              status: "REQUESTED",
            },
          },

          include: {
            rideRequest: true,
          },
        },
      },
    });

    if (!pool) {
      throw new Error("POOL_NOT_AVAILABLE");
    }

    if (pool.members.length === 0) {
      throw new Error("POOL_EMPTY");
    }

    const occupiedSeats = pool.members.reduce(
      (total, member) => total + member.seatsReserved,
      0,
    );

    if (occupiedSeats > vehicle.capacity) {
      throw new Error("POOL_CAPACITY_EXCEEDED");
    }

    const claimedPool = await tx.pool.updateMany({
      where: {
        id: poolId,
        status: "OPEN",
        vehicleId: null,
      },

      data: {
        vehicleId: vehicle.id,

        status: "ACCEPTED",
      },
    });

    if (claimedPool.count !== 1) {
      throw new Error("POOL_NOT_AVAILABLE");
    }

    const rideIds = pool.members.map((member) => member.rideRequestId);

    await tx.rideRequest.updateMany({
      where: {
        id: {
          in: rideIds,
        },

        status: "REQUESTED",
      },

      data: {
        status: "MATCHED",
      },
    });

    await tx.rideStatusHistory.createMany({
      data: rideIds.map((rideRequestId) => ({
        rideRequestId,

        status: "MATCHED",
      })),
    });

    return tx.pool.findUnique({
      where: {
        id: poolId,
      },

      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            plateNumber: true,
            capacity: true,

            driver: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

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
    });
  });
}

export async function updateActivePoolStatus(
  driverId: string,
  nextStatus: "DRIVER_ARRIVED" | "STARTED" | "COMPLETED",
) {
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
        vehicleId: vehicle.id,

        status: {
          in: ["ACCEPTED", "DRIVER_ARRIVED", "STARTED"],
        },
      },

      include: {
        members: true,
      },
    });

    if (!pool) {
      throw new Error("ACTIVE_POOL_NOT_FOUND");
    }

    const allowedNextStatus = {
      ACCEPTED: "DRIVER_ARRIVED",
      DRIVER_ARRIVED: "STARTED",
      STARTED: "COMPLETED",
    } as const;

    const expected =
      allowedNextStatus[pool.status as keyof typeof allowedNextStatus];

    if (expected !== nextStatus) {
      throw new Error("INVALID_POOL_TRANSITION");
    }

    const rideIds = pool.members.map((member) => member.rideRequestId);

    await tx.pool.update({
      where: {
        id: pool.id,
      },

      data: {
        status: nextStatus,
      },
    });

    await tx.rideRequest.updateMany({
      where: {
        id: {
          in: rideIds,
        },
      },

      data: {
        status: nextStatus,
      },
    });

    await tx.rideStatusHistory.createMany({
      data: rideIds.map((rideRequestId) => ({
        rideRequestId,
        status: nextStatus,
      })),
    });

    return tx.pool.findUnique({
      where: {
        id: pool.id,
      },

      include: {
        vehicle: true,

        members: {
          include: {
            rideRequest: {
              include: {
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
    });
  });
}

// Get driver's completed and cancelled ride history

export async function getDriverHistory(driverId: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      driverId,
    },

    select: {
      id: true,
      name: true,
      plateNumber: true,
      capacity: true,
    },
  });

  if (!vehicle) {
    throw new Error("VEHICLE_NOT_FOUND");
  }

  const pools = await prisma.pool.findMany({
    where: {
      vehicleId: vehicle.id,
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
              paymentStatus: true,
              passengerPaid: true,
              driverReceived: true,
              createdAt: true,
              updatedAt: true,

              passenger: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },

    orderBy: {
      updatedAt: "desc",
    },
  });

  return pools.flatMap((pool) =>
    pool.members
      .filter(
        (member) =>
          member.rideRequest.status === "COMPLETED" ||
          member.rideRequest.status === "CANCELLED",
      )
      .map((member) => ({
        id: member.rideRequest.id,

        poolId: pool.id,
        poolStatus: pool.status,

        pickup: member.rideRequest.pickup,
        destination: member.rideRequest.destination,

        seats: member.rideRequest.seats,

        estimatedFarePoisha: member.rideRequest.estimatedFarePoisha,
        finalFarePoisha:
          member.finalFarePoisha ?? member.rideRequest.estimatedFarePoisha,

        status: member.rideRequest.status,

        paymentStatus: member.rideRequest.paymentStatus,
        passengerPaid: member.rideRequest.passengerPaid,
        driverReceived: member.rideRequest.driverReceived,

        passenger: member.rideRequest.passenger,

        createdAt: member.rideRequest.createdAt,
        updatedAt: member.rideRequest.updatedAt,
      })),
  );
}
