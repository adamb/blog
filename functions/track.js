export async function onRequestPost({ request, env }) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const ua = request.headers.get("user-agent") || "unknown";
  const now = new Date().toISOString();
  const ref = request.headers.get("referer");

  let path = "unknown";
  try {
    if (ref) path = new URL(ref).pathname;
  } catch {
    // Leave path as "unknown" if URL is invalid
  }

  try {
    // Check if KV binding is available (won't be in local dev)
    if (env.VISIT_LOG) {
      await env.VISIT_LOG.put(`visit:${now}`, JSON.stringify({
        ip, ua, ts: now, path
      }));
    } else {
      console.log("Track visit (KV not available):", { ip, ua, path, ts: now });
    }
  } catch (error) {
    console.error("Failed to track visit:", error);
  }

  return new Response("ok");
}