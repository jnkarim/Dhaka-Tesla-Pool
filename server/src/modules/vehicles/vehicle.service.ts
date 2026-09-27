import prisma from "../../lib/prisma.js";

export async function updateVehicleStatus(driverId: string, isOnline: boolean) {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      driverId,
    },
  });

  if (!vehicle) {
    throw new Error("VEHICLE_NOT_FOUND");
  }

  const updatedVehicle = await prisma.vehicle.update({
    where: {
      id: vehicle.id,
    },

    data: {
      isOnline,
    },
  });

  return updatedVehicle;
}
