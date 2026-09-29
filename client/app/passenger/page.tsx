"use client";

import dynamic from "next/dynamic";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  LoaderCircle,
  Minus,
  Plus,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";

const RideMap = dynamic(() => import("@/components/RideMap"), {
  ssr: false,

  loading: () => (
    <div className="h-full min-h-[620px] w-full animate-pulse bg-black/[0.04]" />
  ),
});

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

type RideStatus =
  | "REQUESTED"
  | "MATCHED"
  | "DRIVER_ARRIVED"
  | "STARTED"
  | "COMPLETED"
  | "CANCELLED";

type PaymentStatus = "PENDING" | "COMPLETED";

type Ride = {
  id: string;

  pickup: DhakaZone;

  destination: DhakaZone;

  seats: number;

  status: RideStatus;

  estimatedFarePoisha: number;

  paymentStatus?: PaymentStatus;

  passengerPaid?: boolean;

  driverReceived?: boolean;
};

type CreateRideResponse = {
  success: boolean;

  data: Ride;
};

type CurrentRideResponse = {
  success: boolean;

  data: Ride | null;
};

const locations: {
  value: DhakaZone;

  label: string;

  coordinates: [number, number];
}[] = [
  {
    value: "KHILGAON",
    label: "Khilgaon",
    coordinates: [23.7509, 90.4251],
  },

  {
    value: "BANANI",
    label: "Banani",
    coordinates: [23.7937, 90.4066],
  },

  {
    value: "GULSHAN_1",
    label: "Gulshan 1",
    coordinates: [23.7808, 90.4175],
  },

  {
    value: "GULSHAN_2",
    label: "Gulshan 2",
    coordinates: [23.7925, 90.4078],
  },

  {
    value: "MOHAKHALI",
    label: "Mohakhali",
    coordinates: [23.7788, 90.407],
  },

  {
    value: "FARMGATE",
    label: "Farmgate",
    coordinates: [23.7577, 90.3905],
  },

  {
    value: "DHANMONDI",
    label: "Dhanmondi",
    coordinates: [23.7465, 90.376],
  },

  {
    value: "MIRPUR",
    label: "Mirpur",
    coordinates: [23.8045, 90.3667],
  },

  {
    value: "UTTARA",
    label: "Uttara",
    coordinates: [23.8759, 90.3795],
  },

  {
    value: "BASHUNDHARA",
    label: "Bashundhara",
    coordinates: [23.8151, 90.4255],
  },
];

function getCoordinates(zone: DhakaZone): [number, number] {
  return (
    locations.find((location) => location.value === zone)?.coordinates ?? [
      23.8103, 90.4125,
    ]
  );
}

function getZoneLabel(zone: DhakaZone) {
  return locations.find((location) => location.value === zone)?.label ?? zone;
}

function formatStatus(status: RideStatus) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getRideTitle(status: RideStatus) {
  switch (status) {
    case "REQUESTED":
      return "Ride requested";

    case "MATCHED":
      return "Driver matched";

    case "DRIVER_ARRIVED":
      return "Driver arrived";

    case "STARTED":
      return "Ride in progress";

    case "COMPLETED":
      return "Ride completed";

    case "CANCELLED":
      return "Ride cancelled";

    default:
      return "Current ride";
  }
}

function getRideMessage(status: RideStatus) {
  switch (status) {
    case "REQUESTED":
      return "Your request has been submitted. Waiting for a driver to accept the pool.";

    case "MATCHED":
      return "A driver has accepted your ride and is heading towards your pickup location.";

    case "DRIVER_ARRIVED":
      return "Your driver has arrived at the pickup location.";

    case "STARTED":
      return "Your ride is currently in progress.";

    case "COMPLETED":
      return "Your ride has been completed.";

    case "CANCELLED":
      return "This ride has been cancelled.";

    default:
      return "";
  }
}

