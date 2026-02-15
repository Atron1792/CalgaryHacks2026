"use client";

import { useEffect, useState } from "react";
import IntegrationNode from "../components/IntegrationNode";

// Integration visualization notes:
// - Nodes render a straight line to their `pointsTo` target by matching node IDs.
// - GA/HubSpot status turns red when their API key is empty in Tool Stack.
// - Yellow means configured but awaiting deeper health checks.
type NodeStatus = "ok" | "warning" | "error";

const STATUS_COLORS: Record<NodeStatus, string> = {
  ok: "#34d399",
  warning: "#facc15",
  error: "#ef4444",
};

export default function IntegrationVisualizationPage() {
  const [gaKey, setGaKey] = useState<string | null>(null);
  const [hubspotKey, setHubspotKey] = useState<string | null>(null);

  useEffect(() => {
    const savedGaValue = localStorage.getItem("gaApiKey");
    const savedHubspotValue = localStorage.getItem("hubspotApiKey");

    setGaKey(savedGaValue ?? "");
    setHubspotKey(savedHubspotValue ?? "");

    const handleKeyUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ key: string; value: string }>;

      if (customEvent.detail?.key === "gaApiKey") {
        setGaKey(customEvent.detail.value ?? "");
      }

      if (customEvent.detail?.key === "hubspotApiKey") {
        setHubspotKey(customEvent.detail.value ?? "");
      }
    };

    window.addEventListener("api-key-updated", handleKeyUpdate);
    return () => window.removeEventListener("api-key-updated", handleKeyUpdate);
  }, []);

  const gaStatus: NodeStatus =
    gaKey === null
      ? "warning"
      : gaKey.trim().length === 0
        ? "error"
        : "warning";

  const hubspotStatus: NodeStatus =
    hubspotKey === null
      ? "warning"
      : hubspotKey.trim().length === 0
        ? "error"
        : "warning";

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-[color:var(--text-primary)] mb-2">
        Integration Visualization
      </h1>
      <p className="text-sm text-[color:var(--text-muted)] mb-8">
        Live status from acquisition to visualization.
      </p>

      <div className="relative grid grid-cols-1 justify-items-center gap-6 md:grid-cols-3 md:grid-rows-2 md:gap-10" data-integration-container>
        <IntegrationNode
          id="ga"
          label="GA"
          name="Google Analytics"
          status={gaStatus}
          href="/tool-stack"
          ringColor={STATUS_COLORS[gaStatus]}
          pointsTo="ga-db"
        />

        <IntegrationNode
          id="ga-db"
          label="DB"
          name="GA Database"
          status="ok"
          href="/data-validation"
          ringColor={STATUS_COLORS.ok}
          pointsTo="dv"
        />

        <div className="md:row-span-2 md:flex md:items-center">
          <IntegrationNode
            id="dv"
            label="DV"
            name="Data Visualization"
            status="ok"
            href="/"
            ringColor={STATUS_COLORS.ok}
          />
        </div>

        <IntegrationNode
          id="hs"
          label="HS"
          name="HubSpot"
          status={hubspotStatus}
          href="/tool-stack"
          ringColor={STATUS_COLORS[hubspotStatus]}
          pointsTo="hs-db"
        />

        <IntegrationNode
          id="hs-db"
          label="DB"
          name="HubSpot DB"
          status="ok"
          href="/data-validation"
          ringColor={STATUS_COLORS.ok}
          pointsTo="dv"
        />
      </div>
    </div>
  );
}