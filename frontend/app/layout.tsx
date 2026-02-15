import "./globals.css";
import { Sidebar } from "@/app/components/Sidebar";
import ThemeProvider from "@/app/components/ThemeProvider";
import NotificationProvider from "@/app/components/NotificationProvider";

export const metadata = {
  title: "Pantheon",
  description: "A unified data visualization dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]"
      >
        <ThemeProvider />
        <NotificationProvider>
          <div className="min-h-screen flex">
            {/* Persistent sidebar across ALL routes */}
            <Sidebar />
            {/* Page content */}
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </NotificationProvider>
      </body>
    </html>
  );
}
