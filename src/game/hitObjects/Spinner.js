import * as PIXI from 'pixi.js';

export class Spinner {
  constructor(x, y, time, duration, app) {
    this.x = x;
    this.y = y;
    this.time = time;
    this.duration = duration;
    this.app = app;
    this.radius = 100; // Spinner radius
    
    this.isHit = false;
    this.isCompleted = false;
    this.hitType = '';
    this.rotations = 0;
    this.requiredRotations = 3; // Number of rotations required to complete
    
    // Tracking for rotation calculation
    this.lastAngle = 0;
    this.totalRotation = 0;
    this.lastCursorPosition = { x: 0, y: 0 };
    
    // For RPM calculation
    this.rotationHistory = [];
    this.lastRotationTime = 0;
    
    // Create container for all graphics
    this.container = new PIXI.Container();
    
    // Create effects container
    this.effectsContainer = new PIXI.Container();
    
    // Create spinner background
    this.background = new PIXI.Graphics();
    this.background.beginFill(0x000000, 0.5);
    this.background.drawCircle(0, 0, this.radius);
    this.background.endFill();
    
    // Create spinner circle
    this.spinnerCircle = new PIXI.Graphics();
    this.spinnerCircle.lineStyle(5, 0xFF66AA);
    this.spinnerCircle.drawCircle(0, 0, this.radius * 0.8);
    
    // Add guide lines to help visualize rotation
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const line = new PIXI.Graphics();
      line.lineStyle(2, 0xFFFFFF, 0.5);
      line.moveTo(0, 0);
      line.lineTo(Math.cos(angle) * this.radius * 0.7, Math.sin(angle) * this.radius * 0.7);
      this.spinnerCircle.addChild(line);
    }
    
    // Create spinner meter to show progress
    this.spinnerMeter = new PIXI.Graphics();
    this.updateSpinnerMeter(0);
    
    // Create text to show required spins
    this.spinText = new PIXI.Text('Spin!', {
      fontFamily: 'Arial',
      fontSize: 32,
      fill: 0xFFFFFF,
      align: 'center'
    });
    this.spinText.anchor.set(0.5);
    
    // Add all elements to the container
    this.container.addChild(this.background);
    this.container.addChild(this.effectsContainer);
    this.container.addChild(this.spinnerCircle);
    this.container.addChild(this.spinnerMeter);
    this.container.addChild(this.spinText);
    
    // Position the container
    this.container.position.set(x, y);
    
