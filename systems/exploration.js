/**
 * Exploration System for Castles of the Wind Clone
 * Tracks player exploration progress using Kaplay's custom components
 * Manages fog of war, visited areas, and exploration objectives
 */

const ExplorationSystem = {
    // System state
    initialized: false,
    k: null,
    
    // Exploration data
    exploredTiles: new Set(),
    totalTiles: 0,
    explorationPercentage: 0,
    
    // Fog of war settings
    fogEnabled: true,
    visionRadius: 3,
    exploredOpacity: 0.7,
    unexploredOpacity: 0.05,
    
    // Events
    onExplorationUpdate: null,
    onAreaDiscovered: null,
    
    /**
     * Initialize the exploration system
     */
    init(kaplayInstance) {
        if (this.initialized) {
            console.warn('⚠️ ExplorationSystem already initialized');
            return;
        }
        
        this.k = kaplayInstance;
        this.initialized = true;
        
        console.log('🗺️ Exploration System initialized');
        
        // Set up exploration tracking
        this.setupExplorationTracking();
        
        return this;
    },
    
    /**
     * Set up exploration tracking components and events
     */
    setupExplorationTracking() {
        if (!this.k) return;
        
        // Track player movement for exploration
        this.k.onUpdate(() => {
            const player = this.k.get('player')[0];
            if (player && this.fogEnabled) {
                this.updatePlayerVision(player);
            }
        });
        
        console.log('🔍 Exploration tracking setup complete');
    },
    
    /**
     * Start exploration tracking for a level
     */
    startLevelExploration(levelData) {
        if (!levelData) {
            console.warn('⚠️ No level data provided for exploration tracking');
            return;
        }
        
        console.log(`🗺️ Starting exploration tracking for ${levelData.name || levelData.id}`);
        
        // Reset exploration data
        this.exploredTiles.clear();
        this.totalTiles = this.calculateTotalExplorableTiles(levelData);
        this.explorationPercentage = 0;
        
        // Set fog of war settings from level data
        if (levelData.fogOfWar) {
            this.fogEnabled = levelData.fogOfWar.enabled !== false;
            this.visionRadius = levelData.fogOfWar.visionRadius || 3;
            this.exploredOpacity = levelData.fogOfWar.exploredOpacity || 0.7;
            this.unexploredOpacity = levelData.fogOfWar.unexploredOpacity || 0.05;
        }
        
        // Create fog of war overlay if enabled
        if (this.fogEnabled) {
            this.createFogOfWar(levelData);
        }
        
        console.log(`📊 Total explorable tiles: ${this.totalTiles}`);
    },
    
    /**
     * Calculate total explorable tiles in a level
     */
    calculateTotalExplorableTiles(levelData) {
        if (!levelData.layout) return 0;
        
        let count = 0;
        for (let y = 0; y < levelData.layout.length; y++) {
            for (let x = 0; x < levelData.layout[y].length; x++) {
                const symbol = levelData.layout[y][x];
                // Count walkable tiles as explorable
                if (symbol !== '#' && symbol !== ' ') {
                    count++;
                }
            }
        }
        return count;
    },
    
    /**
     * Create fog of war overlay
     */
    createFogOfWar(levelData) {
        if (!this.k || !levelData.layout) return;
        
        console.log('🌫️ Creating fog of war overlay');
        
        const tileSize = levelData.tileSize || 32;
        
        // Create fog tiles for each position
        for (let y = 0; y < levelData.layout.length; y++) {
            for (let x = 0; x < levelData.layout[y].length; x++) {
                const symbol = levelData.layout[y][x];
                
                // Skip walls and empty spaces
                if (symbol === '#' || symbol === ' ') continue;
                
                const worldX = x * tileSize;
                const worldY = y * tileSize;
                
                // Create fog tile
                const fogTile = this.k.add([
                    this.k.rect(tileSize, tileSize),
                    this.k.color(0, 0, 0),
                    this.k.opacity(0),
                    this.k.pos(worldX, worldY),
                    this.k.z(100), // High z-index to overlay everything
                    'fog',
                    {
                        gridX: x,
                        gridY: y,
                        explored: false
                    }
                ]);
            }
        }
    },
    
    /**
     * Update player vision and exploration
     */
    updatePlayerVision(player) {
        if (!player || !this.fogEnabled) return;
        
        const gridX = Math.floor(player.pos.x / 32);
        const gridY = Math.floor(player.pos.y / 32);
        
        // Update fog of war around player
        this.revealArea(gridX, gridY, this.visionRadius);
    },
    
    /**
     * Reveal area around a position
     */
    revealArea(centerX, centerY, radius) {
        if (!this.k) return;
        
        let newTilesExplored = 0;
        
        // Reveal tiles in radius
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= radius) {
                    const x = centerX + dx;
                    const y = centerY + dy;
                    
                    if (this.revealTile(x, y)) {
                        newTilesExplored++;
                    }
                }
            }
        }
        
        // Update exploration percentage if new tiles were explored
        if (newTilesExplored > 0) {
            this.updateExplorationProgress();
        }
    },
    
    /**
     * Reveal a specific tile
     */
    revealTile(x, y) {
        const tileKey = `${x},${y}`;
        
        // Check if already explored
        if (this.exploredTiles.has(tileKey)) {
            return false;
        }
        
        // Find fog tile at this position
        const fogTiles = this.k.get('fog').filter(fog => 
            fog.gridX === x && fog.gridY === y
        );
        
        if (fogTiles.length > 0) {
            const fogTile = fogTiles[0];
            
            // Mark as explored
            fogTile.explored = true;
            fogTile.opacity = 0;
            
            // Add to explored set
            this.exploredTiles.add(tileKey);
            
            // Trigger area discovered event
            if (this.onAreaDiscovered) {
                this.onAreaDiscovered(x, y);
            }
            
            return true;
        }
        
        return false;
    },
    
    /**
     * Update exploration progress
     */
    updateExplorationProgress() {
        if (this.totalTiles > 0) {
            this.explorationPercentage = Math.round((this.exploredTiles.size / this.totalTiles) * 100);
            
            // Trigger exploration update event
            if (this.onExplorationUpdate) {
                this.onExplorationUpdate(this.explorationPercentage, this.exploredTiles.size, this.totalTiles);
            }
        }
    },

    /**
     * Get exploration statistics
     */
    getExplorationStats() {
        return {
            percentage: this.explorationPercentage,
            exploredTiles: this.exploredTiles.size,
            totalTiles: this.totalTiles,
            remainingTiles: this.totalTiles - this.exploredTiles.size
        };
    },
    
    /**
     * Check if area is fully explored
     */
    isAreaFullyExplored() {
        return this.explorationPercentage >= 100;
    },
    
    /**
     * Check if minimum exploration threshold is met
     */
    isExplorationThresholdMet(threshold = 80) {
        return this.explorationPercentage >= threshold;
    },
    
    /**
     * Reveal entire map (cheat/debug function)
     */
    revealAll() {
        if (!this.k) return;
        
        console.log('🗺️ Revealing entire map');
        
        const fogTiles = this.k.get('fog');
        fogTiles.forEach(fog => {
            if (!fog.explored) {
                fog.explored = true;
                fog.opacity = 0;
                this.exploredTiles.add(`${fog.gridX},${fog.gridY}`);
            }
        });
        
        this.updateExplorationProgress();
    },
    
    /**
     * Reset fog of war (hide all explored areas)
     */
    resetFogOfWar() {
        if (!this.k) return;
        
        console.log('🌫️ Resetting fog of war');
        
        const fogTiles = this.k.get('fog');
        fogTiles.forEach(fog => {
            fog.explored = false;
            fog.opacity = 0;
        });
        
        this.exploredTiles.clear();
        this.explorationPercentage = 0;
    },
    
    /**
     * Save exploration state
     */
    saveExplorationState() {
        return {
            exploredTiles: Array.from(this.exploredTiles),
            explorationPercentage: this.explorationPercentage,
            totalTiles: this.totalTiles
        };
    },
    
    /**
     * Load exploration state
     */
    loadExplorationState(state) {
        if (!state) return;
        
        this.exploredTiles = new Set(state.exploredTiles || []);
        this.explorationPercentage = state.explorationPercentage || 0;
        this.totalTiles = state.totalTiles || 0;
        
        // Apply loaded state to fog tiles
        if (this.k) {
            const fogTiles = this.k.get('fog');
            fogTiles.forEach(fog => {
                const tileKey = `${fog.gridX},${fog.gridY}`;
                if (this.exploredTiles.has(tileKey)) {
                    fog.explored = true;
                    fog.opacity = 0;
                } else {
                    fog.explored = false;
                    fog.opacity = 0;
                }
            });
        }
        
        console.log(`🗺️ Loaded exploration state: ${this.explorationPercentage}%`);
    },
    
    /**
     * Clean up exploration system
     */
    cleanup() {
        if (!this.k) return;
        
        // Remove all fog tiles
        this.k.destroyAll('fog');
        
        // Reset state
        this.exploredTiles.clear();
        this.explorationPercentage = 0;
        this.totalTiles = 0;
        
        console.log('🗺️ Exploration system cleaned up');
    }
};

// Make globally available
if (typeof window !== 'undefined') {
    window.ExplorationSystem = ExplorationSystem;
}

console.log('🗺️ Exploration System loaded successfully');
