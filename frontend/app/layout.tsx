import "./globals.css";
import { Sidebar } from "@/app/components/Sidebar";

export const metadata = {
  title: "Panethon",
  description: "A unified data visualization dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="min-h-screen bg-black text-white">
        <div className="min-h-screen flex">
          {/* Persistent sidebar across ALL routes */}
          <Sidebar />
          {/* Page content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
