const site = "https://catalin-carstea.github.io";
const headers = { "Access-Control-Allow-Origin": site, "Cache-Control": "no-store", "Vary": "Origin" };

function validRun(run) {
  return run && typeof run === "object" &&
    typeof run.id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(run.id) &&
    typeof run.completedAt === "string" && Number.isFinite(Date.parse(run.completedAt)) &&
    new Date(run.completedAt).toISOString() === run.completedAt &&
    Date.parse(run.completedAt) <= Date.now() + 86400000 &&
    Number.isInteger(run.total) && run.total >= 1 && run.total <= 5 &&
    Number.isInteger(run.correct) && run.correct >= 0 && run.correct <= run.total &&
    ["practice", "retry"].includes(run.kind) && ["timed", "untimed"].includes(run.mode) &&
    ["submitted", "time_limit"].includes(run.finish) &&
    (run.kind === "practice" ? run.total === 5 : run.mode === "untimed") &&
    (run.finish !== "time_limit" || run.mode === "timed");
}

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname !== "/runs") return new Response(null, { status: 404 });
    if (request.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST" } });
    if (request.headers.get("Origin") !== site) return new Response(null, { status: 403 });
    if (request.headers.get("Content-Type")?.split(";")[0] !== "text/plain") {
      return new Response(null, { status: 415, headers });
    }
    const length = Number(request.headers.get("Content-Length"));
    if (!Number.isInteger(length) || length <= 0 || length > 1024) return new Response(null, { status: 413, headers });
    const run = await request.json().catch(() => null);
    if (!validRun(run)) return new Response(null, { status: 400, headers });
    await env.DB.prepare(
      "INSERT INTO completed_runs (run_id, completed_at, correct, total, kind, mode, finish) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(run_id) DO NOTHING"
    ).bind(run.id, run.completedAt, run.correct, run.total, run.kind, run.mode, run.finish).run();
    return new Response(null, { status: 204, headers });
  }
};
