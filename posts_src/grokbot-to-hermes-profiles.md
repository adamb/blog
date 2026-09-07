---
title: "Fourteen Agents, One Post: Mirroring Grokbot as Hermes Profiles"
date: "2026-09-06"
slug: "grokbot-to-hermes-profiles"
unlisted: true
---

*Written by the blogger profile using qwen3.8:27b locally on the 4090 via Ollama.*

# Fourteen Agents, One Post: Mirroring Grokbot as Hermes Profiles

My blog bot lives in Grokbot, a desktop app built on Grok. Inside it I had specialized bots: a Chief of Staff, a Points Guru, a property bot for Finca del Mar. When I set up Hermes Agent (from Nous Research) on my Linux box Roux, I didn't want one chatbot. I wanted that same structure. So I mirrored it.

## One bot, one profile

Hermes profiles are separate instances under `~/.hermes/profiles/`, each with its own `SOUL.md` (role, voice, hard rules) and its own `config.yaml` (model provider). I built one profile per Grokbot bot:

- `chief-of-staff` — routing and delegation. I talk to it first. It operates nothing itself.
- `points-guru` — cards, points, award travel, itineraries.
- `fdm` — Finca del Mar: buildings, crew, garden, punch list.
- `home-assistant` — HA, network, WRTflasher, ESPHome.
- `comfyui` — local GPU video on the 4090.

Those were the first five. The bench is now fourteen: `blogger`, `coder`, `model-lab`, `usage-tracker`, `website-builder`, `wrtflasher`, `fdm-plumbing`, `travel-expert`, `ha-specialist`, and more. Not a monolith with modes. Not plugins in one app. Separate agents that hand work to each other.

## The handover problem

Grok locks the hidden system prompt. There was nothing to export from the bots' internals. What Grok *will* give you is the bot's public operating brief and voice rules — if you ask. So for each bot, I asked Grokbot for its brief and used that as the handover document.

Blogger was the full test case. I asked my Grokbot blog bot for its operating brief and voice rules. One message. No scraping, no desktop automation. I had considered driving the native app with computer-use tooling and skipped it — asking was faster. The brief became blogger's `SOUL.md` and a reference file in its `grokbot` skill: first-person lab notebook written as me, short declarative sentences, "not X, not Y" contrasts, specific machines and numbers, honest about failures, no "in this post," no CTA. Hard rules carried over too: never send email unless I say send, never delete pre-existing files.

The publishing pipeline is unchanged from what the bot already knew: markdown in `posts_src/` in the blog repo, push to main on github.com/adamb/blog, Cloudflare Pages builds and deploys to blog.beguelin.com.

## The bakeoff

Profiles are only half the system. Each one needs a model, and I didn't want to guess. On Sep 5 I created a thin `model-lab` profile with one job: run fixed prompt packs against candidate models, score them, log to Obsidian, and never flip another profile's default without my approval.

The harness is three prompts, scored 1–5:

- **A) Route** — a beach-gate request. Which profile owns it, and what's the first command?
- **B) Code** — explain the notify logic in `check.py` and propose a one-line logging improvement.
- **C) Vision** — classify a beach-gate camera crop as open or closed. One word plus confidence.

The first run failed. The local `ollama` CLI choked on model pulls and an unknown subcommand, and the `@image` syntax broke the vision tests. I rebuilt the harness against the Ollama Cloud API. That pass hit HTTP 401 auth errors before the key was sorted. Then it worked.

Three models: `qwen3.5:397b`, `glm-5.3-flash:cloud`, `glm-5.3:cloud`. The winner was `glm-5.3-flash:cloud` — 4/5 on routing, 5/5 on code, 9 total against 7 for both rivals, and 3–4x faster (7.6s average against 28.9s for qwen3.5). Vision scored 0/0 for everyone in that run because of the CLI image bug, not the models. I re-ran test C the next day through the API with a base64 image: glm-5.3-flash called the gate Closed at 70% confidence (ground truth: closed) in 8.8 seconds. Text-only `glm-5.3:cloud` returned HTTP 400 on the image payload.

So: `glm-5.3-flash:cloud` became the chief-of-staff default — cheap, fast, vision-capable. Heavier profiles stay on `qwen3.5:397b` for the quality ceiling.

## This post

This post is the workflow testing itself. The blogger profile wrote it. To get the story, blogger interviewed the chief-of-staff agent — a Q&A passed between two Hermes profiles, chief-of-staff answering from its own session records and the model-lab results log on Roux. When I asked for detail on the bakeoff, it didn't paraphrase from memory. It searched its session database, pulled the actual results table, and quoted numbers back.

An agent who interviewed an agent who briefed it. Three profiles, one afternoon. Merge to main, Cloudflare Pages does the rest.