"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowDownUp,
  ArrowRight,
  Banknote,
  Car,
  Check,
  CheckCircle2,
  Circle,
  Lock,
  LoaderCircle,
  MapPin,
  Route,
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

type ActiveField = "pickup" | "destination";

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

  poolMember?: {
    pool?: {
      vehicle?: {
        id: string;
        name: string;
        plateNumber: string;
        capacity: number;

        driver?: {
          id: string;
          name: string;
        };
      } | null;
    };
  } | null;
};

type CreateRideResponse = {
  success: boolean;
  data: Ride;
};

type CurrentRideResponse = {
  success: boolean;
  data: Ride | null;
};

type PaymentResponse = {
  success: boolean;
  data: Ride;
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

const rideSteps: {
  status: Exclude<RideStatus, "CANCELLED">;
  title: string;
  description: string;
}[] = [
  {
    status: "REQUESTED",
    title: "Ride requested",
    description: "Waiting for a driver to accept your Tesla pool.",
  },
  {
    status: "MATCHED",
    title: "Driver matched",
    description: "A driver accepted your pool and is heading to you.",
  },
  {
    status: "DRIVER_ARRIVED",
    title: "Driver arrived",
    description: "Your Tesla has arrived at the pickup location.",
  },
  {
    status: "STARTED",
    title: "Ride started",
    description: "Your Tesla pool ride is now in progress.",
  },
  {
    status: "COMPLETED",
    title: "Ride completed",
    description: "The trip is complete. Finish the cash confirmation.",
  },
];

function isAuthError(error: unknown) {
  const message = (
    error instanceof Error ? error.message : String(error ?? "")
  ).toLowerCase();

  return [
    "unauthorized",
    "unauthorised",
    "unauthenticated",
    "not authenticated",
    "not logged in",
    "sign in",
    "login",
    "token",
    "401",
    "forbidden",
    "403",
  ].some((keyword) => message.includes(keyword));
}

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
      return "A driver accepted your ride and is heading towards your pickup location.";

    case "DRIVER_ARRIVED":
      return "Your driver has arrived at the pickup location.";

    case "STARTED":
      return "Your ride is currently in progress.";

    case "COMPLETED":
      return "Your trip is complete. Confirm the cash payment after paying your driver.";

    case "CANCELLED":
      return "This ride has been cancelled.";

    default:
      return "";
  }
}

