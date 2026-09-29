import prisma from "../../lib/prisma.js";

import { calculateFare, type DhakaZone } from "../fares/fare.service.js";

import { canTransition, type RideStatus } from "./ride.state.js";

// Create ride request

export async function createRide(
  passengerId: string,
  pickup: DhakaZone,
  destination: DhakaZone,
  seats: number,
) {
  if (pickup === destination) {
    throw new Error("PICKUP_DESTINATION_SAME");
  }

  if (!Number.isInteger(seats) || seats < 1 || seats > 3) {
    throw new Error("INVALID_SEAT_COUNT");
  }

  const existingRide = await prisma.rideRequest.findFirst({
    where: {
      passengerId,

      OR: [
        {
          status: {
            notIn: ["COMPLETED", "CANCELLED"],
          },
        },

        {
          status: "COMPLETED",
          paymentStatus: "PENDING",
        },
      ],
    },
  });

  if (existingRide) {
    throw new Error("ACTIVE_RIDE_EXISTS");
  }

  const fare = calculateFare(pickup, destination);

  return prisma.$transaction(async (tx) => {
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

    return ride;
  });
}

// Get current passenger ride

export async function getCurrentRide(passengerId: string) {
  return prisma.rideRequest.findFirst({
    where: {
      passengerId,

      OR: [
        {
          status: {
            notIn: ["COMPLETED", "CANCELLED"],
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

export async function cancelRide(rideId: string) {
  return updateRideStatus(rideId, "CANCELLED");
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
