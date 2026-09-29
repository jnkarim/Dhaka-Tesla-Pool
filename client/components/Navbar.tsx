"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ChevronDown, LoaderCircle, LogOut } from "lucide-react";

import { api } from "@/lib/api";

type Role = "PASSENGER" | "DRIVER";

type MeResponse = {
  success: boolean;

  data?: {
    userId?: string;
    role?: Role;
  };
};

export default function Navbar() {
  const pathname = usePathname();

  const [signupOpen, setSignupOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [role, setRole] = useState<Role | null>(null);

  const [authLoading, setAuthLoading] = useState(true);

  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        setAuthLoading(true);

        const response = await api<MeResponse>("/auth/me");

        if (cancelled) {
          return;
        }

        if (response.success && response.data?.role) {
          setIsLoggedIn(true);

          setRole(response.data.role);
        } else {
          setIsLoggedIn(false);

          setRole(null);
        }
      } catch {
        if (cancelled) {
          return;
        }

        setIsLoggedIn(false);

        setRole(null);
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  async function handleLogout() {
    try {
      setLogoutLoading(true);

      await api("/auth/logout", {
        method: "POST",
      });

      setIsLoggedIn(false);

      setRole(null);

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);

      setLogoutLoading(false);
    }
  }

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const isDriver = role === "DRIVER";

  return (
    <header className="w-full border-b border-black/10 bg-white">
      <nav className="mx-auto flex h-[100px] max-w-[1540px] items-stretch px-6 lg:px-10">
        {/* Logo */}

        <div className="flex min-w-[260px] items-center border-r border-black/10 pr-8">
          <Link href="/">
            <span className="text-[26px] font-black tracking-[-0.04em] text-black">
              Dhaka
              <span className="text-[#C6FF2E]">Tesla</span>
              Pool
            </span>
          </Link>
        </div>

        {/* Desktop */}

        <div className="hidden flex-1 items-stretch justify-end lg:flex">
          {authLoading ? (
            <DesktopAuthLoading />
          ) : (
            <>
              {/* Passenger navigation */}

              {!isDriver && (
                <div className="flex items-center border-r border-black/10 px-8">
                  <Link
                    href="/passenger"
                    className="rounded-full bg-[#C6FF2E] px-8 py-4 text-[17px] font-bold text-black transition hover:scale-[1.02]"
                  >
                    Get a ride
                  </Link>
                </div>
              )}

              {!isDriver && (
                <NavItem href="/passenger/activity">Activity</NavItem>
              )}

              {/* Driver navigation */}

              {(!isLoggedIn || role === "DRIVER") && (
                <NavItem href="/driver">Driver</NavItem>
              )}

              <NavItem href="/#how-it-works">How it works</NavItem>

              {/* Guest */}

              {!isLoggedIn && (
                <>
                  <NavItem href="/login">Log in</NavItem>

                  <div className="relative flex items-stretch border-r border-black/10">
                    <button
                      type="button"
                      onClick={() => setSignupOpen((previous) => !previous)}
                      className="flex items-center gap-2 px-8 text-[17px] font-bold text-black transition hover:bg-black hover:text-white"
                    >
                      Sign up
                      <ChevronDown
                        size={17}
                        className={`transition-transform ${
                          signupOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {signupOpen && (
                      <div className="absolute right-0 top-full z-50 min-w-[245px] border border-black/10 bg-white shadow-xl">
                        <Link
                          href="/register"
                          onClick={() => setSignupOpen(false)}
                          className="block px-8 py-5 text-[17px] hover:bg-[#C6FF2E]"
                        >
                          Sign up to ride
                        </Link>

                        <Link
                          href="/register?role=driver"
                          onClick={() => setSignupOpen(false)}
                          className="block border-t border-black/10 px-8 py-5 text-[17px] hover:bg-[#C6FF2E]"
                        >
                          Apply to drive
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Logged in */}

              {isLoggedIn && (
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="flex items-center gap-2 border-r border-black/10 px-8 text-[17px] font-bold text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {logoutLoading ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <LogOut size={18} />
                  )}

                  {logoutLoading ? "Logging out..." : "Logout"}
                </button>
              )}
            </>
          )}
        </div>

        {/* Mobile */}

        <div className="ml-auto flex items-center gap-3 lg:hidden">
          {authLoading ? (
            <LoaderCircle size={20} className="animate-spin text-black/50" />
          ) : !isLoggedIn ? (
            <>
              <Link href="/login" className="text-sm font-bold">
                Log in
              </Link>

              <Link
                href="/register"
                className="rounded-full bg-[#C6FF2E] px-5 py-3 text-sm font-black"
              >
                Sign up
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutLoading}
              className="flex items-center gap-2 text-sm font-bold disabled:opacity-50"
            >
              {logoutLoading ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <LogOut size={16} />
              )}

              {logoutLoading ? "Logging out..." : "Logout"}
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}

function DesktopAuthLoading() {
  return (
    <div className="flex flex-1 items-center justify-end border-r border-black/10 px-8">
      <LoaderCircle size={21} className="animate-spin text-black/40" />
    </div>
  );
}

type NavItemProps = {
  href: string;
  children: React.ReactNode;
};

function NavItem({ href, children }: NavItemProps) {
  return (
    <div className="flex items-stretch border-r border-black/10">
      <Link
        href={href}
        className="flex items-center px-8 text-[17px] font-bold text-black transition hover:bg-black hover:text-white"
      >
        {children}
      </Link>
    </div>
  );
}
