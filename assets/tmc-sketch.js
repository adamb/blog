let grid;
let gridSize = 1024;
let cellSize;
let isRunning = true;
let iterationCount = 0;
let seedCount = 0;

function setup() {
  // Make canvas responsive to container size
  let containerWidth = document.getElementById('p5-container').offsetWidth;
  let canvasSize = min(containerWidth - 20, 800); // Responsive size with max 800px
  
  let canvas = createCanvas(canvasSize, canvasSize);
  canvas.parent('p5-container');
  
  cellSize = width / gridSize;
  
  // Initialize grid with brightness values (0-255)
  grid = [];
  for (let i = 0; i < gridSize; i++) {
    grid[i] = [];
    for (let j = 0; j < gridSize; j++) {
      grid[i][j] = 0;
    }
  }
  
  // Add some initial seed pixels
  seedInitialPixels();
  
  canvas.mousePressed(toggleAnimation);
}

function draw() {
  background(0);
  
  if (isRunning) {
    updateGrid();
    iterationCount++;
    
    // Stop animation after 255 iterations
    if (iterationCount >= 255) {
      isRunning = false;
    }
  }
  
  renderGrid();
  updateStatus();
}

function seedInitialPixels() {
  // Add 8-15 seed pixels clustered towards center
  seedCount = floor(random(8, 16));
  let centerX = gridSize / 2;
  let centerY = gridSize / 2;
  
  for (let i = 0; i < seedCount; i++) {
    // Use gaussian distribution to cluster around center
    let x = floor(randomGaussian(centerX, gridSize / 6));
    let y = floor(randomGaussian(centerY, gridSize / 6));
    
    // Clamp to grid bounds
    x = constrain(x, 0, gridSize - 1);
    y = constrain(y, 0, gridSize - 1);
    
    grid[x][y] = random(150, 255);
  }
}

function updateGrid() {
  // Create a copy of the current grid to avoid modifying while iterating
  let newGrid = [];
  for (let i = 0; i < gridSize; i++) {
    newGrid[i] = [...grid[i]];
  }
  
  // Track active pixels for optimization
  let activePixels = [];
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (grid[x][y] > 0) {
        activePixels.push({x, y});
      }
    }
  }
  
  // Process only active pixels
  for (let pixel of activePixels) {
    let x = pixel.x;
    let y = pixel.y;
    // Generate random number 1-9
    let rand = floor(random(1, 10));
    
    if (rand === 9) {
      // Increase current pixel brightness
      newGrid[x][y] = min(255, newGrid[x][y] + 1);
    } else {
      // Propagate to adjacent pixel based on mapping:
      // 1 2 3
      // 4 X 5
      // 6 7 8
      let targetX = x;
      let targetY = y;
      
      switch(rand) {
        case 1: targetX = x - 1; targetY = y - 1; break;
        case 2: targetX = x; targetY = y - 1; break;
        case 3: targetX = x + 1; targetY = y - 1; break;
        case 4: targetX = x - 1; targetY = y; break;
        case 5: targetX = x + 1; targetY = y; break;
        case 6: targetX = x - 1; targetY = y + 1; break;
        case 7: targetX = x; targetY = y + 1; break;
        case 8: targetX = x + 1; targetY = y + 1; break;
      }
      
      // Check bounds and propagate
      if (targetX >= 0 && targetX < gridSize && targetY >= 0 && targetY < gridSize) {
        newGrid[targetX][targetY] = min(255, newGrid[targetX][targetY] + 1);
      }
    }
  }
  
  grid = newGrid;
}

function renderGrid() {
  noStroke();
  
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      let brightness = grid[x][y];
      
      if (brightness > 0) {
        // All pixels are white with varying brightness
        fill(brightness);
        rect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }
}

function toggleAnimation() {
  isRunning = !isRunning;
  return false; // Prevent default behavior
}

function updateStatus() {
  let statusDiv = document.getElementById('status');
  if (statusDiv) {
    statusDiv.textContent = `Status: ${isRunning ? 'Running' : 'Paused'} | Iterations: ${iterationCount} | Seeds: ${seedCount}`;
  }
}

function keyPressed() {
  // Press spacebar to pause/resume
  if (key === ' ') {
    toggleAnimation();
  }
  
  // Press 'r' to reset with new seeds
  if (key === 'r' || key === 'R') {
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        grid[i][j] = 0;
      }
    }
    seedInitialPixels();
    iterationCount = 0;
  }
  
  // Press 's' to save JPEG (only when paused) or add seed at mouse position
  if (key === 's' || key === 'S') {
    if (!isRunning) {
      // Save JPEG when paused
      let timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      save(`pixel-propagation-${timestamp}.jpg`);
    } else {
      // Add seed at mouse position when running
      let gridX = floor(mouseX / cellSize);
      let gridY = floor(mouseY / cellSize);
      if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
        grid[gridX][gridY] = 255;
      }
    }
  }
}