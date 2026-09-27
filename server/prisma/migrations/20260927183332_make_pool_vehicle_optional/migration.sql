-- DropForeignKey
ALTER TABLE "Pool" DROP CONSTRAINT "Pool_vehicleId_fkey";

-- AlterTable
ALTER TABLE "Pool" ALTER COLUMN "vehicleId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Pool" ADD CONSTRAINT "Pool_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
