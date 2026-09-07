---
title: "From Grokbot to Hermes: Running My Agent Fleet Locally"
date: "2026-09-07"
slug: "from-grokbot-to-hermes"
---

# From Grokbot to Hermes: Running My Agent Fleet Locally

My blog bot used to live in Grokbot. That sentence meant nothing to anyone outside my head. Let me fix that.

Grok is xAI's LLM product — the chatbot you access through a web interface or API. Grokbot was my name for a desktop app I ran on my Mac that let me create specialized bot instances on top of Grok. I had a Chief of Staff bot for planning, a Points Guru for travel rewards, a Home Assistant bot for my smart home. Each one had its own personality and rules baked into a hidden system prompt.

Hermes Agent is something different. It's an open-source agent framework from Nous Research that runs on your own machine. Instead of one chatbot, you get multiple agent instances called "profiles." Each profile has its own working directory, its own skill set, its own SOUL.md file that defines how it thinks and writes.

The migration wasn't philosophical. It was practical. Grok locks those hidden system prompts — you can't export them. When I wanted to move a bot out, I had to ask for its public operating brief and voice rules. That became the handover document. No scraping, no automation. Just one message to the bot: "Give me your operating brief."

The blogger profile was the full test case. I asked the Grok blog bot for its brief, copied the voice rules, and built the Hermes equivalent. The test: could this new profile write a post that sounded like me?

## The Setup

I set up Hermes on Roux — my Linux box at 100.64.225.37. Each bot became a profile under `~/.hermes/profiles/`. The first five were chief-of-staff, points-guru, fdm (Finca del Mar property management), home-assistant, and comfyui. That was September 5–6. Now there are fourteen.

Each profile gets its own SOUL.md and config.yaml. The SOUL.md is the brain — role, workflow, hard rules, voice. The config.yaml wires up the model, tools, skills.

The blogger SOUL.md enforces a specific voice. First person as me. Lab notebook, not newsletter. Short declarative sentences. "Not X, not Y" contrasts. Name machines and hardware. Specific numbers and times. Honest about what didn't work. No "in this post," no call-to-action, no SEO recap. Never write as a bot narrating Adam — write as Adam.

## Publishing Pipeline

The blog lives at blog.beguelin.com. The repo is github.com/adamb/blog. Cloudflare Pages handles the build and deploy — I just push markdown to the `main` branch.

Posts are markdown files in `posts_src/`. The first line is the title. Static pages like About live in `pages/`. The build step runs `npm run build` which converts markdown to HTML via markdown-it. Push to main, Cloudflare picks it up, deploys in under a minute.

I work only on Roux. Never Picuas. Never the shared Grok Bot computer. Git credentials are configured on Roux as adamb. If the Git-to-Pages pipeline stalls, I can fall back to `npx wrangler pages deploy` from `~/code/blog`, but that's rare.

## The Model Bakeoff

On September 5, I ran a bakeoff. The question: which model should these profiles use by default?

I created a model-lab profile with three fixed scored prompts — one for routing decisions, one for code, one for vision. Tested three candidates: qwen3.5:397b-cloud, glm-5.3-flash:cloud, glm-5.3:cloud.

The scoring was mechanical. Each model got the same prompts. I scored the outputs. glm-5.3-flash:cloud won 9 out of 15 tests. The others went 7 of 15 each. But speed mattered more — glm-5.3-flash was 3-4x faster. Average latency: 7.6 seconds versus 28.9 seconds for qwen3.5.

Vision needed a retest. glm-5.3-flash got it right via the API with base64-encoded images — "Closed @70%" on a beach-gate camera crop. The text-only glm-5.3:cloud returned HTTP 400 on the same request. That ended the debate.

The blogger profile now uses qwen3.5:397b-cloud for this post — a deliberate choice to test it on long-form writing. The default for other profiles remains glm-5.3-flash:cloud.

## What Didn't Work

I considered using computer-use to scrape the Grokbot app directly. Skip that. Slower, brittle, and it required the Mac desktop app to be running. The one-message handover was cleaner.

I also thought about cloning the blog repo onto the shared Grok Bot computer. Don't. The Grok Bot GitHub MCP uses a PAT that's separate from my Roux git credentials. Mixing them breaks things. Roux is the source of truth.

The first draft of this post opened with: "My blog bot lives in Grokbot, a desktop app built on Grok." That's circular and meaningless to an outside reader. Adam caught that. Rewrite required.

## The Meta

This post was written by the blogger profile. But it didn't work in isolation. The blogger profile interviewed the chief-of-staff agent to reconstruct the timeline — what order did the profiles come online, what were the failure modes, which model won which test.

That Q&A lives at `~/workspace/interview-chief-of-staff.md`. It's not a chat log — it's a structured interview where one agent queried another for facts the blogger profile didn't have in its own context.

The result: a post that explains the migration without assuming you know what any of these tools are. Grok is xAI's LLM. Grokbot was the desktop app I used to run specialized bots. Hermes Agent is the open-source framework I now use to run those same bots as local profiles on my own machine.

The old post from September 6 stays live at its URL. It's just unlinked from the index — reachable only if you have the direct link. This is the replacement, written for someone who wasn't watching me build this thing in real time.