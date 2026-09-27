export type DhakaZone = "BANANI" | "MOHAKHALI" | "GULSHAN_1";

const distanceChargeMap: Record<
  DhakaZone,
  Partial<Record<DhakaZone, number>>
> = {
  BANANI: {
    MOHAKHALI: 7000,
    GULSHAN_1: 5000,
  },

  MOHAKHALI: {
    BANANI: 7000,
  },

  GULSHAN_1: {
    BANANI: 5000,
  },
};

export function calculateFare(pickup: DhakaZone, destination: DhakaZone) {
  const baseFare = 5000;

  const distanceCharge = distanceChargeMap[pickup]?.[destination] ?? 5000;

  return baseFare + distanceCharge;
}
