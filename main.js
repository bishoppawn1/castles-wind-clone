// Castles of the Wind Clone - Main Game Entry Point
// Initialize Kaplay and set up the game

// Import level system (will be loaded via script tags)
// import { LevelSystem } from './systems/level.js';
// import { LEVELS } from './data/levels.js';
// import { TileSystem } from './data/tiles.js';

// Fixed scale to prevent distortion - using 1.0 for pixel-perfect rendering
function calculateOptimalScale() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Use fixed scale of 1.0 to maintain pixel-perfect rendering
    const scale = 1.0;
    
    console.log(`🖥️  Screen: ${screenWidth}x${screenHeight}, Fixed Scale: ${scale}x`);
    return scale;
}

// Ensure all required systems are available
if (typeof GridUtils === 'undefined') {
    console.error('❌ GridUtils not loaded!');
}
if (typeof CameraSystem === 'undefined') {
    console.error('❌ CameraSystem not loaded!');
}

// Wait for DOM to be ready before initializing Kaplay
console.log('📋 Setting up DOMContentLoaded event listener...');
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing Kaplay...');
    
    // Check if canvas exists
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('❌ Canvas element not found!');
        return;
    }
    
    console.log('✅ Canvas found, creating Kaplay instance...');

// Initialize Kaplay with enhanced configuration
const k = kaplay({
    // Use the canvas element we created in HTML
    canvas: document.getElementById('game-canvas'),
    
    // Base game resolution - designed for tile-based gameplay
    width: 1024,
    height: 576,
    
    // Calculate optimal scale for current screen
    scale: calculateOptimalScale(),
    
    // Enable crisp pixel art rendering
    crisp: true,
    
    // Stretch to fill available space
    stretch: true,
    
    // Don't use letterbox - let it fill the container
    letterbox: false,
    
    // Background color (dark grey instead of black)
    background: [80, 80, 90],
    
    // Enable debug mode for development
    debug: true,
    
    // Don't pollute global namespace
    global: false,
    
    // Touch controls for mobile (future-proofing)
    touchToMouse: true,
    
    // Load screen configuration
    loadingScreen: false, // Disable for faster startup
});

// Make k globally available for other modules
window.k = k;

// Game state and configuration
const GAME_CONFIG = {
    TILE_SIZE: 32,
    GRID_WIDTH: 32,
    GRID_HEIGHT: 18,
    DEBUG_MODE: true,
    BASE_WIDTH: 1024,
    BASE_HEIGHT: 576,
    FIXED_SCALE: 1.0, // Fixed scale for pixel-perfect rendering
    CURRENT_SCALE: 1.0
};

// Make config globally available
window.GAME_CONFIG = GAME_CONFIG;

// Skip asset loading for now to get basic functionality working
console.log("⚙️ Skipping asset loading - using basic shapes");

// Handle window resize - scale remains fixed but we log the event
function handleResize() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    console.log(`🔄 Window resized to: ${screenWidth}x${screenHeight} (Scale remains fixed at ${GAME_CONFIG.FIXED_SCALE}x)`);
    
    // Update debug display if it exists
    const scaleText = k.get("scale-debug")[0];
    if (scaleText) {
        scaleText.text = `Scale: ${GAME_CONFIG.FIXED_SCALE}x (${k.width()}x${k.height()})`;
    }
}

// Add resize event listener
window.addEventListener('resize', handleResize);

// Also handle orientation change on mobile
window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 100); // Small delay for orientation change
});

// Global debug input handling
if (GAME_CONFIG.DEBUG_MODE) {
    // Show FPS counter
    k.debug.showLog = true;
    
    // Global debug key handler
    k.onKeyPress("f1", () => {
        console.log("🔍 Kaplay Debug Info:");
        console.log("- Version:", k.VERSION || "Unknown");
        console.log("- Canvas size:", k.width(), "x", k.height());
        console.log("- Game objects:", k.get("*").length);
        console.log("- Current scene:", k.getSceneName ? k.getSceneName() : "Unknown");
        console.log("- Config:", GAME_CONFIG);
    });
}

// Function to spawn test enemies for spell testing
function spawnTestEnemies(k) {
    console.log('👹 Spawning test enemies for spell testing...');
    
    const player = k.get('player')[0];
    if (!player) {
        console.error('❌ No player found for enemy spawning');
        return;
    }
    
    const playerGridPos = {
        x: Math.floor(player.pos.x / 32),
        y: Math.floor(player.pos.y / 32)
    };
    
    // Simple enemy data for testing
    const testEnemyType = {
        id: 'test_goblin',
        name: 'Test Goblin',
        sprite: {
            size: 20,
            color: [100, 180, 100],
            shape: 'rect'
        },
        stats: {
            health: 25,
            maxHealth: 25,
            attack: 8,
            defense: 2,
            experience: 15, // Matches standard goblin experience
            gold: 5
        }
    };
    
    // Spawn enemies in a circle around the player
    const spawnPositions = [
        { x: playerGridPos.x + 3, y: playerGridPos.y },     // Right
        { x: playerGridPos.x - 3, y: playerGridPos.y },     // Left  
        { x: playerGridPos.x, y: playerGridPos.y + 3 },     // Down
        { x: playerGridPos.x, y: playerGridPos.y - 3 },     // Up
        { x: playerGridPos.x + 2, y: playerGridPos.y + 2 }, // Bottom-right
        { x: playerGridPos.x - 2, y: playerGridPos.y - 2 }  // Top-left
    ];
    
    spawnPositions.forEach((pos, index) => {
        const enemy = k.add([
            k.rect(testEnemyType.sprite.size, testEnemyType.sprite.size),
            k.pos(pos.x * 32 + 16, pos.y * 32 + 16),
            k.anchor('center'),
            k.color(...testEnemyType.sprite.color),
            k.z(100),
            {
                name: `${testEnemyType.name} ${index + 1}`,
                health: testEnemyType.stats.health,
                maxHealth: testEnemyType.stats.maxHealth,
                gridX: pos.x,
                gridY: pos.y,
                enemyId: `test_goblin_${index}`,
                enemyType: testEnemyType,
                isDead: false,
                attack: testEnemyType.stats.attack,
                defense: testEnemyType.stats.defense,
                
                // Movement AI properties
                aiState: 'wander',
                moveTimer: 0,
                moveInterval: 1 + Math.random() * 2, // Random movement interval 1-3 seconds
                targetDirection: null,
                moveSpeed: 50, // pixels per second
                isMoving: false,
                facing: 'down',
                
                takeDamage(amount) {
                    const actualDamage = Math.max(1, amount - (this.defense || 0));
                    this.health = Math.max(0, this.health - actualDamage);
                    console.log(`💥 ${this.name} took ${actualDamage} damage! Health: ${this.health}/${this.maxHealth}`);
                    
                    // Flash red when taking damage
                    this.color = k.rgb(255, 100, 100);
                    k.wait(0.2, () => {
                        if (this.health > 0) {
                            this.color = k.rgb(...testEnemyType.sprite.color);
                        }
                    });
                    
                    if (this.health <= 0) {
                        console.log(`☠️ ${this.name} defeated!`);
                        this.isDead = true;

                        // Award XP and gold to the player (mirrors standard enemy death behavior)
                        const playerRef = window.currentPlayer || window.player || (window.GameState && window.GameState.player);
                        const xp = testEnemyType.stats.experience || 15;
                        const gold = testEnemyType.stats.gold || 0;
                        if (playerRef && typeof playerRef.gainExperience === 'function') {
                            try {
                                playerRef.gainExperience(xp);
                                playerRef.gold = (playerRef.gold || 0) + gold;
                                console.log(`⭐ Player gained ${xp} XP and ${gold} gold from ${this.name}!`);
                            } catch (e) {
                                console.warn('Failed to award XP/gold from test goblin:', e);
                            }
                        } else {
                            console.warn('No valid player reference to award XP for test goblin');
                        }
                        // Update inventory/UI if available
                        if (window.inventory && typeof window.inventory.updatePlayerStats === 'function') {
                            window.inventory.updatePlayerStats();
                        }

                        this.destroy();
                    }
                    
                    return actualDamage;
                },
                
                // Movement and AI methods
                update() {
                    if (this.isDead) return;
                    
                    this.moveTimer += k.dt();
                    
                    // Handle movement AI
                    if (this.aiState === 'wander') {
                        if (this.moveTimer >= this.moveInterval) {
                            this.chooseRandomDirection();
                            this.moveTimer = 0;
                            this.moveInterval = 1 + Math.random() * 2; // New random interval
                        }
                        
                        if (this.targetDirection && !this.isMoving) {
                            this.startMoving();
                        }
                    }
                    
                    // Update movement
                    if (this.isMoving && this.targetDirection) {
                        this.updateMovement();
                    }
                },
                
                chooseRandomDirection() {
                    const directions = ['up', 'down', 'left', 'right'];
                    const randomDir = directions[Math.floor(Math.random() * directions.length)];
                    
                    // 30% chance to stop moving
                    if (Math.random() < 0.3) {
                        this.targetDirection = null;
                        this.isMoving = false;
                        return;
                    }
                    
                    this.targetDirection = randomDir;
                    this.facing = randomDir;
                    console.log(`👹 ${this.name} choosing direction: ${randomDir}`);
                },
                
                startMoving() {
                    if (!this.targetDirection) return;
                    
                    const directions = {
                        up: { x: 0, y: -1 },
                        down: { x: 0, y: 1 },
                        left: { x: -1, y: 0 },
                        right: { x: 1, y: 0 }
                    };
                    
                    const dir = directions[this.targetDirection];
                    const newGridX = this.gridX + dir.x;
                    const newGridY = this.gridY + dir.y;
                    
                    // Check if new position is valid (not wall, within bounds)
                    if (this.canMoveTo(newGridX, newGridY)) {
                        this.isMoving = true;
                        this.targetGridX = newGridX;
                        this.targetGridY = newGridY;
                        this.moveStartTime = Date.now();
                        this.moveStartPos = { x: this.pos.x, y: this.pos.y };
                    } else {
                        // Can't move there, stop
                        this.targetDirection = null;
                        this.isMoving = false;
                    }
                },
                
                canMoveTo(gridX, gridY) {
                    // Check bounds
                    if (gridX < 1 || gridX > 45 || gridY < 1 || gridY > 32) return false;
                    
                    // Check for walls (simple check)
                    const tiles = k.get('tile');
                    for (let tile of tiles) {
                        if (tile.gridX === gridX && tile.gridY === gridY && tile.solid) {
                            return false;
                        }
                    }
                    
                    // Check for closed doors
                    const doors = k.get('door');
                    for (let door of doors) {
                        if (door.gridX === gridX && door.gridY === gridY && door.solid) {
                            console.log(`🚪 Enemy movement blocked by closed door at (${gridX}, ${gridY})`);
                            return false;
                        }
                    }
                    
                    // Check for other enemies at that position
                    const enemies = k.get('enemy');
                    for (let enemy of enemies) {
                        if (enemy !== this && enemy.gridX === gridX && enemy.gridY === gridY) {
                            return false;
                        }
                    }
                    
                    return true;
                },
                
                updateMovement() {
                    const moveTime = Date.now() - this.moveStartTime;
                    const moveDuration = 500; // 500ms to move one tile
                    const progress = Math.min(moveTime / moveDuration, 1);
                    
                    // Interpolate position
                    const targetPixelX = this.targetGridX * 32 + 16;
                    const targetPixelY = this.targetGridY * 32 + 16;
                    
                    this.pos.x = this.moveStartPos.x + (targetPixelX - this.moveStartPos.x) * progress;
                    this.pos.y = this.moveStartPos.y + (targetPixelY - this.moveStartPos.y) * progress;
                    
                    // Movement complete
                    if (progress >= 1) {
                        this.gridX = this.targetGridX;
                        this.gridY = this.targetGridY;
                        this.pos.x = targetPixelX;
                        this.pos.y = targetPixelY;
                        this.isMoving = false;
                        this.targetDirection = null;
                        
                        console.log(`👹 ${this.name} moved to (${this.gridX}, ${this.gridY})`);
                    }
                }
            },
            'enemy'
        ]);
        
        console.log(`👹 Spawned ${enemy.name} at (${pos.x}, ${pos.y})`);
    });
    
    if (window.MessageSystem) {
        window.MessageSystem.addMessage('Test enemies spawned! Press T again for more.', 'info');
    }
}

