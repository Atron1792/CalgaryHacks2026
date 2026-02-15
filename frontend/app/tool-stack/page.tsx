import ApiAccessKey from "@/app/components/ApiAccessKey";

export default function ToolStackPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold --text-color mb-8">Tool Stack</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-6">API Access Keys</h2>
        <div className="space-y-3">
          <ApiAccessKey
            name="Google Analytics API"
            initialValue={process.env.NEXT_PUBLIC_GA_API_KEY || ""}
            storageKey="gaApiKey"
          />
          <ApiAccessKey
            name="HubSpot API"
            initialValue={process.env.NEXT_PUBLIC_HUBSPOT_API_KEY || ""}
            storageKey="hubspotApiKey"
          />
        </div>
      </div>
    </div>
  );
}