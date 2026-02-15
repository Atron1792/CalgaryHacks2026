import BarGraph from "./components/BarGraph";

/**
 * Dashboard homepage
 */
export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
      <BarGraph />
    </div>
  );
}
