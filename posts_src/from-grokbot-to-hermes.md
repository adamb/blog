---
title: "From Grokbot to Hermes: Running My Agent Fleet Locally"
date: "2026-09-07"
slug: "from-grokbot-to-hermes"
---

# From Grok Bot to Hermes: Running My Agent Fleet Locally

[Grok Bot](https://x.ai/news/introducing-grok-bot) is a product from xAI. Not Grok — a different thing in their product suite. Grok is the chatbot you use through a web interface. Grok Bot is persistent AI agents with their own cloud computer that can log into your apps and work while you sleep. A commercial [Hermes Agent](https://hermes-agent.nousresearch.com/docs), roughly.

I started on Grok Bot in August 2026 on the $30 plan. Chief of Staff for planning. Points Guru for travel rewards. Home Assistant for my smart home. I ran out of tokens fast. Upgraded to the $300 plan. That worked, but $300/month is difficult to stomach for something I use daily.

The pivot came when I used Grok Bot to configure ComfyUI on Roux — my Linux box with the 4090. It worked. If Grok Bot could configure ComfyUI, it could configure Hermes Agent. So I asked it to. A week of using Grok Bot gave me a clear picture of what it could do and what bots I actually needed. I told Grok Bot to replicate those bots as Hermes profiles. (The ComfyUI setup lives in [this post from August](/2026/08/local-gpu-video-with-grokbot/).)

Now I run Hermes on Roux, using [Ollama Cloud](https://ollama.com/cloud) for the models at $20/month. Fourteen profiles so far. I'm also trying to find a local model that works on the 4090 without success yet. Grok Bot is still in the mix for tasks that need its specific capabilities. This isn't a full migration. It's a cost-driven split.

## The Handover

Grok Bot stores its agent definitions in hidden system prompts. You can't export them. When I wanted to move a Bot out, I had to ask for its operating brief. One message: "Give me your operating brief." The Bot would return its public instructions, voice rules, and workflow constraints.

That became the handover document. No scraping. No automation. Just the Bot telling me what it was.

The blogger profile was the test case. I asked the Grok Bot blog bot for its brief, copied the voice rules, and built the Hermes equivalent. The test: could this new profile write a post that sounded like me?

## The Setup

I set up Hermes on Roux — my Linux box. Each Grok Bot became a profile under `~/.hermes/profiles/`. The first five were chief-of-staff, points-guru, fdm (Finca del Mar property management), home-assistant, and comfyui. That was September 5–6. Now there are fourteen.

Each profile gets its own SOUL.md and config.yaml. The SOUL.md is the brain — role, workflow, hard rules, voice. The config.yaml wires up the model, tools, skills.

The blogger SOUL.md enforces a specific voice. First person as me. Lab notebook, not newsletter. Short declarative sentences. "Not X, not Y" contrasts. Name machines and hardware. Specific numbers and times. Honest about what didn't work. No "in this post," no call-to-action, no SEO recap. Never write as a bot narrating Adam — write as Adam.

## The Model Bakeoff

On September 5, I ran a bakeoff. The question: which model should these profiles use by default?

I created a model-lab profile with three fixed scored prompts — one for routing decisions, one for code, one for vision. Tested three candidates: qwen3.5:397b-cloud, glm-5.3-flash:cloud, glm-5.3:cloud.

The scoring was mechanical. Each model got the same prompts. I scored the outputs. glm-5.3-flash:cloud won 9 out of 15 tests. The others went 7 of 15 each. But speed mattered more — glm-5.3-flash was 3-4x faster. Average latency: 7.6 seconds versus 28.9 seconds for qwen3.5.

The blogger profile now uses qwen3.5:397b-cloud for this post — a deliberate choice to test it on long-form writing. The default for other profiles remains glm-5.3-flash:cloud.

## What Didn't Work

I considered using computer-use to scrape the Grokbot app directly. Skip that. Slower, brittle, and it required the Mac desktop app to be running. The one-message handover was cleaner.

I also thought about cloning the blog repo onto the shared Grok Bot computer. Don't. The Grok Bot GitHub MCP uses a PAT that's separate from my Roux git credentials. Mixing them breaks things. Roux is the source of truth.

The first draft of this post opened with: "My blog bot lives in Grokbot, a desktop app built on Grok." That's circular and meaningless to an outside reader. Adam caught that. Rewrite required.

## The Blurring Line

Grok Bot's big sell is the cloud computer. It signs into your apps, keeps sessions alive, works while you sleep. That's the moat. Or it was.

I asked Hermes to run a virtual browser on Roux. I logged into it as myself. It checked my OpenAI usage dashboard and reported back. Same outcome as Grok Bot, different stack.

The boundaries are blurring. Grok Bot isn't magic — it's a browser, a filesystem, and a model wired together. Hermes can drive those same pieces. The difference is who hosts the VM and who bills you at the end of the month.

## The Meta

This post was written by the blogger profile. But it didn't work in isolation. The blogger profile interviewed the chief-of-staff agent to reconstruct the timeline — what order did the profiles come online, what were the failure modes, which model won which test.

That Q&A lives at `~/workspace/interview-chief-of-staff.md`. It's not a chat log — it's a structured interview where one agent queried another for facts the blogger profile didn't have in its own context.

The result: a post that explains the migration without assuming you know what any of these tools are. Grok is xAI's LLM chatbot. Grok Bot is xAI's persistent agent product — launched August 2026, agents with their own cloud computer. Hermes Agent is the open-source framework I now use for most of my daily agent work at $20/month instead of $300.

The old post from September 6 stays live at [its URL](/2026/09/grokbot-to-hermes-profiles/). It's just unlinked from the index — reachable only if you have the direct link. This is the replacement, written for someone who wasn't watching me build this thing in real time.
