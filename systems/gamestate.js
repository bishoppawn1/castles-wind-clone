// Game State Management System
// Preserves game state when switching between scenes

const GameState = {
    // Current game state
    currentState: null,
    isInitialized: false,
    isPaused: false,
    
    // Player state
    playerState: {
        gridX: 23,
        gridY: 17,
        stats: {
            hp: 100,
            maxHp: 100,
            mp: 50,
            maxMp: 50,
            level: 1,
            exp: 0,
            expToNext: 100,
            attack: 10,
            defense: 5,
            gold: 100,
            inventoryCount: 0,
            inventoryMax: 20
        },
        facing: 'right',
        inventory: []
    },
    
    // World state
    worldState: {
        currentLevel: 'demo',
        itemsCollected: [],
        enemiesDefeated: [],
        doorsOpened: [],
        exploredTiles: []
    },
    
    // Camera state
    cameraState: {
        position: { x: 752, y: 560 },
        zoom: 1.0,
        following: true
    },
    
    // Initialize the game state system
    init() {
        this.isInitialized = true;
        
        // Auto-reset for fresh browser sessions
        // If there are collected items but no saved state, this is a fresh start
        if (this.worldState.itemsCollected.length > 0 && !this.currentState) {
            console.log("🆕 Fresh browser session detected with existing collected items - auto-resetting...");
            this.resetForNewGame();
        }
        
        console.log("🗺️ Game State Manager initialized");
    },
    
    // Save current game state
    saveState(k) {
        if (!this.isInitialized) return;
        
        // Save player state
        const player = k.get("player")[0];
        if (player) {
            this.playerState.gridX = player.gridX;
            this.playerState.gridY = player.gridY;
            this.playerState.facing = player.facing;
            
            // Save player stats
            if (player.stats) {
                Object.assign(this.playerState.stats, player.stats);
            }
            
            // Save inventory
            if (player.inventory) {
                this.playerState.inventory = [...player.inventory];
            }
        }
        
        // Save camera state
        if (window.CameraSystem) {
            this.cameraState.position = CameraSystem.getPosition();
            this.cameraState.zoom = CameraSystem.getZoom();
            this.cameraState.following = typeof CameraSystem.isFollowing === 'function' ? CameraSystem.isFollowing() : true;
        }
        
        // Save current items state (which items still exist)
        const items = k.get("item");
        const currentItems = [];
        items.forEach(item => {
            currentItems.push({
                gridX: item.gridX,
                gridY: item.gridY,
                type: item.itemType || 'unknown',
                name: item.name || 'Unknown Item'
            });
        });
        
        // Save current enemies state (which enemies still exist)
        const enemies = k.get("enemy");
        const currentEnemies = [];
        enemies.forEach(enemy => {
            if (!enemy.isDead) {
                currentEnemies.push({
                    gridX: enemy.gridX,
                    gridY: enemy.gridY,
                    enemyId: enemy.enemyId,
                    name: enemy.name,
                    hp: enemy.hp || enemy.maxHp,
                    maxHp: enemy.maxHp
                });
            }
        });
        
        // Mark that we have saved state
        this.currentState = {
            saved: true,
            timestamp: Date.now(),
            items: currentItems,
            enemies: currentEnemies
        };
        
        console.log(`💾 Game state saved: ${currentItems.length} items, ${currentEnemies.length} enemies`);
    },
    
    // Restore game state
    restoreState(k) {
        if (!this.isInitialized || !this.currentState) return false;
        
        console.log("📂 Restoring game state...");
        
        // Restore player position and state
        const player = k.get("player")[0];
        if (player) {
            // Restore player position
            player.gridX = this.playerState.gridX;
            player.gridY = this.playerState.gridY;
            player.facing = this.playerState.facing;
            
            // Update pixel position
            if (window.GridUtils) {
                const pixelPos = GridUtils.gridToPixel(player.gridX, player.gridY);
                player.pos = k.vec2(pixelPos.x, pixelPos.y);
            }
            
            // Restore player stats
            if (player.stats) {
                Object.assign(player.stats, this.playerState.stats);
            }
            
            // Restore inventory
            if (player.inventory) {
                player.inventory = [...this.playerState.inventory];
            }
            
            // Update facing and animation
            if (player.updateFacing) {
                player.updateFacing(this.playerState.facing);
            }
            if (player.playAnimation) {
                player.playAnimation('idle');
            }
        }
        
        // Restore camera state
        if (window.CameraSystem) {
            CameraSystem.moveTo(this.cameraState.position.x, this.cameraState.position.y, true);
            CameraSystem.setZoom(this.cameraState.zoom, true);
            if (this.cameraState.following && player) {
                CameraSystem.followTarget(player);
            }
        }
        
        // Clear saved state after successful restoration
        this.currentState = null;
        
        console.log("✅ Game state restored");
        return true;
    },
    
    // Check if we have saved state
    hasSavedState() {
        return this.isInitialized && this.currentState !== null;
    },
    
    // Clear saved state
    clearState() {
        this.currentState = null;
        console.log("🗑️ Game state cleared");
    },

    // Reset all game state for a new game
    resetForNewGame() {
        if (!this.isInitialized) return;
        
        // Reset player state to defaults
        this.playerState = {
            gridX: 23,
            gridY: 17,
            facing: 'down',
            stats: {
                hp: 100,
                maxHp: 100,
                mp: 50,
                maxMp: 50,
                level: 1,
                exp: 0,
                expToNext: 100,
                gold: 100
            },
            inventory: []
        };
        
        // Reset camera state
        this.cameraState = {
            position: { x: 752, y: 560 },
            zoom: 1.0,
            following: true
        };
        
        // Reset world state - clear all collected items
        this.worldState = {
            itemsCollected: [],
            currentLevel: 1,
            gameProgress: {}
        };
        
        // Clear any saved state
        this.currentState = null;
        
        console.log("🆕 Game state reset for new game - all items will respawn");
    },
    
    // Update player stats
    updatePlayerStats(stats) {
        Object.assign(this.playerState.stats, stats);
    },
    
    // Get player stats for inventory display
    getPlayerStats() {
        return { ...this.playerState.stats };
    },
    
    // Get player inventory
    getPlayerInventory() {
        return [...this.playerState.inventory];
    },
    
    // Pause the game
    pauseGame() {
        if (this.isPaused) return;
        this.isPaused = true;
        console.log("⏸️ Game paused");
    },
    
    // Resume the game
    resumeGame() {
        if (!this.isPaused) return;
        this.isPaused = false;
        console.log("▶️ Game resumed");
    },
    
    // Check if game is paused
    isGamePaused() {
        return this.isPaused;
    }
};

// Make GameState globally available
window.GameState = GameState;
