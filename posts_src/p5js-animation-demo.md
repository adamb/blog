---
title: "Interactive Code Art with p5.js"
date: 2025-06-24
slug: p5js-animation-demo
---

# Interactive Code Art with p5.js

I've been experimenting with [p5.js](https://p5js.org/) lately - it's a JavaScript library that makes coding visual art surprisingly simple and fun. Here's a quick demo of what you can create with just a few lines of code.

## Live Animation

<div id="p5-container" style="text-align: center; margin: 20px auto; padding: 10px; border-radius: 8px; overflow: hidden; background: #000; max-width: 100%; box-sizing: border-box;"></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>
<script>
let particles = [];
let mouseHistory = [];

function setup() {
  // Make canvas responsive to container size
  let containerWidth = document.getElementById('p5-container').offsetWidth;
  let canvasWidth = min(containerWidth - 20, 800); // 10px padding on each side
  let canvasHeight = min(canvasWidth * 0.5, 400); // Maintain aspect ratio, max 400px
  
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('p5-container');
  
  // Adjust particle count for smaller screens
  let particleCount = width < 600 ? 30 : 50;
  
  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
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

// Handle window resize
function windowResized() {
  let containerWidth = document.getElementById('p5-container').offsetWidth;
  let canvasWidth = min(containerWidth - 20, 800);
  let canvasHeight = min(canvasWidth * 0.5, 400);
  resizeCanvas(canvasWidth, canvasHeight);
}

function draw() {
  background(10, 10, 26, 25); // Fading trail effect
  
  // Track mouse/touch position
  let currentX = mouseX;
  let currentY = mouseY;
  
  // Handle touch on mobile
  if (touches.length > 0) {
    currentX = touches[0].x;
    currentY = touches[0].y;
  }
  
  if (currentX > 0 && currentX < width && currentY > 0 && currentY < height) {
    mouseHistory.push({x: currentX, y: currentY});
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
    
    // Attract to mouse/touch
    if (currentX > 0 && currentX < width) {
      let dx = currentX - particle.x;
      let dy = currentY - particle.y;
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
  
  // Instructions (responsive text size)
  fill(224, 224, 224, 150);
  noStroke();
  textAlign(CENTER);
  textSize(width < 600 ? 12 : 14);
  let instructionText = width < 600 ? "Tap to add particles" : "Move your mouse around to interact with the particles";
  text(instructionText, width/2, height - 20);
}

function mousePressed() {
  addParticleAtPosition(mouseX, mouseY);
}

function touchStarted() {
  // Handle touch events for mobile
  if (touches.length > 0) {
    addParticleAtPosition(touches[0].x, touches[0].y);
  }
  // Prevent default behavior
  return false;
}

function addParticleAtPosition(x, y) {
  // Add new particle at specified position
  if (x > 0 && x < width && y > 0 && y < height) {
    particles.push({
      x: x,
      y: y,
      vx: random(-3, 3),
      vy: random(-3, 3),
      size: random(4, 10),
      hue: random(180, 220)
    });
    
    // Limit particle count (lower limit for mobile)
    let maxParticles = width < 600 ? 75 : 100;
    if (particles.length > maxParticles) {
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

*Try clicking or tapping on the animation above to add more particles.*