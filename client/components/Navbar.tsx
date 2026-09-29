"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LoaderCircle, LogOut, Menu, X } from "lucide-react";
import { Montserrat } from "next/font/google";

import { api } from "@/lib/api";

const logoFont = Montserrat({
  subsets: ["latin"],
  weight: ["800", "900"],
});

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

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role | null>(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);

  const hasCheckedAuth = useRef(false);
  const previousPathname = useRef(pathname);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      const previousPath = previousPathname.current;

      const leavingAuthPage =
        previousPath === "/login" || previousPath === "/register";

      if (!hasCheckedAuth.current || leavingAuthPage) {
        setAuthLoading(true);
      }

      try {
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
          hasCheckedAuth.current = true;
          setAuthLoading(false);
          previousPathname.current = pathname;
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleLogout() {
    if (logoutLoading) {
      return;
    }

    try {
      setLogoutLoading(true);
      setMobileOpen(false);

      await api("/auth/logout", {
        method: "POST",
      });

      window.location.replace("/login");
    } catch (error) {
      console.error("Logout failed", error);
      setLogoutLoading(false);
    }
  }

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const navigationLoading = authLoading || logoutLoading;

  return (
    <header className="relative z-50 w-full border-b border-black/10 bg-white">
      <nav className="flex h-[100px] w-full items-stretch">
        {/* Logo */}
        <div className="flex shrink-0 items-center justify-center bg-black px-8 lg:w-[400px]">
          <Link href="/" onClick={() => setMobileOpen(false)} className="group">
            <span
              className={`${logoFont.className} whitespace-nowrap text-[24px] font-black tracking-[-0.065em] text-white transition-transform duration-200 group-hover:scale-[1.02] lg:text-[29px]`}
            >
              Dhaka
              <span className="text-[#C6FF2E]">Tesla</span>
              Pool
            </span>
          </Link>
        </div>

        {/* Desktop */}
        <div className="hidden flex-1 items-stretch justify-end lg:flex">
          {navigationLoading ? (
            <DesktopAuthLoading loggingOut={logoutLoading} />
          ) : !isLoggedIn ? (
            <GuestDesktopNavigation />
          ) : role === "PASSENGER" ? (
            <PassengerDesktopNavigation onLogout={handleLogout} />
          ) : (
            <DriverDesktopNavigation onLogout={handleLogout} />
          )}
        </div>

        {/* Mobile button */}
        <div className="ml-auto flex items-center pr-6 lg:hidden">
          {navigationLoading ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-black/45">
              <LoaderCircle size={19} className="animate-spin" />

              {logoutLoading && "Logging out..."}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setMobileOpen((current) => !current)}
              aria-label="Toggle navigation menu"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white transition hover:bg-[#C6FF2E] hover:text-black"
            >
              {mobileOpen ? (
                <X size={20} strokeWidth={2.4} />
              ) : (
                <Menu size={20} strokeWidth={2.4} />
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile navigation */}
      {mobileOpen && !navigationLoading && (
        <MobileNavigation
          isLoggedIn={isLoggedIn}
          role={role}
          onLogout={handleLogout}
        />
      )}
    </header>
  );
}

function GuestDesktopNavigation() {
  return (
    <>
      <NavItem href="/#how-it-works">How it works</NavItem>

      <NavItem href="/register?role=driver">Driver</NavItem>

      <NavItem href="/login">Log in</NavItem>

      <div className="flex items-center px-8">
        <Link
          href="/register"
          className="rounded-full bg-[#C6FF2E] px-8 py-4 text-[17px] font-bold text-black transition hover:scale-[1.02]"
        >
          Sign up
        </Link>
      </div>
    </>
  );
}

function PassengerDesktopNavigation({ onLogout }: { onLogout: () => void }) {
  return (
    <>
      <div className="flex items-center border-r border-black/10 px-8">
        <Link
          href="/passenger"
          className="rounded-full bg-[#C6FF2E] px-8 py-4 text-[17px] font-bold text-black transition hover:scale-[1.02]"
        >
          Get a ride
        </Link>
      </div>

      <NavItem href="/passenger/activity">Activity</NavItem>

      <NavItem href="/#how-it-works">How it works</NavItem>

      <LogoutButton onLogout={onLogout} />
    </>
  );
}

function DriverDesktopNavigation({ onLogout }: { onLogout: () => void }) {
  return (
    <>
      <NavItem href="/driver">Driver</NavItem>

      <NavItem href="/driver/activity">Activity</NavItem>

      <NavItem href="/#how-it-works">How it works</NavItem>

      <LogoutButton onLogout={onLogout} />
    </>
  );
}

function LogoutButton({ onLogout }: { onLogout: () => void }) {
  return (
    <button
      type="button"
      onClick={onLogout}
      className="flex items-center gap-2 border-l border-black/10 px-8 text-[17px] font-bold text-black transition hover:bg-black hover:text-white"
    >
      <LogOut size={18} />
      Logout
    </button>
  );
}

function DesktopAuthLoading({ loggingOut }: { loggingOut: boolean }) {
  return (
    <div className="flex flex-1 items-center justify-end px-8">
      <div className="flex items-center gap-2 text-sm font-semibold text-black/45">
        <LoaderCircle size={20} className="animate-spin" />

        {loggingOut && "Logging out..."}
      </div>
    </div>
  );
}

function MobileNavigation({
  isLoggedIn,
  role,
  onLogout,
}: {
  isLoggedIn: boolean;
  role: Role | null;
  onLogout: () => void;
}) {
  return (
    <div className="absolute left-0 top-full w-full border-t border-black/10 bg-white shadow-xl lg:hidden">
      <div className="px-6 py-5">
        {!isLoggedIn ? (
          <div className="flex flex-col">
            <MobileNavItem href="/#how-it-works">How it works</MobileNavItem>

            <MobileNavItem href="/register?role=driver">Driver</MobileNavItem>

            <MobileNavItem href="/login">Log in</MobileNavItem>

            <Link
              href="/register"
              className="mt-4 flex h-12 items-center justify-center rounded-xl bg-[#C6FF2E] text-sm font-black text-black"
            >
              Sign up
            </Link>
          </div>
        ) : role === "PASSENGER" ? (
          <div className="flex flex-col">
            <Link
              href="/passenger"
              className="mb-3 flex h-12 items-center justify-center rounded-xl bg-[#C6FF2E] text-sm font-black text-black"
            >
              Get a ride
            </Link>

            <MobileNavItem href="/passenger/activity">Activity</MobileNavItem>

            <MobileNavItem href="/#how-it-works">How it works</MobileNavItem>

            <MobileLogoutButton onLogout={onLogout} />
          </div>
        ) : (
          <div className="flex flex-col">
            <MobileNavItem href="/driver">Driver</MobileNavItem>

            <MobileNavItem href="/driver/activity">Activity</MobileNavItem>

            <MobileNavItem href="/#how-it-works">How it works</MobileNavItem>

            <MobileLogoutButton onLogout={onLogout} />
          </div>
        )}
      </div>
    </div>
  );
}

function MobileLogoutButton({ onLogout }: { onLogout: () => void }) {
  return (
    <button
      type="button"
      onClick={onLogout}
      className="flex min-h-12 items-center gap-3 border-t border-black/10 py-4 text-left text-sm font-bold text-black"
    >
      <LogOut size={17} />
      Logout
    </button>
  );
}

type NavItemProps = {
  href: string;
  children: ReactNode;
};

function NavItem({ href, children }: NavItemProps) {
  return (
    <div className="flex items-stretch border-l border-black/10">
      <Link
        href={href}
        className="flex items-center px-8 text-[17px] font-bold text-black transition hover:bg-black hover:text-white"
      >
        {children}
      </Link>
    </div>
  );
}

function MobileNavItem({ href, children }: NavItemProps) {
  return (
    <Link
      href={href}
      className="flex min-h-12 items-center border-b border-black/10 py-4 text-sm font-bold text-black"
    >
      {children}
    </Link>
  );
}
