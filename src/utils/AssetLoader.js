import { Howl } from 'howler';

export class AssetLoader {
  constructor() {
    this.assets = {
      images: {},
      sounds: {},
      fonts: {}
    };
    
    this.totalAssets = 0;
    this.loadedAssets = 0;
  }
  
  async loadAssets(progressCallback) {
    // Define assets to load
    const imagesToLoad = [
      { name: 'hitcircle', url: 'assets/images/hitcircle.png' },
      { name: 'hitcircle-overlay', url: 'assets/images/hitcircle-overlay.png' },
      { name: 'approachcircle', url: 'assets/images/approachcircle.png' },
      { name: 'cursor', url: 'assets/images/cursor.png' },
      { name: 'cursor-trail', url: 'assets/images/cursor-trail.png' },
      { name: 'slider-body', url: 'assets/images/slider-body.png' },
      { name: 'slider-ball', url: 'assets/images/slider-ball.png' },
      { name: 'spinner-background', url: 'assets/images/spinner-background.png' },
      { name: 'spinner-circle', url: 'assets/images/spinner-circle.png' },
      { name: 'spinner-meter', url: 'assets/images/spinner-meter.png' }
    ];
    
    const soundsToLoad = [
      { name: 'hit-normal', url: 'assets/sounds/normal-hit.wav' },
      { name: 'hit-whistle', url: 'assets/sounds/whistle.wav' },
      { name: 'hit-finish', url: 'assets/sounds/finish.wav' },
      { name: 'hit-clap', url: 'assets/sounds/clap.wav' },
      { name: 'combobreak', url: 'assets/sounds/combobreak.wav' },
      { name: 'perfect-hit', url: 'assets/sounds/perfect-hit.wav' },
      { name: 'good-hit', url: 'assets/sounds/good-hit.wav' },
      { name: 'okay-hit', url: 'assets/sounds/okay-hit.wav' },
      { name: 'miss', url: 'assets/sounds/miss.wav' }
    ];
    
    // Set total assets to load
    this.totalAssets = imagesToLoad.length + soundsToLoad.length;
    this.loadedAssets = 0;
    
    // Create placeholder assets for now (since we don't have actual assets yet)
    // In a real implementation, we would load the actual assets
    for (const image of imagesToLoad) {
      // For now, just create a placeholder and consider it loaded
      this.assets.images[image.name] = { name: image.name, url: image.url };
      this.loadedAssets++;
      
      if (progressCallback) {
        progressCallback(this.loadedAssets / this.totalAssets);
      }
      
      // Add a small delay to simulate loading
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    for (const sound of soundsToLoad) {
      // For now, just create a placeholder and consider it loaded
      this.assets.sounds[sound.name] = new Howl({
        src: [sound.url],
        preload: false // Don't actually try to load the file since it doesn't exist yet
      });
      
      this.loadedAssets++;
      
      if (progressCallback) {
        progressCallback(this.loadedAssets / this.totalAssets);
      }
      
      // Add a small delay to simulate loading
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return this.assets;
  }
  
  getImage(name) {
    return this.assets.images[name];
  }
  
  getSound(name) {
    return this.assets.sounds[name];
  }
  
  playSound(name) {
    const sound = this.getSound(name);
    if (sound) {
      sound.play();
    }
  }
}