import BarGraph from "./components/BarGraph";
import FilterableTable from "./components/FilterableTable";

/**
 * Dashboard homepage
 */
export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-[color:var(--text-primary)] mb-8">Dashboard</h1>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <BarGraph />
        <FilterableTable />
      </div>
    </div>
  );
}