export default function PassengerPage() {
  const [pickup, setPickup] = useState<DhakaZone>("BANANI");

  const [destination, setDestination] = useState<DhakaZone>("MOHAKHALI");

  const [seats, setSeats] = useState(1);

  const [loading, setLoading] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);

  const [cancelLoading, setCancelLoading] = useState(false);

  const [error, setError] = useState("");

  const [cancelError, setCancelError] = useState("");

  const [currentRide, setCurrentRide] = useState<Ride | null>(null);

  const mapPickup = currentRide?.pickup ?? pickup;

  const mapDestination = currentRide?.destination ?? destination;

  const pickupCoordinates = getCoordinates(mapPickup);

  const destinationCoordinates = getCoordinates(mapDestination);

  useEffect(() => {
    async function loadCurrentRide() {
      try {
        const response = await api<CurrentRideResponse>("/rides/current");

        if (response.data) {
          setCurrentRide(response.data);

          setPickup(response.data.pickup);

          setDestination(response.data.destination);

          setSeats(response.data.seats);

          return;
        }

        const params = new URLSearchParams(window.location.search);

        const queryPickup = params.get("pickup");

        const queryDestination = params.get("destination");

        const querySeats = Number(params.get("seats"));

        const validZones = locations.map((location) => location.value);

        if (queryPickup && validZones.includes(queryPickup as DhakaZone)) {
          setPickup(queryPickup as DhakaZone);
        }

        if (
          queryDestination &&
          validZones.includes(queryDestination as DhakaZone)
        ) {
          setDestination(queryDestination as DhakaZone);
        }

        if (
          Number.isInteger(querySeats) &&
          querySeats >= 1 &&
          querySeats <= 3
        ) {
          setSeats(querySeats);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Could not load your ride.",
        );
      } finally {
        setInitialLoading(false);
      }
    }

    loadCurrentRide();
  }, []);

  async function requestRide() {
    setError("");

    if (pickup === destination) {
      setError("Pickup and destination cannot be the same.");

      return;
    }

    try {
      setLoading(true);

      const response = await api<CreateRideResponse>("/rides", {
        method: "POST",

        body: JSON.stringify({
          pickup,
          destination,
          seats,
        }),
      });

      setCurrentRide(response.data);

      setCancelError("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not request the ride.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function cancelCurrentRide() {
    if (!currentRide || cancelLoading) {
      return;
    }

    try {
      setCancelError("");
      setCancelLoading(true);

      await api(`/rides/${currentRide.id}/cancel`, {
        method: "PATCH",
      });

      setCurrentRide(null);
    } catch (error) {
      setCancelError(
        error instanceof Error ? error.message : "Could not cancel the ride.",
      );
    } finally {
      setCancelLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <main className="min-h-screen bg-[#F8F8FA] px-6 py-12 text-black lg:px-10">
        <div className="mx-auto flex min-h-[650px] max-w-[1400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <LoaderCircle size={30} className="animate-spin" />

            <p className="text-sm text-black/50">Loading your ride</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F8FA] px-6 py-12 text-black lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-black/40">
            Passenger
          </p>

          <h1 className="mt-3 text-[42px] font-semibold tracking-[-0.05em]">
            {currentRide ? "Your ride" : "Where to?"}
          </h1>

          <p className="mt-3 text-black/50">
            {currentRide
              ? "Track your current Tesla pool."
              : "Choose your route and request a Tesla pool."}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[430px_1fr]">
          <section className="rounded-2xl border border-black/10 bg-white p-7">
            {!currentRide ? (
              <>
                <h2 className="text-lg font-semibold">Ride details</h2>

                <SelectBox label="Pickup" value={pickup} setValue={setPickup} />

                <SelectBox
                  label="Destination"
                  value={destination}
                  setValue={setDestination}
                />

                <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                      <Users size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">Passengers</p>

                      <p className="text-xs text-black/40">Maximum 3 seats</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setSeats((current) => Math.max(1, current - 1))
                      }
                      disabled={seats === 1}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-black/20 transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="flex h-10 w-7 items-center justify-center text-base font-semibold">
                      {seats}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setSeats((current) => Math.min(3, current + 1))
                      }
                      disabled={seats === 3}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition hover:bg-[#C6FF2E] hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-black/10 bg-black/[0.03] p-4">
                  <p className="text-sm font-semibold">Payment</p>

                  <p className="mt-1 text-sm text-black/50">
                    Cash payment after completing the ride.
                  </p>
                </div>

                {error && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={requestRide}
                  disabled={loading}
                  className="group mt-7 flex h-[58px] w-full items-center justify-center gap-3 rounded-xl bg-black font-semibold text-white transition hover:bg-[#C6FF2E] hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Requesting..." : "Request Tesla Pool"}

                  {!loading && (
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  )}
                </button>
              </>
            ) : (
              <CurrentRide
                ride={currentRide}
                cancelling={cancelLoading}
                cancelError={cancelError}
                onCancel={cancelCurrentRide}
              />
            )}
          </section>

          <section className="min-h-[620px] overflow-hidden rounded-2xl border border-black/10">
            <RideMap
              pickup={pickupCoordinates}
              destination={destinationCoordinates}
            />
          </section>
        </div>
      </div>
    </main>
  );
}

