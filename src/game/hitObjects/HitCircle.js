import * as PIXI from 'pixi.js';

export class HitCircle {
  constructor(x, y, time, app) {
    this.x = x;
    this.y = y;
    this.time = time;
    this.app = app;
    this.radius = 50; // Base radius of the hit circle
    this.isHit = false;
    this.hitTime = null;
    this.hitType = '';
    
    // Create container for all graphics
    this.container = new PIXI.Container();
    
    // Create the hit circle
    this.hitCircle = new PIXI.Graphics();
    this.hitCircle.beginFill(0xFF66AA);
    this.hitCircle.drawCircle(0, 0, this.radius);
    this.hitCircle.endFill();
    
    // Create the approach circle
    this.approachCircle = new PIXI.Graphics();
    this.approachCircle.lineStyle(3, 0xFFFFFF);
    this.approachCircle.drawCircle(0, 0, this.radius * 3); // Start 3x the size
    
    // Create the hit number
    this.hitNumber = new PIXI.Text('1', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFFFFF,
      align: 'center'
    });
    this.hitNumber.anchor.set(0.5);
    
    // Add all elements to the container
    this.container.addChild(this.hitCircle);
    this.container.addChild(this.approachCircle);
    this.container.addChild(this.hitNumber);
    
    // Position the container
    this.container.position.set(x, y);
    
    // Set initial alpha
    this.container.alpha = 0;
  }
  
  initialize(approachRate) {
    this.approachRate = approachRate;
    this.container.alpha = 1;
  }
  
  update(currentTime) {
    // If already hit, just update hit animation
    if (this.isHit) {
      this.updateHitAnimation(currentTime);
      return;
    }
    
    // Calculate time until hit
    const timeUntilHit = this.time - currentTime;
    
    // If the hit time has passed and it wasn't hit, mark as missed
    if (timeUntilHit < -200) { // 200ms is the hit window
      this.miss();
      return;
    }
    
    // Update approach circle size based on time
    if (timeUntilHit > 0) {
      const approachProgress = Math.max(0, Math.min(1, 1 - (timeUntilHit / this.approachRate)));
      const approachScale = 3 - (2 * approachProgress); // Scale from 3x to 1x
      this.approachCircle.scale.set(approachScale);
      
      // Fade in the hit circle
      if (timeUntilHit > this.approachRate - 100) {
        const fadeProgress = (this.approachRate - timeUntilHit) / 100;
        this.container.alpha = Math.min(1, fadeProgress);
      }
    } else {
      // Hit time has passed, approach circle should be at the same size as hit circle
      this.approachCircle.scale.set(1);
    }
  }
  
  hit(hitType) {
    if (this.isHit) return;
    
    this.isHit = true;
    this.hitTime = performance.now();
    this.hitType = hitType;
    
    // Change appearance based on hit type
    switch (hitType) {
      case 'perfect':
        this.hitCircle.tint = 0x66FFFF; // Cyan for perfect hits
        break;
      case 'good':
        this.hitCircle.tint = 0x66FF66; // Green for good hits
        break;
      case 'okay':
        this.hitCircle.tint = 0xFFFF66; // Yellow for okay hits
        break;
    }
    
    // Hide approach circle
    this.approachCircle.visible = false;
  }
  
  miss() {
    if (this.isHit) return;
    
    this.isHit = true;
    this.hitTime = performance.now();
    this.hitType = 'miss';
    
    // Change appearance for miss
    this.hitCircle.tint = 0xFF6666; // Red for misses
    
    // Hide approach circle
    this.approachCircle.visible = false;
  }
  
  updateHitAnimation(currentTime) {
    if (!this.hitTime) return;
    
    // Calculate time since hit
    const timeSinceHit = performance.now() - this.hitTime;
    
    // Animate based on hit type
    if (this.hitType === 'miss') {
      // Fade out quickly for misses
      const fadeProgress = Math.min(1, timeSinceHit / 200);
      this.container.alpha = 1 - fadeProgress;
      this.container.scale.set(1 - (fadeProgress * 0.3));
    } else {
      // Expand and fade out for hits
      const fadeProgress = Math.min(1, timeSinceHit / 300);
      this.container.alpha = 1 - fadeProgress;
      this.container.scale.set(1 + (fadeProgress * 0.5));
    }
  }
}