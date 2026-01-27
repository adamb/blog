---
title: "Claude Code with Ollama Cloud"
date: "2026-01-26"
slug: "claude-ollama"
draft: false
---

# Using Claude without Claude

I really like Claude Code.  I use it almost all the time now.  The problem is that I run into the usage
limits pretty often.  I tried switching to gemini last time I hit the wall.  But then today I decided to see if I could run it with ollama.  

# Ollama, not just for local models

Ollama started as a way to use open source models on your computer.  I have a new MacBook Air circa 2025 and it has 16GB of memory with an M4 chip.  Turns out it can run a pretty good coding model locally.

At first I tried using Goose and it just didn't work well at all.  I'm sure goose is a great project, but I just couldn't get it to work.

I then started looking at using Ollama and running bigger models.  They have a $20 plan that will let you run their models in the cloud.  I signed up for that.  And then somehow along the way I realized that I could just run my good friend Claude Code but with an Ollama brain.  

Here's the command:

```bash
claude --model ollama:qwen2.5-coder:7b
```

That's it!  Now it uses the default model that you have set with ollama.  If you want to run locally I found that `qwen2.5-coder:7b` fits my MacBook Air.  But it's just not very good when you're used to the real Claude.  So I gave `qwen3-coder:480b-cloud` a try.  It's pretty similar to Claude Opus 4.5 which I guess I've been using with my regular claude code.

I find the Qwen2.5 via ollama is a bit slower but it doesn't seem that different.  It's not quite as clever as claude in my limited usage today.  I've been using it to write Home Assistant automations and also trying to solve some Docker issues.

![Claude Code running with Qwen3 via Ollama](/assets/claude-ollama-qwen3.png)

