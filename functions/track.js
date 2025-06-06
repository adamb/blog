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

  await env.VISIT_LOG.put(`visit:${now}`, JSON.stringify({
    ip, ua, ts: now, path
  }));

  return new Response("ok");
}