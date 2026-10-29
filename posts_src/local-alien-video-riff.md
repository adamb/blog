---
title: "Riffing on an Alien Burning Man Video With Only My Home GPU"
date: "2026-10-29"
slug: "local-alien-video-riff"
---

# Riffing on an Alien Burning Man Video With Only My Home GPU

![Antlered alien elder, a still from the local riff.](/assets/promtgenix-riff-poster.jpg)

I saw [a video I loved](https://www.instagram.com/reel/Dd2ggMHRIkO/). Forty-eight seconds, vertical, alien priests on a hazy playa, with a dark, hypnotic soundtrack at about 85 BPM. Burning Man if the camp were from another planet.

So I asked ComfyUI Local, my Grok Bot that drives ComfyUI, to riff on it. One rule: local models only. Everything renders on Roux, my 4090 box at home. No cloud generation APIs.

Last time I did this it was [a Zappa video](/2026/08/local-gpu-video-with-grokbot/). This time the bar was a video I already liked.

## Step 1: watch the source

The bot pulled frames and the audio and wrote down what makes it work. Teal-grey playa haze. Alien priests in tall headdresses. Crimson processions. Giant moons. Pod creatures walking on insect legs. Shots of 3 to 6 seconds, cut to the beat.

Not a copy. A palette.

## Step 2: twelve new scenes

From that palette it wrote 12 shots:

- a manta ray made of lanterns
- a priestess in a cone headdress
- an alien DJ on a modular synth
- a nautilus art car that walks
- a saffron procession
- an antlered elder
- giant metal hands
- figures in a dust storm
- a neon temple
- fire dancers and a burning effigy
- pod walkers over a crowd
- a cloaked child under jellyfish lanterns

## Step 3: stills, then motion

Flux Dev made the stills at 720x1280, about 12 to 15 seconds each.

Then Wan 2.2 image-to-video, the 14B model with the 4-step lightx2v speedup, turned each still into motion: 480x832, 81 frames, about 78 seconds per clip on the 4090.

## Step 4: music

Stable Audio Open made a brand-new soundtrack, locally.

I like the original music much better. Not close. The local track is fine. The original has a pulse the local one doesn't. Local video is getting good. Local music isn't there yet.

## Step 5: the edit

ffmpeg cut the clips on the beat and upscaled to 1080x1920.

<video controls playsinline preload="metadata" poster="/assets/promtgenix-riff-poster.jpg" width="360" style="max-width:100%;height:auto"><source src="/assets/promtgenix-riff.mp4" type="video/mp4"></video>

The music is the original soundtrack from [the source reel](https://www.instagram.com/reel/Dd2ggMHRIkO/). Video concept and soundtrack credit go to its creator, [promptgenix](https://linktr.ee/promptgenix). The visuals in my cut are new, rendered locally.

## Verdict

Great start. Honest list of what's wrong:

- It's softer than the source. The motion renders at 480p and gets upscaled, and you can see it.
- Some shots are too human. The source feels alien all the way through.
- The motion is gentle. The source moves more.

## v2: three takes of every shot

So I asked for more options. Three takes of each of the 12 shots, 36 Flux Dev stills at 832x1472. About 20 seconds each, about 12.5 minutes total.

Each take got a different light:

- A: soft overcast twilight
- B: golden backlit dust, wide
- C: blue-hour bioluminescent, telephoto

The prompts also pushed harder on beings that are clearly not human.

![v2 takes, shots 1-4](/assets/promtgenix-riff-v2-sheet1.jpg)

![v2 takes, shots 5-8](/assets/promtgenix-riff-v2-sheet2.jpg)

![v2 takes, shots 9-12](/assets/promtgenix-riff-v2-sheet3.jpg)

My picks: 01B (with the vehicle from 01C merged in), 02A, 03C, 04C, 05C, 06A, 07C, 08C, 09A, 10A, 11B, 12C. Blue hour took half.

The v2 video from those picks is rendering now.
