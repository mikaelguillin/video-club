"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    // Don't guard the login page
    if (pathname === "/admin/login") return;
    fetch("/admin/api/login", { method: "GET" })
      .then((res) => {
        if (!res.ok) router.push("/admin/login");
      })
      .catch(() => router.push("/admin/login"));
  }, [pathname, router]);
  return <>{children}</>;
}
