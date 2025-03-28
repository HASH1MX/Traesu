import * as PIXI from 'pixi.js';
import { Howl } from 'howler';
import { HitCircle } from './hitObjects/HitCircle.js';
import { Slider } from './hitObjects/Slider.js';
import { Spinner } from './hitObjects/Spinner.js';
import { ScoreManager } from './ScoreManager.js';

export class Game {
  constructor(beatmapManager, uiManager) {
    this.beatmapManager = beatmapManager;
    this.uiManager = uiManager;
    
    // Game state
    this.isRunning = false;
    this.isPaused = false;
    this.currentBeatmap = null;
    this.hitObjects = [];
    this.activeHitObjects = [];
    this.startTime = 0;
    this.currentTime = 0;
    this.audioStartTime = 0;
    this.audioEnabled = false; // Flag to track if audio is enabled
    
    // Gameplay settings
    this.approachRate = 800; // ms for approach circle to shrink
    this.hitWindow = {
      perfect: 80,  // ms window for 300 score
      good: 140,    // ms window for 100 score
      okay: 200     // ms window for 50 score
    };
    
    // Player state
    this.scoreManager = new ScoreManager();
    this.health = 1.0; // 0.0 to 1.0
    this.cursorPosition = { x: 0, y: 0 };
    
    // Initialize PIXI application
    this.app = new PIXI.Application({
      view: document.getElementById('game-canvas'),
      resizeTo: document.getElementById('game-canvas-container'),
      backgroundColor: 0x111111,
      antialias: true
    });
    
    // Create containers for different layers
    this.backgroundLayer = new PIXI.Container();
    this.hitObjectsLayer = new PIXI.Container();
    this.effectsLayer = new PIXI.Container();
    this.cursorLayer = new PIXI.Container();
    
    this.app.stage.addChild(this.backgroundLayer);
    this.app.stage.addChild(this.hitObjectsLayer);
    this.app.stage.addChild(this.effectsLayer);
    this.app.stage.addChild(this.cursorLayer);
    
    // Create cursor sprite
    this.cursor = new PIXI.Graphics();
    this.cursor.beginFill(0xFFFFFF);
    this.cursor.drawCircle(0, 0, 10);
    this.cursor.endFill();
    this.cursorLayer.addChild(this.cursor);
    
    // Audio (optional)
    this.audio = null;
    
    // Bind the update method to the current instance
    this.update = this.update.bind(this);
  }
  
  loadBeatmap(beatmap) {
    this.currentBeatmap = beatmap;
    this.hitObjects = [];
    this.activeHitObjects = [];
    
    // Clear existing hit objects from the display
    this.hitObjectsLayer.removeChildren();
    
    // Parse and create hit objects from the beatmap data
    beatmap.hitObjects.forEach(objData => {
      let hitObject;
      
      switch (objData.type) {
        case 'circle':
          hitObject = new HitCircle(objData.x, objData.y, objData.time, this.app);
          break;
        case 'slider':
          hitObject = new Slider(objData.x, objData.y, objData.time, objData.path, this.app);
          break;
        case 'spinner':
          hitObject = new Spinner(objData.x, objData.y, objData.time, objData.duration, this.app);
          break;
        default:
          console.warn(`Unknown hit object type: ${objData.type}`);
          return;
      }
      
      this.hitObjects.push(hitObject);
    });
    
    // Sort hit objects by time
    this.hitObjects.sort((a, b) => a.time - b.time);
    
    // Disable audio - game will run without sound
    this.audioEnabled = false;
    console.log('Game will run without audio');
    
    // Reset game state
    this.scoreManager.reset();
    this.health = 1.0;
    this.updateUI();
  }
  
  start() {
    if (!this.currentBeatmap) {
      console.error('No beatmap loaded');
      return;
    }
    
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = performance.now();
    this.currentTime = 0;
    
    // Start the game loop
    this.app.ticker.add(this.update);
    
    // Set audio start time for timing calculations
    this.audioStartTime = this.startTime + 3000; // 3 seconds delay
    
    // Game will run without audio
    this.audioEnabled = false;
  }
  
