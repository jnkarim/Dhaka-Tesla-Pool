"use client";

import { useState } from "react";
import Link from "next/link";

import { ArrowRight, Clock3, MapPin, Users } from "lucide-react";

import LocationSelect from "./LocationSelect";
import PremiumMapPreview from "./PremiumMapPreview";

const dhakaZones = [
  "KHILGAON",
  "BANANI",
  "GULSHAN_1",
  "GULSHAN_2",
  "MOHAKHALI",
  "FARMGATE",
  "DHANMONDI",
  "MIRPUR",
  "UTTARA",
  "BASHUNDHARA",
];

export default function Hero() {
  const [pickup, setPickup] = useState("BANANI");
  const [destination, setDestination] = useState("MOHAKHALI");
  const [seats, setSeats] = useState(1);

  function increaseSeats() {
    if (seats < 3) {
      setSeats((current) => current + 1);
    }
  }

  function decreaseSeats() {
    if (seats > 1) {
      setSeats((current) => current - 1);
    }
  }

  return (
    <section className="bg-[#F8F8FA] text-[#0B0B0F]">
      <div
        className="
          mx-auto
          grid
          min-h-[680px]
          max-w-[1540px]
          grid-cols-1
          items-center
          gap-16
          px-6
          py-16
          lg:grid-cols-[0.9fr_1.1fr]
          lg:px-10
          lg:py-20
        "
      >
        {/* LEFT SIDE */}

        <div className="mx-auto w-full max-w-[610px] lg:mx-0">

          {/* Heading */}

          <h1
            className="
              max-w-[590px]
              text-[52px]
              font-black
              leading-[0.98]
              tracking-[-0.055em]
              sm:text-[64px]
              lg:text-[72px]
            "
          >
            Share the ride.
            <br />
            <span className="text-[#C6FF2E]">Move smarter.</span>
          </h1>

          {/* Description */}

          <p
            className="
              mt-7
              max-w-[540px]
              text-[18px]
              leading-8
              text-black/60
            "
          >
            Find passengers travelling in the same direction and share a Tesla
            across Dhaka.
          </p>

          {/* Ride timing */}

          <button
            type="button"
            className="
              mt-8
              flex
              items-center
              gap-3
              rounded-full
              bg-black/[0.06]
              px-5
              py-3
              text-[16px]
              font-semibold
              transition
              hover:bg-black/10
            "
          >
            <Clock3 size={20} />
            Ride now
          </button>

          {/* SEARCH FORM */}

          <div className="mt-7 w-full max-w-[520px]">
            {/* Location selectors */}

            <div className="space-y-3">
              <LocationSelect
                label="Pickup"
                value={pickup}
                locations={dhakaZones}
                onChange={setPickup}
                variant="pickup"
              />

              <LocationSelect
                label="Destination"
                value={destination}
                locations={dhakaZones}
                onChange={setDestination}
                variant="destination"
              />
            </div>

            {/* Seats */}

            <div
              className="
                mt-5
                flex
                items-center
                justify-between
                border-b
                border-black/10
                pb-5
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    bg-black/[0.06]
                  "
                >
                  <Users size={20} />
                </div>

                <div>
                  <p className="font-semibold">Seats</p>

                  <p className="text-xs text-black/45">Tesla has 3 seats</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={decreaseSeats}
                  disabled={seats === 1}
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-black/[0.06]
                    text-xl
                    font-medium
                    transition
                    hover:bg-black/10
                    disabled:cursor-not-allowed
                    disabled:opacity-30
                  "
                >
                  −
                </button>

                <span
                  className="
                    min-w-5
                    text-center
                    text-lg
                    font-bold
                  "
                >
                  {seats}
                </span>

                <button
                  type="button"
                  onClick={increaseSeats}
                  disabled={seats === 3}
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-black
                    text-xl
                    font-medium
                    text-white
                    transition
                    hover:bg-[#C6FF2E]
                    hover:text-black
                    disabled:cursor-not-allowed
                    disabled:opacity-30
                  "
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA */}

            <div
              className="
                mt-7
                flex
                flex-wrap
                items-center
                gap-4
              "
            >
              {/* Primary CTA */}

              <Link
                href={`/passenger?pickup=${pickup}&destination=${destination}&seats=${seats}`}
                className="
                  group
                  inline-flex
                  min-h-[58px]
                  items-center
                  justify-center
                  gap-3
                  rounded-xl
                  bg-[#C6FF2E]
                  px-8
                  text-[17px]
                  font-black
                  text-black
                  shadow-[0_12px_30px_rgba(198,255,46,0.22)]
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:bg-[#C6FF2E]
                  hover:shadow-[0_16px_36px_rgba(198,255,46,0.28)]
                  active:translate-y-0
                "
              >
                Find a pool
                <ArrowRight
                  size={20}
                  className="
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                  "
                />
              </Link>

              {/* Login CTA */}

              <Link
                href="/login"
                className="
                  group
                  inline-flex
                  min-h-[58px]
                  items-center
                  justify-center
                  gap-3
                  rounded-xl
                  border
                  border-black/15
                  bg-white
                  px-7
                  text-[16px]
                  font-bold
                  text-black
                  shadow-[0_8px_25px_rgba(0,0,0,0.06)]
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-black
                  hover:bg-black
                  hover:text-white
                  hover:shadow-[0_14px_30px_rgba(0,0,0,0.14)]
                  active:translate-y-0
                "
              >
                <span>Log in</span>

                <span
                  className="
                    text-sm
                    font-medium
                    text-black/45
                    transition-colors
                    group-hover:text-white/55
                  "
                >
                  View your rides
                </span>

                <ArrowRight
                  size={18}
                  className="
                    ml-1
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                  "
                />
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div
          className="
            flex
            w-full
            justify-center
            lg:justify-end
          "
        >
          <PremiumMapPreview
            pickup={pickup}
            destination={destination}
            seats={seats}
          />
        </div>
      </div>
    </section>
  );
}
