"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Check,
  ChevronDown,
  MapPin,
  Search,
} from "lucide-react";

type LocationSelectProps = {
  label: string;
  value: string;
  locations: string[];
  onChange: (value: string) => void;
  variant?: "pickup" | "destination";
};

function formatZone(zone: string) {
  return zone
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) => letter.toUpperCase(),
    );
}

export default function LocationSelect({
  label,
  value,
  locations,
  onChange,
  variant = "pickup",
}: LocationSelectProps) {
  const [open, setOpen] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const containerRef =
    useRef<HTMLDivElement>(null);

  const filteredLocations =
    locations.filter((location) =>
      formatZone(location)
        .toLowerCase()
        .includes(
          search.toLowerCase(),
        ),
    );

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  function handleSelect(
    location: string,
  ) {
    onChange(location);

    setOpen(false);

    setSearch("");
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      {/* Main field */}

      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) => !current,
          )
        }
        className={`
          group
          flex
          h-[78px]
          w-full
          items-center
          gap-4
          rounded-2xl
          border
          px-5
          text-left
          transition-all
          duration-200

          ${
            open
              ? `
                border-[#C6FF2E]
                bg-white
                shadow-[0_10px_35px_rgba(0,0,0,0.08)]
              `
              : `
                border-black/[0.06]
                bg-black/[0.04]
                hover:border-black/15
                hover:bg-white
              `
          }
        `}
      >
        {/* Location icon */}

        <div
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-full

            ${
              variant === "pickup"
                ? `
                  bg-[#C6FF2E]
                  text-black
                `
                : `
                  bg-black
                  text-white
                `
            }
          `}
        >
          <MapPin
            size={19}
            strokeWidth={2.4}
          />
        </div>

        {/* Location text */}

        <div className="min-w-0 flex-1">
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-black/40
            "
          >
            {label}
          </p>

          <p
            className="
              mt-1
              truncate
              text-[17px]
              font-bold
              text-black
            "
          >
            {formatZone(value)}
          </p>
        </div>

        {/* Arrow */}

        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            transition
            group-hover:bg-black/[0.05]
          "
        >
          <ChevronDown
            size={20}
            strokeWidth={2.2}
            className={`
              text-black/40
              transition-transform
              duration-200

              ${
                open
                  ? "rotate-180"
                  : ""
              }
            `}
          />
        </div>
      </button>

      {/* Dropdown */}

      {open && (
        <div
          className="
            absolute
            left-0
            top-[calc(100%+10px)]
            z-[100]
            w-full
            overflow-hidden
            rounded-2xl
            border
            border-black/[0.08]
            bg-white
            shadow-[0_25px_70px_rgba(0,0,0,0.16)]
          "
        >
          {/* Search */}

          <div
            className="
              border-b
              border-black/[0.06]
              p-3
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
                rounded-xl
                bg-black/[0.04]
                px-4
                py-3
              "
            >
              <Search
                size={18}
                className="text-black/40"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search area"
                autoFocus
                className="
                  w-full
                  bg-transparent
                  text-sm
                  font-medium
                  text-black
                  outline-none
                  placeholder:text-black/35
                "
              />
            </div>
          </div>

          {/* Options */}

          <div
            className="
              max-h-[290px]
              overflow-y-auto
              p-2
            "
          >
            {filteredLocations.map(
              (location) => {
                const selected =
                  location === value;

                return (
                  <button
                    type="button"
                    key={location}
                    onClick={() =>
                      handleSelect(
                        location,
                      )
                    }
                    className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-xl
                      px-4
                      py-3.5
                      text-left
                      transition-all

                      ${
                        selected
                          ? `
                            bg-[#C6FF2E]
                            text-black
                          `
                          : `
                            text-black
                            hover:bg-black/[0.05]
                          `
                      }
                    `}
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >
                      <div
                        className={`
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full

                          ${
                            selected
                              ? `
                                bg-black
                                text-white
                              `
                              : `
                                bg-black/[0.05]
                                text-black
                              `
                          }
                        `}
                      >
                        <MapPin
                          size={16}
                        />
                      </div>

                      <div>
                        <p className="font-semibold">
                          {formatZone(
                            location,
                          )}
                        </p>

                        <p
                          className={`
                            mt-0.5
                            text-xs

                            ${
                              selected
                                ? "text-black/55"
                                : "text-black/40"
                            }
                          `}
                        >
                          Dhaka
                        </p>
                      </div>
                    </div>

                    {selected && (
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-full
                          bg-black
                          text-white
                        "
                      >
                        <Check
                          size={17}
                          strokeWidth={3}
                        />
                      </div>
                    )}
                  </button>
                );
              },
            )}

            {filteredLocations.length ===
              0 && (
              <div
                className="
                  px-4
                  py-10
                  text-center
                "
              >
                <p className="text-sm font-semibold text-black">
                  No locations found
                </p>

                <p className="mt-1 text-xs text-black/40">
                  Try another Dhaka
                  area.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}