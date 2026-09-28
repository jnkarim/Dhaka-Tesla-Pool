import { Check, MapPin, Navigation, Route, Users } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Request",
    text: "Choose pickup, destination and seats.",
    icon: MapPin,
    x: 7,
    y: 46,
  },
  {
    number: "02",
    title: "Matched",
    text: "Join passengers travelling the same way.",
    icon: Users,
    x: 28,
    y: 27,
  },
  {
    number: "03",
    title: "Driver arrives",
    text: "Your Tesla reaches the pickup point.",
    icon: Navigation,
    x: 50,
    y: 50,
  },
  {
    number: "04",
    title: "Ride starts",
    text: "Share the trip while status stays updated.",
    icon: Route,
    x: 72,
    y: 28,
  },
  {
    number: "05",
    title: "Complete",
    text: "Fare is finalized and the ride is saved.",
    icon: Check,
    x: 91,
    y: 48,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="
        bg-[#F8F8FA]
        px-6
        py-20
        text-[#0B0B0F]
        lg:px-10
        lg:py-24
      "
    >
      <div className="mx-auto max-w-[1540px]">
        {/* Header */}

        <div className="mb-10">
          <p
            className="
              mb-3
              text-sm
              font-black
              uppercase
              tracking-[0.18em]
              text-[#C6FF2E]
            "
          >
            How it works
          </p>

          <h2
            className="
              max-w-[760px]
              text-[42px]
              font-black
              leading-[1]
              tracking-[-0.045em]
              sm:text-[52px]
            "
          >
            From request
            <span className="text-[#C6FF2E]"> to drop-off.</span>
          </h2>
        </div>

        {/* Journey Panel */}

        <div
          className="
            relative
            overflow-hidden
            rounded-[30px]
            bg-[#0B0B0F]
            px-7
            py-10
            text-white
            sm:px-10
            lg:px-12
            lg:py-12
          "
        >
          {/* Background map lines */}

          <div className="pointer-events-none absolute inset-0 opacity-20">
            <div className="absolute left-[8%] top-[18%] h-px w-[72%] rotate-[8deg] bg-white/20" />

            <div className="absolute left-[20%] top-[58%] h-px w-[65%] -rotate-[7deg] bg-white/10" />

            <div className="absolute left-[55%] top-[5%] h-[85%] w-px rotate-[20deg] bg-white/10" />
          </div>

          {/* ================= DESKTOP ================= */}

          <div
            className="
              relative
              hidden
              h-[390px]
              lg:block
            "
          >
            {/* Route */}

            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="
                pointer-events-none
                absolute
                inset-0
                h-full
                w-full
              "
              fill="none"
            >
              {/* Glow */}

              <path
                d="
                  M 7 46

                  C 15 46,
                    20 27,
                    28 27

                  C 36 27,
                    42 50,
                    50 50

                  C 58 50,
                    64 28,
                    72 28

                  C 80 28,
                    84 48,
                    91 48
                "
                stroke="#C6FF2E"
                strokeOpacity="0.18"
                strokeWidth="18"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />

              {/* Main Route */}

              <path
                d="
                  M 7 46

                  C 15 46,
                    20 27,
                    28 27

                  C 36 27,
                    42 50,
                    50 50

                  C 58 50,
                    64 28,
                    72 28

                  C 80 28,
                    84 48,
                    91 48
                "
                stroke="#C6FF2E"
                strokeWidth="6"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Nodes */}

            {steps.map((step, index) => (
              <StepNode
                key={step.number}
                step={step}
                finalStep={index === steps.length - 1}
              />
            ))}
          </div>

          {/* ================= MOBILE / TABLET ================= */}

          <div className="relative space-y-4 lg:hidden">
            {steps.map((step, index) => {
              const Icon = step.icon;

              const isFinal = index === steps.length - 1;

              return (
                <div
                  key={step.number}
                  className="
                    relative
                    flex
                    gap-4
                    rounded-[20px]
                    border
                    border-white/10
                    bg-white/[0.04]
                    p-5
                  "
                >
                  {/* Vertical connection */}

                  {!isFinal && (
                    <div
                      className="
                        absolute
                        left-[39px]
                        top-[63px]
                        h-[38px]
                        w-[2px]
                        bg-[#C6FF2E]/50
                      "
                    />
                  )}

                  {/* Icon */}

                  <div
                    className={`
                      relative
                      z-10
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-full

                      ${
                        isFinal
                          ? "bg-[#C6FF2E] text-black"
                          : "bg-white text-black"
                      }
                    `}
                  >
                    <Icon size={18} strokeWidth={2.3} />
                  </div>

                  {/* Text */}

                  <div>
                    <p
                      className="
                        text-[10px]
                        font-black
                        tracking-[0.15em]
                        text-white/35
                      "
                    >
                      STEP {step.number}
                    </p>

                    <h3 className="mt-1 text-lg font-black">{step.title}</h3>

                    <p
                      className="
                        mt-1
                        text-sm
                        leading-6
                        text-white/45
                      "
                    >
                      {step.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Summary */}

          <div
            className="
              mt-5
              flex
              flex-col
              gap-4
              border-t
              border-white/10
              pt-6
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p className="text-sm text-white/45">
              Request → Match → Arrival → Ride → Complete
            </p>

            <div
              className="
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-full
                bg-[#C6FF2E]
                px-4
                py-2
                text-sm
                font-black
                text-black
              "
            >
              <Route size={16} />
              Clear ride lifecycle
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   DESKTOP STEP NODE
   ========================================================= */

type StepNodeProps = {
  step: (typeof steps)[number];
  finalStep?: boolean;
};

function StepNode({
  step,
  finalStep = false,
}: StepNodeProps) {
  const Icon = step.icon;

  return (
    <div
      className="
        absolute
        z-10
        w-[190px]
      "
      style={{
        left: `${step.x}%`,
        top: `${step.y}%`,

        /*
          Marker = 58px × 58px

          -29px means:
          marker center exactly sits on
          the SVG route coordinate.
        */
        transform: "translate(-29px, -29px)",
      }}
    >
      {/* Marker */}

      <div
        className={`
          flex
          h-[58px]
          w-[58px]
          items-center
          justify-center
          rounded-full
          border-[6px]
          border-[#0B0B0F]
          shadow-[0_0_0_3px_rgba(198,255,46,0.28)]

          ${
            finalStep
              ? "bg-[#C6FF2E] text-black"
              : "bg-white text-black"
          }
        `}
      >
        <Icon
          size={22}
          strokeWidth={2.4}
        />
      </div>

      {/* Information */}

      <div className="mt-4">
        <p
          className="
            text-[10px]
            font-black
            tracking-[0.16em]
            text-white/30
          "
        >
          STEP {step.number}
        </p>

        <h3
          className="
            mt-1
            text-[20px]
            font-black
            tracking-[-0.02em]
          "
        >
          {step.title}
        </h3>

        <p
          className="
            mt-2
            max-w-[180px]
            text-[13px]
            leading-5
            text-white/45
          "
        >
          {step.text}
        </p>
      </div>
    </div>
  );
}