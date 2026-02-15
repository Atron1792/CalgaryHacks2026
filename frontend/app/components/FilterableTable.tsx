"use client";

import { useEffect, useMemo, useState } from "react";

type ContactRow = Array<string | number | null>;
type ContactResponse = {
	columns: string[];
	rows: ContactRow[];
};

type FilterKey = "all" | "marketing" | "non-marketing";

const FILTER_OPTIONS: Array<{ key: FilterKey; label: string }> = [
	{ key: "all", label: "All" },
	{ key: "marketing", label: "Marketing" },
	{ key: "non-marketing", label: "Non-marketing" },
];

const FILTER_TO_BACKEND: Record<FilterKey, string> = {
	all: "none",
	marketing: "Marketing contact",
	"non-marketing": "Non-marketing contact",
};

export default function FilterableTable() {
	const [filter, setFilter] = useState<FilterKey>("all");
	const [columns, setColumns] = useState<string[]>([]);
	const [rows, setRows] = useState<ContactRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		const fetchContacts = async () => {
			setLoading(true);
			setError(null);

			const filterType = FILTER_TO_BACKEND[filter];
			const url = `/api/contactData?filterType=${encodeURIComponent(filterType)}`;

			try {
				const res = await fetch(url, { cache: "no-store" });

				if (!res.ok) {
					throw new Error(`Failed to load contacts (${res.status})`);
				}

				const data = (await res.json()) as ContactResponse;

				if (!cancelled) {
					setColumns(Array.isArray(data?.columns) ? data.columns : []);
					setRows(Array.isArray(data?.rows) ? data.rows : []);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : "Unexpected error");
					setColumns([]);
					setRows([]);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		fetchContacts();

		return () => {
			cancelled = true;
		};
	}, [filter]);

	const headers = useMemo(() => {
		if (columns.length > 0) {
			return columns;
		}

		const firstRow = rows[0];
		if (!firstRow) {
			return [] as string[];
		}

		return firstRow.map((_, index) => `Column ${index + 1}`);
	}, [columns, rows]);

	return (
		<section className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-1)] p-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h2 className="text-xl font-semibold text-[color:var(--text-primary)]">
						Contacts
					</h2>
					<p className="text-sm text-[color:var(--text-muted)]">
						Filter by marketing status.
					</p>
				</div>
				<div className="flex items-center gap-2 rounded-full bg-[color:var(--surface-2)] p-1">
					{FILTER_OPTIONS.map((option) => {
						const active = filter === option.key;
						return (
							<button
								key={option.key}
								type="button"
								onClick={() => setFilter(option.key)}
								className={`rounded-full px-4 py-1 text-sm transition-colors ${
									active
										? "bg-[color:var(--accent)] hover:bg-[color:var(--accent-hover)] text-[color:var(--text-on-accent)]"
										: "text-[color:var(--text-subtle)] hover:bg-[color:var(--surface-hover)]"
								}`}
							>
								{option.label}
							</button>
						);
					})}
				</div>
			</div>

			<div className="mt-6 max-h-[28rem] overflow-x-auto overflow-y-auto">
				{loading ? (
					<div className="py-8 text-center text-sm text-[color:var(--text-muted)]">
						Loading contacts...
					</div>
				) : error ? (
					<div className="py-8 text-center text-sm text-[color:var(--text-danger)]">
						{error}
					</div>
				) : rows.length === 0 ? (
					<div className="py-8 text-center text-sm text-[color:var(--text-muted)]">
						No contacts found.
					</div>
				) : (
					<table className="min-w-full border-collapse text-left text-sm">
						<thead className="bg-[color:var(--surface-2)] text-[color:var(--text-primary)]">
							<tr>
								{headers.map((header) => (
									<th key={header} className="px-4 py-3 font-medium">
										{header}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="text-[color:var(--text-subtle)]">
							{rows.map((row, rowIndex) => (
								<tr key={rowIndex} className="border-t border-[color:var(--border)]">
									{row.map((cell, cellIndex) => (
										<td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3">
											{cell === null || cell === undefined || cell === ""
												? "-"
												: String(cell)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</section>
	);
}
