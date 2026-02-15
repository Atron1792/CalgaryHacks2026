/**
 * DataValidation Component
 * 
 * Main component for the data validation page.
 * Manages state, data fetching, and integration logic for raw and ordered data sources.
 * Supports ignoring data sources that should not be integrated.
 */

"use client";

import { useEffect, useState } from "react";
import { useNotifications } from "@/app/components/NotificationProvider";
import RawDataSources from "@/app/components/RawDataSources";
import OrderedDataSources from "@/app/components/OrderedDataSources";

type DataSource = {
  techStack: string;
  table: string;
  fileName?: string;
  dataType?: string;
};

const IGNORED_SOURCES_KEY = "ignoredDataSources";

export default function DataValidation() {
  const [rawData, setRawData] = useState<DataSource[]>([]);
  const [orderedData, setOrderedData] = useState<DataSource[]>([]);
  const [ignoredData, setIgnoredData] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [integrating, setIntegrating] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  // Load ignored sources from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(IGNORED_SOURCES_KEY);
    if (stored) {
      try {
        setIgnoredData(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse ignored sources", error);
      }
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rawRes, orderedRes] = await Promise.all([
        fetch("http://localhost:5000/api/validation/raw-data"),
        fetch("http://localhost:5000/api/validation/ordered-data"),
      ]);

      if (rawRes.ok) setRawData(await rawRes.json());
      if (orderedRes.ok) setOrderedData(await orderedRes.json());
    } catch (error) {
      addNotification("Failed to fetch validation data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        // Wait a bit for database write to complete, then refresh
        setTimeout(() => {
          fetchData();
          setIntegrating(null);
        }, 500);
      } else {
        addNotification(`Failed to integrate: ${result.error}`, "error");
        setIntegrating(null);
      }
    } catch (error) {
      addNotification("Integration request failed", "error");
      setIntegrating(null);
    }
  };

  const handleIgnore = (source: DataSource) => {
    const key = `${source.techStack}-${source.table}`;
    
    let newIgnoredData: string[];
    if (ignoredData.includes(key)) {
      // Unignore: remove from list
      newIgnoredData = ignoredData.filter((k) => k !== key);
      addNotification(`Unignored ${key}`, "info");
    } else {
      // Ignore: add to list
      newIgnoredData = [...ignoredData, key];
      addNotification(`Ignored ${key}`, "info");
    }
    
    setIgnoredData(newIgnoredData);
    localStorage.setItem(IGNORED_SOURCES_KEY, JSON.stringify(newIgnoredData));
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Data Validation</h1>
        <p className="text-[color:var(--text-muted)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Data Validation</h1>
      
      <RawDataSources
        rawData={rawData}
        orderedData={orderedData}
        ignoredData={ignoredData}
        integrating={integrating}
        onIntegrate={handleIntegrate}
        onIgnore={handleIgnore}
      />
      
      <OrderedDataSources orderedData={orderedData} />
    </div>
  );
}
