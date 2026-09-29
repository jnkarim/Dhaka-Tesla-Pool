import Link from "next/link";

import { ExternalLink, Route } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black px-6 pt-20 text-white lg:px-10">
      <div className="mx-auto max-w-[1540px]">
        {/* Top */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_2fr]">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center text-2xl font-black tracking-[-0.04em]"
            >
              <span>Dhaka</span>
              <span className="text-[#C6FF2E]">Tesla</span>
              <span>Pool</span>
            </Link>

            <p className="mt-6 max-w-[360px] text-[15px] leading-7 text-white/45">
              Smart shared rides across Dhaka for passengers and drivers
              travelling the same way.
            </p>

            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C6FF2E] text-black">
                <Route size={17} />
              </div>

              <div>
                <p className="text-xs text-white/35">Built for</p>

                <p className="text-sm font-bold">Shared rides in Dhaka</p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {/* Passengers */}
            <FooterColumn title="Passengers">
              <FooterLink href="/passenger">Find a ride</FooterLink>

              <FooterLink href="/login">Ride history</FooterLink>

              <FooterLink href="/passenger">Fare estimate</FooterLink>
            </FooterColumn>

            {/* Drivers */}
            <FooterColumn title="Drivers">
              <FooterLink href="/driver">Available pools</FooterLink>

              <FooterLink href="/driver">Go online</FooterLink>

              <FooterLink href="/driver">Trip management</FooterLink>
            </FooterColumn>

            {/* Product */}
            <FooterColumn title="Product">
              <FooterLink href="#features">Shared pooling</FooterLink>

              <FooterLink href="#how-it-works">How it works</FooterLink>

              <FooterLink href="#how-it-works">Ride lifecycle</FooterLink>
            </FooterColumn>

            {/* Project */}
            <FooterColumn title="Project">
              <FooterExternal href="https://github.com/jnkarim/Dhaka-Tesla-Pool">
                GitHub
              </FooterExternal>

              <FooterExternal href="#">API docs</FooterExternal>

              <FooterExternal href="#">Architecture</FooterExternal>
            </FooterColumn>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 border-t border-white/10 py-8 text-sm text-white/35">
          <p>© 2026 Dhaka Tesla Pool</p>
        </div>
      </div>
    </footer>
  );
}

/*
   FOOTER COLUMN
   */

type FooterColumnProps = {
  title: string;
  children: React.ReactNode;
};

function FooterColumn({ title, children }: FooterColumnProps) {
  return (
    <div>
      <h3 className="mb-5 text-[16px] font-bold text-white">{title}</h3>

      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

/*
   INTERNAL LINK
   */

type FooterLinkProps = {
  href: string;
  children: React.ReactNode;
};

function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <Link
      href={href}
      className="w-fit text-sm text-white/50 transition hover:text-[#C6FF2E]"
    >
      {children}
    </Link>
  );
}

/*
   EXTERNAL LINK
   */

type FooterExternalProps = {
  href: string;
  children: React.ReactNode;
};

function FooterExternal({ href, children }: FooterExternalProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex w-fit items-center gap-2 text-sm text-white/50 transition hover:text-[#C6FF2E]"
    >
      {children}

      <ExternalLink
        size={13}
        className="opacity-40 transition group-hover:opacity-100"
      />
    </a>
  );
}
