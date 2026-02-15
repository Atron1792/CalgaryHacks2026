"use client";

import { useEffect, useMemo, useState } from "react";

type BarDatum = {
  label: string;
  value: number;
};

/**
 * Simple bar graph component.
 * Fetches data from /api/bar-data (Next proxy -> Flask -> SQLite).
 */
export default function Bargraph() {
  const [data, setData] = useState<BarDatum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Compute max value for bar scaling
  const maxValue = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.max(...data.map((d) => d.value));
  }, [data]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Call Next.js API route (same-origin)
        const res = await fetch("/api/bar-data", { cache: "no-store" });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);

        const json = (await res.json()) as BarDatum[];

        // Basic validation (helps catch backend shape issues)
        const cleaned = json
          .filter((d) => typeof d.label === "string" && typeof d.value === "number")
          .map((d) => ({ label: d.label, value: d.value }));

        setData(cleaned);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div>Loading bar graph…</div>;
  if (error) return <div>Error: {error}</div>;
  if (data.length === 0) return <div>No data found.</div>;

  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
      <h2 style={{ margin: 0, marginBottom: 12, fontSize: 16, fontWeight: 600 }}>
        Bar Graph
      </h2>

      <div style={{ display: "grid", gap: 10 }}>
        {data.map((d) => {
          const pct = maxValue === 0 ? 0 : (d.value / maxValue) * 100;

          return (
            <div key={d.label} style={{ display: "grid", gridTemplateColumns: "120px 1fr 60px", gap: 10, alignItems: "center" }}>
              {/* Label */}
              <div style={{ fontSize: 14, color: "#374151" }}>{d.label}</div>

              {/* Bar track + bar */}
              <div style={{ height: 12, background: "#f3f4f6", borderRadius: 999 }}>
                <div
                  style={{
                    height: 12,
                    width: `${pct}%`,
                    background: "#111827",
                    borderRadius: 999,
                    transition: "width 200ms ease",
                  }}
                />
              </div>

              {/* Value */}
              <div style={{ fontSize: 14, color: "#111827", textAlign: "right" }}>{d.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
