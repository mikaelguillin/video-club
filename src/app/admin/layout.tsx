import { Provider } from "@/components/ui/provider";
import "../globals.css";
import AuthGuard from "@/components/admin/AuthGuard";
import { SessionProvider } from "next-auth/react";
import Layout from "@/components/admin/Layout";

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
              <Layout>
                {children}
              </Layout>
            </AuthGuard>
          </SessionProvider>
        </Provider>
      </body>
    </html>
  );
}
