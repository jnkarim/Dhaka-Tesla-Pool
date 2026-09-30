export type DhakaZone =
  | "KHILGAON"
  | "BANANI"
  | "GULSHAN_1"
  | "GULSHAN_2"
  | "MOHAKHALI"
  | "FARMGATE"
  | "DHANMONDI"
  | "MIRPUR"
  | "UTTARA"
  | "BASHUNDHARA";

const BASE_FARE = 5000; // ৳50
const POOL_DISCOUNT = 2000; // ৳20
const DEFAULT_DISTANCE_CHARGE = 5000; // ৳50

const distanceChargeMap: Partial<
  Record<DhakaZone, Partial<Record<DhakaZone, number>>>
> = {
  BANANI: {
    MOHAKHALI: 7000, // ৳70
    GULSHAN_1: 5000, // ৳50
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
  const distanceCharge =
    distanceChargeMap[pickup]?.[destination] ?? DEFAULT_DISTANCE_CHARGE;

  const total = BASE_FARE + distanceCharge;

  if (isPooled) {
    return total - POOL_DISCOUNT;
  }

  return total;
}
