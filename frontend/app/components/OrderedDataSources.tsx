/**
 * OrderedDataSources Component
 * 
 * Displays a table of all integrated data sources currently in the orderedData folder.
 * Shows the tech stack name, table name, and data type (analytics or CRM).
 */

"use client";

type DataSource = {
  techStack: string;
  table: string;
  fileName?: string;
  dataType?: string;
};

type OrderedDataSourcesProps = {
  orderedData: DataSource[];
};

export default function OrderedDataSources({ orderedData }: OrderedDataSourcesProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Integrated Data Sources</h2>
      <div className="bg-[color:var(--surface-1)] rounded-lg border border-[color:var(--border)] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[color:var(--surface-2)]">
            <tr>
              <th className="text-left p-4 font-medium">Tech Stack</th>
              <th className="text-left p-4 font-medium">Table</th>
              <th className="text-left p-4 font-medium">Type</th>
            </tr>
          </thead>
          <tbody>
            {orderedData.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-[color:var(--text-muted)]">
                  No integrated data sources yet
                </td>
              </tr>
            ) : (
              orderedData.map((source, idx) => (
                <tr
                  key={idx}
                  className="border-t border-[color:var(--border)] hover:bg-[color:var(--surface-hover)]"
                >
                  <td className="p-4">{source.techStack}</td>
                  <td className="p-4">{source.table}</td>
                  <td className="p-4 text-[color:var(--text-muted)]">{source.dataType}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
