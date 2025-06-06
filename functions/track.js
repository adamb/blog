export async function onRequestPost({ request, env }) {
    const ip = request.headers.get("cf-connecting-ip");
    const ua = request.headers.get("user-agent");
    const now = new Date().toISOString();
    const ref = request.headers.get("referer");
  
    await env.VISIT_LOG.put(`visit:${now}`, JSON.stringify({
      ip, ua, ts: now, path: new URL(ref || "").pathname
    }));
  
    return new Response("ok");
  }