// Menu scene is loaded from scenes/menu.js with proper New Game state reset functionality
if (typeof createMenuScene === 'function') {
    createMenuScene(k);
}

// Game over scene is loaded from scenes/gameover.js
if (typeof createGameOverScene === 'function') {
    createGameOverScene(k);
}

// Demo level creation function (temporary until level system is fully integrated)
function createDemoLevel(k) {
    // Create a simple demo level with walls and floors
    const levelWidth = 50;
    const levelHeight = 38;
    const tileSize = 32;
    
    // Simple level layout
    for (let y = 0; y < levelHeight; y++) {
        for (let x = 0; x < levelWidth; x++) {
            let tileType = 'floor';
            let color = [60, 60, 80]; // Floor color
            
            // Create walls around the border
            if (x === 0 || x === levelWidth - 1 || y === 0 || y === levelHeight - 1) {
                tileType = 'wall';
                color = [40, 40, 40]; // Wall color
            }
            
            // Add some interior walls for demo
            if ((x === 10 && y > 5 && y < 15) || (y === 10 && x > 15 && x < 25)) {
                tileType = 'wall';
                color = [40, 40, 40];
            }
            
            // Create tile
            const pixelX = x * tileSize + tileSize / 2;
            const pixelY = y * tileSize + tileSize / 2;
            
            k.add([
                k.rect(tileSize, tileSize),
                k.color(...color),
                k.pos(pixelX, pixelY),
                k.anchor("center"),
                k.z(0),
                "tile",
                tileType,
                {
                    gridX: x,
                    gridY: y,
                    tileType: tileType,
                    solid: tileType === 'wall',
                    walkable: tileType === 'floor'
                }
            ]);
        }
    }
    
    // Add some demo items
    const demoItems = [
        { type: 'treasure', x: 8, y: 8, color: [255, 215, 0] },
        { type: 'potion', x: 15, y: 12, color: [255, 0, 255] },
        { type: 'gold', x: 30, y: 20, color: [255, 255, 0] },
        { type: 'sword', x: 35, y: 15, color: [255, 165, 0] }
    ];
    
    demoItems.forEach(item => {
        const pixelX = item.x * tileSize + tileSize / 2;
        const pixelY = item.y * tileSize + tileSize / 2;
        
        k.add([
            k.rect(tileSize * 0.6, tileSize * 0.6),
            k.color(...item.color),
            k.pos(pixelX, pixelY),
            k.anchor("center"),
            k.z(5),
            k.outline(2, k.rgb(0, 0, 0)),
            "item",
            item.type,
            {
                gridX: item.x,
                gridY: item.y,
                itemType: item.type
            }
        ]);
    });
    
    console.log(`🏗️ Demo level created: ${levelWidth}x${levelHeight} tiles`);
}

