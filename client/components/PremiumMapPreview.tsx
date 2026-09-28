import { Clock3, MapPin, Navigation, Users } from "lucide-react";

type PremiumMapPreviewProps = {
  pickup: string;
  destination: string;
  seats: number;
};

function formatZone(zone: string) {
  return zone
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function PremiumMapPreview({
  pickup,
  destination,
  seats,
}: PremiumMapPreviewProps) {
  return (
    <div className="relative h-[610px] w-full max-w-[620px] overflow-hidden bg-[#0B0B0F]">
      {/* Soft map glow */}

      <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C6FF2E]/[0.04] blur-3xl" />

      {/* Map */}

      <svg
        viewBox="0 0 620 610"
        className="absolute inset-0 h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Major roads */}

        <path
          d="M-30 105 C100 135 165 185 300 202 C425 218 505 178 660 195"
          stroke="white"
          strokeOpacity="0.13"
          strokeWidth="3"
        />

        <path
          d="M55 525 C160 450 215 390 290 290 C345 216 390 128 455 25"
          stroke="white"
          strokeOpacity="0.12"
          strokeWidth="3"
        />

        <path
          d="M20 330 C145 305 245 330 340 295 C435 260 505 210 650 240"
          stroke="white"
          strokeOpacity="0.14"
          strokeWidth="2"
        />

        <path
          d="M410 -25 C390 115 420 220 470 345 C500 420 535 510 575 660"
          stroke="white"
          strokeOpacity="0.1"
          strokeWidth="2"
        />

        {/* Secondary roads */}

        <path
          d="M80 30 L175 185 L130 285 L220 410 L175 590"
          stroke="white"
          strokeOpacity="0.07"
        />

        <path
          d="M230 -20 L255 120 L205 230 L330 370 L300 625"
          stroke="white"
          strokeOpacity="0.07"
        />

        <path
          d="M510 15 L480 120 L545 210 L500 320 L620 400"
          stroke="white"
          strokeOpacity="0.07"
        />

        <path
          d="M-10 425 L120 390 L220 430 L345 410 L460 450 L660 430"
          stroke="white"
          strokeOpacity="0.07"
        />

        <path
          d="M-30 250 L110 225 L215 265 L335 235 L470 275 L660 255"
          stroke="white"
          strokeOpacity="0.06"
        />

        {/* Small street grid */}

        {Array.from({ length: 9 }).map((_, index) => (
          <path
            key={`horizontal-${index}`}
            d={`M40 ${80 + index * 55} C180 ${
              65 + index * 55
            } 420 ${100 + index * 50} 590 ${85 + index * 54}`}
            stroke="white"
            strokeOpacity="0.025"
          />
        ))}

        {/* Route shadow */}

        <path
          d="
            M155 118
            C170 165 180 215 225 245
            C270 275 320 260 344 307
            C370 355 378 405 425 443
            C452 465 470 480 487 512
          "
          stroke="#C6FF2E"
          strokeOpacity="0.18"
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Main route */}

        <path
          d="
            M155 118
            C170 165 180 215 225 245
            C270 275 320 260 344 307
            C370 355 378 405 425 443
            C452 465 470 480 487 512
          "
          stroke="#C6FF2E"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Route dots */}

        <circle cx="155" cy="118" r="9" fill="#C6FF2E" />

        <circle cx="487" cy="512" r="9" fill="#C6FF2E" />

        {/* Midpoint */}

        <circle
          cx="344"
          cy="307"
          r="6"
          fill="#F8F8FA"
          stroke="#C6FF2E"
          strokeWidth="4"
        />
      </svg>

      {/* Area names */}

      <div className="absolute left-[12%] top-[41%] text-[11px] font-semibold tracking-[0.18em] text-white/20">
        BANANI
      </div>

      <div className="absolute right-[15%] top-[28%] text-[11px] font-semibold tracking-[0.18em] text-white/20">
        GULSHAN
      </div>

      <div className="absolute bottom-[30%] left-[24%] text-[11px] font-semibold tracking-[0.18em] text-white/20">
        MOHAKHALI
      </div>

      <div className="absolute bottom-[18%] right-[15%] text-[11px] font-semibold tracking-[0.18em] text-white/20">
        TEJGAON
      </div>

      {/* Pickup */}

      <div className="absolute left-[9%] top-[8%]">
        <div className="rounded-2xl bg-white px-5 py-4 text-black shadow-2xl">
          <div className="flex items-center gap-2 text-xs text-black/45">
            <MapPin size={14} />
            Pickup
          </div>

          <p className="mt-1 text-lg font-black">{formatZone(pickup)}</p>
        </div>
      </div>

      {/* Destination */}

      <div className="absolute bottom-[7%] right-[6%]">
        <div className="rounded-2xl bg-[#C6FF2E] px-5 py-4 text-black shadow-2xl">
          <div className="flex items-center gap-2 text-xs font-medium text-black/55">
            <Navigation size={14} />
            Destination
          </div>

          <p className="mt-1 text-lg font-black">{formatZone(destination)}</p>
        </div>
      </div>

      {/* Tesla current position */}

      <div className="absolute left-[51%] top-[49%] -translate-x-1/2 -translate-y-1/2">
        {/* Glow */}

        <div className="absolute inset-[-16px] rounded-full bg-[#C6FF2E]/25 blur-xl" />

        {/* Navigation marker */}

        <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-[6px] border-[#C6FF2E] bg-white text-black shadow-2xl">
          <Navigation
            size={30}
            strokeWidth={2.5}
            fill="currentColor"
            className="rotate-45"
          />
        </div>
      </div>

      {/* ETA */}

      <div className="absolute right-6 top-6 flex items-center gap-3 rounded-full border border-white/10 bg-black/70 px-4 py-3 text-white backdrop-blur-md">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C6FF2E] text-black">
          <Clock3 size={18} />
        </div>

        <div>
          <p className="text-[11px] text-white/45">Estimated pickup</p>

          <p className="text-sm font-bold">6 min away</p>
        </div>
      </div>

      {/* Pool summary */}

      <div className="absolute bottom-8 left-8 w-[285px] bg-white p-6 text-black shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xl font-black tracking-tight">Shared Tesla</p>

            <p className="mt-1 text-sm text-black/50">Compatible route found</p>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-[#C6FF2E] px-3 py-2 text-xs font-black">
            <Users size={14} />
            {seats}
          </div>
        </div>

        <div className="my-5 h-px bg-black/10" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-black/40">Vehicle</p>

            <p className="font-bold">Tesla</p>
          </div>

          <div className="text-right">
            <p className="text-xs text-black/40">Capacity</p>

            <p className="font-bold">{seats}/3 seats</p>
          </div>
        </div>
      </div>
    </div>
  );
}
