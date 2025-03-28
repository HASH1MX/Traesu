/**
 * RandomBeatmapButton.js
 * A UI component that allows users to generate and play random beatmaps
 */

export class RandomBeatmapButton {
  /**
   * Create a new random beatmap button
   * @param {Object} game - The game instance
   * @param {Object} beatmapManager - The beatmap manager instance
   */
  constructor(game, beatmapManager) {
    this.game = game;
    this.beatmapManager = beatmapManager;
    this.button = null;
    this.difficultySelect = null;
    this.durationSelect = null;
    
    this.createButton();
  }
  
  /**
   * Create the button and add it to the DOM
   */
  createButton() {
    // Create container for the random beatmap controls
    const container = document.createElement('div');
    container.className = 'random-beatmap-container';
    container.style.marginTop = '20px';
    container.style.padding = '10px';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    container.style.borderRadius = '5px';
    
    // Create heading
    const heading = document.createElement('h3');
    heading.textContent = 'Random Beatmap Generator';
    heading.style.color = '#FF66AA';
    heading.style.marginBottom = '10px';
    container.appendChild(heading);
    
    // Create difficulty selector
    const difficultyLabel = document.createElement('label');
    difficultyLabel.textContent = 'Difficulty: ';
    difficultyLabel.style.color = 'white';
    difficultyLabel.style.marginRight = '5px';
    container.appendChild(difficultyLabel);
    
    this.difficultySelect = document.createElement('select');
    this.difficultySelect.style.marginRight = '15px';
    this.difficultySelect.style.padding = '5px';
    this.difficultySelect.style.backgroundColor = '#333';
    this.difficultySelect.style.color = 'white';
    this.difficultySelect.style.border = '1px solid #666';
    this.difficultySelect.style.borderRadius = '3px';
    
    // Add difficulty options
    const difficulties = [
      { value: 1, label: 'Easy' },
      { value: 2, label: 'Normal' },
      { value: 3, label: 'Hard' },
      { value: 4, label: 'Insane' },
      { value: 5, label: 'Expert' }
    ];
    
    difficulties.forEach(diff => {
      const option = document.createElement('option');
      option.value = diff.value;
      option.textContent = diff.label;
      this.difficultySelect.appendChild(option);
    });
    
    // Set default to Normal
    this.difficultySelect.value = '3';
    container.appendChild(this.difficultySelect);
    
    // Create duration selector
    const durationLabel = document.createElement('label');
    durationLabel.textContent = 'Duration: ';
    durationLabel.style.color = 'white';
    durationLabel.style.marginRight = '5px';
    container.appendChild(durationLabel);
    
    this.durationSelect = document.createElement('select');
    this.durationSelect.style.marginRight = '15px';
    this.durationSelect.style.padding = '5px';
    this.durationSelect.style.backgroundColor = '#333';
    this.durationSelect.style.color = 'white';
    this.durationSelect.style.border = '1px solid #666';
    this.durationSelect.style.borderRadius = '3px';
    
    // Add duration options
    const durations = [
      { value: 30000, label: '30 seconds' },
      { value: 60000, label: '1 minute' },
      { value: 120000, label: '2 minutes' },
      { value: 180000, label: '3 minutes' }
    ];
    
    durations.forEach(dur => {
      const option = document.createElement('option');
      option.value = dur.value;
      option.textContent = dur.label;
      this.durationSelect.appendChild(option);
    });
    
    // Set default to 1 minute
    this.durationSelect.value = '60000';
    container.appendChild(this.durationSelect);
    
    // Create the button
    this.button = document.createElement('button');
    this.button.textContent = 'Generate Random Beatmap';
    this.button.className = 'menu-button';
    this.button.style.display = 'block';
    this.button.style.marginTop = '10px';
    this.button.style.padding = '10px 20px';
    this.button.style.backgroundColor = '#FF66AA';
    this.button.style.color = 'white';
    this.button.style.border = 'none';
    this.button.style.borderRadius = '5px';
    this.button.style.cursor = 'pointer';
    this.button.style.fontWeight = 'bold';
    this.button.style.transition = 'background-color 0.3s';
    
    // Add hover effect
    this.button.addEventListener('mouseover', () => {
      this.button.style.backgroundColor = '#FF99CC';
    });
    
    this.button.addEventListener('mouseout', () => {
      this.button.style.backgroundColor = '#FF66AA';
    });
    
    // Add click event
    this.button.addEventListener('click', () => this.generateRandomBeatmap());
    
    container.appendChild(this.button);
    
    // Add the container to the DOM
    const menuContainer = document.querySelector('.menu-container');
    if (menuContainer) {
      menuContainer.appendChild(container);
    } else {
      // If menu container doesn't exist, add to body
      document.body.appendChild(container);
    }
  }
  
  /**
   * Generate a random beatmap and load it into the game
   */
  generateRandomBeatmap() {
    // Get selected difficulty and duration
    const difficulty = parseInt(this.difficultySelect.value, 10);
    const duration = parseInt(this.durationSelect.value, 10);
    
    // Generate random BPM between 100-180
    const bpm = Math.floor(Math.random() * 80) + 100;
    
    // Create the random beatmap
    const randomBeatmap = this.beatmapManager.createRandomBeatmap({
      difficulty,
      duration,
      bpm
    });
    
    // Load the beatmap into the game
    this.game.loadBeatmap(randomBeatmap);
    
    // Start the game
    this.game.start();
    
    // Hide the menu if it exists
    const menuContainer = document.querySelector('.menu-container');
    if (menuContainer) {
      menuContainer.style.display = 'none';
    }
  }
}