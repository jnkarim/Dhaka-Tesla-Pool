"use client";

import {
  ArrowRight,
  CalendarDays,
  CircleCheck,
  CircleX,
  ReceiptText,
  Route,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { api } from "@/lib/api";

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

type RideStatus = "COMPLETED" | "CANCELLED";

type PaymentStatus = "PENDING" | "COMPLETED";

type DriverHistoryItem = {
  id: string;

  poolId: string;

  pickup: DhakaZone;
  destination: DhakaZone;

  seats: number;

  estimatedFarePoisha: number;
  finalFarePoisha: number;

  status: RideStatus;

  paymentStatus: PaymentStatus;

  passengerPaid: boolean;
  driverReceived: boolean;

  passenger: {
    id: string;
    name: string;
    email: string;
  };

  createdAt: string;
  updatedAt: string;
};

type HistoryResponse = {
  success: boolean;
  data: DriverHistoryItem[];
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

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatFare(poisha: number) {
  return `৳${(poisha / 100).toFixed(0)}`;
}

function getPaymentLabel(ride: DriverHistoryItem) {
  if (ride.status === "CANCELLED") {
    return "Not applicable";
  }

  if (ride.paymentStatus === "COMPLETED") {
    return "Cash completed";
  }

  if (ride.passengerPaid && !ride.driverReceived) {
    return "Waiting for driver confirmation";
  }

  if (!ride.passengerPaid && ride.driverReceived) {
    return "Waiting for passenger";
  }

  return "Cash pending";
}

export default function DriverActivityPage() {
  const [rides, setRides] = useState<DriverHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await api<HistoryResponse>("/drivers/history");

        setRides(response.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not load driver activity.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  return (
    <main className="min-h-screen bg-[#F8F8FA] px-6 py-12 text-black lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="flex flex-col gap-6 border-b border-black/10 pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-black/40">
              Driver
            </p>

            <h1 className="mt-3 text-[42px] font-semibold tracking-[-0.05em]">
              Activity
            </h1>

            <p className="mt-3 max-w-xl text-black/50">
              Review completed and cancelled rides from your Tesla pools.
            </p>
          </div>

          <Link
            href="/driver"
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-bold text-white transition hover:bg-[#C6FF2E] hover:text-black"
          >
            Driver dashboard
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-24 text-center text-sm text-black/40">
            Loading activity...
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && rides.length === 0 && <EmptyState />}

        {/* History */}
        {!loading && !error && rides.length > 0 && (
          <div className="mt-8 space-y-4">
            {rides.map((ride, index) => (
              <RideCard key={ride.id} ride={ride} number={index + 1} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function RideCard({
  ride,
  number,
}: {
  ride: DriverHistoryItem;
  number: number;
}) {
  const completed = ride.status === "COMPLETED";

  return (
    <article className="overflow-hidden rounded-2xl border border-black/10 bg-white">
      {/* Top */}
      <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 gap-4">
          {/* Status icon */}
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
              completed ? "bg-[#C6FF2E]" : "bg-black/[0.06]"
            }`}
          >
            {completed ? (
              <CircleCheck size={21} />
            ) : (
              <CircleX size={21} className="text-red-600" />
            )}
          </div>

          <div className="min-w-0">
            {/* Route */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-black/35">
                  {number}.
                </span>

                <h2 className="text-lg font-semibold">
                  {zoneLabels[ride.pickup]}
                  {" → "}
                  {zoneLabels[ride.destination]}
                </h2>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${
                  completed ? "bg-[#C6FF2E] text-black" : "bg-black text-white"
                }`}
              >
                {ride.status}
              </span>
            </div>

            {/* Date */}
            <div className="mt-2 flex items-center gap-2 text-sm text-black/45">
              <CalendarDays size={15} />

              {formatDate(ride.createdAt)}
            </div>
          </div>
        </div>

        {/* Fare + seats */}
        <div className="flex items-center gap-8 lg:justify-end">
          <div>
            <p className="text-xs text-black/40">Fare</p>

            <p className="mt-1 text-xl font-semibold">
              {formatFare(ride.finalFarePoisha)}
            </p>
          </div>

          <div>
            <p className="text-xs text-black/40">Seats</p>

            <div className="mt-1 flex items-center gap-2 font-semibold">
              <Users size={16} />

              {ride.seats}
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid border-t border-black/10 bg-black/[0.015] md:grid-cols-4">
        <Detail
          icon={<UserRound size={16} />}
          label="Passenger"
          value={ride.passenger.name}
        />

        <Detail
          icon={<ReceiptText size={16} />}
          label="Payment"
          value={getPaymentLabel(ride)}
        />

        <Detail
          icon={<Route size={16} />}
          label="Pool"
          value={`#${ride.poolId.slice(0, 8)}`}
        />

        <Detail
          icon={<CircleCheck size={16} />}
          label="Cash received"
          value={
            ride.status === "CANCELLED"
              ? "Not applicable"
              : ride.driverReceived
                ? "Confirmed"
                : "Pending"
          }
        />
      </div>
    </article>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-black/10 p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="flex items-center gap-2 text-black/40">
        {icon}

        <p className="text-xs">{label}</p>
      </div>

      <p className="mt-2 break-words text-sm font-semibold">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-8 flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black">
        <ReceiptText size={22} className="text-[#C6FF2E]" />
      </div>

      <h2 className="mt-6 text-xl font-semibold">No driver activity yet</h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-black/45">
        Completed and cancelled rides from your accepted Tesla pools will appear
        here.
      </p>

      <Link
        href="/driver"
        className="mt-6 flex items-center gap-2 text-sm font-bold"
      >
        Back to driver dashboard
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
