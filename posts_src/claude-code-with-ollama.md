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

Here's the correct command:

```bash
ollama launch claude
```

That's it!  This command launches Claude with Ollama as the backend. You can run this locally with models like `qwen2.5-coder:7b` which fits well on a MacBook Air with 16GB memory. For cloud models, you can use `qwen3-coder:480b-cloud` which provides performance similar to Claude Opus 4.5.

I find the Qwen2.5 via ollama is a bit slower but it doesn't seem that different.  It's not quite as clever as claude in my limited usage today.  I've been using it to write Home Assistant automations and also trying to solve some Docker issues.

![Claude Code running with Qwen3 via Ollama](/assets/claude-ollama-qwen3.png)

## Official Documentation

For more information about using Claude Code with Ollama, check out the [official documentation](https://docs.ollama.com/integrations/claude-code). Here's the official docs for using Ollama and Claude together, which provides detailed instructions on setup, configuration, and troubleshooting.

