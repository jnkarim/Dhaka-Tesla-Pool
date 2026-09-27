export type RideStatus =
  | "REQUESTED"
  | "MATCHED"
  | "DRIVER_ARRIVED"
  | "STARTED"
  | "COMPLETED"
  | "CANCELLED";


export const rideTransitions: Record<
  RideStatus,
  RideStatus[]
> = {

  REQUESTED: [
    "MATCHED",
    "CANCELLED",
  ],


  MATCHED: [
    "DRIVER_ARRIVED",
    "CANCELLED",
  ],


  DRIVER_ARRIVED: [
    "STARTED",
  ],


  STARTED: [
    "COMPLETED",
  ],


  COMPLETED: [],


  CANCELLED: [],

};



export function canTransition(
  current: RideStatus,
  next: RideStatus
): boolean {

  return rideTransitions[current].includes(next);

}