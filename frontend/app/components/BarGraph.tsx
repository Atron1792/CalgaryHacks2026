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

type BarItem = {
  label: string;
  value: number;
};

export default function BarGraph() {
  const [data, setData] = useState<BarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const res = await fetch("/api/barData", { cache: "no-store" });

        if (!res.ok) {
          throw new Error(`Failed to load data (${res.status})`);
        }

        const json = (await res.json()) as BarData[];

        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unexpected error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo<BarItem[]>(() => {
    return data.flatMap((entry) => {
      return Object.entries(entry).map(([label, value]) => ({
        label,
        value,
      }));
    });
  }, [data]);

  const maxValue = useMemo(() => {
    return items.reduce((max, item) => Math.max(max, item.value), 0) || 1;
  }, [items]);

  return (
    <section className="w-full max-w-[39rem]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold --text-color">
          Traffic Acquisition
        </h2>
        {loading ? (
          <span className="text-sm text-slate-400">Loading...</span>
        ) : null}
      </div>

      <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5 shadow-sm">
        {error ? (
          <div className="text-sm text-red-300">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-slate-400">
            No data available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => {
              const widthPct = Math.max(
                2,
                Math.round((item.value / maxValue) * 100)
              );
              const sharePct = maxValue
                ? (item.value / maxValue) * 100
                : 0;

              return (
                <div key={`${item.label}-${index}`} className="flex items-center gap-3">
                  <div className="w-36 text-sm text-slate-200">
                    {item.label}
                  </div>
                  <div className="flex-1">
                    <div className="h-3 rounded-full bg-slate-800">
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm text-slate-300 tabular-nums">
                    {item.value.toLocaleString()}
                  </div>
                  <div className="w-14 text-right text-xs text-slate-500 tabular-nums">
                    {sharePct.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
