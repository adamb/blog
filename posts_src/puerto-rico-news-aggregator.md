---
title: "Feeds for a Puerto Rico News Aggregator"
date: "2026-11-14"
slug: "puerto-rico-news-aggregator"
---

# Feeds for a Puerto Rico News Aggregator

I'm starting a site that aggregates Puerto Rico news from the RSS and XML feeds the outlets already publish. I collected these on November 13.

Almost everything is in Spanish. I don't have an English feed.

## Feeds

[El Nuevo Día](https://www.elnuevodia.com/arc/outboundfeeds/rss/category/noticias/locales/?outputType=xml) publishes local news as an Arc outbound feed. Volume depends on the category. Roughly 8 to 110 posts a day.

[Metro Puerto Rico](https://www.metro.pr/arc/outboundfeeds/rss/?outputType=xml) uses the same Arc pattern for the whole site. About 50 posts a day.

[NotiCel](https://noticel.com/feed/) is the independent outlet, and it often breaks stories first. This is the feed to prioritize. Around 36 to 39 posts a day.

[Telemundo Puerto Rico](https://www.telemundopr.com/?rss=y) is about 20 posts a day.

[Primera Hora](http://www.primerahora.com/rss) is a landing page with several feeds. Primera Hora and El Nuevo Día are both GFR Media, and they share stories. Those two have to be deduped or the same piece shows up twice.

El Vocero runs on BLOX. The feed is a search URL. Replace `SECTION` with the section slug:

```
https://www.elvocero.com/search/?f=rss&t=article&c=SECTION&l=50&s=start_time&sd=desc
```

[La Perla del Sur](https://www.periodicolaperla.com/feed) covers Ponce and the south. It's a WordPress feed.

## No feed

The San Juan Daily Star is the English paper. No RSS. That one would need scraping, or I skip it.

Noticias de Ponce (noticiasdeponce.online) and El Sol de Puerto Rico (elsolpr.com) cover the south too. Neither publishes RSS.

Mayagüez and Fajardo have no dedicated regional outlet with a feed. What shows up there is island-wide coverage: El Vocero's Mayagüez section, and tags on Primera Hora and Telemundo.
