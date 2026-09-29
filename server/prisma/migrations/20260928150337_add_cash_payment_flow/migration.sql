-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "Ride" (
    "id" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "driverId" TEXT,
    "pickup" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "fare" INTEGER NOT NULL,
    "status" "RideStatus" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "passengerPaid" BOOLEAN NOT NULL DEFAULT false,
    "driverReceived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ride_pkey" PRIMARY KEY ("id")
);
