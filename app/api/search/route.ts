import { runSearch } from "@/lib/search";

export async function POST(req: Request) {
  let query: unknown;
  try {
    const body = await req.json();
    query = body?.query;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof query !== "string" || !query.trim()) {
    return Response.json({ error: '"query" must be a non-empty string' }, { status: 400 });
  }

  try {
    const result = await runSearch(query);
    return Response.json(result);
  } catch (error) {
    console.error("search failed", error);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
