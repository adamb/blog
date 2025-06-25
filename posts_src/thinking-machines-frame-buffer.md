---
title: "Thinking Machines Frame Buffer"
date: 2025-06-25
slug: thinking-machines-frame-buffer
---

# Generative Art on a Supercomputer (CM-2, circa 1989)

![Connection Machine CM-2 at MoMA](/assets/MoMa-CM-2.jpg)

*Connection Machine CM-2 on display. Photo by Billie Grace Ward from New York, USA. [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), via [Wikimedia Commons](https://commons.wikimedia.org/w/index.php?curid=115757772)*


In the late 1980s, I had the rare opportunity to write code for a **Connection Machine CM-2**, one of the most visually striking and conceptually ambitious supercomputers of the time. The machine was located at [**NCAR**](https://ncar.ucar.edu) in Boulder, Colorado, and to access it, I had to drive up to the facility and sit down at a terminal hooked into one of the most powerful computing systems of the day.

Looking back on this I remember the feeling of doing something special.  I had to sign up for a time slot and it was in the evening (probably a weekend) when I got my time slot with the machine.  NCAR in Boulder is an imposing building up on the foothills of the Rocky Mountains.  I must admit I felt a little bit like I was approaching some villain's secret lair driving up there in the dark on a weekend. 

![NCAR Boulder](/assets/NOAABoulder.jpg)

[*The NCAR Mesa Laboratory*](https://en.wikipedia.org/wiki/Mesa_Laboratory)* in Boulder, Colorado. Definitely giving off some serious "secret mountain fortress where the evil genius plots world domination" vibes. It housed one of the most advanced supercomputers on the planet. Close enough. *


By <a href="https://en.wikipedia.org/wiki/user:Daderot" class="extiw" title="en:user:Daderot">en:user:Daderot</a> - Original photo, <a href="http://creativecommons.org/licenses/by-sa/3.0/" title="Creative Commons Attribution-Share Alike 3.0">CC BY-SA 3.0</a>, <a href="https://commons.wikimedia.org/w/index.php?curid=628312">Link</a>



## The Machine: Thinking Machines Corporation CM-2

Manufactured by **Thinking Machines Corporation (TMC)**, the CM-2 was a massively parallel computer with up to **65,536 1-bit processors**. These processors were arranged in a hypercube network, enabling massive parallelism for data-intensive tasks. It was a machine originally envisioned for AI and complex simulations, but it also had a unique visual flair: its blinking red LEDs on the front face showed processor activity in real time, making it a kind of digital sculpture as well.

* More on the CM-2: [Wikipedia: Connection Machine](https://en.wikipedia.org/wiki/Connection_Machine)
* More on TMC: [Wikipedia: Thinking Machines Corporation](https://en.wikipedia.org/wiki/Thinking_Machines_Corporation)

## The Framebuffer

What made the CM-2 even more fascinating for creative work was its **framebuffer system**, which enabled real-time visualization of simulations and data. The framebuffer supported up to **1024x1024 resolution** and could output both grayscale and 24-bit color images. This was bleeding-edge for the time and gave scientists and researchers the ability to visually interpret massive parallel computations.

## My C\* Program: Randomized Pixel Growth

The CM-2 was programmed using a dialect called **C**\* (C-star), a variant of C designed to work with SIMD (Single Instruction, Multiple Data) architectures.

I wrote a **generative art program** that created evolving pixel patterns on the framebuffer. Here's the basic idea:

1. Random pixels were turned on initially.
2. Each frame, the program would evaluate adjacent pixels.
3. If a pixel was near an already "on" pixel, it had a higher chance of being turned on or having its brightness increased.
4. Over time, the image "grew" organically, like moss or crystal formations, creating a randomized but cohesive aesthetic.

### The Original C* Code (Reconstructed)

Based on my memory and the C* language specification, here's what the core algorithm probably looked like:

```c
#include <cm/cmmd.h>
#include <cm/paris.h>

shape [1024][1024] pixel_field;
var pixel_field: int brightness;
var pixel_field: int next_brightness;

void seed_initial_pixels() {
    // Seed random pixels across the field
    where (random() < 0.001) {
        brightness = random_int(150, 255);
    }
}

void propagate_pixels() {
    // Clear next generation
    next_brightness = 0;
    
    // For each active pixel, propagate to neighbors
    where (brightness > 0) {
        int rand_dir = random_int(1, 10);
        
        if (rand_dir == 9) {
            // Increase current pixel brightness
            next_brightness = min(255, brightness + 1);
        } else {
            // Propagate to neighbor based on direction
            switch(rand_dir) {
                case 1: [+1][-1] next_brightness += 1; break;  // NW
                case 2: [+0][-1] next_brightness += 1; break;  // N
                case 3: [-1][-1] next_brightness += 1; break;  // NE
                case 4: [+1][+0] next_brightness += 1; break;  // W
                case 5: [-1][+0] next_brightness += 1; break;  // E
                case 6: [+1][+1] next_brightness += 1; break;  // SW
                case 7: [+0][+1] next_brightness += 1; break;  // S
                case 8: [-1][+1] next_brightness += 1; break;  // SE
            }
        }
    }
    
    // Clamp brightness values
    next_brightness = min(255, next_brightness);
    
    // Copy to current generation
    brightness = next_brightness;
}

void render_to_framebuffer() {
    // Send pixel data to graphics framebuffer
    where (brightness > 0) {
        framebuffer_pixel = RGB(brightness, brightness, brightness);
    } elsewhere {
        framebuffer_pixel = RGB(0, 0, 0);
    }
}

main() {
    CM_paris_initialize();
    
    seed_initial_pixels();
    
    for (int iteration = 0; iteration < 255; iteration++) {
        propagate_pixels();
        render_to_framebuffer();
        CM_framebuffer_update();
    }
    
    CM_paris_finalize();
}
```

The beauty of C* was that operations like `where (brightness > 0)` would execute in parallel across **all 65,536 processors simultaneously**. Each processor handled a small section of the 1024x1024 grid, making this massively parallel computation possible in the 1980s.

This was one of my earliest experiments with **emergent behavior** in code — a concept that still fascinates me today.

## Modern Recreation with p5.js

I've recently recreated the concept using [p5.js](https://p5js.org/), a JavaScript library for creative coding. The structure is similar: random seeds, neighbor detection, probabilistic growth. While modern hardware makes this trivial to run in a browser, the underlying idea is still rooted in that late-80s moment of discovery and exploration.

<div id="p5-container" style="text-align: center; margin: 20px auto; padding: 10px; border-radius: 8px; overflow: hidden; background: #000; max-width: 100%; box-sizing: border-box;"></div>

<div id="status" style="text-align: center; margin: 10px auto; padding: 10px; color: #e0e0e0; font-family: monospace; font-size: 14px; background-color: #1a1a2e; border-radius: 4px; max-width: 800px;">Loading...</div>

<div style="text-align: center; margin: 10px auto; color: #999; font-size: 12px; max-width: 800px;">
  <strong>Controls:</strong> Click to pause/resume • Press 'R' to reset • Press 'S' to add seeds or save image
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>
<script src="/assets/tmc-sketch.js"></script>

## Reflections

Working on the CM-2 was like painting with a galaxy of blinking neurons. It was both awe-inspiring and humbling to push pixels around in parallel at a time when most people hadn't yet seen a GUI.

> "The CM-2 didn’t just compute—it pulsed, it shimmered, it came alive." — Me, probably


If you're into generative art, creative coding, or computer history, hit me up—I'd love to hear from others who remember the CM-2 or are reimagining it in modern code.

Stay weird.  

