/**
 * RandomBeatmapGenerator.js
 * Utility class to generate random beatmaps for the Traesu game
 */

export class RandomBeatmapGenerator {
  /**
   * Generate a random beatmap with specified parameters
   * @param {Object} options - Configuration options for the beatmap
   * @param {number} options.duration - Duration of the beatmap in milliseconds
   * @param {number} options.difficulty - Difficulty level (1-5)
   * @param {number} options.bpm - Beats per minute
   * @param {number} options.canvasWidth - Width of the game canvas
   * @param {number} options.canvasHeight - Height of the game canvas
   * @returns {Object} A beatmap object compatible with the game engine
   */
  static generateRandomBeatmap(options = {}) {
    // Default options
    const {
      duration = 60000, // 1 minute by default
      difficulty = 3,   // Medium difficulty
      bpm = 120,        // 120 BPM
      canvasWidth = 800,
      canvasHeight = 600,
      minSpacing = 300  // Minimum time between objects in ms
    } = options;
    
    // Calculate parameters based on difficulty
    const circleFrequency = 0.6 + (difficulty * 0.1); // Higher difficulty = more circles
    const sliderFrequency = 0.2 + (difficulty * 0.05); // Higher difficulty = more sliders
    const spinnerFrequency = 0.05 + (difficulty * 0.01); // Higher difficulty = more spinners
    
    // Calculate beat interval in milliseconds
    const beatInterval = 60000 / bpm;
    
    // Generate hit objects
    const hitObjects = [];
    let currentTime = 1000; // Start after 1 second
    
    while (currentTime < duration) {
      // Determine object type based on random chance and frequencies
      const rand = Math.random();
      let objectType;
      
      if (rand < circleFrequency) {
        objectType = 'circle';
      } else if (rand < circleFrequency + sliderFrequency) {
        objectType = 'slider';
      } else if (rand < circleFrequency + sliderFrequency + spinnerFrequency) {
        objectType = 'spinner';
      } else {
        // Skip this beat
        currentTime += beatInterval;
        continue;
      }
      
      // Generate random position (with padding from edges)
      const padding = 100;
      const x = Math.floor(Math.random() * (canvasWidth - 2 * padding)) + padding;
      const y = Math.floor(Math.random() * (canvasHeight - 2 * padding)) + padding;
      
      // Create the hit object based on type
      switch (objectType) {
        case 'circle':
          hitObjects.push({
            x,
            y,
            time: currentTime,
            type: 'circle'
          });
          break;
          
        case 'slider':
          // Generate a random path for the slider
          const pathLength = Math.floor(Math.random() * 3) + 1; // 1-3 points
          const path = [];
          
          // Start point is the object position
          path.push([x, y]);
          
          // Generate additional points
          for (let i = 0; i < pathLength; i++) {
            // Limit the distance between points to keep sliders reasonable
            const maxDistance = 150;
            const dx = (Math.random() * 2 - 1) * maxDistance;
            const dy = (Math.random() * 2 - 1) * maxDistance;
            
            // Ensure the point stays within canvas bounds
            const newX = Math.max(padding, Math.min(canvasWidth - padding, x + dx));
            const newY = Math.max(padding, Math.min(canvasHeight - padding, y + dy));
            
            path.push([newX, newY]);
          }
          
          hitObjects.push({
            x,
            y,
            time: currentTime,
            type: 'slider',
            path: path
          });
          break;
          
        case 'spinner':
          // Spinners are centered on the screen
          hitObjects.push({
            x: canvasWidth / 2,
            y: canvasHeight / 2,
            time: currentTime,
            type: 'spinner',
            duration: beatInterval * (Math.floor(Math.random() * 4) + 2) // 2-5 beats
          });
          break;
      }
      
      // Add time based on object type and difficulty
      if (objectType === 'spinner') {
        // Spinners take longer, so add more time
        currentTime += hitObjects[hitObjects.length - 1].duration + minSpacing;
      } else {
        // For circles and sliders, add time based on difficulty
        // Higher difficulty = less time between objects
        const timeMultiplier = 1 - ((difficulty - 1) * 0.1); // 1.0 to 0.6
        currentTime += beatInterval * timeMultiplier + minSpacing;
      }
    }
    
    // Create the beatmap object
    return {
      id: 'random',
      title: 'Random Beatmap',
      artist: 'AI Generator',
      difficulty: ['Easy', 'Normal', 'Hard', 'Insane', 'Expert'][difficulty - 1] || 'Custom',
      bpm,
      audioUrl: 'assets/songs/random.mp3', // This should be a valid audio file
      hitObjects
    };
  }
}