// Create a game scene with camera system and larger world
k.scene("game", () => {
    console.log('📍 GAME SCENE STARTED - This should appear first!');
    console.log('🔍 Game scene initialization beginning...');
    
    // Wrap the entire game scene in a try-catch to catch any errors
    try {
    
    // Initialize enemy systems FIRST
    console.log('📍 Enemy system initialization at game scene start...');
    console.log('🔍 ENEMY_TYPES available:', typeof window.ENEMY_TYPES !== 'undefined');
    console.log('🔍 EnemyEntity available:', typeof window.EnemyEntity !== 'undefined');
    console.log('🔍 AISystem available:', typeof window.AISystem !== 'undefined');
    console.log('🔍 SpawningSystem available:', typeof window.SpawningSystem !== 'undefined');
    
    if (window.AISystem) {
        try {
            AISystem.init(k);
            console.log('✅ AISystem initialized successfully');
        } catch (error) {
            console.error('❌ AISystem initialization failed:', error);
        }
    } else {
        console.error('❌ AISystem not available');
    }
    
    if (window.SpawningSystem) {
        try {
            SpawningSystem.init(k);
            console.log('✅ SpawningSystem initialized successfully');
        } catch (error) {
            console.error('❌ SpawningSystem initialization failed:', error);
        }
    } else {
        console.error('❌ SpawningSystem not available');
    }
    
    if (window.CombatSystem) {
        try {
            CombatSystem.init(k);
            console.log('✅ CombatSystem initialized successfully');
        } catch (error) {
            console.error('❌ CombatSystem initialization failed:', error);
        }
    } else {
        console.error('❌ CombatSystem not available');
    }
    
    // Initialize inventory system
    if (window.InventorySystem) {
        try {
            window.inventory = new InventorySystem(k, 60, 150, 80); // 60 slots, 150kg, 80 bulk
            console.log('✅ InventorySystem initialized successfully');
        } catch (error) {
            console.error('❌ InventorySystem initialization failed:', error);
        }
    } else {
        console.error('❌ InventorySystem not available');
    }
    
    // Initialize pickup system
    if (window.PickupSystem) {
        try {
            window.pickupSystem = new PickupSystem(k);
            console.log('✅ PickupSystem initialized successfully');
        } catch (error) {
            console.error('❌ PickupSystem initialization failed:', error);
        }
    } else {
        console.error('❌ PickupSystem not available');
    }
    
    // Initialize UI systems
    if (window.HealthBarUI) {
        try {
            HealthBarUI.init(k);
            console.log('✅ HealthBarUI initialized successfully');
        } catch (error) {
            console.error('❌ HealthBarUI initialization failed:', error);
        }
    }
    
    if (window.MessageUI) {
        try {
            MessageUI.init(k);
            console.log('✅ MessageUI initialized successfully');
        } catch (error) {
            console.error('❌ MessageUI initialization failed:', error);
        }
    }
    
    if (window.CombatUI) {
        try {
            CombatUI.init(k);
            console.log('✅ CombatUI initialized successfully');
        } catch (error) {
            console.error('❌ CombatUI initialization failed:', error);
        }
    }
    
    // Initialize tooltip UI
    if (window.TooltipUIClass) {
        try {
            window.TooltipUI = new TooltipUIClass(k);
            console.log('✅ TooltipUI initialized successfully');
        } catch (error) {
            console.error('❌ TooltipUI initialization failed:', error);
        }
    } else {
        console.error('❌ TooltipUI not available');
    }
    
    // Initialize inventory UI
    if (window.InventoryUI) {
        try {
            window.inventoryUI = new InventoryUI(k);
            console.log('✅ InventoryUI initialized successfully');
        } catch (error) {
            console.error('❌ InventoryUI initialization failed:', error);
        }
    } else {
        console.error('❌ InventoryUI not available');
    }
    
    // Initialize magic system
    console.log('🔍 Checking magic system availability...');
    console.log('🔍 window.MagicSystem:', typeof window.MagicSystem);
    console.log('🔍 window.SpellData:', typeof window.SpellData);
    
    if (window.MagicSystem) {
        try {
            console.log('🔮 Creating MagicSystem instance...');
            window.magicSystem = new MagicSystem(k);
            console.log('✅ Magic system initialized successfully');
        } catch (error) {
            console.error('❌ Magic system initialization failed:', error);
        }
    } else {
        console.error('❌ Magic system not available - class not found');
    }
    
    // Initialize spell UI
    if (window.SpellUI) {
        try {
            window.spellUI = new SpellUI(k);
            console.log('✅ Spell UI initialized successfully');
        } catch (error) {
            console.error('❌ Spell UI initialization failed:', error);
        }
    } else {
        console.error('❌ Spell UI not available');
    }
    
    // Initialize interaction system
    if (window.InteractionSystem) {
        try {
            InteractionSystem.init(k);
            console.log('✅ Interaction system initialized successfully');
        } catch (error) {
            console.error('❌ Interaction system initialization failed:', error);
        }
    } else {
        console.error('❌ Interaction system not available');
    }
    
    // Initialize chest entity system
    if (window.ChestEntity) {
        try {
            ChestEntity.init(k);
            console.log('✅ Chest entity system initialized successfully');
        } catch (error) {
            console.error('❌ Chest entity system initialization failed:', error);
        }
    } else {
        console.error('❌ Chest entity system not available');
    }
    
    // Initialize objectives system
    if (window.ObjectivesSystem) {
        try {
            ObjectivesSystem.init(k);
            console.log('✅ Objectives system initialized successfully');
        } catch (error) {
            console.error('❌ Objectives system initialization failed:', error);
        }
    } else {
        console.error('❌ Objectives system not available');
    }
    
    // Initialize game state
    if (typeof GameState !== 'undefined') {
        GameState.init();
    }

    // Function to check for defeated enemies and track them
    function checkDefeatedEnemies() {
        if (typeof window.GameState === 'undefined' || !window.GameState.worldState.enemiesDefeated) {
            return;
        }
        
        // Get all enemies on the current level
        const enemies = k.get("enemy");
        
        // Debug logging every 120 frames (2 seconds at 60fps) to avoid spam
        if (Math.floor(k.time() * 0.5) % 2 === 0 && k.time() % 2 < 0.1) {
            console.log(`🔍 Enemy death check: ${enemies.length} enemies found`);
        }
        
        enemies.forEach(enemy => {
            // Check if enemy health is 0 or below
            if (enemy.health !== undefined && enemy.health <= 0) {
                // Create unique enemy ID - must match spawning system format
                // Spawning system uses: ${enemyType}_${spawnX}_${spawnY}
                // Use spawn position (spawnX, spawnY) instead of current position (gridX, gridY)
                const enemyType = enemy.enemyType?.id || enemy.enemyId || enemy.name?.toLowerCase() || 'enemy';
                const spawnX = enemy.spawnX !== undefined ? enemy.spawnX : enemy.gridX;
                const spawnY = enemy.spawnY !== undefined ? enemy.spawnY : enemy.gridY;
                const enemyId = `${enemyType}_${spawnX}_${spawnY}`;
                
                console.log(`⚔️ Enemy defeated: ${enemy.name} at current (${enemy.gridX}, ${enemy.gridY}), spawn (${spawnX}, ${spawnY})`);
                console.log(`⚔️ Generated enemy ID: ${enemyId}`);
                
                // Check if already tracked as defeated
                if (!window.GameState.worldState.enemiesDefeated.includes(enemyId)) {
                    // Add to defeated enemies list
                    window.GameState.worldState.enemiesDefeated.push(enemyId);
                    console.log(`⚔️ Enemy defeated and tracked: ${enemyId}`);
                    console.log(`🔍 Defeated enemies array:`, window.GameState.worldState.enemiesDefeated);
                    
                    // Award experience and gold to player
                    const player = k.get("player")[0];
                    if (player && enemy.experience) {
                        if (player.gainExperience) {
                            player.gainExperience(enemy.experience);
                        }
                    }
                    if (player && enemy.gold) {
                        if (player.gold !== undefined) {
                            player.gold += enemy.gold;
                        }
                    }
                }
                
                // Destroy the enemy entity
                enemy.destroy();
            }
        });
    }
    
    // Add inventory system to game state
    if (window.inventory) {
        GameState.inventory = window.inventory;
        console.log('✅ Inventory system added to GameState');
    }
    
    // Check if we're returning from inventory and have saved state
    console.log("🔍 Checking game state...");
    const hasState = GameState.hasSavedState();
    console.log("🔍 hasState:", hasState);
    console.log("🔍 Current collected items:", GameState.worldState.itemsCollected);
    
    if (hasState) {
        console.log("🔄 Returning from inventory - will restore state after creating objects...");
    } else {
        // Fresh start - always reset to ensure clean new game
        console.log("🆕 Fresh game start detected - resetting state for new game...");
        GameState.resetForNewGame();
        console.log("✅ Reset completed. New collected items:", GameState.worldState.itemsCollected);
    }
    
    console.log("🆕 Creating new game world...");
    
    // Initialize camera system with larger world
    CameraSystem.init(k, {
        WORLD_WIDTH: 1600,   // 50 tiles wide
        WORLD_HEIGHT: 1200,  // 37.5 tiles tall
        FOLLOW_SPEED: 0.1,
        SMOOTH_MOVEMENT: true,
        SMOOTH_FACTOR: 0.15
    });
    
    // Load level system (placeholder - will be loaded via script tags)
    // For now, use a simple level system check
    let currentLevel = 1;
    
    // Level system integration (placeholder)
    // TODO: Replace with actual LevelSystem.loadLevel(k, currentLevel) when modules are loaded
    
    // Create world based on level dimensions
    const worldWidth = 1600;  // 50 tiles * 32px
    const worldHeight = 1216; // 38 tiles * 32px
    
    // World background
    k.add([
        k.rect(worldWidth, worldHeight),
        k.color(25, 25, 35),
        k.pos(0, 0),
        k.z(-20)
    ]);
    
    // Update grid config for level dimensions
    GridUtils.updateConfig({
        OFFSET_X: 0,
        OFFSET_Y: 0,
        GRID_WIDTH: 50,
        GRID_HEIGHT: 38
    });
    
    // Temporarily disable procedural dungeon to test door system
    // Load LEVEL_1 with our door modifications
    console.log("🚪 Loading LEVEL_1 to test door system...");
    if (window.LevelSystem && typeof LevelSystem.loadLevel === "function") {
        console.log("🔍 LevelSystem available, calling loadLevel(k, 1)...");
        LevelSystem.loadLevel(k, 1);
        window.currentLevelData = LevelSystem.currentLevelData;
        console.log("🚪 LEVEL_1 loaded for door testing");
        console.log("🔍 Current level data:", window.currentLevelData);
        console.log("🔍 Level walls count:", window.currentLevelData?.walls?.length || 0);
        console.log("🔍 Level doors count:", window.currentLevelData?.doors?.length || 0);
        
        // Initialize ProgressionSystem
        if (typeof ProgressionSystem !== 'undefined') {
            ProgressionSystem.init(k);
            console.log("✅ ProgressionSystem initialized");
        } else {
            console.warn("⚠️ ProgressionSystem not available");
        }
        
        // Initialize and generate additional level content
        if (typeof SystemInitializer !== 'undefined') {
            SystemInitializer.init(k);
            SystemInitializer.generateLevelContent(LevelSystem.currentLevelData);
        } else {
            console.warn("⚠️ SystemInitializer not available");
        }
    } else {
        console.error("❌ LevelSystem not available or loadLevel function missing!");
        console.log("🔍 window.LevelSystem:", typeof window.LevelSystem);
        console.log("🔍 LevelSystem.loadLevel:", window.LevelSystem ? typeof LevelSystem.loadLevel : "LevelSystem undefined");
    }
        
        // Check for defeated enemies and track them
        checkDefeatedEnemies();
        
        // Add continuous enemy death tracking in game loop
        k.onUpdate(() => {
            checkDefeatedEnemies();
        });
        
        // Debug command to test enemy defeat (press K to kill nearest enemy)
        k.onKeyPress("k", () => {
            const enemies = k.get("enemy");
            if (enemies.length > 0) {
                const enemy = enemies[0];
                console.log(`🔧 DEBUG: Setting enemy health to 0 for testing. Enemy: ${enemy.name} at (${enemy.gridX}, ${enemy.gridY}), current health: ${enemy.health}`);
                enemy.health = 0;
            }
        });

        k.onKeyPress("l", () => {
            console.log("🔄 DEBUG: Reloading level to test enemy persistence");
            if (window.ProgressionSystem) {
                ProgressionSystem.transitionToLevel('level_1');
            }
        });

        k.onKeyPress("r", () => {
            console.log("👹 DEBUG: Respawning all enemies (ignoring persistence)");
            if (typeof SpawningSystem !== 'undefined' && SpawningSystem.forceRespawnAllEnemies) {
                SpawningSystem.forceRespawnAllEnemies();
            }
        });

        k.onKeyPress("t", () => {
            console.log("🔄 DEBUG: Toggling enemy persistence");
            if (window.GameState && window.GameState.worldState.enemiesDefeated) {
                const count = window.GameState.worldState.enemiesDefeated.length;
                window.GameState.worldState.enemiesDefeated = [];
                console.log(`🧹 Cleared ${count} defeated enemies from persistence`);
            }
        });

        k.onKeyPress("z", () => {
            console.log("📋 DEBUG: Showing defeated enemies list");
            if (window.GameState && window.GameState.worldState.enemiesDefeated) {
                console.log("💀 Defeated enemies:", window.GameState.worldState.enemiesDefeated);
            }
        });

        // Debug: Test respawn system (D = trigger death, H = heal player) - DISABLED to prevent accidental health drops
        // k.onKeyPress("d", () => {
        //     console.log("💀 DEBUG: Triggering player death for respawn test");
        //     const player = k.get("player")[0];
        //     if (player) {
        //         player.health = 0;
        //         player.isDead = true;
        //         if (window.ProgressionSystem) {
        //             ProgressionSystem.triggerDeathScreen(
        //                 'Debug death triggered for testing!',
        //                 'debug'
        //             );
        //         }
        //     }
        // });

        k.onKeyPress("h", () => {
            console.log("💚 DEBUG: Healing player to full health");
            const player = k.get("player")[0];
            if (player) {
                player.health = player.maxHealth || 100;
                player.isDead = false;
                console.log(`💚 Player healed to ${player.health}/${player.maxHealth}`);
            }
        });

        // Removed debug status effect test that was causing health to go to zero
        
        // Debug command to check defeated enemies list (press L to list)
        k.onKeyPress("l", () => {
            console.log(`🔍 ===== DEBUG COMMAND L PRESSED =====`);
            console.log(`🔍 DEBUG: GameState exists:`, typeof window.GameState !== 'undefined');
            console.log(`🔍 DEBUG: GameState.worldState:`, window.GameState?.worldState);
            console.log(`🔍 DEBUG: Current defeated enemies:`, window.GameState?.worldState?.enemiesDefeated);
            const enemies = k.get("enemy");
            console.log(`🔍 DEBUG: Current enemies on level (${enemies.length}):`, enemies.map(e => {
                const enemyType = e.enemyType?.id || e.enemyId || e.name?.toLowerCase() || 'enemy';
                const spawnX = e.spawnX !== undefined ? e.spawnX : e.gridX;
                const spawnY = e.spawnY !== undefined ? e.spawnY : e.gridY;
                const enemyId = `${enemyType}_${spawnX}_${spawnY}`;
                return `${e.name} at current (${e.gridX}, ${e.gridY}), spawn (${spawnX}, ${spawnY}), health: ${e.health}, ID: ${enemyId}`;
            }));
            console.log(`🔍 DEBUG: Enemy properties:`, enemies.length > 0 ? enemies[0] : 'No enemies');
            console.log(`🔍 ===== END DEBUG COMMAND =====`);
        });
        
        // Debug command to manually test level reload (press R to reload level)
        k.onKeyPress("r", () => {
            console.log(`🔄 DEBUG: Manually reloading level to test enemy persistence...`);
            if (window.LevelSystem && typeof LevelSystem.loadLevel === "function") {
                LevelSystem.loadLevel(k, 1);
                console.log(`🔄 DEBUG: Level reloaded`);
            }
        });
        
        // Comprehensive test command (press T to run full test)
        k.onKeyPress("t", () => {
            console.log(`🧪 RUNNING COMPREHENSIVE ENEMY PERSISTENCE TEST`);
            console.log(`🧪 Step 1: Check current enemies`);
            const enemies = k.get("enemy");
            console.log(`🧪 Found ${enemies.length} enemies:`, enemies.map(e => `${e.name} at (${e.gridX}, ${e.gridY}) health: ${e.health}`));
            
            console.log(`🧪 Step 2: Check current defeated enemies list`);
            console.log(`🧪 Defeated enemies:`, window.GameState.worldState.enemiesDefeated);
            
            if (enemies.length > 0) {
                console.log(`🧪 Step 3: Defeating first enemy for test`);
                const enemy = enemies[0];
                const enemyType = enemy.enemyType?.id || enemy.enemyId || enemy.name?.toLowerCase() || 'enemy';
                const spawnX = enemy.spawnX !== undefined ? enemy.spawnX : enemy.gridX;
                const spawnY = enemy.spawnY !== undefined ? enemy.spawnY : enemy.gridY;
                const enemyId = `${enemyType}_${spawnX}_${spawnY}`;
                console.log(`🧪 Enemy ID will be: ${enemyId}`);
                console.log(`🧪 Enemy details:`, {
                    name: enemy.name,
                    enemyType: enemy.enemyType,
                    enemyId: enemy.enemyId,
                    currentPos: `(${enemy.gridX}, ${enemy.gridY})`,
                    spawnPos: `(${spawnX}, ${spawnY})`,
                    health: enemy.health
                });
                enemy.health = 0;
                console.log(`🧪 Enemy health set to 0, should be processed next frame`);
                
                // Wait a moment then check if it was tracked
                setTimeout(() => {
                    console.log(`🧪 Step 4: Checking if enemy was tracked as defeated`);
                    console.log(`🧪 Defeated enemies after defeat:`, window.GameState.worldState.enemiesDefeated);
                    console.log(`🧪 Remaining enemies:`, k.get("enemy").map(e => `${e.name} at (${e.gridX}, ${e.gridY})`));
                    
                    console.log(`🧪 Step 5: Reloading level to test persistence`);
                    if (window.LevelSystem && typeof LevelSystem.loadLevel === "function") {
                        LevelSystem.loadLevel(k, 1);
                        
                        setTimeout(() => {
                            console.log(`🧪 Step 6: Checking enemies after level reload`);
                            const newEnemies = k.get("enemy");
                            console.log(`🧪 Enemies after reload:`, newEnemies.map(e => `${e.name} at (${e.gridX}, ${e.gridY})`));
                            console.log(`🧪 TEST COMPLETE: Enemy persistence ${newEnemies.length < enemies.length ? 'WORKING' : 'NOT WORKING'}`);
                        }, 1000);
                    }
                }, 1000);
            } else {
                console.log(`🧪 No enemies found to test with`);
            }
        });
    
    // Draw debug grid (optional)
    let levelGridVisible = false;
    if (levelGridVisible) {
        GridUtils.drawDebugGrid(k, {
            color: [80, 80, 100],
            opacity: 0.3
        });
    }
    
    // Create player at dungeon spawn
    const spawn = (window.LevelSystem && typeof LevelSystem.getPlayerSpawn === "function")
        ? LevelSystem.getPlayerSpawn()
        : (window.currentLevelData && window.currentLevelData.playerSpawn) ? window.currentLevelData.playerSpawn : { x: 2, y: 2 };
    const playerGridPos = { x: spawn.x, y: spawn.y };
    console.log("🧍 Spawning player at", playerGridPos);
    const player = PlayerEntity.create(k, playerGridPos.x, playerGridPos.y, {
        SPRITE_SIZE: 24,
        SPRITE_COLOR: [100, 150, 255]
    });
    
    // Set initial fog of war reveal around player
    if (window.LevelSystem && typeof LevelSystem.updateFogOfWar === "function") {
        try {
            LevelSystem.updateFogOfWar(k, player.gridX, player.gridY);
        } catch (err) {
            console.warn("Fog of war update failed at spawn:", err);
        }
    }
    
    // Set camera to follow player
    CameraSystem.followTarget(player, true);
    
    // Make player globally accessible
    window.player = player;
    window.currentPlayer = player; // For backward compatibility
    
    // 🧪 TEST SETUP: Give player maximum mana and level for testing all spells
    player.mana = 200;
    player.maxMana = 200;
    player.level = 10; // Level 10 to access ALL spells
    console.log('🧪 TEST: Player boosted for magic testing - Mana: 200/200, Level: 10');
    
    // Initialize equipment stats system
    if (window.inventory) {
        window.inventory.applyEquipmentStats();
        console.log('🛡️ Equipment system initialized for player');
    }
    
    // Magic system is ready for testing!
    console.log('🧪 TEST: Magic system ready - try casting spells with Z/X/C/V/B/N + 1-5');
    console.log('🧪 TEST: Example: Z+1 for Fire Spark, B+1 for Minor Heal');
    console.log('🧪 TEST: Player has 100 mana and level 3 for testing');
    
    // Note: Enemies will spawn from level data if available
    // You can also attack the walls or test self-targeting spells
    
    // Initialize enemy systems here (moved from earlier in code)
    console.log('📍 About to initialize enemy systems...');
    console.log('🔍 Checking enemy systems availability...');
    console.log('🔍 ENEMY_TYPES:', typeof window.ENEMY_TYPES, window.ENEMY_TYPES ? Object.keys(window.ENEMY_TYPES) : 'undefined');
    console.log('🔍 EnemyEntity:', typeof window.EnemyEntity);
    console.log('🔍 AISystem:', typeof window.AISystem);
    console.log('🔍 SpawningSystem:', typeof window.SpawningSystem);
    
    if (window.AISystem) {
        AISystem.init(k);
        console.log('✅ AISystem initialized');
    } else {
        console.error('❌ AISystem not available');
    }
    
    if (window.SpawningSystem) {
        SpawningSystem.init(k);
        console.log('✅ SpawningSystem initialized');
    } else {
        console.error('❌ SpawningSystem not available');
    }
    
    if (window.StatusEffectSystem) {
        StatusEffectSystem.init(k);
        console.log('✅ StatusEffectSystem initialized');
    } else {
        console.error('❌ StatusEffectSystem not available');
    }
    
    // Spawn test enemies
    if (window.ENEMY_TYPES && window.EnemyEntity) {
        // Spawn a goblin in room 1
        const goblin = EnemyEntity.create(k, ENEMY_TYPES.goblin, 25, 15);
        
        // Spawn a rat in room 2
        const rat = EnemyEntity.create(k, ENEMY_TYPES.rat, 10, 6);
        
        // Spawn an orc in room 3
        const orc = EnemyEntity.create(k, ENEMY_TYPES.orc, 38, 29);
        
        // Spawn a skeleton near the starting area
        const skeleton = EnemyEntity.create(k, ENEMY_TYPES.skeleton, 20, 20);
        
        console.log('👹 Test enemies spawned successfully');
    } else {
        console.warn('⚠️ Enemy systems not loaded, skipping enemy spawn');
    }
    
    // Spawn test ground items for inventory system demonstration
    if (window.GroundItemEntity && window.ItemData && window.ItemData.DATA) {
        console.log('📦 Spawning test ground items...');
        
        // Create test items using the new inventory system
        const testItems = [
            // Weapons
            { itemId: 'sword', x: 24, y: 15 },
            { itemId: 'magic_sword', x: 25, y: 15 },
            { itemId: 'dagger', x: 26, y: 15 },
            
            // Armor
            { itemId: 'leather_armor', x: 22, y: 18 },
            { itemId: 'chain_mail', x: 23, y: 18 },
            { itemId: 'plate_armor', x: 24, y: 18 },
            
            // Accessories
            { itemId: 'ring_of_strength', x: 21, y: 17 },
            { itemId: 'magic_cloak', x: 22, y: 17 },
            { itemId: 'apprentice_spellbook', x: 23, y: 17 },
            
            // Consumables
            { itemId: 'health_potion', x: 26, y: 16 },
            { itemId: 'mana_potion', x: 27, y: 16 },
            { itemId: 'strength_potion', x: 28, y: 16 },
            
            // Misc
            { itemId: 'gold_coin', x: 25, y: 17 },
            { itemId: 'scroll_fireball', x: 21, y: 16 },
            { itemId: 'iron_key', x: 23, y: 19 },
            { itemId: 'gem', x: 27, y: 18 },
            { itemId: 'bread', x: 24, y: 19 }
        ];
        
        testItems.forEach(testItem => {
            const itemData = window.ItemData.DATA[testItem.itemId];
            if (itemData) {

                // Use GridUtils to get centered position within grid square
                const centerPos = window.GridUtils.gridToPixelCenter(testItem.x, testItem.y);
                GroundItemEntity.create(k, itemData, centerPos.x, centerPos.y);
                console.log(`📦 Spawned ${itemData.name} at grid (${testItem.x}, ${testItem.y}) pixel (${centerPos.x}, ${centerPos.y})`);
            } else {
                console.warn(`⚠️ Item not found: ${testItem.itemId}`);
            }
        });
        
        console.log('✅ Test ground items spawned successfully');
    } else {
        console.log('🔍 Checking ground item system availability...');
        console.log('🔍 GroundItemEntity:', typeof window.GroundItemEntity);
        console.log('🔍 ItemData:', typeof window.ItemData);
        console.log('🔍 ItemData.DATA:', window.ItemData ? typeof window.ItemData.DATA : 'N/A');
        console.warn('⚠️ Ground item system not loaded, skipping item spawn');
    }
    
    // Create multiple rooms/areas across the world (legacy test walls)
    // Keep behind a flag so we can see actual dungeon walls instead
    const SHOW_LEGACY_TEST_WALLS = false;
    
    // Room 1: Starting area (center)
    const room1Walls = [
        // Outer walls
        ...Array.from({length: 10}, (_, i) => ({ x: 18 + i, y: 12 })), // Top
        ...Array.from({length: 10}, (_, i) => ({ x: 18 + i, y: 22 })), // Bottom
        ...Array.from({length: 10}, (_, i) => ({ x: 18, y: 12 + i })), // Left
        ...Array.from({length: 10}, (_, i) => ({ x: 27, y: 12 + i })), // Right
        // Door openings (remove some walls)
    ].filter(pos => !(pos.x === 22 && pos.y === 12) && !(pos.x === 22 && pos.y === 22) &&
                    !(pos.x === 18 && pos.y === 17) && !(pos.x === 27 && pos.y === 17));
    
    // Room 2: Northwest area
    const room2Walls = [
        ...Array.from({length: 8}, (_, i) => ({ x: 5 + i, y: 3 })),
        ...Array.from({length: 8}, (_, i) => ({ x: 5 + i, y: 10 })),
        ...Array.from({length: 7}, (_, i) => ({ x: 5, y: 3 + i })),
        ...Array.from({length: 7}, (_, i) => ({ x: 12, y: 3 + i }))
    ].filter(pos => !(pos.x === 8 && pos.y === 10)); // Door
    
    // Room 3: Southeast area
    const room3Walls = [
        ...Array.from({length: 8}, (_, i) => ({ x: 35 + i, y: 25 })),
        ...Array.from({length: 8}, (_, i) => ({ x: 35 + i, y: 32 })),
        ...Array.from({length: 7}, (_, i) => ({ x: 35, y: 25 + i })),
        ...Array.from({length: 7}, (_, i) => ({ x: 42, y: 25 + i }))
    ].filter(pos => !(pos.x === 35 && pos.y === 28)); // Door
    
    // Combine all walls
    const allWalls = [...room1Walls, ...room2Walls, ...room3Walls];
    
    if (SHOW_LEGACY_TEST_WALLS) {
        allWalls.forEach(pos => {
            const pixelPos = GridUtils.createGridPos(pos.x, pos.y);
            k.add([
                k.rect(32, 32),
                k.color(60, 60, 60),
                k.pos(pixelPos.x, pixelPos.y),
                k.outline(1, k.rgb(40, 40, 40)),
                k.z(5),
                "wall",
                { gridX: pos.x, gridY: pos.y }
            ]);
        });
    }
    
    // Scatter items across the world
    const itemPositions = [
        // Room 1 items
        { x: 20, y: 15, color: [255, 215, 0], name: "gold" },
        { x: 25, y: 19, color: [255, 100, 100], name: "potion" },
        { x: 22, y: 16, color: [192, 192, 192], name: "sword" },
        
        // Room 2 items
        { x: 8, y: 6, color: [100, 255, 100], name: "emerald" },
        { x: 10, y: 8, color: [255, 150, 0], name: "scroll" },
        
        // Room 3 items
        { x: 38, y: 28, color: [150, 100, 255], name: "crystal" },
        { x: 40, y: 30, color: [255, 200, 200], name: "armor" },
        
        // Scattered items
        { x: 15, y: 25, color: [255, 255, 100], name: "key" },
        { x: 30, y: 8, color: [100, 200, 255], name: "gem" },
        { x: 12, y: 20, color: [200, 100, 50], name: "book" }
    ];
    
    itemPositions.forEach(item => {
        // Check if this item has already been collected
        const itemId = `${item.name}_${item.x}_${item.y}`;
        const isCollected = GameState.worldState.itemsCollected.includes(itemId);
        
        if (!isCollected) {
            const pixelPos = GridUtils.createGridPos(item.x, item.y, true);
            k.add([
                k.rect(16, 16),
                k.color(...item.color),
                k.pos(pixelPos.x, pixelPos.y),
                k.anchor("center"),
                k.z(8),
                "item",
                { gridX: item.x, gridY: item.y, itemType: item.name }
            ]);
        } else {
            console.log(`⏭️ Skipping already collected item: ${itemId}`);
        }
    });
    
    // Add area labels
    k.add([
        k.text("STARTING ROOM"),
        k.pos(GridUtils.createGridPos(22, 14, true).x, GridUtils.createGridPos(22, 14, true).y),
        k.anchor("center"),
        k.scale(0.3),
        k.color(150, 150, 150),
        k.z(15)
    ]);
    
    k.add([
        k.text("TREASURE ROOM"),
        k.pos(GridUtils.createGridPos(8, 5, true).x, GridUtils.createGridPos(8, 5, true).y),
        k.anchor("center"),
        k.scale(0.3),
        k.color(150, 150, 150),
        k.z(15)
    ]);
    
    k.add([
        k.text("ARMORY"),
        k.pos(GridUtils.createGridPos(38, 27, true).x, GridUtils.createGridPos(38, 27, true).y),
        k.anchor("center"),
        k.scale(0.3),
        k.color(150, 150, 150),
        k.z(15)
    ]);
    
    // Fixed UI elements (stay on screen)
    const uiLayer = k.add([
        k.fixed(),
        k.z(100)
    ]);
    
    
    // Controls info (fixed position)
    uiLayer.add([
        k.text("WASD: Move | I: Inventory | G: Grid | SPACE: Attack | E: Interact | ESC: Menu"),
        k.pos(k.width() / 2, k.height() - 20),
        k.anchor("center"),
        k.scale(0.3),
        k.color(150, 150, 150)
    ]);
    
    // Camera info panel (fixed position)
    const cameraInfoPanel = uiLayer.add([
        k.rect(200, 120),
        k.color(20, 20, 30),
        k.pos(k.width() - 210, 10),
        k.outline(1, k.rgb(100, 100, 100))
    ]);
    
    const cameraInfoText = uiLayer.add([
        k.text(""),
        k.pos(k.width() - 205, 15),
        k.scale(0.3),
        k.color(200, 200, 200)
    ]);
    
    // Player info panel (fixed position) - made larger for more stats
    const playerInfoPanel = uiLayer.add([
        k.rect(180, 140),
        k.color(20, 20, 30),
        k.pos(10, 10),
        k.outline(1, k.rgb(100, 100, 100))
    ]);
    
    const playerInfoText = uiLayer.add([
        k.text(""),
        k.pos(15, 15),
        k.scale(0.3),
        k.color(200, 200, 200)
    ]);
    
    // Add player stats title
    uiLayer.add([
        k.text("PLAYER STATS"),
        k.pos(15, 15),
        k.scale(0.35),
        k.color(220, 180, 100)
    ]);
    
    // Debug walkability helpers (toggle with window.DEBUG_WALKABILITY = true in console)
    function debugWalkabilityEnabled() {
        try { return typeof window !== 'undefined' && window.DEBUG_WALKABILITY === true; } catch { return false; }
    }
    function logWalkabilityAt(x, y, reason = "blocked") {
        if (!debugWalkabilityEnabled()) return;
        try {
            const ls = (typeof window !== 'undefined') ? window.LevelSystem : null;
            const lu = (typeof window !== 'undefined') ? window.LevelUtils : null;
            const level = ls?.currentLevelData;
            const symbol = (level?.layout?.[y] && typeof level.layout[y] === 'string') ? level.layout[y][x] : undefined;
            const type = lu && level ? lu.getTileAt(level, x, y) : undefined;
            const walk = lu && level ? lu.isWalkable(level, x, y) : undefined;
            console.log(`🚧 Move ${reason} to (${x},${y}) symbol='${symbol}' type='${type}' walkable=${walk}`);
        } catch (e) {
            console.log("🚧 Move blocked (debug logging failed)", e);
        }
    }

    // Player movement using grid system
    function movePlayer(dx, dy) {
        const newGridX = player.gridX + dx;
        const newGridY = player.gridY + dy;
        
        // Bounds check
        if (!GridUtils.isValidGridPosition(newGridX, newGridY)) {
            logWalkabilityAt(newGridX, newGridY, "blocked (out of bounds)");
            return;
        }
        
        // Unified walkability check via LevelSystem.isWalkable()
        const canMove = LevelSystem.isWalkable(newGridX, newGridY);
        
        // console.log(`🔧 movePlayer: canMove result = ${canMove}`);
        
        if (!canMove) {
            // console.log(`🔧 movePlayer: Movement blocked to (${newGridX}, ${newGridY})`);
            logWalkabilityAt(newGridX, newGridY, "blocked (non-walkable)");
            return;
        }
        
        // Update grid position
        player.gridX = newGridX;
        player.gridY = newGridY;
        
        // Trigger player moved event for objectives system
        const playerMoveData = {
            position: { x: newGridX, y: newGridY },
            direction: { dx: dx, dy: dy }
        };
        
        // Try multiple ways to trigger the event
        if (typeof k !== 'undefined' && k.trigger) {
            k.trigger('player_moved', playerMoveData);
        }
        
        if (typeof window !== 'undefined' && window.k && typeof window.k.trigger === 'function') {
            window.k.trigger('player_moved', playerMoveData);
        }
        
        // Direct call to objectives system as fallback
        if (typeof window !== 'undefined' && window.ObjectivesSystem) {
            window.ObjectivesSystem.trackObjectiveProgress('player_moved', playerMoveData);
        }
        
        // Update fog of war around player
        if (window.LevelSystem && typeof LevelSystem.updateFogOfWar === 'function') {
            try {
                LevelSystem.updateFogOfWar(k, player.gridX, player.gridY);
            } catch (err) {
                console.warn('Fog of war update failed during move:', err);
            }
        }
        
        // Calculate pixel position (centered in tile)
        const newPixelPos = GridUtils.createGridPos(newGridX, newGridY, true);
        
        // Animate movement
        player.playAnimation('walk');
        player.isMoving = true;
        
        // Smooth movement tween with reference
        player.currentTween = k.tween(player.pos, k.vec2(newPixelPos.x, newPixelPos.y), 0.15, (pos) => {
            if (player.exists()) {
                player.pos = pos;
            }
        }, k.easings.easeOutQuad).then(() => {
            if (player.exists()) {
                player.isMoving = false;
                player.currentTween = null;
                player.playAnimation('idle');
            }
        });
        
        // Item pickup on arrival
        const items = k.get("item");
        items.forEach(item => {
            if (item.gridX === newGridX && item.gridY === newGridY) {
                const itemData = {
                    id: `${item.itemType}_${Date.now()}`,
                    name: item.itemType,
                    type: item.itemType,
                    value: getItemValue(item.itemType),
                    description: getItemDescription(item.itemType)
                };
                
                // Ensure GameState structure is properly initialized
                if (!GameState.playerState) {
                    console.warn('⚠️ GameState.playerState was undefined, reinitializing...');
                    GameState.playerState = {
                        inventory: [],
                        stats: { inventoryCount: 0 }
                    };
                }
                if (!GameState.playerState.inventory) {
                    console.warn('⚠️ GameState.playerState.inventory was undefined, reinitializing...');
                    GameState.playerState.inventory = [];
                }
                if (!GameState.playerState.stats) {
                    console.warn('⚠️ GameState.playerState.stats was undefined, reinitializing...');
                    GameState.playerState.stats = { inventoryCount: 0 };
                }
                if (!GameState.worldState) {
                    console.warn('⚠️ GameState.worldState was undefined, reinitializing...');
                    GameState.worldState = {
                        itemsCollected: []
                    };
                }
                if (!GameState.worldState.itemsCollected) {
                    console.warn('⚠️ GameState.worldState.itemsCollected was undefined, reinitializing...');
                    GameState.worldState.itemsCollected = [];
                }
                
                GameState.playerState.inventory.push(itemData);
                GameState.playerState.stats.inventoryCount++;
                
                const itemId = `${item.itemType}_${item.gridX}_${item.gridY}`;
                GameState.worldState.itemsCollected.push(itemId);
                
                console.log(`🎒 Picked up ${item.itemType}! (ID: ${itemId})`);
                console.log(`🔍 Items collected array now:`, GameState.worldState.itemsCollected);
                itemsCollected++;
                
                if (player.gainExperience) {
                    player.gainExperience(80); // Temporarily high for testing level up
                }
                
                handleItemPickup(player, item.itemType);
                
                k.destroy(item);
                
                CameraSystem.shake(8, 200);
            }
        });
    }
    
    // Grid-based movement controls with facing updates and animations
    k.onKeyPress("w", () => {
        if (window.GameState && window.GameState.isGamePaused()) return;
        player.updateFacing('up');
        player.playAnimation('walk');
        movePlayer(0, -1);
    });
    k.onKeyPress("s", () => {
        if (window.GameState && window.GameState.isGamePaused()) return;
        player.updateFacing('down');
        player.playAnimation('walk');
        movePlayer(0, 1);
    });
    k.onKeyPress("a", () => {
        if (window.GameState && window.GameState.isGamePaused()) return;
        player.updateFacing('left');
        player.playAnimation('walk');
        movePlayer(-1, 0);
    });
    k.onKeyPress("d", () => {
        if (window.GameState && window.GameState.isGamePaused()) return;
        player.updateFacing('right');
        player.playAnimation('walk');
        movePlayer(1, 0);
    });
    
    // Magic system controls
    k.onKeyPress("z", () => {
        if (window.GameState && window.GameState.isGamePaused()) return;
        if (window.magicSystem) {
            magicSystem.selectSchool('fire');
        }
    });
    
    k.onKeyPress("x", () => {
        if (window.GameState && window.GameState.isGamePaused()) return;
        if (window.magicSystem) {
            magicSystem.selectSchool('ice');
        }
    });
    
    k.onKeyPress("c", () => {
        if (window.GameState && window.GameState.isGamePaused()) return;
        if (window.magicSystem) {
            magicSystem.selectSchool('lightning');
        }
    });
    
    k.onKeyPress("v", () => {
        if (window.GameState && window.GameState.isGamePaused()) return;
        if (window.magicSystem) {
            magicSystem.selectSchool('poison');
        }
    });
    
    k.onKeyPress("b", () => {
        if (window.GameState && window.GameState.isGamePaused()) return;
        if (window.magicSystem) {
            magicSystem.selectSchool('heal');
        }
    });
    
    k.onKeyPress("n", () => {
        if (window.GameState && window.GameState.isGamePaused()) return;
        if (window.magicSystem) {
            magicSystem.selectSchool('protect');
        }
    });
    
    // Combat attack
    k.onKeyPress("space", () => {
        if (window.GameState && window.GameState.isGamePaused()) {
            console.log("⏸️ Attack blocked: game is paused");
            return;
        }
        console.log("⎵ SPACE pressed: invoking CombatSystem.playerAttack()");
        if (window.CombatSystem && typeof window.CombatSystem.playerAttack === 'function') {
            window.CombatSystem.playerAttack();
        } else {
            // Fallback to simple attack animation
            player.playAnimation('attack');
            if (window.CameraSystem) {
                CameraSystem.shake(15, 300);
            }
            console.log("⚔️ Player attacks!");
        }
    });
    
    // Debug key bindings
    k.onKeyPress("t", () => {
        console.log("🧪 Debug: Testing objectives system...");
        if (window.ObjectivesSystem) {
            ObjectivesSystem.debugCurrentObjective();
            
            ObjectivesSystem.debugListObjectivePool();
        }
    });
    
    k.onKeyPress("f3", () => {
        if (window.ObjectivesSystem) {
            // Test enemy defeated event
            ObjectivesSystem.debugTriggerEvent('enemy_defeated', {
                enemyType: 'goblin',
                enemyId: 'test_goblin_1'
            });
        }
    });
    
    k.onKeyPress("f4", () => {
        if (window.ObjectivesSystem) {
            // Force complete current objective
            ObjectivesSystem.forceCompleteObjective();
        }
    });
    
    // Camera and display state
    let gridVisible = true;
    let freeCameraMode = false;
    let itemsCollected = 0;
    let spawnPointsVisible = false;
    
    // Item helper functions
    function getItemValue(itemType) {
        const values = {
            'gold': 50, 'potion': 25, 'sword': 100, 'emerald': 75,
            'scroll': 30, 'crystal': 150, 'armor': 200, 'key': 10,
            'gem': 80, 'book': 40
        };
        return values[itemType] || 10;
    }
    
    function getItemDescription(itemType) {
        const descriptions = {
            'gold': 'Shiny gold coins',
            'potion': 'Restores health',
            'sword': 'Sharp steel blade',
            'emerald': 'Precious green gem',
            'scroll': 'Ancient magic scroll',
            'crystal': 'Glowing magic crystal',
            'armor': 'Protective chainmail',
            'key': 'Opens locked doors',
            'gem': 'Valuable jewel',
            'book': 'Tome of knowledge'
        };
        return descriptions[itemType] || 'Mysterious item';
    }
    
    function handleItemPickup(player, itemType) {
        switch (itemType) {
            case 'potion':
                player.heal(25);
                break;
            case 'gold':
                player.gold += 50;
                break;
            case 'sword':
                player.attack += 2;
                console.log(`⚔️ Attack increased! New attack: ${player.attack}`);
                break;
            case 'armor':
                player.defense += 3;
                console.log(`🛡️ Defense increased! New defense: ${player.defense}`);
                break;
            case 'crystal':
                player.mana = Math.min(player.maxMana, player.mana + 20);
                console.log(`✨ Mana restored! MP: ${player.mana}/${player.maxMana}`);
                break;
            case 'book':
                player.gainExperience(15); // Extra experience
                break;
        }
    }
    
    // Toggle grid visibility
    k.onKeyPress("g", () => {
        if (gridVisible) {
            GridUtils.removeDebugGrid(k);
            gridVisible = false;
            console.log("Grid hidden");
        } else {
            GridUtils.drawDebugGrid(k, {
                color: [80, 80, 100],
                opacity: 0.5
            });
            gridVisible = true;
            console.log("Grid shown");
        }
    });
    
    // Toggle enemy spawn point debug markers (DISABLED - causing visual artifacts)
    // k.onKeyPress("f12", () => {
    //     // Respect pause state like other inputs
    //     if (window.GameState && typeof window.GameState.isGamePaused === 'function' && window.GameState.isGamePaused()) {
    //         console.log('Spawn toggle ignored: game is paused');
    //         return;
    //     }
    //     if (!window.SpawningSystem) {
    //         console.warn('⚠️ SpawningSystem not available');
    //         return;
    //     }
    //     
    //     if (!spawnPointsVisible) {
    //         // Prefer currentLevelData if available
    //         const levelData = window.currentLevelData || (window.LevelSystem ? window.LevelSystem.currentLevelData : null);
    //         if (!levelData) {
    //             console.warn('⚠️ No level data available to show spawn points');
    //             return;
    //         }
    //         const spawnPoints = window.SpawningSystem.getSpawnPointsFromLevel(levelData);
    //         if (!spawnPoints || spawnPoints.length === 0) {
    //             console.warn('⚠️ No spawn points found in current level');
    //             return;
    //         }
    //         // Use a long duration so markers persist until explicitly hidden
    //         window.SpawningSystem.showSpawnPoints(k, spawnPoints, 9999);
    //         spawnPointsVisible = true;
    //         console.log(`🐾 Spawn point debug: shown (${spawnPoints.length})`);
    //     } else {
    //         window.SpawningSystem.hideSpawnPoints(k);
    //         spawnPointsVisible = false;
    //         console.log('🐾 Spawn point debug: hidden');
    //     }
    // });
    

    

    
    // Clear any existing debug spawn markers on game start
    if (window.SpawningSystem) {
        window.SpawningSystem.hideSpawnPoints(k);
    }
    
    // Test hurt animation
    k.onKeyPress("h", () => {
        player.playAnimation('hurt');
        console.log("💔 Player hurt animation!");
    });
    
    // Test level up animation
    k.onKeyPress("l", () => {
        player.playAnimation('levelup');
        console.log("⭐ Player level up animation!");
    });
    
    // Debug: Test treasure hunter achievement
    k.onKeyPress("t", () => {
        console.log("🧪 Testing treasure hunter achievement...");
        if (window.ObjectivesSystem) {
            const currentObj = window.ObjectivesSystem.getCurrentObjective();
            console.log("📊 Current objective:", currentObj);
            
            // Force assign treasure hunter objective if not active
            if (!currentObj || currentObj.id !== 'open_chests') {
                console.log("🎯 Forcing treasure hunter objective...");
                window.ObjectivesSystem.currentObjective = {
                    id: 'open_chests',
                    title: 'Treasure Hunter',
                    description: 'Open treasure chests',
                    type: 'interaction',
                    target: 2,
                    trackEvent: 'chest_opened',
                    trackCondition: () => true,
                    current: 0,
                    completed: false,
                    startTime: Date.now()
                };
                window.ObjectivesSystem.displayObjective();
            }
            
            console.log("🎯 Manually triggering chest_opened event...");
            k.trigger('chest_opened', {
                chest: { chestType: 'wooden', contents: [] },
                player: player
            });
        } else {
            console.log("❌ ObjectivesSystem not available");
        }
    });
    
    // Debug: Show objectives system status
    k.onKeyPress("o", () => {
        console.log("📊 === OBJECTIVES SYSTEM STATUS ===");
        if (window.ObjectivesSystem) {
            window.ObjectivesSystem.debugShowObjectiveInfo();
            console.log("🏆 Completed objectives:", window.ObjectivesSystem.getCompletedCount());
        } else {
            console.log("❌ ObjectivesSystem not available");
        }
    });
    
    // Debug: Force treasure hunter objective
    k.onKeyPress("f", () => {
        console.log("🎯 Forcing Treasure Hunter objective...");
        if (window.ObjectivesSystem) {
            // Clear current objective
            window.ObjectivesSystem.currentObjective = null;
            k.destroyAll("objective_display");
            
            // Set treasure hunter objective
            window.ObjectivesSystem.currentObjective = {
                id: 'open_chests',
                title: 'Treasure Hunter',
                description: 'Open treasure chests',
                type: 'interaction',
                target: 2,
                trackEvent: 'chest_opened',
                trackCondition: () => true,
                current: 0,
                completed: false,
                startTime: Date.now()
            };
            window.ObjectivesSystem.displayObjective();
            console.log("✅ Treasure Hunter objective is now active!");
        }
    });
    
    // Help key
    k.onKeyPress("h", () => {
        if (window.MessageSystem) {
            window.MessageSystem.addMessage('Help: WASD to move, SPACE to attack, I for inventory, F to force treasure hunter objective, T to test chest event, O for objective status', 'info');
        }
    });
    
    // Open inventory UI
    k.onKeyPress("i", () => {
        if (window.inventoryUI) {
            inventoryUI.toggle();
        } else {
            console.error("❌ InventoryUI not available");
        }
    });
    
    // Spawn test enemies for spell testing
    k.onKeyPress("t", () => {
        spawnTestEnemies(k);
    });
    
    // Arrow key movement (when not in free camera mode) and free camera movement
    k.onKeyPress("up", () => {
        if (window.GameState && window.GameState.isGamePaused()) return;
        if (!freeCameraMode) {
            player.updateFacing('up');
            player.playAnimation('walk');
            movePlayer(0, -1);
        }
    });
    
    k.onKeyPress("down", () => {
        if (window.GameState && window.GameState.isGamePaused()) return;
        if (!freeCameraMode) {
            player.updateFacing('down');
            player.playAnimation('walk');
            movePlayer(0, 1);
        }
    });
    
    k.onKeyPress("left", () => {
        if (window.GameState && window.GameState.isGamePaused()) return;
        if (!freeCameraMode) {
            player.updateFacing('left');
            player.playAnimation('walk');
            movePlayer(-1, 0);
        }
    });
    
    k.onKeyPress("right", () => {
        if (window.GameState && window.GameState.isGamePaused()) return;
        if (!freeCameraMode) {
            player.updateFacing('right');
            player.playAnimation('walk');
            movePlayer(1, 0);
        }
    });
    
    // Free camera movement (when in free camera mode)
    k.onKeyDown("up", () => {
        if (freeCameraMode) {
            CameraSystem.moveBy(0, -5);
        }
    });
    
    k.onKeyDown("down", () => {
        if (freeCameraMode) {
            CameraSystem.moveBy(0, 5);
        }
    });
    
    k.onKeyDown("left", () => {
        if (freeCameraMode) {
            CameraSystem.moveBy(-5, 0);
        }
    });
    
    k.onKeyDown("right", () => {
        if (freeCameraMode) {
            CameraSystem.moveBy(5, 0);
        }
    });
    
    // Mouse click debouncing variables
    let lastClickTime = 0;
    const CLICK_DEBOUNCE_MS = 100; // Minimum time between clicks
    
    // Target locking for consistent diagonal movement
    let lockedTarget = null;
    let targetLockTime = 0;
    const TARGET_LOCK_DURATION_MS = 2000; // Keep target locked for 2 seconds
    
    // Mouse-based movement
    k.onMouseDown((button) => {
        if (window.GameState && window.GameState.isGamePaused()) return; // Don't move when paused
        if (freeCameraMode) return; // Don't move player in free camera mode
        if (button !== "left") return; // Only respond to left clicks
        
        // Debounce rapid clicks to prevent over-movement
        const currentTime = Date.now();
        if (currentTime - lastClickTime < CLICK_DEBOUNCE_MS) {
            return; // Ignore clicks that are too rapid
        }
        lastClickTime = currentTime;
        
        const mousePos = k.mousePos();
        
        // Check if mousePos is valid
        if (!mousePos || mousePos.x === undefined || mousePos.y === undefined) {
            return;
        }
        
        // Only allow new movement if not currently moving
        if (player.isMoving) {
            return; // Don't interrupt movement - wait for it to complete
        }
        
        // Check if we should use locked target or calculate new one
        let targetGridX, targetGridY;
        
        // If we have a locked target and it's still valid, use it
        if (lockedTarget && (currentTime - targetLockTime) < TARGET_LOCK_DURATION_MS) {
            targetGridX = lockedTarget.x;
            targetGridY = lockedTarget.y;
        } else {
            // Calculate new target from mouse position
            const cameraPos = CameraSystem.getPosition();
            const cameraZoom = CameraSystem.getZoom();
            
            // Calculate world position accounting for camera offset and zoom
            const worldX = (mousePos.x - k.width()/2) / cameraZoom + cameraPos.x;
            const worldY = (mousePos.y - k.height()/2) / cameraZoom + cameraPos.y;
            
            targetGridX = Math.floor(worldX / 32);
            targetGridY = Math.floor(worldY / 32);
            
            // Lock this target if it's different from current player position
            if (targetGridX !== player.gridX || targetGridY !== player.gridY) {
                lockedTarget = { x: targetGridX, y: targetGridY };
                targetLockTime = currentTime;
            }
        }
        
        // Check if target is within valid grid bounds
        if (!GridUtils.isValidGridPosition(targetGridX, targetGridY)) {
            return; // Don't move to invalid positions
        }
        
        // Calculate movement direction (one step at a time)
        const deltaX = targetGridX - player.gridX;
        const deltaY = targetGridY - player.gridY;
        
        // Move one step towards the target
        let moveX = 0, moveY = 0;
        
        // If we're already at the target, clear lock and don't move
        if (deltaX === 0 && deltaY === 0) {
            lockedTarget = null;
            return;
        }
        
        // Improved diagonal movement: alternate between horizontal and vertical
        // This prevents "overshooting" in one direction
        if (Math.abs(deltaX) > 0 && Math.abs(deltaY) > 0) {
            // For diagonal movement, alternate based on which direction we moved last
            // Use a simple alternating pattern to create more natural diagonal movement
            const totalMoves = Math.abs(player.gridX - 23) + Math.abs(player.gridY - 17); // Distance from start
            if (totalMoves % 2 === 0) {
                // Even moves: prioritize the larger delta
                if (Math.abs(deltaX) >= Math.abs(deltaY)) {
                    moveX = deltaX > 0 ? 1 : -1;
                } else {
                    moveY = deltaY > 0 ? 1 : -1;
                }
            } else {
                // Odd moves: prioritize the smaller delta to balance movement
                if (Math.abs(deltaX) <= Math.abs(deltaY)) {
                    moveX = deltaX > 0 ? 1 : -1;
                } else {
                    moveY = deltaY > 0 ? 1 : -1;
                }
            }
        } else {
            // Pure horizontal or vertical movement
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                moveX = deltaX > 0 ? 1 : -1;
            } else {
                moveY = deltaY > 0 ? 1 : -1;
            }
        }
        
        if (moveX !== 0 || moveY !== 0) {
            // Update facing direction
            if (moveX > 0) player.updateFacing('right');
            else if (moveX < 0) player.updateFacing('left');
            else if (moveY > 0) player.updateFacing('down');
            else if (moveY < 0) player.updateFacing('up');
            
            player.playAnimation('walk');
            movePlayerSmooth(moveX, moveY);
        }
    });
    
    // Main update loop
    k.onUpdate(() => {
        try {
            // Get delta time safely
            const deltaTime = k.dt();
            if (typeof deltaTime !== 'number' || isNaN(deltaTime)) {
                console.warn('Invalid delta time, skipping update');
                return;
            }
            
            // Update camera system
            CameraSystem.update(k);
            
            // Update player animations
            PlayerEntity.updateAnimation(k, player, deltaTime);
            
            // Update AI system for all enemies
            if (window.AISystem) {
                AISystem.update(k, deltaTime);
            }
            
            // Update spawning system
            if (window.SpawningSystem) {
                SpawningSystem.update(k, deltaTime);
            }
            
            // Update combat system
            if (window.CombatSystem) {
                CombatSystem.update(k, deltaTime);
            }
            
            // Update interaction system
            if (window.InteractionSystem) {
                InteractionSystem.update();
            }
        } catch (error) {
            console.error('Error in main update loop:', error);
        }
        
        // Update pickup system
        if (window.pickupSystem) {
            window.pickupSystem.update();
        }
        
        // Update UI systems
        if (window.HealthBarUI) {
            HealthBarUI.update();
        }
        
        if (window.MessageUI) {
            MessageUI.update();
        }
        
        // Update tooltip UI
        if (window.TooltipUI) {
            window.TooltipUI.update();
        }
        
        // Update magic system
        if (window.magicSystem) {
            window.magicSystem.update();
        }
        
        // Update spell UI
        if (window.spellUI) {
            window.spellUI.update();
        }
        
        // Update combat UI based on combat state
        if (window.CombatUI && window.CombatSystem) {
            CombatUI.updateCombatState(
                CombatSystem.combatActive,
                CombatSystem.currentTurn,
                CombatSystem.combatQueue
            );
        }
        
        // Update UI displays
        const cameraPos = CameraSystem.getPosition();
        const cameraZoom = CameraSystem.getZoom();
        const cameraDebug = CameraSystem.getDebugInfo();
        
        // Update camera info
        cameraInfoText.text = `CAMERA INFO\n` +
            `Pos: ${Math.round(cameraPos.x)}, ${Math.round(cameraPos.y)}\n` +
            `Zoom: ${cameraZoom.toFixed(2)}x\n` +
            `Mode: ${freeCameraMode ? 'Free' : 'Follow'}\n` +
            `Grid: ${gridVisible ? 'On' : 'Off'}\n` +
            `Spawns: ${spawnPointsVisible ? 'On' : 'Off'}\n` +
            `Shake: ${cameraDebug.shake ? 'Active' : 'Off'}`;
        
        // Update player info
        const stats = player.getStats();
        playerInfoText.text = `\n` + // Skip title line
            `Level: ${stats.level}\n` +
            `HP: ${stats.health}/${stats.maxHealth}\n` +
            `MP: ${stats.mana}/${stats.maxMana}\n` +
            `ATK: ${stats.attack} DEF: ${stats.defense}\n` +
            `EXP: ${stats.experience}/${stats.experienceToNext}\n` +
            `Gold: ${stats.gold}\n` +
            `Items: ${stats.inventoryCount}/${stats.inventoryMax}\n` +
            `Grid: ${player.gridX}, ${player.gridY}\n` +
            `Pos: ${Math.round(player.pos.x)}, ${Math.round(player.pos.y)}\n` +
            `Facing: ${player.facing}`;
    });
    
    k.onKeyPress("escape", () => {
        console.log("🔑 ESCAPE key pressed - returning to menu");
        k.go("menu");
    });
    
    console.log("🎮 Game scene created with camera system demo");
    console.log("📷 Camera following player at", CameraSystem.getPosition());
    console.log("🗺️ World size: 1600x1200 pixels (50x37.5 tiles)");
    
    // Now restore state if we have saved state (after all objects are created)
    if (hasState) {
        console.log("🔄 Restoring saved state to newly created objects...");
        GameState.restoreState(k);
    }

// Create inventory overlay function
function createInventoryOverlay(k, player, closeCallback) {
    // Create overlay background
    const overlay = k.add([
        k.rect(k.width(), k.height()),
        k.color(0, 0, 0, 0.8), // Semi-transparent black
        k.pos(0, 0),
        k.fixed(), // Stay on screen regardless of camera
        k.z(1000) // High z-index to appear on top
    ]);
    
    // Inventory panel
    const panel = overlay.add([
        k.rect(600, 400),
        k.color(30, 30, 40),
        k.pos(k.width() / 2 - 300, k.height() / 2 - 200),
        k.outline(2, k.rgb(100, 100, 100))
    ]);
    
    // Title
    overlay.add([
        k.text("INVENTORY"),
        k.pos(k.width() / 2, k.height() / 2 - 170),
        k.anchor("center"),
        k.color(220, 180, 100)
    ]);
    
    // Player stats
    const stats = player.stats || {};
    const statsText = [
        `Level: ${stats.level || 1}`,
        `Health: ${stats.hp || 100}/${stats.maxHp || 100}`,
        `Mana: ${stats.mp || 50}/${stats.maxMp || 50}`,
        `Attack: ${stats.attack || 10}`,
        `Defense: ${stats.defense || 5}`,
        `Gold: ${stats.gold || 100}`,
        `EXP: ${stats.exp || 0}/${stats.expToNext || 100}`
    ];
    
    // Stats panel
    overlay.add([
        k.rect(250, 180),
        k.color(25, 25, 35),
        k.pos(k.width() / 2 - 280, k.height() / 2 - 130),
        k.outline(1, k.rgb(80, 80, 80))
    ]);
    
    overlay.add([
        k.text("PLAYER STATS"),
        k.pos(k.width() / 2 - 155, k.height() / 2 - 110),
        k.anchor("center"),
        k.color(180, 180, 180)
    ]);
    
    statsText.forEach((line, index) => {
        overlay.add([
            k.text(line),
            k.pos(k.width() / 2 - 270, k.height() / 2 - 85 + index * 18),
            k.color(200, 200, 200)
        ]);
    });
    
    // Inventory items panel
    overlay.add([
        k.rect(320, 180),
        k.color(25, 25, 35),
        k.pos(k.width() / 2 - 10, k.height() / 2 - 130),
        k.outline(1, k.rgb(80, 80, 80))
    ]);
    
    overlay.add([
        k.text("INVENTORY"),
        k.pos(k.width() / 2 + 150, k.height() / 2 - 110),
        k.anchor("center"),
        k.color(180, 180, 180)
    ]);
    
    // Display inventory items
    const inventory = player.inventory || [];
    if (inventory.length === 0) {
        overlay.add([
            k.text("No items in inventory"),
            k.pos(k.width() / 2 + 150, k.height() / 2 - 40),
            k.anchor("center"),
            k.color(150, 150, 150)
        ]);
    } else {
        // Display actual inventory items
        inventory.slice(0, 12).forEach((item, index) => { // Show max 12 items
            const x = k.width() / 2 + 20 + (index % 4) * 70;
            const y = k.height() / 2 - 80 + Math.floor(index / 4) * 50;
            
            // Item colors based on type
            const itemColors = {
                'gold': [255, 215, 0],
                'potion': [255, 100, 100],
                'sword': [192, 192, 192],
                'emerald': [100, 255, 100],
                'scroll': [255, 150, 0],
                'crystal': [150, 100, 255],
                'armor': [255, 200, 200],
                'key': [255, 255, 100],
                'gem': [100, 200, 255],
                'book': [200, 100, 50]
            };
            
            const itemColor = itemColors[item.type] || [200, 200, 200];
            
            overlay.add([
                k.rect(30, 30),
                k.color(...itemColor),
                k.pos(x, y),
                k.outline(1, k.rgb(80, 80, 80))
            ]);
            
            overlay.add([
                k.text(item.name || item.type),
                k.pos(x + 15, y + 35),
                k.anchor("center"),
                k.color(200, 200, 200)
            ]);
        });
    }
    
    // Controls
    overlay.add([
        k.text("Press I or ESC to close"),
        k.pos(k.width() / 2, k.height() / 2 + 150),
        k.anchor("center"),
        k.color(150, 150, 150)
    ]);
    
    // Handle ESC key to close inventory
    const escapeHandler = k.onKeyPress("escape", () => {
        closeCallback();
        escapeHandler.cancel(); // Remove this event handler
        console.log(" Inventory closed with ESC");
    });
    
    return overlay;
}

// Create inventory scene
createInventoryScene(k);



// Create game over scene
createGameOverScene(k);

// Debug canvas information
const gameCanvas = document.getElementById('game-canvas');
console.log(" Canvas element:", gameCanvas);
console.log(" Canvas dimensions:", gameCanvas.width, "x", gameCanvas.height);
console.log(" Canvas style:", gameCanvas.style.cssText);
const ctx = gameCanvas.getContext('2d');
console.log("🎨 Canvas context:", ctx);

// Debug: Scene information
console.log("🔍 Available scenes:", k.getScenes ? k.getScenes() : "getScenes not available");
console.log("🔍 Current scene:", k.getSceneName ? k.getSceneName() : "getSceneName not available");

// Log successful initialization with scene management
console.log("🎮 Castles of the Wind Clone - Kaplay Successfully Initialized!");
console.log("📋 Game Config:", GAME_CONFIG);
console.log(`🎯 Canvas: ${GAME_CONFIG.BASE_WIDTH}x${GAME_CONFIG.BASE_HEIGHT} @ ${GAME_CONFIG.FIXED_SCALE}x scale (FIXED)`);
console.log(`📐 Actual Size: ${k.width()}x${k.height()} pixels`);
console.log(`🎲 Tile Grid: ${GAME_CONFIG.GRID_WIDTH}x${GAME_CONFIG.GRID_HEIGHT} (${GAME_CONFIG.TILE_SIZE}px tiles)`);
console.log("🔧 Debug Mode:", GAME_CONFIG.DEBUG_MODE ? "ON" : "OFF");
console.log("🔒 Fixed Scaling: ENABLED (No Distortion)");
console.log("🖼️  Pixel Perfect: ENABLED");
console.log("🎭 Scene Management: ENABLED (Menu, Game, Inventory)");

// TODO: Asset loading will be implemented in assets.js
// TODO: Grid system will be implemented in utils/grid.js

        console.log('✅ Game scene initialization completed successfully!');
        console.log('🎮 Game should now be playable - staying in game scene');
        
        // Add a check to see if we're still in the game scene after a short delay
        setTimeout(() => {
            console.log('🔍 Scene check after 1 second:', k.getSceneName ? k.getSceneName() : 'unknown');
            if (k.getSceneName && k.getSceneName() !== 'game') {
                console.error('❌ Scene changed unexpectedly from game to:', k.getSceneName());
            }
        }, 1000);

    } catch (error) {
        console.error('❌ CRITICAL ERROR in game scene:', error);
        console.error('❌ Error stack:', error.stack);
        console.log('🔄 Reverting to menu due to game scene error...');
        k.go("menu");
    }

}); // End of game scene

