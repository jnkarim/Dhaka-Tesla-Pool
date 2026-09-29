"use client";

import {
  ArrowRight,
  Car,
  CheckCircle2,
  CircleDollarSign,
  LoaderCircle,
  LogOut,
  ReceiptText,
  Route,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";

type RideStatus =
  | "REQUESTED"
  | "MATCHED"
  | "DRIVER_ARRIVED"
  | "STARTED"
  | "COMPLETED"
  | "CANCELLED";

type PaymentStatus = "PENDING" | "COMPLETED";

type Transaction = {
  id: string;

  poolId: string | null;

  pickup: string;
  destination: string;

  seats: number;

  estimatedFarePoisha: number;
  farePoisha: number;

  status: RideStatus;

  paymentStatus: PaymentStatus;

  passengerPaid: boolean;
  driverReceived: boolean;

  passenger: {
    id: string;
    name: string;
    email: string;
  };

  driver: {
    id: string;
    name: string;
    email: string;
  } | null;

  vehicle: {
    id: string;
    name: string;
    plateNumber: string;
  } | null;

  createdAt: string;
  updatedAt: string;
};

type TransactionsResponse = {
  success: boolean;
  data: Transaction[];
};

function formatZone(zone: string) {
  return zone
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatFare(poisha: number) {
  return `৳${(poisha / 100).toFixed(0)}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getPaymentLabel(transaction: Transaction) {
  if (transaction.status === "CANCELLED") {
    return "Not applicable";
  }

  if (transaction.paymentStatus === "COMPLETED") {
    return "Cash completed";
  }

  if (transaction.passengerPaid && !transaction.driverReceived) {
    return "Waiting for driver";
  }

  if (!transaction.passengerPaid && transaction.driverReceived) {
    return "Waiting for passenger";
  }

  return "Cash pending";
}

export default function AdminPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadTransactions() {
      try {
        const response = await api<TransactionsResponse>("/admin/transactions");

        setTransactions(response.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not load admin transactions.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, []);

  const completedCount = useMemo(
    () =>
      transactions.filter((transaction) => transaction.status === "COMPLETED")
        .length,
    [transactions],
  );

  const paymentCompletedCount = useMemo(
    () =>
      transactions.filter(
        (transaction) => transaction.paymentStatus === "COMPLETED",
      ).length,
    [transactions],
  );

  const totalCompletedFare = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.paymentStatus === "COMPLETED")
        .reduce((total, transaction) => total + transaction.farePoisha, 0),
    [transactions],
  );

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);

      await api("/auth/logout", {
        method: "POST",
      });

      window.location.replace("/login");
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F8FA] text-black">
      {/* Admin header */}
      <header className="border-b border-black/10 bg-black text-white">
        <div className="mx-auto flex min-h-[92px] max-w-[1540px] items-center justify-between px-6 lg:px-10">
          <Link
            href="/admin"
            className="text-[23px] font-black tracking-[-0.05em]"
          >
            Dhaka
            <span className="text-[#C6FF2E]">Tesla</span>
            Pool
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 text-sm font-semibold text-white/50 sm:flex">
              <ShieldCheck size={17} className="text-[#C6FF2E]" />
              Admin
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-bold transition hover:bg-[#C6FF2E] hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <LogOut size={17} />
              )}
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1540px] px-6 py-12 lg:px-10">
        {/* Heading */}
        <div className="flex flex-col gap-6 border-b border-black/10 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-black/40" />

              <p className="text-xs font-black uppercase tracking-[0.2em] text-black/40">
                Administration
              </p>
            </div>

            <h1 className="mt-3 text-[42px] font-semibold tracking-[-0.05em] sm:text-[52px]">
              Ride transactions
            </h1>

            <p className="mt-3 max-w-2xl text-black/50">
              Review rides, passengers, drivers, fares and cash payment status
              across Dhaka Tesla Pool.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-[#C6FF2E] px-5 py-3 text-sm font-bold">
            <ReceiptText size={17} />
            {transactions.length} transactions
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm font-semibold text-black/40">
              <LoaderCircle size={20} className="animate-spin" />
              Loading transactions...
            </div>
          </div>
        )}

        {/* Error / unauthorized */}
        {!loading && error && (
          <div className="mt-10 flex min-h-[360px] flex-col items-center justify-center rounded-[24px] border border-black/10 bg-white px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black">
              <ShieldCheck size={23} className="text-[#C6FF2E]" />
            </div>

            <h2 className="mt-6 text-2xl font-semibold">
              Admin access required
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-black/45">
              Sign in using the configured administrator account to access ride
              transactions.
            </p>

            <Link
              href="/login"
              className="mt-7 flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-[#C6FF2E] hover:text-black"
            >
              Go to login
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Summary */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                icon={<ReceiptText size={20} />}
                label="Total rides"
                value={String(transactions.length)}
              />

              <SummaryCard
                icon={<CheckCircle2 size={20} />}
                label="Completed rides"
                value={String(completedCount)}
              />

              <SummaryCard
                icon={<CircleDollarSign size={20} />}
                label="Cash completed"
                value={String(paymentCompletedCount)}
              />

              <SummaryCard
                icon={<CircleDollarSign size={20} />}
                label="Collected fare"
                value={formatFare(totalCompletedFare)}
                accent
              />
            </div>

            {/* Empty */}
            {transactions.length === 0 ? (
              <div className="mt-8 flex min-h-[360px] flex-col items-center justify-center rounded-[24px] border border-dashed border-black/15 bg-white px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black">
                  <ReceiptText size={22} className="text-[#C6FF2E]" />
                </div>

                <h2 className="mt-6 text-xl font-semibold">
                  No transactions yet
                </h2>

                <p className="mt-2 text-sm text-black/45">
                  Ride activity will appear here.
                </p>
              </div>
            ) : (
              <TransactionTable transactions={transactions} />
            )}
          </>
        )}
      </div>
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[22px] border p-6 ${
        accent ? "border-[#C6FF2E] bg-[#C6FF2E]" : "border-black/10 bg-white"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          accent ? "bg-black text-[#C6FF2E]" : "bg-black/[0.05] text-black"
        }`}
      >
        {icon}
      </div>

      <p
        className={`mt-5 text-xs font-bold uppercase tracking-[0.12em] ${
          accent ? "text-black/55" : "text-black/40"
        }`}
      >
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{value}</p>
    </div>
  );
}