export default function PassengerPage() {
  const [pickup, setPickup] = useState<DhakaZone>("BANANI");

  const [destination, setDestination] = useState<DhakaZone>("MOHAKHALI");

  const [activeField, setActiveField] = useState<ActiveField>("pickup");

  const [seats, setSeats] = useState(1);

  const [loading, setLoading] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);

  const [cancelLoading, setCancelLoading] = useState(false);

  const [paymentLoading, setPaymentLoading] = useState(false);

  const [error, setError] = useState("");

  const [cancelError, setCancelError] = useState("");

  const [paymentError, setPaymentError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [currentRide, setCurrentRide] = useState<Ride | null>(null);

  const [authenticated, setAuthenticated] = useState(true);

  const pickupCoordinates = getCoordinates(pickup);

  const destinationCoordinates = getCoordinates(destination);

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
        if (isAuthError(error)) {
          setAuthenticated(false);
        } else {
          setError(
            error instanceof Error
              ? error.message
              : "Could not load your ride.",
          );
        }
      } finally {
        setInitialLoading(false);
      }
    }

    loadCurrentRide();
  }, []);

  useEffect(() => {
    if (!currentRide) {
      return;
    }

    const interval = window.setInterval(async () => {
      try {
        const response = await api<CurrentRideResponse>("/rides/current");

        if (response.data) {
          setCurrentRide(response.data);

          return;
        }

        setCurrentRide(null);

        setSuccessMessage("Ride and cash confirmation completed successfully.");
      } catch {
        // Keep the current UI if a background refresh temporarily fails.
      }
    }, 3000);

    return () => {
      window.clearInterval(interval);
    };
  }, [currentRide?.id]);

  function selectZone(zone: DhakaZone) {
    setError("");

    if (activeField === "pickup") {
      setPickup(zone);

      setActiveField("destination");

      return;
    }

    setDestination(zone);
  }

  function swapRoute() {
    setError("");

    setPickup(destination);

    setDestination(pickup);
  }

  async function requestRide() {
    setError("");
    setSuccessMessage("");

    if (!authenticated) {
      return;
    }

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

      setPaymentError("");
    } catch (error) {
      if (isAuthError(error)) {
        setAuthenticated(false);
      } else {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to request your ride. Please try again.",
        );
      }
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

      setSuccessMessage("Ride cancelled successfully.");
    } catch (error) {
      setCancelError(
        error instanceof Error ? error.message : "Could not cancel the ride.",
      );
    } finally {
      setCancelLoading(false);
    }
  }

  async function confirmCashPayment() {
    if (
      !currentRide ||
      currentRide.status !== "COMPLETED" ||
      currentRide.passengerPaid ||
      paymentLoading
    ) {
      return;
    }

    try {
      setPaymentError("");

      setPaymentLoading(true);

      const response = await api<PaymentResponse>(
        `/rides/${currentRide.id}/payment/passenger`,
        {
          method: "PATCH",
        },
      );

      if (response.data.paymentStatus === "COMPLETED") {
        setCurrentRide(null);

        setSuccessMessage("Payment completed. Your ride is fully done.");

        return;
      }

      setCurrentRide((ride) =>
        ride
          ? {
              ...ride,
              passengerPaid: response.data.passengerPaid,
              driverReceived: response.data.driverReceived,
              paymentStatus: response.data.paymentStatus,
            }
          : ride,
      );
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Could not confirm cash payment.",
      );
    } finally {
      setPaymentLoading(false);
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
          <p className="text-sm font-semibold text-black/40">Passenger</p>

          <h1 className="mt-2 text-[44px] font-semibold leading-none tracking-[-0.05em]">
            {currentRide ? "Your ride" : "Where to?"}
          </h1>

          <p className="mt-4 text-black/50">
            {currentRide
              ? "Follow your Tesla pool status in real time."
              : "Pick your pickup and destination, then request a Tesla pool."}
          </p>
        </div>

        {successMessage && !currentRide && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#C6FF2E] bg-[#C6FF2E]/15 p-5">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">Done</p>

              <p className="mt-1 text-sm text-black/55">{successMessage}</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[440px_1fr]">
          <section className="rounded-3xl border border-black/10 bg-white p-6 sm:p-7">
            {!currentRide ? (
              <>
                <RouteSelector
                  pickup={pickup}
                  destination={destination}
                  activeField={activeField}
                  onActivate={setActiveField}
                  onSelect={selectZone}
                  onSwap={swapRoute}
                />

                <div className="mt-7">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Users size={17} />

                      <p className="text-sm font-semibold">Passengers</p>
                    </div>

                    <p className="text-xs text-black/40">Up to 3 seats</p>
                  </div>

                  <div
                    role="radiogroup"
                    aria-label="Number of seats"
                    className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-black/[0.05] p-1"
                  >
                    {[1, 2, 3].map((count) => (
                      <button
                        key={count}
                        type="button"
                        role="radio"
                        aria-checked={seats === count}
                        onClick={() => setSeats(count)}
                        className={`h-11 rounded-lg text-sm font-semibold transition ${
                          seats === count
                            ? "bg-black text-white shadow-sm"
                            : "text-black/50 hover:text-black"
                        }`}
                      >
                        {count} {count === 1 ? "seat" : "seats"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex items-start gap-3 rounded-xl border border-black/10 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C6FF2E]">
                    <Banknote size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">Pay in cash</p>

                    <p className="mt-0.5 text-sm leading-5 text-black/50">
                      Hand the fare to your driver when the ride ends.
                    </p>
                  </div>
                </div>

                {!authenticated && (
                  <div className="mt-6 flex items-start gap-3 rounded-xl border border-black/10 bg-black/[0.03] p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-[#C6FF2E]">
                      <Lock size={16} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">Sign in required</p>

                      <p className="mt-0.5 text-sm leading-5 text-black/50">
                        Sign in to request a Tesla pool ride.
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                  >
                    {error}
                  </div>
                )}

                {!authenticated && (
                  <Link
                    href="/login"
                    className="mt-4 flex h-12 w-full items-center justify-center rounded-xl border border-black text-sm font-semibold transition hover:bg-black hover:text-white"
                  >
                    Sign in
                  </Link>
                )}

                <button
                  type="button"
                  onClick={requestRide}
                  disabled={loading || !authenticated}
                  aria-disabled={loading || !authenticated}
                  className="group mt-6 flex h-[58px] w-full items-center justify-center gap-3 rounded-xl bg-black font-semibold text-white transition enabled:hover:bg-[#C6FF2E] enabled:hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:pointer-events-none disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Requesting...
                    </>
                  ) : !authenticated ? (
                    <>
                      <Lock size={17} />
                      Sign in to request
                    </>
                  ) : (
                    <>
                      Request Tesla Pool
                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </>
            ) : (
              <CurrentRide
                ride={currentRide}
                cancelling={cancelLoading}
                cancelError={cancelError}
                paymentLoading={paymentLoading}
                paymentError={paymentError}
                onCancel={cancelCurrentRide}
                onPaymentDone={confirmCashPayment}
              />
            )}
          </section>

          {!currentRide ? (
            <section className="min-h-[620px] overflow-hidden rounded-3xl border border-black/10">
              <RideMap
                pickup={pickupCoordinates}
                destination={destinationCoordinates}
              />
            </section>
          ) : (
            <RideProgress ride={currentRide} />
          )}
        </div>
      </div>
    </main>
  );
}

function RouteSelector({
  pickup,
  destination,
  activeField,
  onActivate,
  onSelect,
  onSwap,
}: {
  pickup: DhakaZone;
  destination: DhakaZone;
  activeField: ActiveField;
  onActivate: (field: ActiveField) => void;
  onSelect: (zone: DhakaZone) => void;
  onSwap: () => void;
}) {
  const rows: {
    field: ActiveField;
    label: string;
    value: DhakaZone;
  }[] = [
    { field: "pickup", label: "Pickup", value: pickup },
    { field: "destination", label: "Destination", value: destination },
  ];

  const otherValue = activeField === "pickup" ? destination : pickup;

  const selectedValue = activeField === "pickup" ? pickup : destination;

  return (
    <div>
      <div className="relative rounded-2xl bg-black/[0.04] p-1.5">
        {/* timeline connector */}
        <div className="pointer-events-none absolute left-[27px] top-[46px] h-[calc(100%-92px)] border-l border-dashed border-black/25" />

        {rows.map((row) => {
          const active = activeField === row.field;

          return (
            <button
              key={row.field}
              type="button"
              onClick={() => onActivate(row.field)}
              aria-pressed={active}
              className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 pr-16 text-left transition ${
                active
                  ? "border-black bg-white"
                  : "border-transparent hover:bg-white/60"
              }`}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                {row.field === "pickup" ? (
                  <span className="h-3 w-3 rounded-full border-[3px] border-black bg-white" />
                ) : (
                  <span className="h-3 w-3 bg-black" />
                )}
              </span>

              <span className="min-w-0">
                <span className="block text-xs font-medium text-black/40">
                  {row.label}
                </span>

                <span className="mt-0.5 block truncate text-[17px] font-semibold tracking-[-0.01em]">
                  {getZoneLabel(row.value)}
                </span>
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onSwap}
          aria-label="Swap pickup and destination"
          className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white transition hover:border-black hover:bg-black hover:text-[#C6FF2E]"
        >
          <ArrowDownUp size={16} />
        </button>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold">
          {activeField === "pickup"
            ? "Choose pickup area"
            : "Choose destination area"}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {locations.map((location) => {
            const selected = location.value === selectedValue;

            const taken = location.value === otherValue;

            return (
              <button
                key={location.value}
                type="button"
                onClick={() => onSelect(location.value)}
                disabled={taken}
                aria-pressed={selected}
                className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition ${
                  selected
                    ? "border-black bg-black text-white"
                    : taken
                      ? "cursor-not-allowed border-black/5 bg-black/[0.03] text-black/25"
                      : "border-black/15 bg-white text-black/70 hover:border-black hover:text-black"
                }`}
              >
                {selected && (
                  <Check size={14} strokeWidth={3} className="text-[#C6FF2E]" />
                )}

                {location.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CurrentRide({
  ride,
  cancelling,
  cancelError,
  paymentLoading,
  paymentError,
  onCancel,
  onPaymentDone,
}: {
  ride: Ride;
  cancelling: boolean;
  cancelError: string;
  paymentLoading: boolean;
  paymentError: string;
  onCancel: () => void;
  onPaymentDone: () => void;
}) {
  const canCancel = ride.status === "REQUESTED";

  const completed = ride.status === "COMPLETED";

  const passengerPaid = Boolean(ride.passengerPaid);

  const driverReceived = Boolean(ride.driverReceived);

  return (
    <div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C6FF2E]">
        <CheckCircle2 size={22} />
      </div>

      <p className="mt-7 text-sm font-semibold text-black/40">Current ride</p>

      <h2 className="mt-1 text-[28px] font-semibold tracking-[-0.03em]">
        {getRideTitle(ride.status)}
      </h2>

      <div className="mt-8 flex gap-4">
        <div className="flex flex-col items-center pt-1.5">
          <span className="h-3 w-3 rounded-full border-[3px] border-black bg-white" />

          <span className="my-1 h-10 border-l border-dashed border-black/25" />

          <span className="h-3 w-3 bg-black" />
        </div>

        <div className="flex flex-col justify-between gap-5">
          <div>
            <p className="text-xs text-black/40">Pickup</p>

            <p className="mt-0.5 text-lg font-semibold">
              {getZoneLabel(ride.pickup)}
            </p>
          </div>

          <div>
            <p className="text-xs text-black/40">Destination</p>

            <p className="mt-0.5 text-lg font-semibold">
              {getZoneLabel(ride.destination)}
            </p>
          </div>
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

      {completed && (
        <div className="mt-6 border-t border-black/10 pt-6">
          <div className="flex items-center gap-2">
            <Banknote size={19} />

            <h3 className="font-semibold">Cash payment</h3>
          </div>

          <p className="mt-2 text-sm leading-6 text-black/50">
            Fare:{" "}
            <span className="font-semibold text-black">
              ৳{(ride.estimatedFarePoisha / 100).toFixed(0)}
            </span>
          </p>

          {ride.paymentStatus === "COMPLETED" ? (
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-[#C6FF2E]/20 p-4">
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

              <div>
                <p className="text-sm font-semibold">Payment completed</p>

                <p className="mt-1 text-xs text-black/50">
                  You and the driver both confirmed the cash payment.
                </p>
              </div>
            </div>
          ) : passengerPaid ? (
            <div className="mt-4 rounded-xl border border-black/10 bg-black/[0.025] p-4">
              <p className="text-sm font-semibold">Payment confirmed by you</p>

              <p className="mt-1 text-xs leading-5 text-black/50">
                Waiting for the driver to confirm cash received.
              </p>
            </div>
          ) : (
            <>
              <p className="mt-3 text-sm leading-6 text-black/50">
                Pay the driver in cash, then confirm below.
                {driverReceived &&
                  " The driver has already confirmed receiving the cash."}
              </p>

              {paymentError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {paymentError}
                </div>
              )}

              <button
                type="button"
                onClick={onPaymentDone}
                disabled={paymentLoading}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black text-sm font-bold text-white transition hover:bg-[#C6FF2E] hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {paymentLoading ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    Payment done
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function RideProgress({ ride }: { ride: Ride }) {
  const currentIndex = rideSteps.findIndex(
    (step) => step.status === ride.status,
  );

  const vehicle = ride.poolMember?.pool?.vehicle;

  return (
    <section className="min-h-[620px] overflow-hidden rounded-3xl border border-black/10 bg-white">
      <div className="border-b border-black/10 bg-black p-7 text-white">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white/40">
              Live ride status
            </p>

            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.04em]">
              {getRideTitle(ride.status)}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/55">
              <span>{getZoneLabel(ride.pickup)}</span>

              <ArrowRight size={14} />

              <span>{getZoneLabel(ride.destination)}</span>
            </div>
          </div>

          <div className="rounded-full bg-[#C6FF2E] px-4 py-2 text-sm font-bold text-black">
            {formatStatus(ride.status)}
          </div>
        </div>
      </div>

      <div className="grid gap-10 p-7 md:grid-cols-[1fr_260px] md:p-10">
        <div>
          <p className="text-sm font-semibold text-black/40">
            Journey progress
          </p>

          <div className="mt-8">
            {rideSteps.map((step, index) => {
              const done = index < currentIndex;

              const current = index === currentIndex;

              const completedRide = ride.status === "COMPLETED";

              const stepDone =
                done || (completedRide && step.status === "COMPLETED");

              return (
                <div
                  key={step.status}
                  className="relative flex gap-5 pb-9 last:pb-0"
                >
                  {index !== rideSteps.length - 1 && (
                    <div
                      className={`absolute left-[17px] top-9 h-[calc(100%-20px)] w-[2px] ${
                        stepDone ? "bg-[#C6FF2E]" : "bg-black/10"
                      }`}
                    />
                  )}

                  <div
                    className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
                      stepDone
                        ? "border-[#C6FF2E] bg-[#C6FF2E] text-black"
                        : current
                          ? "border-black bg-black text-[#C6FF2E]"
                          : "border-black/10 bg-white text-black/25"
                    }`}
                  >
                    {stepDone ? (
                      <Check size={17} strokeWidth={3} />
                    ) : current ? (
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#C6FF2E]" />
                    ) : (
                      <Circle size={11} />
                    )}
                  </div>

                  <div className="pt-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <p
                        className={`font-semibold ${
                          !stepDone && !current ? "text-black/35" : "text-black"
                        }`}
                      >
                        {step.title}
                      </p>

                      {current && (
                        <span className="rounded-full bg-black px-2.5 py-1 text-[11px] font-bold text-[#C6FF2E]">
                          Current
                        </span>
                      )}
                    </div>

                    <p
                      className={`mt-1 max-w-lg text-sm leading-6 ${
                        !stepDone && !current
                          ? "text-black/25"
                          : "text-black/45"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside>
          <div className="rounded-2xl border border-black/10 bg-black/[0.025] p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-[#C6FF2E]">
              <Route size={18} />
            </div>

            <p className="mt-5 text-xs text-black/40">Route</p>

            <div className="mt-3 flex gap-3">
              <MapPin size={17} className="mt-0.5 shrink-0" />

              <div>
                <p className="text-sm font-semibold">
                  {getZoneLabel(ride.pickup)}
                </p>

                <div className="my-3 h-6 border-l border-dashed border-black/20" />

                <p className="text-sm font-semibold">
                  {getZoneLabel(ride.destination)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-black/10 p-5">
            <div className="flex items-center gap-2">
              <Car size={17} />

              <p className="text-xs text-black/40">Tesla</p>
            </div>

            <p className="mt-3 font-semibold">
              {vehicle?.name ?? "Waiting for driver"}
            </p>

            {vehicle?.plateNumber && (
              <p className="mt-1 text-sm text-black/40">
                {vehicle.plateNumber}
              </p>
            )}

            {vehicle?.driver?.name && (
              <>
                <div className="my-4 border-t border-black/10" />

                <p className="text-xs text-black/40">Driver</p>

                <p className="mt-1 text-sm font-semibold">
                  {vehicle.driver.name}
                </p>
              </>
            )}
          </div>

          <div className="mt-4 rounded-2xl bg-[#C6FF2E] p-5">
            <p className="text-xs font-semibold text-black/50">Fare</p>

            <p className="mt-2 text-[28px] font-semibold tracking-[-0.04em]">
              ৳{(ride.estimatedFarePoisha / 100).toFixed(0)}
            </p>

            <p className="mt-1 text-xs text-black/55">
              Cash after ride completion
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
