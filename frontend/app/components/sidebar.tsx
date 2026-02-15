"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

/**
 * Navigation menu items for the sidebar.
 * Each item contains a display label and a corresponding href path.
 */
const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Integration Visualization", href: "/integration-visualization" },
  { label: "Data Validation", href: "/data-validation" },
  { label: "Tool Stack", href: "/tool-stack" },
  { label: "Settings", href: "/settings" },
];

/**
 * Sidebar Component
 * 
 * Renders a navigation sidebar with logo/branding and main navigation links.
 * Highlights the current page with an active state based on the URL pathname.
 */
export function Sidebar() {
  // Get the current page pathname to determine active navigation state
  const pathname = usePathname();

  return (
    // Dark blue sidebar container with border on the right
    <aside className="w-64 border-r" style={{ backgroundColor: '#00152b' }}>
      {/* Logo section linking back to dashboard */}
      <div className="px-6 py-5 border-b border-blue-800">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image src="/icon0.svg" alt="Logo" width={32} height={32} className="rounded-md" />
          <div className="leading-tight">
            <div className="text-xl font-semibold text-white">Pantheon</div>
          </div>
        </Link>
      </div>

      {/* Navigation menu with active state highlighting */}
      <nav className="px-3 py-4 space-y-1">
        {navItems.map((item) => {
          // Determine if this nav item corresponds to the current page
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
