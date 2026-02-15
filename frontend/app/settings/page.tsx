"use client";

import ThemeToggle from "@/app/components/ThemeToggle";

export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <ThemeToggle />
    </div>
  );
}
