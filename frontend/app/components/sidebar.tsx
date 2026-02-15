"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Navigation menu items
const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Integration Visualization", href: "/integration-visualization" },
  { label: "Data Validation", href: "/data-validation" },
  { label: "Tool Stack", href: "/tool-stack" },
  { label: "Settings", href: "/settings" },
];

export function Sidebar() {
  // Get current page path for active state
  const pathname = usePathname();

  return (
    // Dark blue sidebar container
    <aside className="w-64 border-r" style={{ backgroundColor: '#00152b' }}>
      {/* Logo → Dashboard */}
      <div className="px-6 py-5 border-b border-blue-800">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image src="/icon0.svg" alt="Logo" width={32} height={32} className="rounded-md" />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">Pantheon</div>
          </div>
        </Link>
      </div>

      {/* Navigation links */}
      <nav className="px-3 py-4 space-y-1">
        {navItems.map((item) => {
          // Check if current page matches this nav item
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "block rounded-md px-3 py-2 text-sm text-white",
                active
                  ? "bg-blue-800 font-medium"
                  : "hover:bg-blue-900",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