    // Set initial alpha
    this.container.alpha = 0;
  }
  
  initialize(approachRate) {
    this.approachRate = approachRate;
    this.container.alpha = 0; // Start invisible
  }
  
  update(currentTime) {
    // Calculate time until spinner starts
    const timeUntilStart = this.time - currentTime;
    const timeUntilEnd = this.time + this.duration - currentTime;
    
    // Fade in before spinner starts
    if (timeUntilStart > 0) {
      const fadeProgress = Math.max(0, Math.min(1, 1 - (timeUntilStart / 500)));
      this.container.alpha = fadeProgress;
      return;
    }
    
    // Spinner is active
    if (timeUntilStart <= 0 && timeUntilEnd > 0) {
      this.container.alpha = 1;
      
      // Update spinner appearance based on progress
      const spinProgress = this.rotations / this.requiredRotations;
      this.updateSpinnerMeter(spinProgress);
      
      // Update text
      this.spinText.text = `${Math.floor(this.rotations)}/${this.requiredRotations}`;
      
      // Check if completed
      if (this.rotations >= this.requiredRotations && !this.isCompleted) {
        this.complete();
      }
    }
    
    // Spinner has ended
    if (timeUntilEnd <= 0) {
      // If not completed, mark as miss
      if (!this.isCompleted && !this.isHit) {
        this.miss();
      }
      
      // Fade out
      const fadeOutProgress = Math.min(1, Math.abs(timeUntilEnd) / 300);
      this.container.alpha = 1 - fadeOutProgress;
    }
  }
  
  registerKeyPress(key, cursorPosition) {
    if (this.isCompleted) return;
    
    // Update cursor position for rotation calculation
    this.updateRotation(cursorPosition);
  }
  
  registerClick(cursorPosition) {
    if (this.isCompleted) return;
    
    // Update cursor position for rotation calculation
    this.updateRotation(cursorPosition);
  }
  
  updateRotation(cursorPosition) {
    // Calculate angle from center to cursor
    const dx = cursorPosition.x - this.x;
    const dy = cursorPosition.y - this.y;
    const angle = Math.atan2(dy, dx);
    
    // Calculate distance from center (for improved detection)
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If cursor is too close to center, rotation calculation becomes unstable
    // So we'll ignore updates when cursor is very close to center
    if (distance < this.radius * 0.1) {
      return;
    }
    
    // If this is the first update, just store the angle
    if (this.lastCursorPosition.x === 0 && this.lastCursorPosition.y === 0) {
      this.lastAngle = angle;
      this.lastCursorPosition = { ...cursorPosition };
      return;
    }
    
    // Calculate angle difference
    let angleDiff = angle - this.lastAngle;
    
    // Handle angle wrapping
    if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    
    // Detect direction of rotation (clockwise or counter-clockwise)
    const direction = angleDiff >= 0 ? 1 : -1;
    
    // Add to total rotation (convert to full rotations)
    this.totalRotation += angleDiff;
    this.rotations = Math.abs(this.totalRotation) / (Math.PI * 2);
    
    // Update last values
    this.lastAngle = angle;
    this.lastCursorPosition = { ...cursorPosition };
    
    // Rotate the spinner circle for visual feedback
    this.spinnerCircle.rotation = this.totalRotation;
    
    // Add a visual effect to show rotation direction
    this.createRotationEffect(direction);
  }
  
  updateSpinnerMeter(progress) {
    // Clear previous meter
    this.spinnerMeter.clear();
    
    // Choose color based on progress
    let color;
    if (progress < 0.33) {
      color = 0xFF6666; // Red for low progress
    } else if (progress < 0.66) {
      color = 0xFFFF66; // Yellow for medium progress
    } else if (progress < 1) {
      color = 0x66FF66; // Green for high progress
    } else {
      color = 0x66FFFF; // Cyan for complete
    }
    
    // Draw progress meter
    this.spinnerMeter.lineStyle(10, color);
    this.spinnerMeter.arc(0, 0, this.radius * 0.9, 0, Math.PI * 2 * Math.min(1, progress));
    
    // Update rotation speed indicator
    if (!this.rotationSpeedIndicator) {
      this.rotationSpeedIndicator = new PIXI.Text('0 RPM', {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 0xFFFFFF,
        align: 'center'
      });
      this.rotationSpeedIndicator.anchor.set(0.5);
      this.rotationSpeedIndicator.position.set(0, this.radius * 0.5);
      this.container.addChild(this.rotationSpeedIndicator);
    }
    
    // Calculate RPM (rotations per minute) based on recent rotation changes
    const rpm = this.calculateRPM();
    this.rotationSpeedIndicator.text = `${rpm.toFixed(0)} RPM`;
  }
  
  complete() {
    this.isCompleted = true;
    this.isHit = true;
    this.hitType = 'perfect';
    
    // Visual feedback for completion
    this.spinnerCircle.tint = 0x66FFFF;
    this.spinText.text = 'Complete!';
  }
  
  miss() {
    if (this.isHit) return;
    
    this.isHit = true;
    this.hitType = 'miss';
    
    // Visual feedback for miss
    this.spinnerCircle.tint = 0xFF6666; // Red for misses
    this.spinText.text = 'Miss!';
  }
  
  // Calculate RPM based on recent rotation history
  calculateRPM() {
    const now = performance.now();
    const recentTime = 500; // Look at last 500ms for RPM calculation
    
    // Add current rotation to history
    if (this.lastRotationTime > 0) {
      const timeDiff = now - this.lastRotationTime;
      const rotationDiff = Math.abs(this.totalRotation - (this.rotationHistory[this.rotationHistory.length - 1]?.rotation || 0));
      
      this.rotationHistory.push({
        time: now,
        rotation: this.totalRotation,
        diff: rotationDiff,
        timeDiff: timeDiff
      });
    }
    this.lastRotationTime = now;
    
    // Remove old entries
    while (this.rotationHistory.length > 0 && now - this.rotationHistory[0].time > recentTime) {
      this.rotationHistory.shift();
    }
    
    // Calculate RPM based on recent history
    if (this.rotationHistory.length < 2) return 0;
    
    let totalRotation = 0;
    for (let i = 1; i < this.rotationHistory.length; i++) {
      totalRotation += this.rotationHistory[i].diff;
    }
    
    const timeSpan = (now - this.rotationHistory[0].time) / 1000 / 60; // Convert to minutes
    if (timeSpan <= 0) return 0;
    
    return (totalRotation / (Math.PI * 2)) / timeSpan; // Convert to full rotations per minute
  }
  
  // Create visual effect for rotation
  createRotationEffect(direction) {
    // Create a particle effect to show rotation direction
    const effect = new PIXI.Graphics();
    const angle = Math.random() * Math.PI * 2;
    const distance = this.radius * (0.5 + Math.random() * 0.3);
    
    // Position at a random point on the spinner circle
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    
    // Color based on direction
    const color = direction > 0 ? 0x66FFFF : 0xFF66AA;
    
    effect.beginFill(color, 0.7);
    effect.drawCircle(0, 0, 3 + Math.random() * 2);
    effect.endFill();
    effect.position.set(x, y);
    
    this.effectsContainer.addChild(effect);
    
    // Animate and remove
    const startTime = performance.now();
    const duration = 200 + Math.random() * 100;
    
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      
      effect.alpha = 1 - progress;
      effect.scale.set(1 + progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.effectsContainer.removeChild(effect);
      }
    };
    
    animate();
  }
}