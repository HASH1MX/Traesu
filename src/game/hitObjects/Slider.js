import * as PIXI from 'pixi.js';
import { HitCircle } from './HitCircle.js';

export class Slider extends HitCircle {
  constructor(x, y, time, path, app) {
    super(x, y, time, app);
    
    this.path = path;
    this.duration = 1000; // Default duration in ms
    this.isFollowing = false;
    this.followProgress = 0;
    this.lastFollowTime = 0;
    
    // Create slider path
    this.sliderPath = new PIXI.Graphics();
    this.sliderPath.lineStyle(this.radius * 2, 0xFF66AA, 0.5);
    this.sliderPath.moveTo(0, 0);
    
    // Draw the path
    for (const point of path) {
      this.sliderPath.lineTo(point[0] - x, point[1] - y);
    }
    
    // Create slider ball
    this.sliderBall = new PIXI.Graphics();
    this.sliderBall.beginFill(0xFFFFFF);
    this.sliderBall.drawCircle(0, 0, this.radius / 2);
    this.sliderBall.endFill();
    this.sliderBall.visible = false;
    
    // Add slider elements to container
    this.container.addChildAt(this.sliderPath, 0); // Add path behind hit circle
    this.container.addChild(this.sliderBall);
    
    // Calculate total path length for animation
    this.pathLength = this.calculatePathLength();
  }
  
  calculatePathLength() {
    let length = 0;
    let prevX = 0;
    let prevY = 0;
    
    for (let i = 0; i < this.path.length; i++) {
      const point = this.path[i];
      const dx = point[0] - this.x - prevX;
      const dy = point[1] - this.y - prevY;
      length += Math.sqrt(dx * dx + dy * dy);
      prevX = point[0] - this.x;
      prevY = point[1] - this.y;
    }
    
    return length;
  }
  
  update(currentTime) {
    // First update the hit circle part
    super.update(currentTime);
    
    // If already completed, don't update further
    if (this.isHit && this.hitType !== '') return;
    
    // Calculate time since hit time
    const timeSinceHit = currentTime - this.time;
    
    // If the hit time has passed, show the slider ball and start tracking
    if (timeSinceHit >= 0 && timeSinceHit <= this.duration) {
      // If we just started following
      if (!this.isFollowing && this.isHit) {
        this.isFollowing = true;
        this.sliderBall.visible = true;
        this.lastFollowTime = currentTime;
      }
      
      // Update slider ball position
      if (this.isFollowing) {
        this.followProgress = timeSinceHit / this.duration;
        this.updateSliderBallPosition();
      }
      
      // Check if slider is completed
      if (timeSinceHit >= this.duration) {
        this.completeSlider();
      }
    }
  }
  
  updateSliderBallPosition() {
    // Calculate position along the path based on progress
    const progress = Math.min(1, this.followProgress);
    
    // Simple linear interpolation for now
    // In a real implementation, this would follow the actual curve
    if (this.path.length > 0) {
      const targetIndex = Math.floor(progress * this.path.length);
      const nextIndex = Math.min(targetIndex + 1, this.path.length - 1);
      
      const targetPoint = this.path[targetIndex];
      const nextPoint = this.path[nextIndex];
      
      const segmentProgress = (progress * this.path.length) - targetIndex;
      
      const x = targetPoint[0] + (nextPoint[0] - targetPoint[0]) * segmentProgress - this.x;
      const y = targetPoint[1] + (nextPoint[1] - targetPoint[1]) * segmentProgress - this.y;
      
      this.sliderBall.position.set(x, y);
    }
  }
  
  hit(hitType) {
    // Only register the initial hit
    if (!this.isHit) {
      super.hit(hitType);
      
      // Don't hide the hit circle for sliders
      this.hitCircle.visible = true;
      this.hitCircle.alpha = 0.5;
    }
  }
  
  completeSlider() {
    if (this.isFollowing) {
      this.isFollowing = false;
      this.sliderBall.visible = false;
      
      // Mark as completed with a perfect hit
      this.hitType = 'perfect';
      this.hitCircle.tint = 0x66FFFF; // Cyan for perfect hits
    }
  }
  
  miss() {
    // If already following, don't mark as miss
    if (this.isFollowing) return;
    
    super.miss();
  }
}