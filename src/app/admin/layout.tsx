import { Provider } from "@/components/ui/provider";
import "../globals.css";
import AuthGuard from "@/components/admin/AuthGuard";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "next-auth/react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider>
          <SessionProvider>
            <AuthGuard>
              <>
                {children}
                <Toaster />
              </>
            </AuthGuard>
          </SessionProvider>
        </Provider>
      </body>
    </html>
  );
}
