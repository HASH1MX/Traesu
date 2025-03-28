import { Game } from './game/Game.js';
import { UIManager } from './ui/UIManager.js';
import { AssetLoader } from './utils/AssetLoader.js';
import { BeatmapManager } from './game/BeatmapManager.js';
import { RandomBeatmapButton } from './ui/RandomBeatmapButton.js';

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create instances of core components
  const assetLoader = new AssetLoader();
  const beatmapManager = new BeatmapManager();
  const uiManager = new UIManager();
  const game = new Game(beatmapManager, uiManager);
  
  // Initialize the UI
  uiManager.initialize();
  
  // Load assets and beatmaps
  initializeGame(assetLoader, beatmapManager, uiManager, game);
});

async function initializeGame(assetLoader, beatmapManager, uiManager, game) {
  try {
    // Load assets (sounds, images, etc.)
    await assetLoader.loadAssets(updateLoadingProgress);
    
    // Load available beatmaps
    await beatmapManager.loadBeatmaps();
    
    // Update the UI with loaded beatmaps
    uiManager.populateBeatmapList(beatmapManager.getBeatmaps());
    
    // Show the main menu
    uiManager.showScreen('menu');
    
    // Set up event listeners for UI interactions
    setupEventListeners(uiManager, beatmapManager, game);
    
  } catch (error) {
    console.error('Failed to initialize game:', error);
    uiManager.showError('Failed to load game resources. Please refresh the page.');
  }
}

function updateLoadingProgress(progress) {
  // Update the loading progress bar
  const progressBar = document.querySelector('.progress');
  if (progressBar) {
    progressBar.style.width = `${progress * 100}%`;
  }
}

function setupEventListeners(uiManager, beatmapManager, game) {
  // Play button
  document.getElementById('play-button').addEventListener('click', () => {
    uiManager.showScreen('beatmap-select');
  });
  
  // Options button
  document.getElementById('options-button').addEventListener('click', () => {
    // TODO: Implement options screen
    console.log('Options button clicked');
  });
  
  // Back to menu button
  document.getElementById('back-to-menu').addEventListener('click', () => {
    uiManager.showScreen('menu');
  });
  
  // Beatmap selection
  const beatmapList = document.getElementById('beatmap-list');
  beatmapList.addEventListener('click', (event) => {
    const beatmapItem = event.target.closest('.beatmap-item');
    if (beatmapItem) {
      const beatmapId = beatmapItem.dataset.id;
      const selectedBeatmap = beatmapManager.getBeatmapById(beatmapId);
      
      if (selectedBeatmap) {
        game.loadBeatmap(selectedBeatmap);
        uiManager.showScreen('gameplay');
        game.start();
      }
    }
  });
  
  // Create the random beatmap button
  new RandomBeatmapButton(game, beatmapManager);
  
  // Retry button
  document.getElementById('retry-button').addEventListener('click', () => {
    game.restart();
    uiManager.showScreen('gameplay');
  });
  
  // Back to select button
  document.getElementById('back-to-select').addEventListener('click', () => {
    game.reset();
    uiManager.showScreen('beatmap-select');
  });
  
  // Handle keyboard inputs for gameplay
  document.addEventListener('keydown', (event) => {
    if (uiManager.getCurrentScreen() === 'gameplay') {
      if (event.key === 'z' || event.key === 'x') {
        game.handleKeyPress(event.key);
      } else if (event.key === 'Escape') {
        game.pause();
        // TODO: Implement pause menu
      }
    }
  });
  
  // Handle mouse inputs for gameplay
  document.getElementById('game-canvas').addEventListener('mousedown', (event) => {
    if (uiManager.getCurrentScreen() === 'gameplay') {
      game.handleMouseClick(event.clientX, event.clientY);
    }
  });
  
  document.getElementById('game-canvas').addEventListener('mousemove', (event) => {
    if (uiManager.getCurrentScreen() === 'gameplay') {
      game.updateCursorPosition(event.clientX, event.clientY);
    }
  });
}