// Create the original detailed menu scene
k.scene("menu", () => {
    // Clear any existing objects
    k.destroyAll();
    
    // Background
    k.add([
        k.rect(k.width(), k.height()),
        k.color(15, 15, 25), // Dark blue background
        k.pos(0, 0),
        k.z(-10)
    ]);
    
    // Title
    k.add([
        k.text("CASTLES OF THE WIND", {
            size: 48,
            font: "monospace",
            weight: "bold"
        }),
        k.pos(k.width() / 2, 120),
        k.anchor("center"),
        k.color(220, 180, 100), // Golden color
        "title"
    ]);
    
    // Subtitle
    k.add([
        k.text("A Classic Roguelike Adventure", {
            size: 24,
            font: "monospace"
        }),
        k.pos(k.width() / 2, 180),
        k.anchor("center"),
        k.color(180, 180, 180),
        "subtitle"
    ]);
    
    // Menu options
    const menuOptions = [
        { 
            text: "New Game", 
            action: () => {
                console.log("🔄 New Game button clicked!");
                console.log("🔍 Checking GameState availability:", !!window.GameState);
                console.log("🔍 GameState object:", window.GameState);
                
                // Reset game state for a fresh start
                if (window.GameState) {
                    console.log("✅ GameState found - calling resetForNewGame()");
                    console.log("🔄 Starting new game - resetting state...");
                    try {
                        GameState.resetForNewGame();
                        console.log("✅ resetForNewGame() completed");
                    } catch (error) {
                        console.error("❌ Error in resetForNewGame():", error);
                    }
                } else {
                    console.error("❌ GameState not available on window object!");
                }
                
                console.log("🎮 About to switch to game scene...");
                console.log("🔍 Current scene before switch:", k.getSceneName ? k.getSceneName() : "unknown");
                
                try {
                    k.go("game");
                    console.log("✅ k.go('game') called successfully");
                } catch (error) {
                    console.error("❌ Error calling k.go('game'):", error);
                }
            }
        },
        { text: "Load Game", action: () => console.log("Load game not implemented yet") },
        { text: "Settings", action: () => console.log("Settings not implemented yet") },
        { text: "Exit", action: () => console.log("Exit game") }
    ];
    
    let selectedOption = 0;
    
    // Create menu buttons
    menuOptions.forEach((option, index) => {
        const button = k.add([
            k.text(option.text, {
                size: 28,
                font: "monospace"
            }),
            k.pos(k.width() / 2, 280 + index * 60),
            k.anchor("center"),
            k.color(selectedOption === index ? [255, 255, 100] : [200, 200, 200]),
            k.area(),
            "menu-option",
            { 
                index: index,
                action: option.action,
                isSelected: selectedOption === index
            }
        ]);
        
        // Mouse hover effect
        button.onHover(() => {
            if (selectedOption !== index) {
                selectedOption = index;
                updateMenuSelection();
            }
        });
        
        // Mouse click
        button.onClick(() => {
            option.action();
        });
    });
    
    // Function to update menu selection visual
    function updateMenuSelection() {
        k.get("menu-option").forEach((option) => {
            if (option.index === selectedOption) {
                option.color = k.rgb(255, 255, 100); // Highlight color
                option.isSelected = true;
            } else {
                option.color = k.rgb(200, 200, 200); // Normal color
                option.isSelected = false;
            }
        });
    }
    
    // Keyboard navigation
    k.onKeyPress("up", () => {
        selectedOption = (selectedOption - 1 + menuOptions.length) % menuOptions.length;
        updateMenuSelection();
    });
    
    k.onKeyPress("down", () => {
        selectedOption = (selectedOption + 1) % menuOptions.length;
        updateMenuSelection();
    });
    
    k.onKeyPress("enter", () => {
        menuOptions[selectedOption].action();
    });
    
    k.onKeyPress("space", () => {
        menuOptions[selectedOption].action();
    });
    
    // Version info
    k.add([
        k.text("v0.1.0 - Phase 1 MVP", {
            size: 16,
            font: "monospace"
        }),
        k.pos(20, k.height() - 30),
        k.color(120, 120, 120),
        "version"
    ]);
    
    // Controls info
    k.add([
        k.text("Use ARROW KEYS or MOUSE to navigate • ENTER/SPACE to select", {
            size: 14,
            font: "monospace"
        }),
        k.pos(k.width() / 2, k.height() - 60),
        k.anchor("center"),
        k.color(150, 150, 150),
        "controls"
    ]);
    
    // Debug info (if debug mode is enabled)
    if (window.GAME_CONFIG && window.GAME_CONFIG.DEBUG_MODE) {
        k.add([
            k.text("DEBUG MODE - Press F1 for debug info", {
                size: 12,
                font: "monospace"
            }),
            k.pos(k.width() - 20, 20),
            k.anchor("topright"),
            k.color(255, 100, 100),
            "debug-info"
        ]);
    }
    
    console.log("📋 Menu scene loaded");
});

// Start the game by going to the menu scene (only on initial load)
if (!window.gameInitialized) {
    window.gameInitialized = true;
    console.log("🚀 Initial game load - going to menu scene");
    k.go("menu");
}

}); // End of DOMContentLoaded event listener