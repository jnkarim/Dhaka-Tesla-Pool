"use client";

import {
  Banknote,
  Car,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  Power,
  Route,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";

type Vehicle = {
  id: string;
  name: string;
  plateNumber: string;
  capacity: number;
  isOnline: boolean;
};

type DhakaZone =
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

type PoolStatus =
  | "OPEN"
  | "ACCEPTED"
  | "DRIVER_ARRIVED"
  | "STARTED"
  | "COMPLETED";

type PaymentStatus = "PENDING" | "COMPLETED";

type PoolRide = {
  id: string;
  pickup: DhakaZone;
  destination: DhakaZone;
  seats: number;
  estimatedFarePoisha: number;
  status: string;
  paymentStatus?: PaymentStatus;
  passengerPaid?: boolean;
  driverReceived?: boolean;
  createdAt?: string;

  passenger: {
    id: string;
    name: string;
  };
};

type PoolMember = {
  id: string;
  seatsReserved: number;
  joinedAt?: string;
  finalFarePoisha?: number | null;
  ride: PoolRide;
};

type AvailablePool = {
  id: string;
  status: "OPEN";
  createdAt: string;
  capacity: number;
  occupiedSeats: number;
  availableSeats: number;
  members: PoolMember[];
};

type ActivePool = {
  id: string;

  status: "ACCEPTED" | "DRIVER_ARRIVED" | "STARTED" | "COMPLETED";

  capacity: number;
  occupiedSeats: number;
  availableSeats: number;

  vehicle: Vehicle;

  members: PoolMember[];
};

type VehicleResponse = {
  success: boolean;
  data: Vehicle;
};

type AvailablePoolsResponse = {
  success: boolean;
  data: AvailablePool[];
};

type ActivePoolResponse = {
  success: boolean;
  data: ActivePool | null;
};

type DriverPaymentResponse = {
  success: boolean;

  data: {
    id: string;
    passengerPaid: boolean;
    driverReceived: boolean;
    paymentStatus: PaymentStatus;
  };
};

const zoneLabels: Record<DhakaZone, string> = {
  KHILGAON: "Khilgaon",
  BANANI: "Banani",
  GULSHAN_1: "Gulshan 1",
  GULSHAN_2: "Gulshan 2",
  MOHAKHALI: "Mohakhali",
  FARMGATE: "Farmgate",
  DHANMONDI: "Dhanmondi",
  MIRPUR: "Mirpur",
  UTTARA: "Uttara",
  BASHUNDHARA: "Bashundhara",
};

function formatFare(poisha: number) {
  return `৳${(poisha / 100).toFixed(0)}`;
}

function formatPoolStatus(status: PoolStatus) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function DriverPage() {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const [pools, setPools] = useState<AvailablePool[]>([]);

  const [activePool, setActivePool] = useState<ActivePool | null>(null);

  const [loading, setLoading] = useState(true);

  const [poolsLoading, setPoolsLoading] = useState(false);

  const [statusLoading, setStatusLoading] = useState(false);

  const [acceptingPoolId, setAcceptingPoolId] = useState<string | null>(null);

  const [lifecycleLoading, setLifecycleLoading] = useState(false);

  const [cashLoadingRideId, setCashLoadingRideId] = useState<string | null>(
    null,
  );

  const [error, setError] = useState("");

  const [poolError, setPoolError] = useState("");

  const [poolMessage, setPoolMessage] = useState("");

  useEffect(() => {
    async function loadDriver() {
      try {
        const [vehicleResponse, activePoolResponse] = await Promise.all([
          api<VehicleResponse>("/vehicles/me"),

          api<ActivePoolResponse>("/drivers/active-pool"),
        ]);

        setVehicle(vehicleResponse.data);

        setActivePool(activePoolResponse.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not load driver workspace.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDriver();
  }, []);

  useEffect(() => {
    if (!vehicle?.isOnline || activePool) {
      setPools([]);
      return;
    }

    let cancelled = false;

    async function loadPools(showLoading = false) {
      try {
        if (showLoading) {
          setPoolsLoading(true);
        }

        const response = await api<AvailablePoolsResponse>("/drivers/pools");

        if (cancelled) {
          return;
        }

        setPools(response.data);

        setPoolError("");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setPoolError(
          error instanceof Error
            ? error.message
            : "Could not load available pools.",
        );
      } finally {
        if (showLoading && !cancelled) {
          setPoolsLoading(false);
        }
      }
    }

    void loadPools(true);

    const interval = window.setInterval(() => {
      void loadPools(false);
    }, 3000);

    return () => {
      cancelled = true;

      window.clearInterval(interval);
    };
  }, [vehicle?.isOnline, activePool]);

  async function refreshActivePool() {
    const response = await api<ActivePoolResponse>("/drivers/active-pool");

    setActivePool(response.data);

    return response.data;
  }

  async function toggleOnlineStatus() {
    if (!vehicle || statusLoading || activePool) {
      return;
    }

    try {
      setStatusLoading(true);

      setError("");

      const response = await api<VehicleResponse>("/vehicles/online-status", {
        method: "PATCH",

        body: JSON.stringify({
          isOnline: !vehicle.isOnline,
        }),
      });

      setVehicle(response.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not update driver status.",
      );
    } finally {
      setStatusLoading(false);
    }
  }

  async function acceptAvailablePool(poolId: string) {
    if (acceptingPoolId) {
      return;
    }

    try {
      setPoolError("");

      setPoolMessage("");

      setAcceptingPoolId(poolId);

      await api(`/drivers/pools/${poolId}/accept`, {
        method: "PATCH",
      });

      await refreshActivePool();

      setPools([]);

      setPoolMessage("Pool accepted. Passenger rides are matched.");
    } catch (error) {
      setPoolError(
        error instanceof Error ? error.message : "Could not accept this pool.",
      );
    } finally {
      setAcceptingPoolId(null);
    }
  }

  async function advanceLifecycle() {
    if (!activePool || lifecycleLoading || activePool.status === "COMPLETED") {
      return;
    }

    let nextStatus: "DRIVER_ARRIVED" | "STARTED" | "COMPLETED";

    if (activePool.status === "ACCEPTED") {
      nextStatus = "DRIVER_ARRIVED";
    } else if (activePool.status === "DRIVER_ARRIVED") {
      nextStatus = "STARTED";
    } else {
      nextStatus = "COMPLETED";
    }

    try {
      setLifecycleLoading(true);

      setPoolError("");

      setPoolMessage("");

      await api("/drivers/active-pool/status", {
        method: "PATCH",

        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      await refreshActivePool();

      if (nextStatus === "DRIVER_ARRIVED") {
        setPoolMessage("Passengers have been notified that you arrived.");
      }

      if (nextStatus === "STARTED") {
        setPoolMessage("Ride started successfully.");
      }

      if (nextStatus === "COMPLETED") {
        setPoolMessage(
          "Ride completed. Confirm cash received from each passenger.",
        );
      }
    } catch (error) {
      setPoolError(
        error instanceof Error
          ? error.message
          : "Could not update ride status.",
      );
    } finally {
      setLifecycleLoading(false);
    }
  }

  async function confirmCashReceived(rideId: string) {
    if (cashLoadingRideId) {
      return;
    }

    try {
      setCashLoadingRideId(rideId);

      setPoolError("");

      setPoolMessage("");

      const response = await api<DriverPaymentResponse>(
        `/rides/${rideId}/payment/driver`,
        {
          method: "PATCH",
        },
      );

      setActivePool((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,

          members: current.members.map((member) =>
            member.ride.id === rideId
              ? {
                  ...member,

                  ride: {
                    ...member.ride,

                    passengerPaid: response.data.passengerPaid,

                    driverReceived: response.data.driverReceived,

                    paymentStatus: response.data.paymentStatus,
                  },
                }
              : member,
          ),
        };
      });

      setPoolMessage("Cash received confirmed.");

      const refreshedPool = await refreshActivePool();

      if (!refreshedPool) {
        setPoolMessage(
          "Your cash confirmations are complete. This pool is closed on the driver side.",
        );
      }
    } catch (error) {
      setPoolError(
        error instanceof Error
          ? error.message
          : "Could not confirm cash received.",
      );
    } finally {
      setCashLoadingRideId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F8FA] px-6 py-12 text-black lg:px-10">
        <div className="mx-auto flex min-h-[580px] max-w-[1200px] items-center justify-center">
          <LoaderCircle size={28} className="animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F8FA] px-6 py-12 text-black lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col gap-6 border-b border-black/10 pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-black/40">
              Driver
            </p>

            <h1 className="mt-3 text-[42px] font-semibold tracking-[-0.05em]">
              Driver workspace
            </h1>

            <p className="mt-3 text-black/50">
              Manage your Tesla and active pool rides.
            </p>
          </div>

          {vehicle && (
            <div
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                vehicle.isOnline ? "bg-[#C6FF2E]" : "bg-black/5 text-black/50"
              }`}
            >
              {vehicle.isOnline ? "Online" : "Offline"}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {vehicle && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <section className="overflow-hidden rounded-2xl border border-black/10 bg-white">
              <div className="p-7">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-black/35">
                      Your Tesla
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold">
                      {vehicle.name}
                    </h2>

                    <p className="mt-1 text-sm text-black/45">
                      {vehicle.plateNumber}
                    </p>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black">
                    <Car size={24} className="text-[#C6FF2E]" />
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-black/10 p-5">
                    <Users size={17} />

                    <p className="mt-3 text-sm text-black/40">Capacity</p>

                    <p className="mt-1 text-xl font-semibold">
                      {vehicle.capacity} seats
                    </p>
                  </div>

                  <div className="rounded-xl border border-black/10 p-5">
                    <Zap size={17} />

                    <p className="mt-3 text-sm text-black/40">Availability</p>

                    <p className="mt-1 text-xl font-semibold">
                      {vehicle.isOnline ? "Accepting rides" : "Offline"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-black/10 p-7">
                <button
                  type="button"
                  onClick={toggleOnlineStatus}
                  disabled={statusLoading || Boolean(activePool)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black font-semibold text-white transition hover:bg-[#C6FF2E] hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {statusLoading ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Power size={17} />
                  )}

                  {activePool
                    ? activePool.status === "COMPLETED"
                      ? "Finish cash confirmation first"
                      : "Finish active pool first"
                    : vehicle.isOnline
                      ? "Go offline"
                      : "Go online"}
                </button>
              </div>
            </section>

            <aside className="rounded-2xl bg-black p-7 text-white">
              <MapPin className="text-[#C6FF2E]" />

              <p className="mt-8 text-xs uppercase tracking-[0.16em] text-white/40">
                Status
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                {activePool
                  ? formatPoolStatus(activePool.status)
                  : vehicle.isOnline
                    ? `${pools.length} open pools`
                    : "Offline"}
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/50">
                {activePool?.status === "COMPLETED"
                  ? "Trip completed. Confirm the cash received from each passenger."
                  : activePool
                    ? "Complete the active pool lifecycle before accepting another ride."
                    : vehicle.isOnline
                      ? "Available passenger pools are shown below."
                      : "Go online to receive ride requests."}
              </p>
            </aside>
          </div>
        )}

        {poolMessage && (
          <div className="mt-6 rounded-xl border border-[#C6FF2E] bg-[#C6FF2E]/15 p-4 text-sm">
            {poolMessage}
          </div>
        )}

        {poolError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {poolError}
          </div>
        )}

        {activePool ? (
          <ActivePoolCard
            pool={activePool}
            lifecycleLoading={lifecycleLoading}
            cashLoadingRideId={cashLoadingRideId}
            onAdvance={advanceLifecycle}
            onCashReceived={confirmCashReceived}
          />
        ) : vehicle?.isOnline ? (
          <section className="mt-8">
            <h2 className="text-2xl font-semibold">Available pools</h2>

            {poolsLoading ? (
              <div className="mt-6 flex min-h-[220px] items-center justify-center rounded-2xl border border-black/10 bg-white">
                <LoaderCircle className="animate-spin" />
              </div>
            ) : pools.length === 0 ? (
              <div className="mt-6 flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white">
                <Route size={22} />

                <p className="mt-4 font-semibold">No open pools right now</p>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                {pools.map((pool) => (
                  <PoolCard
                    key={pool.id}
                    pool={pool}
                    accepting={acceptingPoolId === pool.id}
                    disabled={acceptingPoolId !== null}
                    onAccept={() => acceptAvailablePool(pool.id)}
                  />
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}

function ActivePoolCard({
  pool,
  lifecycleLoading,
  cashLoadingRideId,
  onAdvance,
  onCashReceived,
}: {
  pool: ActivePool;
  lifecycleLoading: boolean;
  cashLoadingRideId: string | null;
  onAdvance: () => void;
  onCashReceived: (rideId: string) => void;
}) {
  const actionLabel =
    pool.status === "ACCEPTED"
      ? "Mark driver arrived"
      : pool.status === "DRIVER_ARRIVED"
        ? "Start ride"
        : "Complete ride";

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-black/10 bg-white">
      <div className="flex flex-col gap-5 border-b border-black/10 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/40">
            Active pool
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            {formatPoolStatus(pool.status)}
          </h2>
        </div>

        <div className="text-sm">
          <span className="font-semibold">{pool.occupiedSeats}</span>
          {" / "}
          {pool.capacity} seats
        </div>
      </div>

      {pool.status === "COMPLETED" && (
        <div className="border-b border-black/10 bg-[#C6FF2E]/15 p-6">
          <div className="flex items-start gap-3">
            <Banknote size={20} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">Cash confirmation</p>

              <p className="mt-1 text-sm leading-6 text-black/55">
                The trip is completed. Confirm cash received separately for each
                passenger.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="divide-y divide-black/10">
        {pool.members.map((member) => (
          <div key={member.id} className="p-6">
            <div className="grid gap-4 md:grid-cols-[160px_1fr_100px_120px]">
              <div>
                <p className="text-xs text-black/40">Passenger</p>

                <p className="mt-1 font-semibold">
                  {member.ride.passenger.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-black/40">Route</p>

                <p className="mt-1 font-semibold">
                  {zoneLabels[member.ride.pickup]}

                  {" → "}

                  {zoneLabels[member.ride.destination]}
                </p>
              </div>

              <div>
                <p className="text-xs text-black/40">Seats</p>

                <p className="mt-1 font-semibold">{member.seatsReserved}</p>
              </div>

              <div>
                <p className="text-xs text-black/40">Fare</p>

                <p className="mt-1 font-semibold">
                  {formatFare(
                    member.finalFarePoisha ?? member.ride.estimatedFarePoisha,
                  )}
                </p>
              </div>
            </div>

            {pool.status === "COMPLETED" && (
              <div className="mt-5 border-t border-black/10 pt-5">
                {member.ride.driverReceived ? (
                  <div className="flex items-start gap-3 rounded-xl border border-[#C6FF2E] bg-[#C6FF2E]/15 p-4">
                    <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

                    <div>
                      <p className="text-sm font-semibold">Cash received</p>

                      <p className="mt-1 text-xs leading-5 text-black/50">
                        {member.ride.paymentStatus === "COMPLETED"
                          ? "Passenger and driver have both confirmed the payment."
                          : "Your confirmation is done. Waiting for the passenger confirmation."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold">Confirm cash</p>

                      <p className="mt-1 text-xs text-black/50">
                        {member.ride.passengerPaid
                          ? "Passenger has already confirmed payment."
                          : "Confirm after receiving the cash from this passenger."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onCashReceived(member.ride.id)}
                      disabled={cashLoadingRideId !== null}
                      className="flex h-11 min-w-[170px] items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-bold text-white transition hover:bg-[#C6FF2E] hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cashLoadingRideId === member.ride.id ? (
                        <>
                          <LoaderCircle size={16} className="animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <Banknote size={16} />
                          Cash received
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {pool.status !== "COMPLETED" && (
        <div className="border-t border-black/10 p-6">
          <button
            type="button"
            onClick={onAdvance}
            disabled={lifecycleLoading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black font-bold text-white transition hover:bg-[#C6FF2E] hover:text-black disabled:opacity-50"
          >
            {lifecycleLoading ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <CheckCircle2 size={17} />
            )}

            {lifecycleLoading ? "Updating..." : actionLabel}
          </button>
        </div>
      )}
    </section>
  );
}

function PoolCard({
  pool,
  accepting,
  disabled,
  onAccept,
}: {
  pool: AvailablePool;
  accepting: boolean;
  disabled: boolean;
  onAccept: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-black/10 bg-white">
      <div className="flex flex-col gap-5 border-b border-black/10 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded-full bg-[#C6FF2E] px-3 py-1 text-xs font-bold">
            Open
          </span>

          <h3 className="mt-3 text-xl font-semibold">
            {pool.members.length}{" "}
            {pool.members.length === 1 ? "passenger" : "passengers"}
          </h3>
        </div>

        <button
          type="button"
          onClick={onAccept}
          disabled={disabled}
          className="flex h-11 min-w-[140px] items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-bold text-white transition hover:bg-[#C6FF2E] hover:text-black disabled:opacity-50"
        >
          {accepting ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <CheckCircle2 size={16} />
          )}

          {accepting ? "Accepting..." : "Accept pool"}
        </button>
      </div>

      <div className="divide-y divide-black/10">
        {pool.members.map((member) => (
          <div
            key={member.id}
            className="grid gap-4 p-6 md:grid-cols-[160px_1fr_100px_120px]"
          >
            <p className="font-semibold">{member.ride.passenger.name}</p>

            <p>
              {zoneLabels[member.ride.pickup]}

              {" → "}

              {zoneLabels[member.ride.destination]}
            </p>

            <p>
              {member.seatsReserved}{" "}
              {member.seatsReserved === 1 ? "seat" : "seats"}
            </p>

            <p className="font-semibold">
              {formatFare(
                member.finalFarePoisha ?? member.ride.estimatedFarePoisha,
              )}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
