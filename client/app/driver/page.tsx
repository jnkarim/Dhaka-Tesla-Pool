"use client";

import {
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


type VehicleResponse = {
  success: boolean;
  data: Vehicle;
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


type PoolRide = {
  id: string;
  pickup: DhakaZone;
  destination: DhakaZone;
  seats: number;
  estimatedFarePoisha: number;
  status: string;
  createdAt: string;

  passenger: {
    id: string;
    name: string;
  };
};


type PoolMember = {
  id: string;
  seatsReserved: number;
  joinedAt: string;
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


type AvailablePoolsResponse = {
  success: boolean;
  data: AvailablePool[];
};


type AcceptPoolResponse = {
  success: boolean;

  data: {
    id: string;
    status: "ACCEPTED";
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


export default function DriverPage() {
  const [vehicle, setVehicle] =
    useState<Vehicle | null>(null);

  const [pools, setPools] =
    useState<AvailablePool[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [statusLoading, setStatusLoading] =
    useState(false);

  const [poolsLoading, setPoolsLoading] =
    useState(false);

  const [
    acceptingPoolId,
    setAcceptingPoolId,
  ] = useState<string | null>(null);

  const [
    acceptedPool,
    setAcceptedPool,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [poolError, setPoolError] =
    useState("");

  const [
    poolMessage,
    setPoolMessage,
  ] = useState("");


  useEffect(() => {
    async function loadVehicle() {
      try {
        const response =
          await api<VehicleResponse>(
            "/vehicles/me",
          );

        setVehicle(response.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not load vehicle.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadVehicle();
  }, []);


  useEffect(() => {
    if (
      !vehicle?.isOnline ||
      acceptedPool
    ) {
      setPools([]);
      setPoolError("");

      return;
    }


    async function loadPools() {
      try {
        setPoolsLoading(true);
        setPoolError("");


        const response =
          await api<AvailablePoolsResponse>(
            "/drivers/pools",
          );


        setPools(response.data);
      } catch (error) {
        setPoolError(
          error instanceof Error
            ? error.message
            : "Could not load available pools.",
        );
      } finally {
        setPoolsLoading(false);
      }
    }


    loadPools();
  }, [
    vehicle?.isOnline,
    acceptedPool,
  ]);


  async function toggleOnlineStatus() {
    if (
      !vehicle ||
      statusLoading
    ) {
      return;
    }


    try {
      setError("");
      setStatusLoading(true);


      const response =
        await api<VehicleResponse>(
          "/vehicles/online-status",
          {
            method: "PATCH",

            body: JSON.stringify({
              isOnline:
                !vehicle.isOnline,
            }),
          },
        );


      setVehicle(response.data);

      if (!response.data.isOnline) {
        setPools([]);
        setPoolError("");
        setPoolMessage("");
      }
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


  async function acceptAvailablePool(
    poolId: string,
  ) {
    if (acceptingPoolId) {
      return;
    }


    try {
      setPoolError("");
      setPoolMessage("");
      setAcceptingPoolId(poolId);


      await api<AcceptPoolResponse>(
        `/drivers/pools/${poolId}/accept`,
        {
          method: "PATCH",
        },
      );


      setPools([]);

      setAcceptedPool(true);

      setPoolMessage(
        "Pool accepted successfully. Passenger rides are now matched.",
      );
    } catch (error) {
      setPoolError(
        error instanceof Error
          ? error.message
          : "Could not accept this pool.",
      );
    } finally {
      setAcceptingPoolId(null);
    }
  }


  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F8FA] px-6 py-12 text-black lg:px-10">
        <div className="mx-auto flex min-h-[580px] max-w-[1200px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <LoaderCircle
              size={28}
              className="animate-spin"
            />

            <p className="text-sm text-black/45">
              Loading driver workspace...
            </p>
          </div>
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

            <p className="mt-3 max-w-xl text-black/50">
              Manage your Tesla availability and available pool rides.
            </p>
          </div>


          {vehicle && (
            <div
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                vehicle.isOnline
                  ? "bg-[#C6FF2E] text-black"
                  : "bg-black/5 text-black/55"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  vehicle.isOnline
                    ? "bg-black"
                    : "bg-black/30"
                }`}
              />

              {vehicle.isOnline
                ? "Online"
                : "Offline"}
            </div>
          )}
        </div>


        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}


        {vehicle && (
          <>
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">

              <section className="overflow-hidden rounded-2xl border border-black/10 bg-white">

                <div className="p-7">
                  <div className="flex items-start justify-between gap-6">

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/35">
                        Your Tesla
                      </p>

                      <h2 className="mt-3 text-[28px] font-semibold tracking-[-0.04em]">
                        {vehicle.name}
                      </h2>

                      <p className="mt-1 text-sm text-black/45">
                        {vehicle.plateNumber}
                      </p>
                    </div>


                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black">
                      <Car
                        size={24}
                        className="text-[#C6FF2E]"
                      />
                    </div>

                  </div>


                  <div className="mt-8 grid gap-4 sm:grid-cols-2">

                    <div className="rounded-xl border border-black/10 bg-black/[0.02] p-5">
                      <div className="flex items-center gap-2 text-black/40">
                        <Users size={16} />

                        <p className="text-xs">
                          Capacity
                        </p>
                      </div>

                      <p className="mt-2 text-xl font-semibold">
                        {vehicle.capacity} seats
                      </p>
                    </div>


                    <div className="rounded-xl border border-black/10 bg-black/[0.02] p-5">
                      <div className="flex items-center gap-2 text-black/40">
                        <Zap size={16} />

                        <p className="text-xs">
                          Availability
                        </p>
                      </div>

                      <p className="mt-2 text-xl font-semibold">
                        {vehicle.isOnline
                          ? "Accepting rides"
                          : "Not accepting rides"}
                      </p>
                    </div>

                  </div>
                </div>


                <div className="border-t border-black/10 bg-black/[0.015] p-7">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <h3 className="font-semibold">
                        Driver availability
                      </h3>

                      <p className="mt-1 text-sm text-black/45">
                        Go online when you are ready to accept a Tesla pool.
                      </p>
                    </div>


                    <button
                      type="button"
                      onClick={
                        toggleOnlineStatus
                      }
                      disabled={
                        statusLoading
                      }
                      className={`flex h-12 min-w-[170px] items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        vehicle.isOnline
                          ? "border border-black/15 bg-white text-black hover:bg-black hover:text-white"
                          : "bg-black text-white hover:bg-[#C6FF2E] hover:text-black"
                      }`}
                    >
                      {statusLoading ? (
                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Power size={17} />
                      )}

                      {statusLoading
                        ? "Updating..."
                        : vehicle.isOnline
                          ? "Go offline"
                          : "Go online"}
                    </button>

                  </div>
                </div>

              </section>


              <aside className="rounded-2xl border border-black/10 bg-black p-7 text-white">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C6FF2E] text-black">
                  <MapPin size={21} />
                </div>


                <p className="mt-8 text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                  Ride requests
                </p>


                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                  {acceptedPool
                    ? "Pool accepted"
                    : vehicle.isOnline
                      ? `${pools.length} available ${
                          pools.length === 1
                            ? "pool"
                            : "pools"
                        }`
                      : "You are offline"}
                </h2>


                <p className="mt-3 text-sm leading-6 text-white/50">
                  {acceptedPool
                    ? "You now have an active Tesla pool."
                    : vehicle.isOnline
                      ? "Open passenger pools are shown below."
                      : "Go online to start receiving available ride pools."}
                </p>


                <div className="mt-8 border-t border-white/10 pt-6">
                  <p className="text-xs text-white/35">
                    Current status
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        vehicle.isOnline
                          ? "bg-[#C6FF2E]"
                          : "bg-white/30"
                      }`}
                    />

                    <p className="text-sm font-semibold">
                      {vehicle.isOnline
                        ? "Online"
                        : "Offline"}
                    </p>
                  </div>
                </div>

              </aside>

            </div>


            {vehicle.isOnline && (
              <section className="mt-8">

                <div className="flex items-end justify-between gap-5">

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-black/35">
                      Available pools
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                      {acceptedPool
                        ? "Active pool assigned"
                        : "Ride requests"}
                    </h2>
                  </div>


                  {!poolsLoading &&
                    !acceptedPool && (
                      <p className="text-sm text-black/40">
                        {pools.length} open
                      </p>
                    )}

                </div>


                {poolMessage && (
                  <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#C6FF2E] bg-[#C6FF2E]/15 p-5">
                    <CheckCircle2
                      size={20}
                      className="mt-0.5 shrink-0"
                    />

                    <div>
                      <p className="font-semibold">
                        Pool accepted
                      </p>

                      <p className="mt-1 text-sm text-black/55">
                        {poolMessage}
                      </p>
                    </div>
                  </div>
                )}


                {poolError &&
                  !poolsLoading && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
                      {poolError}
                    </div>
                  )}


                {!acceptedPool &&
                  poolsLoading && (
                    <div className="mt-6 flex min-h-[220px] items-center justify-center rounded-2xl border border-black/10 bg-white">

                      <div className="flex items-center gap-3 text-sm text-black/45">
                        <LoaderCircle
                          size={18}
                          className="animate-spin"
                        />

                        Loading available pools...
                      </div>

                    </div>
                  )}


                {!acceptedPool &&
                  !poolsLoading &&
                  !poolError &&
                  pools.length === 0 && (
                    <div className="mt-6 flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white px-6 text-center">

                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black">
                        <Route
                          size={22}
                          className="text-[#C6FF2E]"
                        />
                      </div>


                      <h3 className="mt-5 text-lg font-semibold">
                        No open pools right now
                      </h3>


                      <p className="mt-2 max-w-sm text-sm leading-6 text-black/45">
                        New passenger ride requests will appear here while you are online.
                      </p>

                    </div>
                  )}


                {!acceptedPool &&
                  !poolsLoading &&
                  !poolError &&
                  pools.length > 0 && (
                    <div className="mt-6 grid gap-5">

                      {pools.map(
                        (pool) => (
                          <PoolCard
                            key={pool.id}
                            pool={pool}
                            accepting={
                              acceptingPoolId ===
                              pool.id
                            }
                            disabled={
                              acceptingPoolId !==
                              null
                            }
                            onAccept={() =>
                              acceptAvailablePool(
                                pool.id,
                              )
                            }
                          />
                        ),
                      )}

                    </div>
                  )}

              </section>
            )}
          </>
        )}

      </div>
    </main>
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

      <div className="flex flex-col gap-6 border-b border-black/10 p-6 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <span className="rounded-full bg-[#C6FF2E] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em]">
              Open
            </span>

            <p className="text-sm text-black/40">
              Tesla pool
            </p>

          </div>


          <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em]">
            {pool.members.length}{" "}
            {pool.members.length === 1
              ? "passenger"
              : "passengers"}
          </h3>
        </div>


        <div className="flex items-center gap-8">

          <div>
            <p className="text-xs text-black/40">
              Seats
            </p>

            <p className="mt-1 text-lg font-semibold">
              {pool.occupiedSeats}
              {" / "}
              {pool.capacity}
            </p>
          </div>


          <div>
            <p className="text-xs text-black/40">
              Available
            </p>

            <p className="mt-1 text-lg font-semibold">
              {pool.availableSeats}
            </p>
          </div>


          <button
            type="button"
            onClick={onAccept}
            disabled={disabled}
            className="flex h-11 min-w-[135px] items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-bold text-white transition hover:bg-[#C6FF2E] hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {accepting ? (
              <>
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />

                Accepting...
              </>
            ) : (
              <>
                <CheckCircle2
                  size={16}
                />

                Accept pool
              </>
            )}
          </button>

        </div>
      </div>


      <div className="divide-y divide-black/10">

        {pool.members.map(
          (member) => (
            <div
              key={member.id}
              className="grid gap-5 p-6 md:grid-cols-[180px_1fr_120px_120px]"
            >

              <div>
                <p className="text-xs text-black/40">
                  Passenger
                </p>

                <p className="mt-1 font-semibold">
                  {
                    member.ride
                      .passenger.name
                  }
                </p>
              </div>


              <div>
                <p className="text-xs text-black/40">
                  Route
                </p>

                <div className="mt-1 flex items-center gap-2 font-semibold">
                  {
                    zoneLabels[
                      member.ride
                        .pickup
                    ]
                  }

                  <span className="text-black/30">
                    →
                  </span>

                  {
                    zoneLabels[
                      member.ride
                        .destination
                    ]
                  }
                </div>
              </div>


              <div>
                <p className="text-xs text-black/40">
                  Seats
                </p>

                <div className="mt-1 flex items-center gap-2 font-semibold">
                  <Users size={15} />

                  {
                    member.seatsReserved
                  }
                </div>
              </div>


              <div>
                <p className="text-xs text-black/40">
                  Fare
                </p>

                <p className="mt-1 font-semibold">
                  {formatFare(
                    member.ride
                      .estimatedFarePoisha,
                  )}
                </p>
              </div>

            </div>
          ),
        )}

      </div>
    </article>
  );
}