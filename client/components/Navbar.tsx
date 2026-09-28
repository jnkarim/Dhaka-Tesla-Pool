"use client";

import Link from "next/link";
import { useState } from "react";
import { Globe2, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [signupOpen, setSignupOpen] = useState(false);

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
                hover:bg-[#B8F51E]
              "
            >
              Get a ride
            </Link>
          </div>

          <NavItem href="/passenger">Rider</NavItem>

          <NavItem href="/driver">Driver</NavItem>

          <NavItem href="#how-it-works">How it works</NavItem>

          <NavItem href="/login">Log in</NavItem>

          {/* Sign up dropdown */}
          <div className="relative flex items-stretch border-r border-black/10">
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
                className={`transition-transform ${
                  signupOpen ? "rotate-180" : ""
                }`}
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
