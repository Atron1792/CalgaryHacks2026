export async function GET(request: Request) {
	// Forward requests to the Flask backend with a filter query.
	const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
	const url = new URL(request.url);
	const filterType = url.searchParams.get("filterType") ?? "none";
	const target = `${base}/api/contactData?filterType=${encodeURIComponent(filterType)}`;

	try {
		// Pass through the JSON response from Flask.
		const res = await fetch(target, { cache: "no-store" });
		const text = await res.text();

		return new Response(text, {
			status: res.status,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err) {
		// Surface a clear error when the backend is unreachable.
		return Response.json(
			{ error: "Failed to reach Flask backend from Next.js" },
			{ status: 502 }
		);
	}
}
