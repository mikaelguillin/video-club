import { Provider } from "@/components/ui/provider";
import "../globals.css";
import AuthGuard from "@/components/admin/AuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Provider>
          <AuthGuard>{children}</AuthGuard>
        </Provider>
      </body>
    </html>
  );
}
