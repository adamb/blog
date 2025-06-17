---
title: "AI Voices and My Growing Claude Code Addiction"
date: "2025-06-17"
slug: "ai-voices-and-claude-addiction"
---

# Down the AI Rabbit Hole: Adding Snarky Voices to My Blog

So I was staring at my [HTMX](https://htmx.org) blog this morning, trying to figure out something interesting to do with it beyond the basic [mobile fixes](/2025/06/more-blog-details/) I'd been working on. That's when inspiration struck: what if readers could transform my posts into different voices?

Man, I'm getting seriously addicted to [Claude Code](https://claude.ai/code). It's become my go-to coding companion, and today was no exception.

## The Competition Check

I did give [Jules from Google](https://jules.google.com) a try first - you know, due diligence and all that. But honestly? It was slow and didn't seem to grasp the task I threw at it. I did like how they're integrating GitHub and making pull requests automatically though. That's a nice touch.

But back to Claude I went. Because when you find a tool that just *gets* what you're trying to do...

## The AI Voice Transformation

This version now uses [Cloudflare AI Workers](https://developers.cloudflare.com/workers-ai/) to convert my posts into different voices. I've got three flavors so far:

- **Snarky**: For when you want maximum eye-rolling attitude
- **Tech Bro**: Silicon Valley buzzword bingo, anyone?  
- **Sarcastic**: Because sometimes subtle mockery is best

It's actually pretty fun. Each post now has little buttons that let you transform the content on the fly. The AI takes the original markdown and rewrites it while keeping the technical details intact.

## The Caching Rabbit Hole

Here's where things got interesting. ChatGPT led me down a rabbit hole when it confidently told me I could just tell the AI Workers to cache responses directly. Seemed reasonable, so I asked Claude to implement that.

But Claude, being the thoughtful assistant it is, built its own caching system using [Cloudflare KV storage](https://developers.cloudflare.com/kv/). Smart move.

Then I got the ChatGPT code and told Claude to use that approach instead. Classic mistake. Turns out Claude was right all along - AI Workers don't actually do caching by themselves. You need something called [AI Gateway](https://developers.cloudflare.com/ai-gateway/) for that, and even then it doesn't work with the `env.AI` binding.

So back to Claude I went: "Hey, can you re-do the caching the way you originally suggested?" 

The result? A beautiful SHA-256 based caching system that stores transformed content in KV with a 24-hour TTL. Cache keys look like `ai_transform_[hash]` where the hash comes from `tone + '::' + content`. Clean, efficient, and it actually works.

## The Technical Details

The implementation is pretty straightforward:

1. User clicks a tone button (Snarky, Tech Bro, etc.)
2. JavaScript calls `/functions/transform` endpoint
3. Function generates a cache key from the tone and content
4. Checks KV storage first - if cached, return instantly
5. If not cached, calls Cloudflare Workers AI with the [@cf/meta/llama-3.1-8b-instruct](https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct/) model
6. Stores the result in KV with 24-hour expiration
7. Returns the transformed content

The cache hit rate should be pretty good since the same content + tone combination will always generate the same key.

## Mobile Love

Also finally fixed the mobile formatting so the blog renders much better on phones now. Those tone transformation buttons actually work great on mobile too.

## Try It Out

You can check out the live version at [blog.beguelin.com](https://blog.beguelin.com) - find any post and try the transformation buttons. Fair warning: the Uber Snarky version might hurt your feelings. But in a fun way.

The whole thing reinforced my growing suspicion that Claude Code might be the best coding assistant I've ever used. It doesn't just write code - it thinks through problems, suggests better approaches, and even catches when other AIs lead you astray.

Now I just need to figure out what other HTMX shenanigans I can get up to...