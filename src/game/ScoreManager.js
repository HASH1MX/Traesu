export class ScoreManager {
  constructor() {
    this.reset();
  }
  
  reset() {
    // Score tracking
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    
    // Hit statistics
    this.perfectHits = 0;
    this.goodHits = 0;
    this.okayHits = 0;
    this.misses = 0;
    this.totalHits = 0;
  }
  
  addHit(points, hitType) {
    // Add points to score (with combo multiplier)
    const comboMultiplier = Math.max(1, this.combo / 10);
    this.score += Math.floor(points * comboMultiplier);
    
    // Increment combo
    this.combo++;
    
    // Update max combo if current combo is higher
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }
    
    // Update hit statistics
    switch (hitType) {
      case 'perfect':
        this.perfectHits++;
        break;
      case 'good':
        this.goodHits++;
        break;
      case 'okay':
        this.okayHits++;
        break;
    }
    
    this.totalHits++;
  }
  
  addMiss() {
    // Reset combo
    this.combo = 0;
    
    // Update miss count
    this.misses++;
    this.totalHits++;
  }
  
  getScore() {
    return this.score;
  }
  
  getCombo() {
    return this.combo;
  }
  
  getMaxCombo() {
    return this.maxCombo;
  }
  
  getAccuracy() {
    if (this.totalHits === 0) {
      return 100.0;
    }
    
    // Calculate weighted accuracy
    const totalPoints = this.perfectHits * 300 + this.goodHits * 100 + this.okayHits * 50;
    const maxPossiblePoints = this.totalHits * 300;
    
    return (totalPoints / maxPossiblePoints) * 100;
  }
  
  getPerfectHits() {
    return this.perfectHits;
  }
  
  getGoodHits() {
    return this.goodHits;
  }
  
  getOkayHits() {
    return this.okayHits;
  }
  
  getMisses() {
    return this.misses;
  }
}