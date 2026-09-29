import prisma from "../../lib/prisma.js";

export async function getAllTransactions() {
  const rides = await prisma.rideRequest.findMany({
    include: {
      passenger: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      poolMember: {
        select: {
          poolId: true,
          finalFarePoisha: true,

          pool: {
            select: {
              vehicle: {
                select: {
                  id: true,
                  name: true,
                  plateNumber: true,

                  driver: {
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
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return rides.map((ride) => {
    const vehicle = ride.poolMember?.pool.vehicle ?? null;

    return {
      id: ride.id,

      poolId: ride.poolMember?.poolId ?? null,

      pickup: ride.pickup,
      destination: ride.destination,

      seats: ride.seats,

      estimatedFarePoisha: ride.estimatedFarePoisha,

      farePoisha: ride.poolMember?.finalFarePoisha ?? ride.estimatedFarePoisha,

      status: ride.status,

      paymentStatus: ride.paymentStatus,

      passengerPaid: ride.passengerPaid,
      driverReceived: ride.driverReceived,

      passenger: ride.passenger,

      driver: vehicle?.driver ?? null,

      vehicle: vehicle
        ? {
            id: vehicle.id,
            name: vehicle.name,
            plateNumber: vehicle.plateNumber,
          }
        : null,

      createdAt: ride.createdAt,
      updatedAt: ride.updatedAt,
    };
  });
}
