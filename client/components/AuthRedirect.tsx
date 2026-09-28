"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

export default function AuthRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await api<{
          success: boolean;
          data?: {
            role?: "PASSENGER" | "DRIVER";
          };
        }>("/auth/me");

        if (response.success) {
          const role = response.data?.role;

          router.replace(role === "DRIVER" ? "/driver" : "/passenger");

          return;
        }
      } catch {
        setChecking(false);
      }
    }

    checkAuth();
  }, [router]);

  if (checking) {
    return null;
  }

  return children;
}
