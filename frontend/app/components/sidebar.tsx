// frontend/app/components/sidebar.tsx
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <nav>
        <Link href="/dashboard" className="nav-item">Dashboard</Link>
        <Link href="/settings" className="nav-item">Settings</Link>
      </nav>
    </aside>
  );
}