function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="mt-8 overflow-hidden rounded-[24px] border border-black/10 bg-white">
      {/* Desktop */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1200px] border-collapse">
          <thead className="bg-black text-left text-white">
            <tr>
              <TableHead>Ride</TableHead>
              <TableHead>Passenger</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Fare</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
            </tr>
          </thead>

          <tbody>
            {transactions.map((transaction, index) => (
              <tr
                key={transaction.id}
                className="border-b border-black/[0.07] last:border-b-0"
              >
                <TableCell>
                  <div>
                    <p className="font-bold">#{index + 1}</p>

                    <p className="mt-1 font-mono text-[11px] text-black/35">
                      {transaction.id.slice(0, 8)}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/[0.05]">
                      <UserRound size={15} />
                    </div>

                    <div>
                      <p className="font-semibold">
                        {transaction.passenger.name}
                      </p>

                      <p className="mt-1 text-xs text-black/40">
                        {transaction.passenger.email}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  {transaction.driver ? (
                    <div>
                      <p className="font-semibold">{transaction.driver.name}</p>

                      <p className="mt-1 text-xs text-black/40">
                        {transaction.vehicle?.name ?? "Tesla"}
                      </p>
                    </div>
                  ) : (
                    <span className="text-black/35">Not assigned</span>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2 font-semibold">
                    <Route size={15} className="shrink-0 text-black/35" />

                    {formatZone(transaction.pickup)}
                    <span className="text-black/30">→</span>
                    {formatZone(transaction.destination)}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users size={15} />
                    {transaction.seats}
                  </div>
                </TableCell>

                <TableCell>
                  <span className="font-bold">
                    {formatFare(transaction.farePoisha)}
                  </span>
                </TableCell>

                <TableCell>
                  <RideStatusBadge status={transaction.status} />
                </TableCell>

                <TableCell>
                  <PaymentBadge transaction={transaction} />
                </TableCell>

                <TableCell>
                  <span className="whitespace-nowrap text-black/50">
                    {formatDate(transaction.createdAt)}
                  </span>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet */}
      <div className="divide-y divide-black/10 lg:hidden">
        {transactions.map((transaction, index) => (
          <div key={transaction.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-black/35">
                  RIDE #{index + 1}
                </p>

                <h3 className="mt-2 font-semibold">
                  {formatZone(transaction.pickup)}
                  {" → "}
                  {formatZone(transaction.destination)}
                </h3>
              </div>

              <RideStatusBadge status={transaction.status} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <MobileDetail
                label="Passenger"
                value={transaction.passenger.name}
              />

              <MobileDetail
                label="Driver"
                value={transaction.driver?.name ?? "Not assigned"}
              />

              <MobileDetail label="Seats" value={String(transaction.seats)} />

              <MobileDetail
                label="Fare"
                value={formatFare(transaction.farePoisha)}
              />

              <MobileDetail
                label="Payment"
                value={getPaymentLabel(transaction)}
              />

              <MobileDetail
                label="Date"
                value={formatDate(transaction.createdAt)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-[0.1em] text-white/55">
      {children}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="px-5 py-5 text-sm">{children}</td>;
}

function RideStatusBadge({ status }: { status: RideStatus }) {
  const completed = status === "COMPLETED";
  const cancelled = status === "CANCELLED";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] ${
        completed
          ? "bg-[#C6FF2E] text-black"
          : cancelled
            ? "bg-black text-white"
            : "bg-black/[0.06] text-black"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

function PaymentBadge({ transaction }: { transaction: Transaction }) {
  const completed = transaction.paymentStatus === "COMPLETED";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-black ${
        completed ? "bg-[#C6FF2E] text-black" : "bg-black/[0.06] text-black/60"
      }`}
    >
      {getPaymentLabel(transaction)}
    </span>
  );
}

function MobileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-black/35">{label}</p>

      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
