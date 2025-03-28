export class UIManager {
  constructor() {
    this.screens = {
      loading: document.getElementById('loading-screen'),
      menu: document.getElementById('menu-screen'),
      beatmapSelect: document.getElementById('beatmap-select-screen'),
      gameplay: document.getElementById('gameplay-screen'),
      result: document.getElementById('result-screen')
    };
    
    this.currentScreen = 'loading';
  }
  
  initialize() {
    // Make sure all screens are hidden except loading screen
    Object.keys(this.screens).forEach(screenId => {
      if (screenId === 'loading') {
        this.screens[screenId].classList.add('active');
      } else {
        this.screens[screenId].classList.remove('active');
      }
    });
  }
  
  showScreen(screenId) {
    // Convert screenId to camelCase if needed
    const formattedScreenId = screenId.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    
    // Hide all screens
    Object.keys(this.screens).forEach(id => {
      this.screens[id].classList.remove('active');
    });
    
    // Show the requested screen
    if (this.screens[formattedScreenId]) {
      this.screens[formattedScreenId].classList.add('active');
      this.currentScreen = formattedScreenId;
    } else {
      console.error(`Screen ${screenId} not found`);
    }
  }
  
  getCurrentScreen() {
    return this.currentScreen;
  }
  
  populateBeatmapList(beatmaps) {
    const beatmapList = document.getElementById('beatmap-list');
    beatmapList.innerHTML = '';
    
    if (beatmaps.length === 0) {
      beatmapList.innerHTML = '<p>No beatmaps available. Please add some beatmaps to the game.</p>';
      return;
    }
    
    beatmaps.forEach(beatmap => {
      const beatmapItem = document.createElement('div');
      beatmapItem.className = 'beatmap-item';
      beatmapItem.dataset.id = beatmap.id;
      
      const title = document.createElement('h3');
      title.textContent = beatmap.title;
      
      const artist = document.createElement('p');
      artist.textContent = `Artist: ${beatmap.artist}`;
      
      const difficulty = document.createElement('p');
      difficulty.textContent = `Difficulty: ${beatmap.difficulty || 'Normal'}`;
      
      beatmapItem.appendChild(title);
      beatmapItem.appendChild(artist);
      beatmapItem.appendChild(difficulty);
      
      beatmapList.appendChild(beatmapItem);
    });
  }
  
  showError(message) {
    // Create an error message element
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.textContent = message;
    
    // Add to the current screen
    const currentScreenElement = this.screens[this.currentScreen];
    currentScreenElement.appendChild(errorContainer);
    
    // Remove after a few seconds
    setTimeout(() => {
      currentScreenElement.removeChild(errorContainer);
    }, 5000);
  }
}