export type DhakaZone = "BANANI" | "MOHAKHALI" | "GULSHAN_1";

const BASE_FARE = 5000; // 50 BDT
const POOL_DISCOUNT = 2000; // 20 BDT

const distanceChargeMap: Record<
  DhakaZone,
  Partial<Record<DhakaZone, number>>
> = {
  BANANI: {
    MOHAKHALI: 7000, // 70 BDT
    GULSHAN_1: 5000, // 50 BDT
  },

  MOHAKHALI: {
    BANANI: 7000,
  },

  GULSHAN_1: {
    BANANI: 5000,
  },
};

export function calculateFare(
  pickup: DhakaZone,
  destination: DhakaZone,
  isPooled = false,
) {
  const distanceCharge = distanceChargeMap[pickup]?.[destination] ?? 5000;

  const poolDiscount = isPooled ? POOL_DISCOUNT : 0;

  return BASE_FARE + distanceCharge - poolDiscount;
}
