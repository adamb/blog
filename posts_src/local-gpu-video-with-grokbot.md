---
title: "Making a Zappa Video on My Home GPU with Grok Bot"
date: "2026-08-28"
slug: "local-gpu-video-with-grokbot"
---

# Making a Zappa Video on My Home GPU with Grok Bot

I wanted local video generation on the house GPU. Not a cloud demo, not a rented A100. Roux, the Linux box that already sits in the closet running DNS and cameras, has an RTX 4090. I pointed Grok Bot at it and asked it to set the whole thing up.

Two hours later I had a two-minute cut of *Don't Eat The Yellow Snow*, generated on that card, synced to an MP3 I own, sitting unlisted on my YouTube.

![Arctic road under a green aurora, two dogs on the track. A still from the local LTX-2.5 cut.](/assets/yellow-snow-aurora-road.jpg)

## The machine I wasn't allowed to break

Roux is not a lab box. It is the house: DNS, Samba, NFS, Frigate cameras. The brief to Grok Bot was simple. User-space only. No reboot. No `apt`. No firewall edits. Don't kill Frigate's ffmpeg processes, which already sit on the GPU doing camera decode.

I thought the card was a 3090. It is a 4090. Same 24 GB class, which matters, because the model we wanted does not actually fit in 24 GB unless you get picky about the files.

## LTX-2.5, INT8, no cloud

LTX-2.5 from Lightricks had just dropped with day-0 ComfyUI support. Roux already had ComfyUI 0.33.0. The 22B bf16 transformer is a non-starter on this card, so Grok Bot downloaded the official INT8 distilled ComfyUI checkpoint and the lighter conv video VAE onto the backup drive, not the root disk.

Gemma 4 12B runs only as the local text encoder. It gets RAM-swapped so it can share the 24 GB with the video model. Prompt enhancement stayed off. No cloud APIs in the generate path. Ollama Cloud is around for cheap prompt rewriting. We didn't use it for this cut. The prompts were written by hand.

ComfyUI listens on the LAN. Grok Bot talks to it over HTTP, the same `/prompt` endpoint you'd hit from the UI, except nobody is clicking Queue.

## The song, without the lyrics in the prompt

I own the Apostrophe' recording. Grok Bot dropped the MP3 into `~/code/snow`, aligned it with Whisper on the 4090, and cut it into 18 shots of about five to eight seconds. Visual prompts only. No lyrics in the graph. 768x512, 24 fps, eight-step distilled schedule. Frame counts are 1 plus a multiple of 8 because that's what LTX wants.

Shot 18 was the test: huskies around a stained patch of yellow snow. Picture and sync were good enough, so we ran the other 17. Grok Bot queued them one at a time (the card peaked at 23.3 of 24.6 GB). That batch ran from 2:39 to 3:01 PM Atlantic, about 22 minutes. Fast shots finished in 15-25 seconds. The slow ones took two and a half to three minutes while ComfyUI reshuffled VRAM. Temperature hit 66C at 100% util. Frigate stayed up. The cameras hitch a little when the 4090 fills. That's the deal.

Then ffmpeg concatenated the clips and muxed the original MP3. Not the model's audio. The file is 16.5 MB and 2:05 long.

![Furry boots striding through icy snow.](/assets/yellow-snow-boots.jpg)

![Hunter, shack, tripod light, green and purple aurora.](/assets/yellow-snow-shack.jpg)

## What Grok Bot actually did

I did not sit in ComfyUI. The bot SSHed to Roux, patched a broken `kornia` import in the LTX custom nodes so the graph would load, wrote a Yellow Snow workflow instead of the anime-fox demo template, pointed the loaders at the INT8 files, queued every shot, watched `nvidia-smi`, stitched, muxed, then uploaded the cut unlisted to my YouTube and dropped the mp4 in Drive.

The unlisted video is here:

[Don't Eat The Yellow Snow (local LTX-2.5 test)](https://youtu.be/hEYEyom8rwI)

YouTube's Content ID caught the audio, which is fair. It didn't block an unlisted publish. Earnings would be a different story. I'm not monetizing this.

## It's not a movie

768x512 looks like a 1970s TV transfer, which accidentally fits. LTX also drifts. The prompt for the last huskies shot produced this instead:

![LTX drifted: a tearful close-up in a fur collar, not the huskies we asked for.](/assets/yellow-snow-closeup.jpg)

That's the model, not the prompt writer being clever. Fine for a first test. Not fine if you need a locked character.

Weights are gated on Hugging Face. Once they're on disk, generation is free and local. Electricity and a 4090 you already bought.

Next up is the rest of the suite. Nanook Rubs It is sitting right there.
