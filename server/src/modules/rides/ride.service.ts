import prisma from "../../lib/prisma.js";

import {
  calculateFare,
  type DhakaZone,
} from "../../modules/fares/fare.service.js";

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