function CurrentRide({
  ride,
  cancelling,
  cancelError,
  onCancel,
}: {
  ride: Ride;
  cancelling: boolean;
  cancelError: string;
  onCancel: () => void;
}) {
  const canCancel = ride.status === "REQUESTED";

  return (
    <div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C6FF2E]">
        <CheckCircle2 size={22} />
      </div>

      <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-black/40">
        Current ride
      </p>

      <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.03em]">
        {getRideTitle(ride.status)}
      </h2>

      <div className="mt-8">
        <div>
          <p className="text-xs text-black/40">Pickup</p>

          <p className="mt-1 font-semibold">{getZoneLabel(ride.pickup)}</p>
        </div>

        <div className="my-4 ml-[5px] h-8 border-l border-dashed border-black/20" />

        <div>
          <p className="text-xs text-black/40">Destination</p>

          <p className="mt-1 font-semibold">{getZoneLabel(ride.destination)}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 border-t border-black/10 pt-6">
        <div>
          <p className="text-xs text-black/40">Estimated fare</p>

          <p className="mt-1 text-2xl font-semibold">
            ৳{(ride.estimatedFarePoisha / 100).toFixed(0)}
          </p>
        </div>

        <div>
          <p className="text-xs text-black/40">Seats</p>

          <p className="mt-1 text-2xl font-semibold">{ride.seats}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl bg-black px-4 py-4 text-white">
        <div>
          <p className="text-xs text-white/50">Status</p>

          <p className="mt-1 text-sm font-semibold">
            {formatStatus(ride.status)}
          </p>
        </div>

        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#C6FF2E]" />
      </div>

      <p className="mt-4 text-sm leading-6 text-black/45">
        {getRideMessage(ride.status)}
      </p>

      {cancelError && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {cancelError}
        </div>
      )}

      {canCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={cancelling}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cancelling ? (
            <>
              <LoaderCircle size={17} className="animate-spin" />
              Cancelling...
            </>
          ) : (
            <>
              <XCircle size={17} />
              Cancel ride
            </>
          )}
        </button>
      )}
    </div>
  );
}

function SelectBox({
  label,
  value,
  setValue,
}: {
  label: string;

  value: DhakaZone;

  setValue: (value: DhakaZone) => void;
}) {
  return (
    <div className="mt-5 rounded-xl border border-black/10 bg-white px-4 py-3 transition focus-within:border-black">
      <p className="text-xs font-medium text-black/40">{label}</p>

      <div className="flex items-center">
        <select
          value={value}
          onChange={(event) => setValue(event.target.value as DhakaZone)}
          className="mt-1 w-full appearance-none bg-transparent font-semibold text-black outline-none"
        >
          {locations.map((location) => (
            <option key={location.value} value={location.value}>
              {location.label}
            </option>
          ))}
        </select>

        <ChevronDown size={16} className="pointer-events-none text-black/40" />
      </div>
    </div>
  );
}
