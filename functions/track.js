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
      
      // Get current day for day counter
      const day = now.split('T')[0]; // YYYY-MM-DD format
      
      // Update all counters in parallel
      const [pathCount, countryCount, dayCount, totalCount, ipExists] = await Promise.all([
        env.VISIT_LOG.get(`path:${path}`),
        env.VISIT_LOG.get(`country:${country}`),
        env.VISIT_LOG.get(`day:${day}`),
        env.VISIT_LOG.get('total_visits'),
        env.VISIT_LOG.get(`ip:${ip}`)
      ]);
      
      const newPathCount = pathCount ? parseInt(pathCount) + 1 : 1;
      const newCountryCount = countryCount ? parseInt(countryCount) + 1 : 1;
      const newDayCount = dayCount ? parseInt(dayCount) + 1 : 1;
      const newTotalCount = totalCount ? parseInt(totalCount) + 1 : 1;
      
      // Handle unique IP tracking
      const updates = [
        env.VISIT_LOG.put(`path:${path}`, newPathCount.toString()),
        env.VISIT_LOG.put(`country:${country}`, newCountryCount.toString()),
        env.VISIT_LOG.put(`day:${day}`, newDayCount.toString()),
        env.VISIT_LOG.put('total_visits', newTotalCount.toString())
      ];
      
      // If this is a new IP, increment unique IP counter and mark IP as seen
      if (!ipExists) {
        const uniqueIpCount = await env.VISIT_LOG.get('unique_ips_count');
        const newUniqueIpCount = uniqueIpCount ? parseInt(uniqueIpCount) + 1 : 1;
        
        updates.push(
          env.VISIT_LOG.put(`ip:${ip}`, '1'), // Mark this IP as seen
          env.VISIT_LOG.put('unique_ips_count', newUniqueIpCount.toString())
        );
      }
      
      // Update all counters in parallel
      await Promise.all(updates);
      
    } else {
      console.log("Track visit (KV not available):", { ip, ua, path, country, ts: now });
    }
  } catch (error) {
    console.error("Failed to track visit:", error);
  }

  return new Response("ok");
}