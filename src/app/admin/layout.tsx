import { Provider } from "@/components/ui/provider";
import "../globals.css";
import AuthGuard from "@/components/admin/AuthGuard";
import { Toaster } from "@/components/ui/toaster";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Provider>
          <AuthGuard>
            <>
                {children}
                <Toaster />
            </>
        </AuthGuard>
        </Provider>
      </body>
    </html>
  );
}
