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

const DHAKA_ZONES: DhakaZone[] = [
  "KHILGAON",
  "BANANI",
  "GULSHAN_1",
  "GULSHAN_2",
  "MOHAKHALI",
  "FARMGATE",
  "DHANMONDI",
  "MIRPUR",
  "UTTARA",
  "BASHUNDHARA",
];

export function isCompatibleRoute(
  pickup: string,
  destination: string,
): boolean {
  const validPickup = DHAKA_ZONES.includes(pickup as DhakaZone);

  const validDestination = DHAKA_ZONES.includes(destination as DhakaZone);

  if (!validPickup || !validDestination) {
    return false;
  }

  if (pickup === destination) {
    return false;
  }

  return true;
}
