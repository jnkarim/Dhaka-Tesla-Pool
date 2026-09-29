"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { ArrowRight, CheckCircle2, Eye, EyeOff, UserPlus } from "lucide-react";

import AuthRedirect from "@/components/AuthRedirect";

import { api, ApiError } from "@/lib/api";

type UserRole = "PASSENGER" | "DRIVER";

type LoginResponse = {
  success: boolean;

  data?: {
    role?: UserRole;

    user?: {
      id?: string;
      name?: string;
      email?: string;
      role?: UserRole;
      isAdmin?: boolean;
    };
  };

  message?: string;
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("registered") === "true") {
      setRegistered(true);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setRegistered(false);

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api<LoginResponse>("/auth/login", {
        method: "POST",

        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const user = response.data?.user;

      if (!user) {
        throw new Error("Invalid login response.");
      }

      if (user.isAdmin) {
        window.location.replace("/admin");
        return;
      }

      if (user.role === "DRIVER") {
        window.location.replace("/driver");
        return;
      }

      window.location.replace("/passenger");
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Unable to log in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthRedirect>
      <main className="min-h-screen bg-[#F8F8FA] text-black">
        <header className="h-[76px] bg-black">
          <div className="mx-auto flex h-full max-w-[1440px] items-center px-6 lg:px-10">
            <Link
              href="/"
              className="text-[25px] font-black tracking-[-0.045em] text-white"
            >
              Dhaka
              <span className="text-[#C6FF2E]">Tesla</span>
              Pool
            </Link>
          </div>
        </header>

        <section className="mx-auto flex min-h-[calc(100vh-76px)] max-w-[1440px] justify-center px-5 py-16">
          <div className="w-full max-w-[500px]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-black/35">
                Welcome back
              </p>

              <h1 className="mt-3 text-[36px] font-medium leading-[1.08] tracking-[-0.04em]">
                Log in to your account
              </h1>

              <p className="mt-3 max-w-[440px] text-[15px] leading-6 text-black/50">
                Continue to your rides, pools and trip history.
              </p>
            </div>

            {registered && (
              <div className="mt-7 flex items-center gap-3 rounded-[12px] border border-[#C6FF2E]/40 bg-[#C6FF2E]/10 px-4 py-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C6FF2E]">
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold">Account created</p>

                  <p className="text-xs text-black/45">You can log in now.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter email address"
                className={inputClassName}
              />

              <div className="relative mt-4">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  className={`${inputClassName} pr-14`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black/35"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>

              {error && (
                <div className="mt-4 rounded-[12px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group mt-5 flex h-[58px] w-full items-center justify-center gap-3 rounded-[10px] bg-black text-[17px] font-semibold text-white transition hover:bg-[#C6FF2E] hover:text-black active:scale-[0.985] disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Continue"}

                {!loading && (
                  <ArrowRight
                    size={19}
                    className="transition group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-black/20" />

              <span className="text-sm text-black/45">New here?</span>

              <div className="h-px flex-1 bg-black/20" />
            </div>

            <Link
              href="/register"
              className="flex min-h-[78px] items-center gap-4 rounded-[14px] border border-black/10 bg-white px-4 transition hover:bg-black hover:text-white"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-[#C6FF2E]">
                <UserPlus size={19} />
              </div>

              <div>
                <p className="font-bold">Create a new account</p>

                <p className="text-xs text-black/40">
                  Join as passenger or driver
                </p>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </AuthRedirect>
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
  outline-none
  transition
  placeholder:text-black/45
  focus:border-black
  focus:bg-white
`;
