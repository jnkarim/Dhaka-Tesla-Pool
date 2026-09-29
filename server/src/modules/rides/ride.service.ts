import prisma from "../../lib/prisma.js";

import { calculateFare, type DhakaZone } from "../fares/fare.service.js";

import { isCompatibleRoute } from "../pools/matching.js";

import { canTransition, type RideStatus } from "./ride.state.js";

const MAX_POOL_CAPACITY = 3;

const MAX_TRANSACTION_RETRIES = 3;

const ACTIVE_RIDE_STATUSES: RideStatus[] = [
  "REQUESTED",
  "MATCHED",
  "DRIVER_ARRIVED",
  "STARTED",
];

// Create ride request and assign it to an open pool

export async function createRide(
  passengerId: string,
  pickup: DhakaZone,
  destination: DhakaZone,
  seats: number,
) {
  if (pickup === destination) {
    throw new Error("PICKUP_DESTINATION_SAME");
  }

  if (!Number.isInteger(seats) || seats < 1 || seats > MAX_POOL_CAPACITY) {
    throw new Error("INVALID_SEAT_COUNT");
  }

  const fare = calculateFare(pickup, destination);

  for (let attempt = 1; attempt <= MAX_TRANSACTION_RETRIES; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const existingRide = await tx.rideRequest.findFirst({
            where: {
              passengerId,

              status: {
                in: ACTIVE_RIDE_STATUSES,
              },
            },
          });

          if (existingRide) {
            throw new Error("ACTIVE_RIDE_EXISTS");
          }

          const ride = await tx.rideRequest.create({
            data: {
              passengerId,
              pickup,
              destination,
              seats,

              estimatedFarePoisha: fare,

              status: "REQUESTED",

              paymentStatus: "PENDING",

              passengerPaid: false,

              driverReceived: false,
            },
          });

          await tx.rideStatusHistory.create({
            data: {
              rideRequestId: ride.id,

              status: "REQUESTED",
            },
          });

          let selectedPoolId: string | null = null;

          const canShare = isCompatibleRoute(pickup, destination);

          if (canShare) {
            const openPools = await tx.pool.findMany({
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

            for (const pool of openPools) {
              const occupiedSeats = pool.members.reduce(
                (total, member) => total + member.seatsReserved,
                0,
              );

              const hasCapacity = occupiedSeats + seats <= MAX_POOL_CAPACITY;

              if (!hasCapacity) {
                continue;
              }

              const routesCompatible = pool.members.every((member) =>
                isCompatibleRoute(
                  member.rideRequest.pickup,
                  member.rideRequest.destination,
                ),
              );

              if (routesCompatible) {
                selectedPoolId = pool.id;

                break;
              }
            }
          }

          if (!selectedPoolId) {
            const pool = await tx.pool.create({
              data: {
                status: "OPEN",
                vehicleId: null,
              },
            });

            selectedPoolId = pool.id;
          }

          await tx.poolMember.create({
            data: {
              poolId: selectedPoolId,

              rideRequestId: ride.id,

              seatsReserved: seats,
            },
          });

          return ride;
        },
        {
          isolationLevel: "Serializable",
        },
      );
    } catch (error) {
      const prismaError = error as {
        code?: string;
      };

      if (prismaError.code === "P2034" && attempt < MAX_TRANSACTION_RETRIES) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("RIDE_CREATION_FAILED");
}

// Get current passenger ride

export async function getCurrentRide(passengerId: string) {
  return prisma.rideRequest.findFirst({
    where: {
      passengerId,

      OR: [
        {
          status: {
            in: ACTIVE_RIDE_STATUSES,
          },
        },

        {
          status: "COMPLETED",
          paymentStatus: "PENDING",
        },
      ],
    },

    include: {
      poolMember: {
        include: {
          pool: {
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
            },
          },
        },
      },

      statusHistory: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

// Passenger ride activity/history

export async function getPassengerRideHistory(passengerId: string) {
  return prisma.rideRequest.findMany({
    where: {
      passengerId,

      status: {
        in: ["COMPLETED", "CANCELLED"],
      },
    },

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

      poolMember: {
        select: {
          finalFarePoisha: true,

          pool: {
            select: {
              vehicle: {
                select: {
                  name: true,

                  plateNumber: true,

                  driver: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

// Update ride status

export async function updateRideStatus(rideId: string, nextStatus: RideStatus) {
  const ride = await prisma.rideRequest.findUnique({
    where: {
      id: rideId,
    },
  });

  if (!ride) {
    throw new Error("RIDE_NOT_FOUND");
  }

  const allowed = canTransition(ride.status as RideStatus, nextStatus);

  if (!allowed) {
    throw new Error("INVALID_TRANSITION");
  }

  return prisma.$transaction(async (tx) => {
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
}

// Cancel ride

export async function cancelRide(rideId: string, passengerId: string) {
  const ride = await prisma.rideRequest.findUnique({
    where: {
      id: rideId,
    },

    include: {
      poolMember: true,
    },
  });

  if (!ride) {
    throw new Error("RIDE_NOT_FOUND");
  }

  if (ride.passengerId !== passengerId) {
    throw new Error("UNAUTHORIZED");
  }

  if (ride.status !== "REQUESTED") {
    throw new Error("RIDE_CANNOT_BE_CANCELLED");
  }

  return prisma.$transaction(async (tx) => {
    const updatedRide = await tx.rideRequest.update({
      where: {
        id: rideId,
      },

      data: {
        status: "CANCELLED",
      },
    });

    await tx.rideStatusHistory.create({
      data: {
        rideRequestId: rideId,

        status: "CANCELLED",
      },
    });

    if (ride.poolMember) {
      const poolId = ride.poolMember.poolId;

      await tx.poolMember.delete({
        where: {
          id: ride.poolMember.id,
        },
      });

      const remainingMembers = await tx.poolMember.count({
        where: {
          poolId,
        },
      });

      if (remainingMembers === 0) {
        await tx.pool.deleteMany({
          where: {
            id: poolId,

            status: "OPEN",

            vehicleId: null,
          },
        });
      }
    }

    return updatedRide;
  });
}

// Passenger confirms cash payment

export async function confirmPassengerPayment(
  rideId: string,
  passengerId: string,
) {
  const ride = await prisma.rideRequest.findUnique({
    where: {
      id: rideId,
    },
  });

  if (!ride) {
    throw new Error("RIDE_NOT_FOUND");
  }

  if (ride.passengerId !== passengerId) {
    throw new Error("UNAUTHORIZED");
  }

  if (ride.status !== "COMPLETED") {
    throw new Error("RIDE_NOT_COMPLETED");
  }

  if (ride.passengerPaid) {
    return ride;
  }

  return prisma.rideRequest.update({
    where: {
      id: rideId,
    },

    data: {
      passengerPaid: true,

      paymentStatus: ride.driverReceived ? "COMPLETED" : "PENDING",
    },
  });
}

// Driver confirms cash received

export async function confirmDriverPayment(rideId: string, driverId: string) {
  const ride = await prisma.rideRequest.findUnique({
    where: {
      id: rideId,
    },

    include: {
      poolMember: {
        include: {
          pool: {
            include: {
              vehicle: true,
            },
          },
        },
      },
    },
  });

  if (!ride) {
    throw new Error("RIDE_NOT_FOUND");
  }

  const assignedDriverId = ride.poolMember?.pool.vehicle?.driverId;

  if (!assignedDriverId || assignedDriverId !== driverId) {
    throw new Error("UNAUTHORIZED");
  }

  if (ride.status !== "COMPLETED") {
    throw new Error("RIDE_NOT_COMPLETED");
  }

  if (ride.driverReceived) {
    return ride;
  }

  return prisma.rideRequest.update({
    where: {
      id: rideId,
    },

    data: {
      driverReceived: true,

      paymentStatus: ride.passengerPaid ? "COMPLETED" : "PENDING",
    },
  });
}
