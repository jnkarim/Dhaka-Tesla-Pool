import Image from "next/image";
import Link from "next/link";

import {
  ArrowUpRight,
  CircleDollarSign,
  Navigation,
  Route,
  Users,
  Zap,
} from "lucide-react";

export default function FeatureSection() {
  return (
    <section
      id="features"
      className="bg-[#0B0B0F] px-6 py-20 text-white lg:px-10"
    >
      <div className="mx-auto max-w-[1540px]">
        {/* Header */}
        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#C6FF2E]">
            Built for shared rides
          </p>

          <h2 className="max-w-[720px] text-[38px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[48px]">
            Everything you need
            <br />
            to move across Dhaka.
          </h2>
        </div>

        {/* Passenger + Driver Cards */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* PASSENGER */}
          <article className="group relative min-h-[330px] overflow-hidden rounded-[26px] bg-[#F8F8FA] text-black transition-transform duration-300 hover:-translate-y-1">
            {/* Passenger image */}
            <div className="absolute inset-y-0 right-0 w-[52%]">
              <Image
                src="/passenger.png"
                alt="Passenger using Dhaka Tesla Pool"
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Image blending */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F8F8FA] from-[44%] via-[#F8F8FA]/95 via-[53%] to-transparent to-[75%]" />

            {/* Subtle lime glow */}
            <div className="absolute -left-14 -top-16 h-52 w-52 rounded-full bg-[#C6FF2E]/20 blur-3xl" />

            {/* Content */}
            <div className="relative z-10 flex min-h-[330px] max-w-[62%] flex-col justify-between p-8">
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#C6FF2E]">
                  <Users size={22} strokeWidth={2.3} />
                </div>

                <h3 className="text-[30px] font-black tracking-[-0.035em]">
                  For passengers
                </h3>

                <p className="mt-3 max-w-[410px] text-[15px] leading-6 text-black/55">
                  Choose your pickup, destination and seats, then find a
                  compatible Tesla pool going your way.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-2.5">
                <span className="rounded-full bg-black/[0.06] px-4 py-2 text-sm font-semibold">
                  Request ride
                </span>

                <span className="rounded-full bg-black/[0.06] px-4 py-2 text-sm font-semibold">
                  Fare estimate
                </span>

                <span className="rounded-full bg-black/[0.06] px-4 py-2 text-sm font-semibold">
                  Ride status
                </span>

                <Link
                  href="/register"
                  aria-label="Register as passenger"
                  className="ml-1 flex h-11 w-11 items-center justify-center rounded-full bg-black text-white transition-all duration-200 hover:bg-[#C6FF2E] hover:text-black"
                >
                  <ArrowUpRight size={20} />
                </Link>
              </div>
            </div>
          </article>

          {/* DRIVER */}
          <article className="group relative min-h-[330px] overflow-hidden rounded-[26px] bg-[#F8F8FA] text-black transition-transform duration-300 hover:-translate-y-1">
            {/* Driver image */}
            <div className="absolute inset-y-0 right-0 w-[52%]">
              <Image
                src="/driver.png"
                alt="Driver using Dhaka Tesla Pool"
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Image blending */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F8F8FA] from-[44%] via-[#F8F8FA]/95 via-[53%] to-transparent to-[75%]" />

            {/* Subtle lime glow */}
            <div className="absolute -left-14 -top-16 h-52 w-52 rounded-full bg-[#C6FF2E]/12 blur-3xl" />

            {/* Content */}
            <div className="relative z-10 flex min-h-[330px] max-w-[62%] flex-col justify-between p-8">
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-black text-[#C6FF2E]">
                  <Navigation
                    size={22}
                    strokeWidth={2.3}
                    fill="currentColor"
                  />
                </div>

                <h3 className="text-[30px] font-black tracking-[-0.035em]">
                  For drivers
                </h3>

                <p className="mt-3 max-w-[410px] text-[15px] leading-6 text-black/55">
                  Go online, review available pools, accept passengers and
                  manage the trip lifecycle.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-2.5">
                <span className="rounded-full bg-black/[0.06] px-4 py-2 text-sm font-semibold">
                  Go online
                </span>

                <span className="rounded-full bg-black/[0.06] px-4 py-2 text-sm font-semibold">
                  Accept pool
                </span>

                <span className="rounded-full bg-black/[0.06] px-4 py-2 text-sm font-semibold">
                  Manage trip
                </span>

                <Link
                  href="/register?role=driver"
                  aria-label="Register as driver"
                  className="ml-1 flex h-11 w-11 items-center justify-center rounded-full bg-black text-white transition-all duration-200 hover:bg-[#C6FF2E] hover:text-black"
                >
                  <ArrowUpRight size={20} />
                </Link>
              </div>
            </div>
          </article>
        </div>

        {/* SHARED POOLING */}
        <div className="mt-16 flex flex-col gap-6 rounded-[24px] bg-[#C6FF2E] px-8 py-7 text-black lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[560px]">
            <div className="mb-3 flex items-center gap-3">
              <Route size={22} />

              <span className="text-xs font-black uppercase tracking-[0.15em]">
                Shared pooling
              </span>
            </div>

            <h3 className="text-[29px] font-black leading-tight tracking-[-0.035em]">
              Same direction. One Tesla.
            </h3>

            <p className="mt-2 text-[15px] leading-6 text-black/60">
              Compatible passengers share a Tesla without exceeding its
              three-seat capacity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <div className="flex items-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-bold text-white">
              <Route size={17} />
              Route matching
            </div>

            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-bold">
              <Users size={17} />
              3 seats max
            </div>

            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-bold">
              <CircleDollarSign size={17} />
              Individual fare
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}