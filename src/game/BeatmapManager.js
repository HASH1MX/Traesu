import { RandomBeatmapGenerator } from './RandomBeatmapGenerator.js';

export class BeatmapManager {
  constructor() {
    this.beatmaps = [];
  }
  
  async loadBeatmaps() {
    // In a real implementation, this would load beatmaps from files or an API
    // For now, we'll create some sample beatmaps
    
    // Sample beatmap 1
    const beatmap1 = {
      id: 'sample1',
      title: 'Sample Beatmap 1',
      artist: 'Test Artist',
      difficulty: 'Easy',
      bpm: 120,
      audioUrl: 'assets/songs/sample1.mp3',
      hitObjects: [
        { x: 200, y: 200, time: 1000, type: 'circle' },
        { x: 400, y: 300, time: 2000, type: 'circle' },
        { x: 300, y: 400, time: 3000, type: 'circle' },
        { x: 500, y: 200, time: 4000, type: 'circle' },
        { x: 200, y: 300, time: 5000, type: 'slider', path: [[300, 300], [400, 300]] },
        { x: 400, y: 400, time: 6500, type: 'circle' },
        { x: 300, y: 200, time: 7500, type: 'circle' },
        { x: 500, y: 300, time: 8500, type: 'slider', path: [[400, 400], [300, 500]] },
        { x: 300, y: 300, time: 10000, type: 'spinner', duration: 2000 }
      ]
    };
    
    // Sample beatmap 2
    const beatmap2 = {
      id: 'sample2',
      title: 'Sample Beatmap 2',
      artist: 'Another Artist',
      difficulty: 'Normal',
      bpm: 150,
      audioUrl: 'assets/songs/sample2.mp3',
      hitObjects: [
        { x: 300, y: 300, time: 1000, type: 'circle' },
        { x: 400, y: 200, time: 1500, type: 'circle' },
        { x: 200, y: 400, time: 2000, type: 'circle' },
        { x: 500, y: 300, time: 2500, type: 'circle' },
        { x: 300, y: 200, time: 3000, type: 'slider', path: [[400, 200], [500, 200]] },
        { x: 200, y: 300, time: 4000, type: 'circle' },
        { x: 400, y: 400, time: 4500, type: 'circle' },
        { x: 300, y: 300, time: 5000, type: 'slider', path: [[300, 400], [300, 500]] },
        { x: 400, y: 200, time: 6000, type: 'circle' },
        { x: 200, y: 400, time: 6500, type: 'circle' },
        { x: 300, y: 300, time: 7000, type: 'spinner', duration: 1500 },
        { x: 500, y: 300, time: 9000, type: 'circle' },
        { x: 400, y: 400, time: 9500, type: 'circle' },
        { x: 300, y: 200, time: 10000, type: 'circle' }
      ]
    };
    
    // Sample beatmap 3
    const beatmap3 = {
      id: 'sample3',
      title: 'Sample Beatmap 3',
      artist: 'Hard Artist',
      difficulty: 'Hard',
      bpm: 180,
      audioUrl: 'assets/songs/sample3.mp3',
      hitObjects: [
        { x: 300, y: 300, time: 500, type: 'circle' },
        { x: 400, y: 200, time: 800, type: 'circle' },
        { x: 200, y: 400, time: 1100, type: 'circle' },
        { x: 500, y: 300, time: 1400, type: 'circle' },
        { x: 300, y: 200, time: 1700, type: 'slider', path: [[400, 200], [500, 200]] },
        { x: 200, y: 300, time: 2300, type: 'circle' },
        { x: 400, y: 400, time: 2600, type: 'circle' },
        { x: 300, y: 300, time: 2900, type: 'slider', path: [[300, 400], [300, 500]] },
        { x: 400, y: 200, time: 3500, type: 'circle' },
        { x: 200, y: 400, time: 3800, type: 'circle' },
        { x: 500, y: 300, time: 4100, type: 'circle' },
        { x: 300, y: 200, time: 4400, type: 'circle' },
        { x: 400, y: 400, time: 4700, type: 'circle' },
        { x: 200, y: 300, time: 5000, type: 'slider', path: [[300, 300], [400, 300]] },
        { x: 500, y: 200, time: 5600, type: 'circle' },
        { x: 300, y: 400, time: 5900, type: 'circle' },
        { x: 400, y: 300, time: 6200, type: 'spinner', duration: 1000 },
        { x: 200, y: 200, time: 7500, type: 'circle' },
        { x: 500, y: 400, time: 7800, type: 'circle' },
        { x: 300, y: 300, time: 8100, type: 'circle' }
      ]
    };
    
    // Add the sample beatmaps to the list
    this.beatmaps.push(beatmap1, beatmap2, beatmap3);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return this.beatmaps;
  }
  
  getBeatmaps() {
    return this.beatmaps;
  }
  
  getBeatmapById(id) {
    return this.beatmaps.find(beatmap => beatmap.id === id);
  }
  
  /**
   * Creates a random beatmap with the specified parameters
   * @param {Object} options - Configuration options for the random beatmap
   * @returns {Object} The generated random beatmap
   */
  createRandomBeatmap(options = {}) {
    // Get the canvas dimensions from the game
    const canvasContainer = document.getElementById('game-canvas-container');
    const canvasWidth = canvasContainer ? canvasContainer.clientWidth : 800;
    const canvasHeight = canvasContainer ? canvasContainer.clientHeight : 600;
    
    // Set default options with canvas dimensions
    const beatmapOptions = {
      ...options,
      canvasWidth,
      canvasHeight
    };
    
    // Generate the random beatmap
    const randomBeatmap = RandomBeatmapGenerator.generateRandomBeatmap(beatmapOptions);
    
    // Add a timestamp to make the ID unique
    randomBeatmap.id = `random_${Date.now()}`;
    
    // Add to the beatmaps list
    this.beatmaps.push(randomBeatmap);
    
    return randomBeatmap;
  }
}