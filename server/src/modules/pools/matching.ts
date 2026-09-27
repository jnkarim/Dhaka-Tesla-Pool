export function isCompatibleRoute(
  pickup: string,
  destination: string,
): boolean {
  if (pickup !== "BANANI") {
    return false;
  }

  return destination === "MOHAKHALI" || destination === "GULSHAN_1";
}
