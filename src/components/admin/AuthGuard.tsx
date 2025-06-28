"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't guard the login page
    if (pathname === "/admin/login") return;

    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/admin/login");
    }
  }, [session, status, pathname, router]);

  useEffect(() => {
    // Redirect authenticated users away from login page
    if (pathname === "/admin/login" && session && status === "authenticated") {
      router.push("/admin");
    }
  }, [session, status, pathname, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // Don't render children on login page if already authenticated
  if (pathname === "/admin/login" && session) {
    return null;
  }

  return <>{children}</>;
}
