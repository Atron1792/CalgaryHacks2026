/**
 * RawDataSources Component
 * 
 * Displays a table of all available raw CSV data sources with their integration status.
 * Allows users to integrate or ignore unintegrated sources.
 */

"use client";

type DataSource = {
  techStack: string;
  table: string;
  fileName?: string;
  dataType?: string;
};

type RawDataSourcesProps = {
  rawData: DataSource[];
  orderedData: DataSource[];
  ignoredData: string[]; // Array of "techStack-table" keys
  integrating: string | null;
  onIntegrate: (source: DataSource) => void;
  onIgnore: (source: DataSource) => void;
};

export default function RawDataSources({
  rawData,
  orderedData,
  ignoredData,
  integrating,
  onIntegrate,
  onIgnore,
}: RawDataSourcesProps) {
  const isIntegrated = (source: DataSource) => {
    return orderedData.some(
      (od) => od.techStack === source.techStack && od.table === source.table
    );
  };

  const isIgnored = (source: DataSource) => {
    const key = `${source.techStack}-${source.table}`;
    return ignoredData.includes(key);
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Available Raw Data Sources</h2>
      <div className="bg-[color:var(--surface-1)] rounded-lg border border-[color:var(--border)] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[color:var(--surface-2)]">
            <tr>
              <th className="text-left p-4 font-medium">Tech Stack</th>
              <th className="text-left p-4 font-medium">Table</th>
              <th className="text-left p-4 font-medium">File Name</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rawData.map((source, idx) => {
              const integrated = isIntegrated(source);
              const ignored = isIgnored(source);
              const key = `${source.techStack}-${source.table}`;
              const isIntegratingThis = integrating === key;

              return (
                <tr
                  key={idx}
                  className="border-t border-[color:var(--border)] hover:bg-[color:var(--surface-hover)]"
                >
                  <td className="p-4">{source.techStack}</td>
                  <td className="p-4">{source.table}</td>
                  <td className="p-4 text-[color:var(--text-muted)]">{source.fileName}</td>
                  <td className="p-4">
                    {integrated ? (
                      <span className="text-[color:var(--success)]">✓ Integrated</span>
                    ) : ignored ? (
                      <span className="text-[color:var(--text-muted)]">⊘ Ignored</span>
                    ) : (
                      <span className="text-[color:var(--warning)]">⚠ Not Integrated</span>
                    )}
                  </td>
                  <td className="p-4">
                    {!integrated && !ignored && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onIntegrate(source)}
                          disabled={isIntegratingThis}
                          className="bg-[color:var(--accent)] hover:bg-[color:var(--accent-hover)] disabled:bg-[color:var(--surface-disabled)] disabled:cursor-not-allowed px-4 py-2 rounded transition-colors text-[color:var(--text-on-accent)]"
                        >
                          {isIntegratingThis ? "Integrating..." : "Integrate"}
                        </button>
                        <button
                          onClick={() => onIgnore(source)}
                          disabled={isIntegratingThis}
                          className="bg-[color:var(--surface-2)] hover:bg-[color:var(--surface-hover)] disabled:bg-[color:var(--surface-disabled)] disabled:cursor-not-allowed px-4 py-2 rounded transition-colors text-[color:var(--text-primary)]"
                        >
                          Ignore
                        </button>
                      </div>
                    )}
                    {ignored && (
                      <button
                        onClick={() => onIgnore(source)}
                        className="bg-[color:var(--surface-2)] hover:bg-[color:var(--surface-hover)] px-4 py-2 rounded transition-colors text-[color:var(--text-primary)]"
                      >
                        Unignore
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
  );
}
