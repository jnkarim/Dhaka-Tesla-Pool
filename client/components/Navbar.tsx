"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const [signupOpen, setSignupOpen] = useState(false);

  /*
    Auth pages-এ main landing navbar
    দেখাব না।
  */
  if (pathname === "/register" || pathname === "/login") {
    return null;
  }

  return (
    <header className="w-full border-b border-black/10 bg-white">
      <nav className="mx-auto flex h-[100px] max-w-[1540px] items-stretch px-6 lg:px-10">
        {/* Brand */}

        <div className="flex min-w-[260px] items-center border-r border-black/10 pr-8">
          <Link href="/" className="flex items-center">
            <span className="text-[26px] font-black tracking-[-0.04em] text-black">
              Dhaka
              <span className="text-[#C6FF2E]">Tesla</span>
              Pool
            </span>
          </Link>
        </div>

        {/* Desktop navigation */}

        <div className="hidden flex-1 items-stretch justify-end lg:flex">
          {/* Get a ride */}

          <div className="flex items-center border-r border-black/10 px-8">
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
                hover:opacity-90
              "
            >
              Get a ride
            </Link>
          </div>

          {/* Rider */}

          <NavItem href="/passenger">Rider</NavItem>

          {/* Driver */}

          <NavItem href="/driver">Driver</NavItem>

          {/* How it works */}

          <NavItem href="/#how-it-works">How it works</NavItem>

          {/* Login */}

          <NavItem href="/login">Log in</NavItem>

          {/* Sign up dropdown */}

          <div className="relative flex items-stretch border-r border-black/10">
            <button
              type="button"
              onClick={() => setSignupOpen((previous) => !previous)}
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
                  duration-200

                  ${signupOpen ? "rotate-180" : ""}
                `}
              />
            </button>

            {/* Dropdown */}

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
                  onClick={() => setSignupOpen(false)}
                  className="
                    block
                    px-8
                    py-5
                    text-[17px]
                    font-medium
                    text-black
                    transition
                    hover:bg-[#C6FF2E]
                  "
                >
                  Sign up to ride
                </Link>

                <Link
                  href="/register?role=driver"
                  onClick={() => setSignupOpen(false)}
                  className="
                    block
                    border-t
                    border-black/10
                    px-8
                    py-5
                    text-[17px]
                    font-medium
                    text-black
                    transition
                    hover:bg-[#C6FF2E]
                  "
                >
                  Apply to drive
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile navigation */}

        <div className="ml-auto flex items-center gap-3 lg:hidden">
          <Link
            href="/login"
            className="
              px-3
              py-2
              text-sm
              font-bold
              text-black
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
              text-black
            "
          >
            Sign up
          </Link>
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
    <div className="flex items-stretch border-r border-black/10">
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
