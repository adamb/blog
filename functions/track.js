export async function onRequestPost({ request, env }) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const ua = request.headers.get("user-agent") || "unknown";
  const country = request.headers.get("cf-ipcountry") || "unknown";
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
      // Store individual visit record
      await env.VISIT_LOG.put(`visit:${now}`, JSON.stringify({
        ip, ua, ts: now, path, country
      }));
      
      // Update per-page counter
      const pathKey = `path:${path}`;
      const currentCount = await env.VISIT_LOG.get(pathKey);
      const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
      await env.VISIT_LOG.put(pathKey, newCount.toString());
      
    } else {
      console.log("Track visit (KV not available):", { ip, ua, path, country, ts: now });
    }
  } catch (error) {
    console.error("Failed to track visit:", error);
  }

  return new Response("ok");
}