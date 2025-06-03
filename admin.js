var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/worker.js
function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) {
    return "\u{1F3F3}\uFE0F";
  }
  const codePoints = countryCode.toUpperCase().split("").map((char) => 127462 + (char.charCodeAt(0) - "A".charCodeAt(0)));
  return String.fromCodePoint(...codePoints);
}
__name(getFlagEmoji, "getFlagEmoji");

var worker_default = {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);

    if (pathname === "/logs.json") {
      const keys = await env.CASI_STATS.list();
      const visits = [];

      for (const k of keys.keys) {
        const val = await env.CASI_STATS.get(k.name);
        if (val) {
          try {
            const visit = JSON.parse(val);
            visits.push({ key: k.name, ...visit });
          } catch (e) {
            console.error("Failed to parse visit data:", val, e);
          }
        }
      }

      return new Response(JSON.stringify(visits, null, 2), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (pathname === "/admin") {
      const keys = await env.CASI_STATS.list();
      const countryCounts = {};
      const statsPromises = keys.keys.map(async (k) => {
        const val = await env.CASI_STATS.get(k.name);
        if (val) {
          try {
            const visitData2 = JSON.parse(val);
            if (visitData2 && visitData2.country) {
              countryCounts[visitData2.country] = (countryCounts[visitData2.country] || 0) + 1;
            }
          } catch (e) {
            console.error("Failed to parse visit data:", val, e);
          }
        }
        let displayName = k.name;
        if (k.name.startsWith("visit_") && k.name.includes("_")) {
          displayName = k.name.substring("visit_".length, k.name.lastIndexOf("_"));
        }
        return `${displayName}: ${val}`;
      });
      const stats = await Promise.all(statsPromises);
      let countrySummary = "--- Visit Counts by Country ---\n";
      for (const [country2, count] of Object.entries(countryCounts).sort(([, a], [, b]) => b - a)) {
        countrySummary += `${getFlagEmoji(country2)} ${country2}: ${count}\n`;
      }
      countrySummary += "\n--- Individual Visit Logs ---\n";
      let responseBody = countrySummary + stats.join("\n");
      responseBody += "\n\n--- Current /admin Request Headers ---\n";
      for (const [key, value] of request.headers) {
        responseBody += `${key}: ${value}\n`;
      }
      return new Response(responseBody, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    // default: track and redirect
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const userAgent = request.headers.get("User-Agent") || "unknown";
    const country = request.headers.get("cf-ipcountry") || "XX";
    const referer = request.headers.get("Referer") || "unknown";
    const timestamp = new Date().toISOString();
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const visitKey = `visit_${timestamp}_${randomSuffix}`;
    const visitData = {
      ip,
      userAgent,
      country,
      referer,
      timestamp,
    };
    await env.CASI_STATS.put(visitKey, JSON.stringify(visitData));
    return Response.redirect("https://photos.app.goo.gl/R6jQWiJpAqmCZ3yU7", 302);
  }
};

export {
  worker_default as default
};