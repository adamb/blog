---
title: "Interactive Code Art with p5.js"
date: 2025-06-24
slug: p5js-animation-demo
---

# Interactive Code Art with p5.js

I've been experimenting with [p5.js](https://p5js.org/) lately - it's a JavaScript library that makes coding visual art surprisingly simple and fun. Here's a quick demo of what you can create with just a few lines of code.

## Live Animation

<div id="p5-container" style="text-align: center; margin: 20px 0; border-radius: 8px; overflow: hidden; background: #000;"></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>
<script>
let particles = [];
let mouseHistory = [];

function setup() {
  let canvas = createCanvas(800, 400);
  canvas.parent('p5-container');
  
  // Initialize particles
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      vx: random(-2, 2),
      vy: random(-2, 2),
      size: random(3, 8),
      hue: random(180, 220)
    });
  }
}

function draw() {
  background(10, 10, 26, 25); // Fading trail effect
  
  // Track mouse position
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    mouseHistory.push({x: mouseX, y: mouseY});
    if (mouseHistory.length > 20) {
      mouseHistory.splice(0, 1);
    }
  }
  
  // Draw mouse trail
  noFill();
  for (let i = 0; i < mouseHistory.length - 1; i++) {
    let alpha = map(i, 0, mouseHistory.length, 0, 255);
    stroke(0, 242, 255, alpha);
    strokeWeight(map(i, 0, mouseHistory.length, 1, 5));
    if (mouseHistory[i + 1]) {
      line(mouseHistory[i].x, mouseHistory[i].y, 
           mouseHistory[i + 1].x, mouseHistory[i + 1].y);
    }
  }
  
  // Update and draw particles
  particles.forEach(particle => {
    // Move particles
    particle.x += particle.vx;
    particle.y += particle.vy;
    
    // Bounce off edges
    if (particle.x <= 0 || particle.x >= width) particle.vx *= -1;
    if (particle.y <= 0 || particle.y >= height) particle.vy *= -1;
    
    // Attract to mouse
    if (mouseX > 0 && mouseX < width) {
      let dx = mouseX - particle.x;
      let dy = mouseY - particle.y;
      let distance = sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        particle.vx += dx * 0.0001;
        particle.vy += dy * 0.0001;
      }
    }
    
    // Draw particle
    fill(particle.hue, 70, 100, 180);
    noStroke();
    ellipse(particle.x, particle.y, particle.size);
    
    // Draw connections between nearby particles
    particles.forEach(other => {
      let d = dist(particle.x, particle.y, other.x, other.y);
      if (d < 80) {
        stroke(0, 242, 255, map(d, 0, 80, 100, 0));
        strokeWeight(0.5);
        line(particle.x, particle.y, other.x, other.y);
      }
    });
  });
  
  // Instructions
  fill(224, 224, 224, 150);
  noStroke();
  textAlign(CENTER);
  textSize(14);
  text("Click your mouse to create more particles", width/2, height - 20);
}

function mousePressed() {
  // Add new particle at mouse position
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    particles.push({
      x: mouseX,
      y: mouseY,
      vx: random(-3, 3),
      vy: random(-3, 3),
      size: random(4, 10),
      hue: random(180, 220)
    });
    
    // Limit particle count
    if (particles.length > 100) {
      particles.splice(0, 1);
    }
  }
}
</script>

## The Code

This animation demonstrates several key p5.js concepts:

### Particle System
```javascript
let particles = [];

function setup() {
  // Initialize particles with random properties
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      vx: random(-2, 2),
      vy: random(-2, 2),
      size: random(3, 8),
      hue: random(180, 220)
    });
  }
}
```

### Interactive Mouse Tracking
```javascript
// Attract particles to mouse
let dx = mouseX - particle.x;
let dy = mouseY - particle.y;
let distance = sqrt(dx * dx + dy * dy);

if (distance < 100) {
  particle.vx += dx * 0.0001;
  particle.vy += dy * 0.0001;
}
```

### Connection Lines
```javascript
// Draw lines between nearby particles
particles.forEach(other => {
  let d = dist(particle.x, particle.y, other.x, other.y);
  if (d < 80) {
    stroke(0, 242, 255, map(d, 0, 80, 100, 0));
    line(particle.x, particle.y, other.x, other.y);
  }
});
```

## Why p5.js?

p5.js makes creative coding accessible by handling the canvas setup, animation loops, and providing intuitive drawing functions. It's perfect for:

- **Data visualization prototypes**
- **Interactive art installations** 
- **Educational coding demos**
- **Generative art experiments**

The library abstracts away WebGL complexity while still giving you access to powerful graphics capabilities. You can literally go from idea to working animation in minutes.

## Next Steps

Some ideas to extend this demo:
- Add physics simulation with gravity
- Implement particle collision detection
- Create particle systems that respond to audio
- Generate static art pieces with randomized parameters

Check out the [p5.js examples gallery](https://p5js.org/examples/) for more inspiration!

*Try clicking on the animation above to add more particles.*