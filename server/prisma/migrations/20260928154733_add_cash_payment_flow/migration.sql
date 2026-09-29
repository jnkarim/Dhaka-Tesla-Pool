/*
  Warnings:

  - You are about to drop the `Ride` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "RideRequest" ADD COLUMN     "driverReceived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passengerPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "Ride";
