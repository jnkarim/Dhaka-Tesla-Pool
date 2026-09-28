import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";

import { headers } from "next/headers";

import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dhaka Tesla Pool",
  description: "Smart ride pooling for Dhaka commuters",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const headersList = await headers();

  const pathname = headersList.get("x-pathname") ?? "";

  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {!isAuthPage && <Navbar />}

        <main className="flex-1">{children}</main>

        {!isAuthPage && <Footer />}
      </body>
    </html>
  );
}
