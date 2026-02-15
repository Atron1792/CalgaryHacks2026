"use client";

import { useEffect, useState } from "react";

// Bar data structure
type BarData = {
  label: string;
  value: number;
};

/**
 * BarGraph component - displays Google Analytics traffic data
 * Fetches data from Flask backend using SQLite database
 */
export default function BarGraph() {
  const [data, setData] = useState<BarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from backend
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch("/api/bar-data", { cache: "no-store" });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Calculate max value for scaling bars
  const maxValue = Math.max(...data.map(d => d.value), 0);

  if (loading) {
    return <div className="text-white p-6">Loading chart data...</div>;
  }

  if (error) {
    return <div className="text-red-400 p-6">Error: {error}</div>;
  }

  if (data.length === 0) {
    return <div className="text-white p-6">No data available</div>;
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
      <h2 className="text-white text-xl font-semibold mb-6">
        Google Analytics - Traffic by Channel
      </h2>

      <div className="space-y-4">
        {data.map((item) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

          return (
            <div key={item.label} className="grid grid-cols-[150px_1fr_100px] gap-4 items-center">
              {/* Channel name */}
              <div className="text-sm text-gray-300 truncate">{item.label}</div>

              {/* Bar */}
              <div className="h-8 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Session count */}
              <div className="text-sm text-white text-right font-medium tabular-nums">
                {item.value.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