  pause() {
    if (this.isRunning) {
      this.isPaused = true;
      this.app.ticker.remove(this.update);
      
      // Only pause audio if it's enabled
      if (this.audioEnabled && this.audio) {
        try {
          this.audio.pause();
        } catch (error) {
          console.error('Error pausing audio:', error);
        }
      }
    }
  }
  
  resume() {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      this.app.ticker.add(this.update);
      
      // Only resume audio if it's enabled
      if (this.audioEnabled && this.audio) {
        try {
          this.audio.play();
        } catch (error) {
          console.error('Error resuming audio:', error);
          this.audioEnabled = false;
        }
      }
    }
  }
  
  restart() {
    this.reset();
    this.loadBeatmap(this.currentBeatmap);
    this.start();
  }
  
  reset() {
    this.isRunning = false;
    this.isPaused = false;
    this.app.ticker.remove(this.update);
    
    // Only stop audio if it's enabled
    if (this.audioEnabled && this.audio) {
      try {
        this.audio.stop();
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
    }
    
    this.hitObjectsLayer.removeChildren();
    this.effectsLayer.removeChildren();
    
    this.hitObjects = [];
    this.activeHitObjects = [];
    this.scoreManager.reset();
    this.health = 1.0;
    this.updateUI();
  }
  
  update(delta) {
    if (!this.isRunning || this.isPaused) return;
    
    // Update current time
    this.currentTime = performance.now() - this.startTime;
    
    // Update cursor position
    this.cursor.position.set(this.cursorPosition.x, this.cursorPosition.y);
    
    // Check if the beatmap has ended
    // Use beatmap duration or default to 3 minutes (180 seconds)
    if (this.currentTime > this.audioStartTime + (this.currentBeatmap.duration || 180) * 1000 + 2000) {
      this.endGame();
      return;
    }
    
    // Spawn new hit objects
    this.spawnHitObjects();
    
    // Update active hit objects
    this.updateHitObjects();
    
    // Update UI
    this.updateUI();
    
    // Check for failed state (health depleted)
    if (this.health <= 0) {
      this.failGame();
    }
  }
  
  spawnHitObjects() {
    // Find hit objects that should be spawned based on current time
    const spawnTime = this.currentTime + this.approachRate;
    
    while (this.hitObjects.length > 0 && this.hitObjects[0].time <= spawnTime) {
      const hitObject = this.hitObjects.shift();
      
      // Add to active hit objects
      this.activeHitObjects.push(hitObject);
      
      // Add to display
      this.hitObjectsLayer.addChild(hitObject.container);
      
      // Initialize the hit object
      hitObject.initialize(this.approachRate);
    }
  }
  
  updateHitObjects() {
    const currentGameTime = this.currentTime - this.audioStartTime;
    
    // Update each active hit object
    for (let i = this.activeHitObjects.length - 1; i >= 0; i--) {
      const hitObject = this.activeHitObjects[i];
      
      // Update the hit object
      hitObject.update(currentGameTime);
      
      // Special handling for spinners
      if (hitObject.constructor.name === 'Spinner') {
        // Check if spinner duration has ended
        if (currentGameTime > hitObject.time + hitObject.duration) {
          if (!hitObject.isHit) {
            // Player missed this spinner
            this.handleMiss(hitObject);
          }
          
          // Remove from active hit objects and display
          this.activeHitObjects.splice(i, 1);
          this.hitObjectsLayer.removeChild(hitObject.container);
        }
        // Continue to next hit object
        continue;
      }
      
      // Check if the hit object is expired (missed)
      if (currentGameTime > hitObject.time + this.hitWindow.okay) {
        if (!hitObject.isHit) {
          // Player missed this hit object
          this.handleMiss(hitObject);
        }
        
        // Remove from active hit objects and display
        this.activeHitObjects.splice(i, 1);
        this.hitObjectsLayer.removeChild(hitObject.container);
      }
    }
  }
  
  handleKeyPress(key) {
    if (!this.isRunning || this.isPaused || this.activeHitObjects.length === 0) return;
    
    // Find the earliest active hit object that can be hit
    const currentGameTime = this.currentTime - this.audioStartTime;
    const hitableObjects = this.activeHitObjects.filter(obj => {
      // For spinners, we check if it's active during its duration
      if (obj.constructor.name === 'Spinner') {
        return currentGameTime >= obj.time && 
               currentGameTime <= obj.time + obj.duration && 
               !obj.isCompleted;
      }
      // For other hit objects, use the hit window
      const timeDiff = Math.abs(currentGameTime - obj.time);
      return timeDiff <= this.hitWindow.okay && !obj.isHit;
    });
    
    if (hitableObjects.length > 0) {
      // Sort by time (earliest first)
      hitableObjects.sort((a, b) => a.time - b.time);
      
      // Check if cursor is over the hit object (for circles and sliders)
      const hitObject = hitableObjects[0];
      if (hitObject.constructor.name === 'HitCircle' || hitObject.constructor.name === 'Slider') {
        const distance = Math.sqrt(
          Math.pow(this.cursorPosition.x - hitObject.x, 2) +
          Math.pow(this.cursorPosition.y - hitObject.y, 2)
        );
        
        if (distance <= hitObject.radius) {
          this.handleHit(hitObject, currentGameTime);
        }
      } else if (hitObject.constructor.name === 'Spinner') {
        // For spinners, register the key press and update cursor position
        hitObject.registerKeyPress(key, this.cursorPosition);
        
        // Check if spinner is completed
        if (hitObject.isCompleted && !hitObject.isScored) {
          hitObject.isScored = true;
          this.handleHit(hitObject, currentGameTime);
        }
        
        // Create a small effect at cursor position for visual feedback
        this.createSpinnerEffect(this.cursorPosition.x, this.cursorPosition.y);
      }
    }
  }
  
  handleMouseClick(x, y) {
    if (!this.isRunning || this.isPaused || this.activeHitObjects.length === 0) return;
    
    // Update cursor position
    this.updateCursorPosition(x, y);
    
    // Find the earliest active hit object that can be hit
    const currentGameTime = this.currentTime - this.audioStartTime;
    const hitableObjects = this.activeHitObjects.filter(obj => {
      // For spinners, we check if it's active during its duration
      if (obj instanceof Spinner) {
        return currentGameTime >= obj.time && 
               currentGameTime <= obj.time + obj.duration && 
               !obj.isCompleted;
      }
      // For other hit objects, use the hit window
      const timeDiff = Math.abs(currentGameTime - obj.time);
      return timeDiff <= this.hitWindow.okay && !obj.isHit;
    });
    
    if (hitableObjects.length > 0) {
      // Sort by time (earliest first)
      hitableObjects.sort((a, b) => a.time - b.time);
      
      // Check if cursor is over the hit object
      const hitObject = hitableObjects[0];
      if (hitObject.constructor.name === 'HitCircle' || hitObject.constructor.name === 'Slider') {
        const distance = Math.sqrt(
          Math.pow(this.cursorPosition.x - hitObject.x, 2) +
          Math.pow(this.cursorPosition.y - hitObject.y, 2)
        );
        
        if (distance <= hitObject.radius) {
          this.handleHit(hitObject, currentGameTime);
        }
      } else if (hitObject.constructor.name === 'Spinner') {
        // For spinners, register the click
        hitObject.registerClick(this.cursorPosition);
        
        // Check if spinner is completed
        if (hitObject.isCompleted && !hitObject.isScored) {
          hitObject.isScored = true;
          this.handleHit(hitObject, currentGameTime);
        }
        
        // Create a small effect at cursor position for visual feedback
        this.createSpinnerEffect(this.cursorPosition.x, this.cursorPosition.y);
      }
    }
  }
  
  updateCursorPosition(x, y) {
    // Convert screen coordinates to canvas coordinates
    const rect = this.app.view.getBoundingClientRect();
    this.cursorPosition.x = x - rect.left;
    this.cursorPosition.y = y - rect.top;
    
    // Check if there's an active spinner and update its rotation
    if (this.isRunning && !this.isPaused) {
      const currentGameTime = this.currentTime - this.audioStartTime;
      
      // Find active spinners
      const activeSpinners = this.activeHitObjects.filter(obj => {
        return obj.constructor.name === 'Spinner' && 
               currentGameTime >= obj.time && 
               currentGameTime <= obj.time + obj.duration && 
               !obj.isCompleted;
      });
      
      // Update rotation for active spinners
      if (activeSpinners.length > 0) {
        activeSpinners[0].updateRotation(this.cursorPosition);
      }
    }
  }
  
  handleHit(hitObject, currentTime) {
    // Calculate timing accuracy
    const timeDiff = Math.abs(currentTime - hitObject.time);
    let hitScore = 0;
    let hitType = '';
    
    if (timeDiff <= this.hitWindow.perfect) {
      hitScore = 300;
      hitType = 'perfect';
    } else if (timeDiff <= this.hitWindow.good) {
      hitScore = 100;
      hitType = 'good';
    } else if (timeDiff <= this.hitWindow.okay) {
      hitScore = 50;
      hitType = 'okay';
    }
    
    // Mark the hit object as hit
    hitObject.hit(hitType);
    
    // Update score
    this.scoreManager.addHit(hitScore, hitType);
    
    // Update health
    this.updateHealth(true, hitType);
    
    // Play hit sound
    this.playHitSound(hitType);
    
    // Create hit effect
    this.createHitEffect(hitObject.x, hitObject.y, hitType);
  }
  
  handleMiss(hitObject) {
    // Mark the hit object as missed
    hitObject.miss();
    
    // Update score
    this.scoreManager.addMiss();
    
    // Update health
    this.updateHealth(false);
    
    // Play miss sound
    this.playMissSound();
  }
  
  updateHealth(isHit, hitType = '') {
    if (isHit) {
      // Increase health based on hit type
      switch (hitType) {
        case 'perfect':
          this.health += 0.05;
          break;
        case 'good':
          this.health += 0.03;
          break;
        case 'okay':
          this.health += 0.01;
          break;
      }
    } else {
      // Decrease health on miss
      this.health -= 0.1;
    }
    
    // Clamp health between 0 and 1
    this.health = Math.max(0, Math.min(1, this.health));
    
    // Update health bar in UI
    document.getElementById('health').style.width = `${this.health * 100}%`;
  }
  
  updateUI() {
    // Update score display
    document.getElementById('score').textContent = this.scoreManager.getScore();
    document.getElementById('combo').textContent = this.scoreManager.getCombo();
    
    // Update accuracy display
    const accuracy = this.scoreManager.getAccuracy();
    document.getElementById('accuracy').textContent = `${accuracy.toFixed(2)}%`;
    
    // Update health bar
    document.getElementById('health').style.width = `${this.health * 100}%`;
  }
  
  playHitSound(hitType) {
    // Only play sounds if audio is enabled
    if (this.audioEnabled) {
      // Play different sounds based on hit type
      // This would be implemented with actual sound files
      console.log(`Playing ${hitType} hit sound`);
    }
  }
  
  playMissSound() {
    // Only play sounds if audio is enabled
    if (this.audioEnabled) {
      // Play miss sound
      // This would be implemented with actual sound files
      console.log('Playing miss sound');
    }
  }
  
  createHitEffect(x, y, hitType) {
    // Create a visual effect at the hit location
    const effect = new PIXI.Graphics();
    
    switch (hitType) {
      case 'perfect':
        effect.beginFill(0x66FFFF, 0.5);
        break;
      case 'good':
        effect.beginFill(0x66FF66, 0.5);
        break;
      case 'okay':
        effect.beginFill(0xFFFF66, 0.5);
        break;
      case 'miss':
        effect.beginFill(0xFF6666, 0.5);
        break;
    }
    
    effect.drawCircle(0, 0, 60);
    effect.endFill();
    effect.position.set(x, y);
    this.effectsLayer.addChild(effect);
    
    // Animate and remove the effect
    const startTime = performance.now();
    const duration = 300; // ms
    
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      
      effect.alpha = 1 - progress;
      effect.scale.set(1 + progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.effectsLayer.removeChild(effect);
      }
    };
    
    animate();
  }
  
  // Create a smaller effect for spinner feedback
  createSpinnerEffect(x, y) {
    // Create a small visual effect at the cursor location for spinner feedback
    const effect = new PIXI.Graphics();
    
    // Random color for variety
    const colors = [0x66FFFF, 0xFF66AA, 0x66FF66, 0xFFFF66];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    effect.beginFill(color, 0.7);
    effect.drawCircle(0, 0, 10 + Math.random() * 5);
    effect.endFill();
    effect.position.set(x, y);
    this.effectsLayer.addChild(effect);
    
    // Animate and remove the effect quickly
    const startTime = performance.now();
    const duration = 150; // ms - faster than regular hit effects
    
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      
      effect.alpha = 1 - progress;
      effect.scale.set(1 + progress * 0.5);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.effectsLayer.removeChild(effect);
      }
    };
    
    animate();
  }
  
  endGame() {
    this.isRunning = false;
    this.app.ticker.remove(this.update);
    
    if (this.audioEnabled && this.audio) {
      try {
        this.audio.stop();
      } catch (error) {
        console.error('Error stopping audio at end game:', error);
      }
    }
    
    // Show results screen
    this.uiManager.showScreen('result');
    
    // Update result screen with game stats
    document.getElementById('final-score').textContent = this.scoreManager.getScore();
    document.getElementById('final-accuracy').textContent = `${this.scoreManager.getAccuracy().toFixed(2)}%`;
    document.getElementById('max-combo').textContent = this.scoreManager.getMaxCombo();
    document.getElementById('perfect-hits').textContent = this.scoreManager.getPerfectHits();
    document.getElementById('good-hits').textContent = this.scoreManager.getGoodHits();
    document.getElementById('okay-hits').textContent = this.scoreManager.getOkayHits();
    document.getElementById('misses').textContent = this.scoreManager.getMisses();
    
    // Reset the heading to default
    const resultHeading = document.querySelector('#result-screen h2');
    if (resultHeading) {
      resultHeading.textContent = 'Results';
    }
  }
  
  failGame() {
    this.isRunning = false;
    this.app.ticker.remove(this.update);
    
    if (this.audioEnabled && this.audio) {
      try {
        this.audio.stop();
      } catch (error) {
        console.error('Error stopping audio at fail game:', error);
      }
    }
    
    // Show fail screen
    this.uiManager.showScreen('result');
    
    // Update result screen with game stats
    document.getElementById('final-score').textContent = this.scoreManager.getScore();
    document.getElementById('final-accuracy').textContent = `${this.scoreManager.getAccuracy().toFixed(2)}%`;
    document.getElementById('max-combo').textContent = this.scoreManager.getMaxCombo();
    document.getElementById('perfect-hits').textContent = this.scoreManager.getPerfectHits();
    document.getElementById('good-hits').textContent = this.scoreManager.getGoodHits();
    document.getElementById('okay-hits').textContent = this.scoreManager.getOkayHits();
    document.getElementById('misses').textContent = this.scoreManager.getMisses();
    
    // Add a fail message to the results heading
    const resultHeading = document.querySelector('#result-screen h2');
    if (resultHeading) {
      resultHeading.textContent = 'Game Over';
    }
  }
}