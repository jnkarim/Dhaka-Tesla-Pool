"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

export default function PassengerGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    async function checkRole() {
      try {
        const response = await api<{
          success: boolean;
          data?: {
            role: "PASSENGER" | "DRIVER";
          };
        }>("/auth/me");

        if (response.data?.role === "DRIVER") {
          router.replace("/driver");
        }
      } catch {
        router.replace("/login");
      }
    }

    checkRole();
  }, [router]);

  return children;
}
