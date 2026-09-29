"use client";

import {
  ArrowRight,
  CalendarDays,
  Car,
  CircleCheck,
  CircleX,
  ReceiptText,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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

type RideHistoryItem = {
  id: string;

  pickup: DhakaZone;

  destination: DhakaZone;

  seats: number;

  estimatedFarePoisha: number;

  status: RideStatus;

  paymentStatus: PaymentStatus;

  passengerPaid: boolean;

  driverReceived: boolean;

  createdAt: string;

  updatedAt: string;

  poolMember: {
    finalFarePoisha: number | null;

    pool: {
      vehicle: {
        name: string;
        plateNumber: string;

        driver: {
          name: string;
        };
      } | null;
    };
  } | null;
};

type HistoryResponse = {
  success: boolean;

  data: RideHistoryItem[];
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

export default function ActivityPage() {
  const [rides, setRides] = useState<RideHistoryItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await api<HistoryResponse>("/rides/history");

        setRides(response.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not load ride activity.",
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
        <div className="flex flex-col gap-6 border-b border-black/10 pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-black/40">
              Passenger
            </p>

            <h1 className="mt-3 text-[42px] font-semibold tracking-[-0.05em]">
              Activity
            </h1>

            <p className="mt-3 max-w-xl text-black/50">
              Review your completed and cancelled Tesla pool rides.
            </p>
          </div>

          <Link
            href="/passenger"
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-bold text-white transition hover:bg-[#C6FF2E] hover:text-black"
          >
            Book a ride
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading && (
          <div className="py-24 text-center text-sm text-black/40">
            Loading activity...
          </div>
        )}

        {error && !loading && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && rides.length === 0 && <EmptyState />}

        {!loading && !error && rides.length > 0 && (
          <div className="mt-8 space-y-4">
            {rides.map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function RideCard({ ride }: { ride: RideHistoryItem }) {
  const completed = ride.status === "COMPLETED";

  const fare = ride.poolMember?.finalFarePoisha ?? ride.estimatedFarePoisha;

  const vehicle = ride.poolMember?.pool.vehicle;

  return (
    <article className="overflow-hidden rounded-2xl border border-black/10 bg-white">
      <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
              completed ? "bg-[#C6FF2E]" : "bg-black/[0.06]"
            }`}
          >
            {completed ? <CircleCheck size={21} /> : <CircleX size={21} />}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold">
                {zoneLabels[ride.pickup]}
                {" → "}
                {zoneLabels[ride.destination]}
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${
                  completed ? "bg-[#C6FF2E] text-black" : "bg-black text-white"
                }`}
              >
                {ride.status}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm text-black/45">
              <CalendarDays size={15} />

              {formatDate(ride.createdAt)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 lg:justify-end">
          <div>
            <p className="text-xs text-black/40">Fare</p>

            <p className="mt-1 text-xl font-semibold">{formatFare(fare)}</p>
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

      <div className="grid border-t border-black/10 bg-black/[0.015] md:grid-cols-3">
        <Detail
          icon={<ReceiptText size={16} />}
          label="Payment"
          value={
            ride.status === "CANCELLED"
              ? "Not applicable"
              : ride.paymentStatus === "COMPLETED"
                ? "Cash completed"
                : "Cash pending"
          }
        />

        <Detail
          icon={<Car size={16} />}
          label="Tesla"
          value={vehicle?.name ?? "Not assigned"}
        />

        <Detail
          icon={<Users size={16} />}
          label="Driver"
          value={vehicle?.driver.name ?? "Not assigned"}
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
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-black/10 p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="flex items-center gap-2 text-black/40">
        {icon}

        <p className="text-xs">{label}</p>
      </div>

      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-8 flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black">
        <ReceiptText size={22} className="text-[#C6FF2E]" />
      </div>

      <h2 className="mt-6 text-xl font-semibold">No ride activity yet</h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-black/45">
        Completed and cancelled rides will appear here.
      </p>

      <Link
        href="/passenger"
        className="mt-6 flex items-center gap-2 text-sm font-bold"
      >
        Request your first ride
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
