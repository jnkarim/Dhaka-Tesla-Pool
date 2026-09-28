"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LogIn,
  Navigation,
  Users,
} from "lucide-react";

import AuthRedirect from "@/components/AuthRedirect";

import { api, ApiError } from "@/lib/api";

type UserRole = "PASSENGER" | "DRIVER";

type RegisterResponse = {
  success: boolean;

  data?: {
    id?: string;
    name?: string;
    email?: string;
    role?: UserRole;
  };

  message?: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [role, setRole] = useState<UserRole>("PASSENGER");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // Select driver when coming from apply to drive
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("role") === "driver") {
      setRole("DRIVER");
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");

      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");

      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");

      return;
    }

    try {
      setLoading(true);

      await api<RegisterResponse>("/auth/register", {
        method: "POST",

        body: JSON.stringify({
          name: name.trim(),

          email: email.trim().toLowerCase(),

          password,

          role,
        }),
      });

      router.push("/login?registered=true");
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthRedirect>
      <main
        className="
          min-h-screen
          bg-[#F8F8FA]
          text-black
        "
      >
        <header
          className="
            h-[76px]
            bg-black
          "
        >
          <div
            className="
              mx-auto
              flex
              h-full
              max-w-[1440px]
              items-center
              px-6
              lg:px-10
            "
          >
            <Link
              href="/"
              className="
                text-[25px]
                font-black
                tracking-[-0.045em]
                text-white
              "
            >
              Dhaka
              <span className="text-[#C6FF2E]">Tesla</span>
              Pool
            </Link>
          </div>
        </header>

        <section
          className="
            mx-auto
            flex
            min-h-[calc(100vh-76px)]
            max-w-[1440px]
            justify-center
            px-5
            py-14
          "
        >
          <div
            className="
              w-full
              max-w-[500px]
            "
          >
            <div>
              <p
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.16em]
                  text-black/35
                "
              >
                Create account
              </p>

              <h1
                className="
                  mt-3
                  text-[34px]
                  font-medium
                  leading-[1.08]
                  tracking-[-0.035em]
                "
              >
                Join Dhaka Tesla Pool
              </h1>

              <p
                className="
                  mt-3
                  max-w-[440px]
                  text-[15px]
                  leading-6
                  text-black/50
                "
              >
                Create an account to request shared rides or manage pools as a
                driver.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8">
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter full name"
                autoComplete="name"
                className={inputClassName}
              />

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter email address"
                autoComplete="email"
                className={`
                  ${inputClassName}
                  mt-4
                `}
              />

              {/* Role selection */}

              <div className="mt-6">
                <p
                  className="
                    mb-3
                    text-[13px]
                    font-semibold
                    text-black/50
                  "
                >
                  Continue as
                </p>

                <div
                  className="
                    grid
                    grid-cols-2
                    gap-3
                  "
                >
                  <RoleCard
                    active={role === "PASSENGER"}
                    title="Passenger"
                    subtitle="Find shared rides"
                    onClick={() => setRole("PASSENGER")}
                  >
                    <Users size={19} />
                  </RoleCard>

                  <RoleCard
                    active={role === "DRIVER"}
                    title="Driver"
                    subtitle="Manage ride pools"
                    onClick={() => setRole("DRIVER")}
                  >
                    <Navigation
                      size={19}
                      fill={role === "DRIVER" ? "currentColor" : "none"}
                    />
                  </RoleCard>
                </div>
              </div>

              <div className="relative mt-5">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  autoComplete="new-password"
                  className={`
                    ${inputClassName}
                    pr-14
                  `}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-black/35
                  "
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>

              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm password"
                autoComplete="new-password"
                className={`
                  ${inputClassName}
                  mt-4
                `}
              />

              {error && (
                <div
                  className="
                    mt-4
                    rounded-[12px]
                    border
                    border-red-100
                    bg-red-50
                    px-4
                    py-3
                    text-sm
                    text-red-600
                  "
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="
                  group
                  mt-5
                  flex
                  h-[58px]
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-[10px]
                  bg-black
                  text-[17px]
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#C6FF2E]
                  hover:text-black
                  active:scale-[0.985]
                  disabled:opacity-50
                "
              >
                {loading ? "Creating account..." : "Continue"}

                {!loading && (
                  <ArrowRight
                    size={19}
                    className="
                      transition
                      group-hover:translate-x-1
                    "
                  />
                )}
              </button>
            </form>

            <div
              className="
                my-7
                flex
                items-center
                gap-4
              "
            >
              <div className="h-px flex-1 bg-black/20" />

              <span className="text-sm text-black/45">or</span>

              <div className="h-px flex-1 bg-black/20" />
            </div>

            <Link
              href="/login"
              className="
                group
                flex
                min-h-[78px]
                w-full
                items-center
                gap-4
                rounded-[14px]
                border
                border-black/[0.08]
                bg-white
                px-4
                transition
                hover:bg-black
                hover:text-white
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  bg-black
                  text-[#C6FF2E]
                "
              >
                <LogIn size={19} />
              </div>

              <div>
                <p className="font-bold">Already have an account?</p>

                <p
                  className="
                    text-xs
                    text-black/40
                  "
                >
                  Log in and continue your ride
                </p>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </AuthRedirect>
  );
}

function RoleCard({
  active,
  title,
  subtitle,
  children,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative
        flex
        min-h-[82px]
        items-center
        gap-3
        rounded-[14px]
        border
        px-4
        text-left
        transition

        ${
          active
            ? `
              border-black
              bg-black
              text-white
            `
            : `
              border-transparent
              bg-[#EEEEEE]
            `
        }
      `}
    >
      <div
        className={`
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-full

          ${active ? "bg-[#C6FF2E] text-black" : "bg-white"}
        `}
      >
        {children}
      </div>

      <div>
        <p className="text-[15px] font-bold">{title}</p>

        <p className="text-[11px] opacity-50">{subtitle}</p>
      </div>
    </button>
  );
}

const inputClassName = `
  h-[58px]
  w-full
  rounded-[10px]
  border
  border-transparent
  bg-[#EEEEEE]
  px-5
  text-[16px]
  font-medium
  text-black
  outline-none
  transition
  placeholder:text-black/45
  hover:bg-[#E9E9E9]
  focus:border-black
  focus:bg-white
`;
