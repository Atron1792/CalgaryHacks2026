export async function GET() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  try {
    const res = await fetch(`${base}/api/barData`, { cache: "no-store" });

    // If Flask errors, pass it through so you can see the status
    const text = await res.text();

    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    // If Flask is unreachable, you'll get here (connection refused, etc.)
    return Response.json(
      { error: "Failed to reach Flask backend from Next.js" },
      { status: 502 }
    );
  }
}
