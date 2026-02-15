"use client";

import { useEffect, useState } from "react";
import { useNotifications } from "@/app/components/NotificationProvider";

type DataSource = {
  techStack: string;
  table: string;
  fileName?: string;
  dataType?: string;
};

type ValidationStatus = {
  allIntegrated: boolean;
  missing: DataSource[];
};

export default function DataValidationPage() {
  const [rawData, setRawData] = useState<DataSource[]>([]);
  const [orderedData, setOrderedData] = useState<DataSource[]>([]);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [integrating, setIntegrating] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rawRes, orderedRes, statusRes] = await Promise.all([
        fetch("http://localhost:5000/api/validation/raw-data"),
        fetch("http://localhost:5000/api/validation/ordered-data"),
        fetch("http://localhost:5000/api/validation/status"),
      ]);

      if (rawRes.ok) setRawData(await rawRes.json());
      if (orderedRes.ok) setOrderedData(await orderedRes.json());
      if (statusRes.ok) setValidationStatus(await statusRes.json());
    } catch (error) {
      addNotification("Failed to fetch validation data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isIntegrated = (source: DataSource) => {
    return orderedData.some(
      (od) => od.techStack === source.techStack && od.table === source.table
    );
  };

  const handleIntegrate = async (source: DataSource) => {
    const key = `${source.techStack}-${source.table}`;
    setIntegrating(key);

    try {
      // Determine data type based on tech stack
      const dataType = source.techStack === "googleAnalytics4" ? "analytics" : "CRM";

      const res = await fetch("http://localhost:5000/api/validation/integrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          techStack: source.techStack,
          table: source.table,
          dataType,
        }),
      });

      const result = await res.json();

      if (result.success) {
        addNotification(`Successfully integrated ${key}`, "success");
        fetchData(); // Refresh data
      } else {
        addNotification(`Failed to integrate: ${result.error}`, "error");
      }
    } catch (error) {
      addNotification("Integration request failed", "error");
    } finally {
      setIntegrating(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Data Validation</h1>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Data Validation</h1>

      {/* Validation Status */}
      <div className="mb-8">
        {validationStatus?.allIntegrated ? (
          <div className="bg-green-600/20 border border-green-500 rounded-lg p-4">
            <p className="text-green-400 font-medium">
              ✓ All data sources are integrated
            </p>
          </div>
        ) : (
          <div className="bg-red-600/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400 font-medium">
              ⚠ {validationStatus?.missing.length || 0} data source(s) not integrated
            </p>
          </div>
        )}
      </div>

      {/* Raw Data Sources */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Available Raw Data Sources</h2>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="text-left p-4 font-medium">Tech Stack</th>
                <th className="text-left p-4 font-medium">Table</th>
                <th className="text-left p-4 font-medium">File Name</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rawData.map((source, idx) => {
                const integrated = isIntegrated(source);
                const key = `${source.techStack}-${source.table}`;
                const isIntegratingThis = integrating === key;

                return (
                  <tr
                    key={idx}
                    className="border-t border-slate-700 hover:bg-slate-700/30"
                  >
                    <td className="p-4">{source.techStack}</td>
                    <td className="p-4">{source.table}</td>
                    <td className="p-4 text-slate-400">{source.fileName}</td>
                    <td className="p-4">
                      {integrated ? (
                        <span className="text-green-400">✓ Integrated</span>
                      ) : (
                        <span className="text-orange-400">⚠ Not Integrated</span>
                      )}
                    </td>
                    <td className="p-4">
                      {!integrated && (
                        <button
                          onClick={() => handleIntegrate(source)}
                          disabled={isIntegratingThis}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-4 py-2 rounded transition-colors"
                        >
                          {isIntegratingThis ? "Integrating..." : "Integrate"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ordered Data (Integrated) */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Integrated Data Sources</h2>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="text-left p-4 font-medium">Tech Stack</th>
                <th className="text-left p-4 font-medium">Table</th>
                <th className="text-left p-4 font-medium">Type</th>
              </tr>
            </thead>
            <tbody>
              {orderedData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-slate-400">
                    No integrated data sources yet
                  </td>
                </tr>
              ) : (
                orderedData.map((source, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-slate-700 hover:bg-slate-700/30"
                  >
                    <td className="p-4">{source.techStack}</td>
                    <td className="p-4">{source.table}</td>
                    <td className="p-4 text-slate-400">{source.dataType}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}