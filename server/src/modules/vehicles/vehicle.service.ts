import prisma from "../../lib/prisma.js";

export async function getDriverVehicle(driverId: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      driverId,
    },
  });

  if (!vehicle) {
    throw new Error("VEHICLE_NOT_FOUND");
  }

  return vehicle;
}

export async function updateVehicleStatus(driverId: string, isOnline: boolean) {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      driverId,
    },
  });

  if (!vehicle) {
    throw new Error("VEHICLE_NOT_FOUND");
  }

  return prisma.vehicle.update({
    where: {
      id: vehicle.id,
    },

    data: {
      isOnline,
    },
  });
}
