export async function GET() {
  // Flask base URL (dev)
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

  // Fetch from Flask
  const res = await fetch(`${base}/api/bar-data`, { cache: "no-store" });
  const data = await res.json();

  // Return to browser
  return Response.json(data, { status: res.status });
}
