---
title: "Adding Alerts to Spiderplant Sensors"
date: "2025-05-31"
slug: "adding-alerts-to-spiderplant-sensors"
draft: true
---

# Adding alerts to Spiderplant Sensors

My friend Bob makes these absolutely brilliant sensors and runs the cloud service behind them. The sensors are perfect for monitoring things like temperature in my freezer or water levels in tanks - basically anywhere you need to keep an eye on environmental conditions without constantly checking manually.

*[Photo of Spiderplant sensor - placeholder]*

The problem? Bob's lab environment runs everything over HTTP, which is fine for internal use, but I wanted proper HTTPS access and some additional features like configurable alerts. Plus, having APIs that I could actually integrate with other services would be fantastic.

So naturally, I did what any reasonable person would do - I built a proxy service hosted on Cloudflare Workers to solve all these problems at once.

## The Solution: A Cloudflare Workers Proxy

The code is up on [GitHub](https://github.com/adamb/spider) if you want to follow along. The basic concept is straightforward: create an HTTPS proxy that sits between the internet and Bob's HTTP-only service, while adding some useful features along the way.

### How It Works

The proxy is elegantly simple. When you hit `spider.dev.pr` (my Cloudflare Workers domain), it:

1. **Forwards your request** to the corresponding HTTP URL at `lab.spiderplant.com`
2. **Rewrites any redirect headers** to maintain HTTPS throughout
3. **Caches GET requests** for 5 minutes to reduce load on Bob's servers
4. **Adds CORS headers** so browsers don't complain about cross-origin requests

The beauty of using Cloudflare Workers is that it's serverless - I don't need to maintain any infrastructure, it scales automatically, and it's ridiculously fast thanks to Cloudflare's global edge network.

### The APIs That Actually Matter

One of the best parts about building this proxy was finally having proper APIs to work with. Here's what's available:

**Device Information** (`/api/devices`)
```json
{
  "devices": [
    {
      "id": "sensor_001",
      "name": "Freezer Monitor",
      "lastReport": "2024-01-15T14:30:00Z"
    }
  ]
}
```

**All Sensor Probes** (`/api/probes`)
Lists every probe with details like ID, name, type, and the last reading.

**Specific Probe Values** (`/api/probes/{probe_id}`)
The real money shot - current sensor readings with timestamps and metadata.

*[Photo of sensor installed in freezer - placeholder]*

### Adding Smart Alerts

Here's where things get interesting. Using Cloudflare's KV storage, I can configure alert thresholds for different sensors without touching code. The system runs a cron job every 15 minutes to check all probe values against their configured thresholds.

When something goes wrong - like the freezer temperature spiking or the water tank running low - I get instant Pushover notifications on my phone. No more discovering problems hours later.

*[Photo of sensor in water tank - placeholder]*

The alert configuration is dead simple. Just store threshold values in KV storage like:
```
probe_freezer_temp_max: -10
probe_water_level_min: 20
```

The worker automatically picks up these configurations and monitors accordingly.

### Why This Architecture Works

Using Cloudflare Workers for this proxy made perfect sense:

- **Zero infrastructure maintenance** - it just runs
- **Global edge deployment** - fast responses from anywhere
- **Built-in caching** - reduces load on Bob's servers
- **KV storage** - perfect for configuration and state
- **Cron triggers** - automated monitoring without external services

The entire system costs basically nothing to run (thanks to Cloudflare's generous free tier) and provides enterprise-level reliability for a hobby project.

## The Results

Now I have:
- ✅ Secure HTTPS access to all sensor data
- ✅ Clean REST APIs for integration with other services
- ✅ Configurable alerts that actually notify me when things go wrong
- ✅ Automatic caching to keep things fast
- ✅ Zero maintenance overhead

The sensors are now monitoring my freezer temperature and water tank levels, with alerts configured so I know immediately if something needs attention. Bob's original hardware and cloud service remain unchanged - the proxy just adds the features I needed on top.

*Pro tip*: If you're dealing with any HTTP-only service that you need to access securely or extend with additional features, Cloudflare Workers is an excellent solution. The development experience is smooth, deployment is instant, and the global performance is hard to beat.

Next up, I'm thinking about adding trend analysis and maybe some simple dashboards. But honestly, having reliable alerts for critical environmental monitoring has already solved my biggest problem.

The code is open source at [github.com/adamb/spider](https://github.com/adamb/spider) if you want to build something similar for your own sensors or services.
