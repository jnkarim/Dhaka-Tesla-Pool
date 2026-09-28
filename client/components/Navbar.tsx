"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ChevronDown, LogOut } from "lucide-react";

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

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await api<MeResponse>("/auth/me");

        if (response.success) {
          setIsLoggedIn(true);

          setRole(response.data?.role ?? null);
        }
      } catch {
        setIsLoggedIn(false);

        setRole(null);
      }
    }

    checkAuth();
  }, [pathname]);

  async function handleLogout() {
    try {
      await api("/auth/logout", {
        method: "POST",
      });

      setIsLoggedIn(false);

      setRole(null);

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  }

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const isDriver = role === "DRIVER";

  return (
    <header
      className="
        w-full
        border-b
        border-black/10
        bg-white
      "
    >
      <nav
        className="
          mx-auto
          flex
          h-[100px]
          max-w-[1540px]
          items-stretch
          px-6
          lg:px-10
        "
      >
        {/* Logo */}

        <div
          className="
            flex
            min-w-[260px]
            items-center
            border-r
            border-black/10
            pr-8
          "
        >
          <Link href="/">
            <span
              className="
                text-[26px]
                font-black
                tracking-[-0.04em]
                text-black
              "
            >
              Dhaka
              <span className="text-[#C6FF2E]">Tesla</span>
              Pool
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}

        <div
          className="
            hidden
            flex-1
            items-stretch
            justify-end
            lg:flex
          "
        >
          {/* Passenger */}

          {!isDriver && (
            <div
              className="
                flex
                items-center
                border-r
                border-black/10
                px-8
              "
            >
              <Link
                href="/passenger"
                className="
                  rounded-full
                  bg-[#C6FF2E]
                  px-8
                  py-4
                  text-[17px]
                  font-bold
                  text-black
                  transition
                  hover:scale-[1.02]
                "
              >
                Get a ride
              </Link>
            </div>
          )}

          {!isDriver && <NavItem href="/passenger">Rider</NavItem>}

          {/* Driver */}

          {!isLoggedIn || role === "DRIVER" ? (
            <NavItem href="/driver">Driver</NavItem>
          ) : null}

          <NavItem href="/#how-it-works">How it works</NavItem>

          {/* Guest */}

          {!isLoggedIn && (
            <>
              <NavItem href="/login">Log in</NavItem>

              <div
                className="
                  relative
                  flex
                  items-stretch
                  border-r
                  border-black/10
                "
              >
                <button
                  type="button"
                  onClick={() => setSignupOpen((prev) => !prev)}
                  className="
                    flex
                    items-center
                    gap-2
                    px-8
                    text-[17px]
                    font-bold
                    text-black
                    transition
                    hover:bg-black
                    hover:text-white
                  "
                >
                  Sign up
                  <ChevronDown
                    size={17}
                    className={`
                      transition-transform

                      ${signupOpen ? "rotate-180" : ""}
                    `}
                  />
                </button>

                {signupOpen && (
                  <div
                    className="
                      absolute
                      right-0
                      top-full
                      z-50
                      min-w-[245px]
                      border
                      border-black/10
                      bg-white
                      shadow-xl
                    "
                  >
                    <Link
                      href="/register"
                      className="
                        block
                        px-8
                        py-5
                        text-[17px]
                        hover:bg-[#C6FF2E]
                      "
                    >
                      Sign up to ride
                    </Link>

                    <Link
                      href="/register?role=driver"
                      className="
                        block
                        border-t
                        border-black/10
                        px-8
                        py-5
                        text-[17px]
                        hover:bg-[#C6FF2E]
                      "
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
              className="
                flex
                items-center
                gap-2
                border-r
                border-black/10
                px-8
                text-[17px]
                font-bold
                text-black
                transition
                hover:bg-black
                hover:text-white
              "
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
        </div>

        {/* Mobile */}

        <div
          className="
            ml-auto
            flex
            items-center
            gap-3
            lg:hidden
          "
        >
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="
                  text-sm
                  font-bold
                "
              >
                Log in
              </Link>

              <Link
                href="/register"
                className="
                  rounded-full
                  bg-[#C6FF2E]
                  px-5
                  py-3
                  text-sm
                  font-black
                "
              >
                Sign up
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="
                flex
                items-center
                gap-2
                text-sm
                font-bold
              "
            >
              <LogOut size={16} />
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}

type NavItemProps = {
  href: string;
  children: React.ReactNode;
};

function NavItem({ href, children }: NavItemProps) {
  return (
    <div
      className="
        flex
        items-stretch
        border-r
        border-black/10
      "
    >
      <Link
        href={href}
        className="
          flex
          items-center
          px-8
          text-[17px]
          font-bold
          text-black
          transition
          hover:bg-black
          hover:text-white
        "
      >
        {children}
      </Link>
    </div>
  );
}
