"use client";

import { useEffect, useMemo, useState } from "react";

// Backend returns: [{ "Direct": 71315 }, { "Paid Search": 17755 }, ...]
type BarData = Record<string, number>;

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#14b8a6",
  "#f97316",
  "#84cc16",
];

type NormalizedDatum = { label: string; value: number };

function normalize(raw: BarData[]): NormalizedDatum[] {
  if (!Array.isArray(raw)) return [];

  const out: NormalizedDatum[] = [];

  for (const obj of raw) {
    if (!obj || typeof obj !== "object") continue;

    // Each object is expected to have exactly one key-value
    const entries = Object.entries(obj);
    if (entries.length === 0) continue;

    const [label, valueRaw] = entries[0];

    // Coerce value safely
    const value =
      typeof valueRaw === "number"
        ? valueRaw
        : typeof valueRaw === "string"
        ? Number(valueRaw)
        : NaN;

    if (!label) continue;
    if (!Number.isFinite(value)) continue;

    // Drop Total row
    if (label.toLowerCase() === "total") continue;

    out.push({ label, value });
  }

  return out;
}

export default function BarGraph() {
  const [raw, setRaw] = useState<BarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch from Next proxy route (recommended)
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // IMPORTANT: use the same route you actually created in Next:
        // frontend/app/api/barData/route.ts  -> "/api/barData"
        const res = await fetch("/api/barData", { cache: "no-store" });

        if (!res.ok) throw new Error(`Request failed (${res.status})`);

        const json = await res.json();
        setRaw(json);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const data = useMemo(() => normalize(raw), [raw]);

  const maxValue = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.max(...data.map((d) => d.value));
  }, [data]);

  const median = useMemo(() => {
    if (data.length === 0) return 0;
    const values = [...data.map((d) => d.value)].sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    return values.length % 2 === 0
      ? (values[mid - 1] + values[mid]) / 2
      : values[mid];
  }, [data]);

  const medianPct = maxValue > 0 ? (median / maxValue) * 100 : 0;

  if (loading) return <div style={{ color: "white" }}>Loading chart data…</div>;
  if (error) return <div style={{ color: "#f87171" }}>Error: {error}</div>;
  if (data.length === 0) return <div style={{ color: "white" }}>No data available</div>;

  return (
    // Quarter-page sizing:
    // - max width ~ 520px
    // - fixed height ~ 280px
    // This usually reads as "about 1/4" of a typical dashboard view.
    <div
      style={{
        width: "min(520px, 25vw)",   // quarter-ish width
        minWidth: "360px",          // don’t become unusably small
        height: "280px",            // quarter-ish height
        background: "#0f172a",       // deep navy
        border: "1px solid #1f2937",
        borderRadius: 12,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        color: "white",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
        Google Analytics – Traffic by Channel
      </div>

      {/* Chart area */}
      <div
        style={{
          position: "relative",
          flex: 1,
          background: "#111827",
          border: "1px solid #1f2937",
          borderRadius: 10,
          padding: 12,
          overflow: "hidden",
        }}
      >
        {/* Median line */}
        <div
          title={`Median: ${median.toLocaleString()}`}
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            bottom: `${medianPct}%`,
            borderTop: "1px dashed #facc15",
            opacity: 0.75,
            pointerEvents: "none",
          }}
        />

        {/* Bars row */}
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {data.map((d, i) => {
            const pct = maxValue > 0 ? (d.value / maxValue) * 100 : 0;
            const color = COLORS[i % COLORS.length];

            return (
              <div
                key={d.label}
                style={{
                  width: 70,
                  flex: "0 0 auto",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  gap: 6,
                }}
              >
                {/* Bar */}
                <div
                  title={`${d.label}: ${d.value.toLocaleString()}`}
                  style={{
                    height: `${pct}%`,
                    minHeight: 3,
                    background: color,
                    borderRadius: "8px 8px 0 0",
                    transition: "height 200ms ease",
                  }}
                />

                {/* Label + value */}
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#cbd5e1",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={d.label}
                  >
                    {d.label}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>
                    {d.value.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
