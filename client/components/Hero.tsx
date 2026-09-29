"use client";

import Image from "next/image";
import Link from "next/link";

import { ArrowRight, Check } from "lucide-react";

export default function Hero() {
  return (
    <section className="overflow-hidden bg-[#F8F8FA] text-black">
      <div className="mx-auto max-w-[1540px] px-6 py-12 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
          {/* LEFT */}

          <div className="max-w-[650px]">
            <div className="flex items-center gap-3">
              <span className="h-[3px] w-10 bg-[#C6FF2E]" />

              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-black/45">
                Dhaka Tesla Pool
              </p>
            </div>

            <h1 className="mt-6 text-[52px] font-black leading-[0.92] tracking-[-0.065em] sm:text-[66px] lg:text-[76px] xl:text-[84px]">
              Ride together.
              <br />
              <span className="text-[#A8E600]">Pay your share.</span>
            </h1>

            <p className="mt-7 max-w-[570px] text-[17px] leading-8 text-black/55 sm:text-[18px]">
              Match with passengers travelling in the same direction, share one
              Tesla across Dhaka, and pay your own fare.
            </p>

            {/* CTA */}

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/passenger"
                className="group flex h-[58px] items-center gap-8 bg-black px-7 text-[16px] font-bold text-white transition hover:bg-[#C6FF2E] hover:text-black"
              >
                Find a pool
                <ArrowRight
                  size={19}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/#how-it-works"
                className="flex h-[58px] items-center border border-black/15 px-7 text-[16px] font-bold transition  hover:bg-[#C6FF2E]"
              >
                How it works
              </Link>
            </div>

            {/* PRODUCT FACTS */}

            <div className="mt-12 max-w-[610px] border-y border-black/10">
              <div className="grid sm:grid-cols-3">
                <HeroFact title="3 seats" description="Fixed Tesla capacity" />

                <HeroFact title="Own fare" description="Individual ride fare" />

                <HeroFact title="Cash" description="Simple payment flow" />
              </div>
            </div>

            <div className="mt-7 flex items-center gap-3 text-sm text-black/45">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-black text-[#C6FF2E]">
                <Check size={14} strokeWidth={3} />
              </span>

              <p>
                Same direction. Shared ride. Clear status from request to
                completion.
              </p>
            </div>
          </div>

          {/* RIGHT IMAGE */}

          <div className="relative">
            {/* offset frame */}

            <div className="absolute -bottom-3 -right-3 hidden h-full w-full bg-black lg:block" />

            <div className="relative overflow-hidden border-t-[8px] border-[#C6FF2E] bg-white">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src="/hero-rickshaw.png"
                  alt="Two passengers sharing a Dhaka Tesla Pool rickshaw"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col gap-5 border-t border-black/10 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/35">
                    Shared rides in Dhaka
                  </p>

                  <p className="mt-1 text-lg font-bold tracking-[-0.025em]">
                    Going the same way? Ride together.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 bg-[#C6FF2E]" />

                  <span className="text-sm font-semibold text-black/50">
                    Tesla Pool
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroFact({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-black/10 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0">
      <p className="text-[17px] font-bold tracking-[-0.025em]">{title}</p>

      <p className="mt-1 text-xs leading-5 text-black/40">{description}</p>
    </div>
  );
}
