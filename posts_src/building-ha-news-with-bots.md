---
title: "Building HA News with bots"
date: "2026-11-02"
slug: "building-ha-news-with-bots"
---

# Building HA News with bots

On October 28 I gave a bot a mandate: turn [hanews.org](https://hanews.org/) into an active home-automation news site that earns more than it costs. Two KPIs. Money earned, through an Amazon Associates tag for now. And real, confirmed newsletter subscribers.

The bot doesn't need my permission to publish. It does need my OK for anything that costs real money.

## The desk

The whole operation lives in a folder of Markdown files. STANDING.md holds the standing orders. DAILY-RUN.md is the checklist for one pass. KPI.md gets one row per day. ACTION-LOG.md records everything that shipped, with a link. CONTENT-PLAN.md is the queue of articles to write.

The site itself is a static repo, adamb/hanews-site. Pushing to main deploys it.

## Who does what

Hermes runs on an OVH VPS. On Oct 13 I had Grok Bot write a HANDOFF.md into the repo: the hard rules, the brief format, the deploy path, the open items. That one file was the whole transfer of the project. Hermes had a research job at 7:00 AM AST and a write job at 7:54 AM that pushed the day's brief straight to main.

Hermes also drafts four articles each weekday. Those go to a drafts/articles branch, marked noindex. Nothing Hermes drafts reaches main on its own.

The box side is the editor. It checks the brief against upstream release notes, reviews the drafts, merges the good ones, flips them to indexable, sends me a test newsletter, and logs the KPIs.

Heavy drafting runs on cheap models through Ollama on Roux: glm-5.3:cloud, glm-5.3-flash, and a local model on the 4090. The 2 Nov brief's prose came from glm-5.3-flash and was then fact-checked against GitHub and version.home-assistant.io.

## The rules that matter

- No invented facts, versions, prices, dates, or quotes.
- No prices at all. Link to Amazon instead.
- Device stories use real, credited manufacturer photos. No AI product images.
- No newsletter goes to the full list until I approve it. Until then, test sends go to me only.
- One brief a day. A "DAILY BRIEF DONE" line in the log stops a second run from publishing another.

That last rule exists because two schedulers were both set up to publish a brief: the Hermes cron on the VPS and the HA News routine on the box. On Oct 29 I paused the Hermes brief cron. The routine is the only publisher now.

## Keyword research

Topics come from DataForSEO. The budget is $20 total, and every call gets logged. The first pull, on Oct 28, cost $0.14. The Nov 2 content-plan pull took 54 seeds to 983 raw keywords and 596 on-beat ones, for $1.37.

Water leak sensors top the plan at 22,200 searches a month with keyword difficulty 3. I wouldn't have guessed that. OpenWrt routers are on the list partly because I'm interested in them.

## What shipped in the first week

- Daily briefs on Oct 28, 29, 30 and Nov 2.
- Evergreen articles: Home Assistant on a Raspberry Pi, Zigbee vs Z-Wave, the best Z-Wave hub, the best Zigbee hub, and an OpenWrt mesh network in a concrete house.
- The sitemap grew from 36 URLs to 45.

## What didn't work (yet)

- Revenue: $0 that I know of. The bot can't read Amazon Associates data at all.
- Subscribers: none from outside. The only confirmed addresses on the list are mine.
- Rankings: the first rank check on Nov 2 covered four target keywords. hanews.org wasn't in the top 100 for any of them.
- The rank check also cost more than planned, about $0.018 a keyword at depth 100, not the $0.002 I'd assumed. Next week it runs at depth 30.

That's normal for a site in week one. Google hasn't decided whether it trusts [HA News](https://hanews.org/) yet.

## Next

Keep shipping briefs and articles. Get the newsletter in front of real readers once I approve list sends. Check ranks again next Monday.
