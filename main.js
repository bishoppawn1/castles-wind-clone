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
    
    // Background color (dark medieval theme)
    background: [20, 20, 30],
    
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
    
    // Initialize game state manager
    if (!GameState.isInitialized) {
        GameState.init();
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
    
    // Procedural dungeon: generate and load
    try {
        const DG = (typeof window !== "undefined" && window.DungeonGenerator) ? window.DungeonGenerator : DungeonGenerator;
        const levelData = DG.generate(50, 38, { tileSize: 32 });
        console.log("🧭 Generated procedural dungeon level", { width: 50, height: 38, tileSize: 32 });
        if (window.LevelSystem && typeof LevelSystem.loadLevelData === "function") {
            LevelSystem.loadLevelData(k, levelData);
        } else {
            console.error("❌ LevelSystem not available; cannot load generated level");
        }
        // Store for inspection
        window.currentLevelData = levelData;
    } catch (err) {
        console.error("❌ Dungeon generation failed; falling back to LEVEL_1", err);
        if (window.LevelSystem && typeof LevelSystem.loadLevel === "function") {
            LevelSystem.loadLevel(k, 1);
            window.currentLevelData = LevelSystem.currentLevelData;
        }
    }
    
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
        : (window.currentLevelData && window.currentLevelData.playerSpawn) ? window.currentLevelData.playerSpawn : { x: 23, y: 17 };
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
    
    // Title (fixed position)
    uiLayer.add([
        k.text("CAMERA SYSTEM DEMO"),
        k.pos(k.width() / 2, 20),
        k.anchor("center"),
        k.scale(0.4),
        k.color(220, 180, 100)
    ]);
    
    // Controls info (fixed position)
    uiLayer.add([
        k.text("WASD: Move | I: Inventory | G: Grid | SPACE: Attack | ESC: Menu"),
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
    
    // Player movement using grid system
    function movePlayer(dx, dy) {
        const newGridX = player.gridX + dx;
        const newGridY = player.gridY + dy;
        
        // Check if new position is valid and not blocked
        if (GridUtils.isValidGridPosition(newGridX, newGridY)) {
            // Unified walkability check via LevelSystem.isWalkable()
            const canMove = (window.LevelSystem && typeof LevelSystem.isWalkable === 'function')
                ? LevelSystem.isWalkable(newGridX, newGridY)
                : !k.get("wall").some(wall => wall.gridX === newGridX && wall.gridY === newGridY);
            
            if (canMove) {
                player.gridX = newGridX;
                player.gridY = newGridY;

                // Update fog of war around player
                if (window.LevelSystem && typeof LevelSystem.updateFogOfWar === 'function') {
                    try {
                        LevelSystem.updateFogOfWar(k, player.gridX, player.gridY);
                    } catch (err) {
                        console.warn('Fog of war update failed during move:', err);
                    }
                }

                const newPixelPos = GridUtils.createGridPos(newGridX, newGridY, true);
                
                // Animate movement
                player.playAnimation('walk');
                player.isMoving = true;
                
                // Smooth movement tween
                k.tween(player.pos, k.vec2(newPixelPos.x, newPixelPos.y), 0.15, (pos) => {
                    if (player.exists()) {
                        player.pos = pos;
                    }
                }, k.easings.easeOutQuad).then(() => {
                    if (player.exists()) {
                        player.isMoving = false;
                        player.playAnimation('idle');
                    }
                });
                
                // Check for item pickup
                const items = k.get("item");
                items.forEach(item => {
                    if (item.gridX === newGridX && item.gridY === newGridY) {
                        // Create item object for inventory
                        const itemData = {
                            id: `${item.itemType}_${Date.now()}`,
                            name: item.itemType,
                            type: item.itemType,
                            value: getItemValue(item.itemType),
                            description: getItemDescription(item.itemType)
                        };
                        
                        // Add to player inventory through GameState
                        GameState.playerState.inventory.push(itemData);
                        GameState.playerState.stats.inventoryCount++;
                        
                        // Track collected item in world state
                        const itemId = `${item.itemType}_${item.gridX}_${item.gridY}`;
                        GameState.worldState.itemsCollected.push(itemId);
                        
                        console.log(`Picked up ${item.itemType}! (ID: ${itemId})`);
                        itemsCollected++;
                        
                        // Grant experience for finding items
                        if (player.gainExperience) {
                            player.gainExperience(80); // Temporarily high for testing level up
                        }
                        
                        k.destroy(item);
                        
                        // Shake camera on item pickup
                        CameraSystem.shake(8, 200);
                    }
                });
                
                // Process poison damage after player action
                if (window.magicSystem) {
                    window.magicSystem.processEntityAction(player);
                }
            }
        }
    }
    
    // Smooth movement function for mouse-based movement
    function movePlayerSmooth(dx, dy) {
        const newGridX = player.gridX + dx;
        const newGridY = player.gridY + dy;
        
        // Check if new position is valid and not blocked
        if (GridUtils.isValidGridPosition(newGridX, newGridY)) {
            // Unified walkability check via LevelSystem.isWalkable()
            const canMove = (window.LevelSystem && typeof LevelSystem.isWalkable === 'function')
                ? LevelSystem.isWalkable(newGridX, newGridY)
                : !k.get("wall").some(wall => wall.gridX === newGridX && wall.gridY === newGridY);
            
            if (canMove) {
                // Update grid position
                player.gridX = newGridX;
                player.gridY = newGridY;
                
                // Update fog of war around player
                if (window.LevelSystem && typeof LevelSystem.updateFogOfWar === 'function') {
                    try {
                        LevelSystem.updateFogOfWar(k, player.gridX, player.gridY);
                    } catch (err) {
                        console.warn('Fog of war update failed during move:', err);
                    }
                }
                
                // Calculate pixel position
                const newPixelPos = GridUtils.gridToPixel(newGridX, newGridY);
                player.isMoving = true;
                
                // Store tween reference for potential cancellation
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
                
                // Check for item pickup
                const items = k.get("item");
                items.forEach(item => {
                    if (item.gridX === newGridX && item.gridY === newGridY) {
                        // Create item object for inventory
                        const itemData = {
                            id: `${item.itemType}_${Date.now()}`,
                            name: item.itemType,
                            type: item.itemType,
                            value: getItemValue(item.itemType),
                            description: getItemDescription(item.itemType)
                        };
                        
                        // Add to player inventory through GameState
                        GameState.playerState.inventory.push(itemData);
                        GameState.playerState.stats.inventoryCount++;
                        
                        // Track collected item in world state
                        const itemId = `${item.itemType}_${item.gridX}_${item.gridY}`;
                        GameState.worldState.itemsCollected.push(itemId);
                        
                        console.log(`Picked up ${item.itemType}! (ID: ${itemId})`);
                        itemsCollected++;
                        
                        // Grant experience for finding items
                        if (player.gainExperience) {
                            player.gainExperience(80); // Temporarily high for testing level up
                        }
                        
                        // Handle item effects
                        handleItemPickup(player, item.itemType);
                        
                        k.destroy(item);
                        
                        // Shake camera on item pickup
                        CameraSystem.shake(8, 200);
                    }
                });
            }
        }
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
    
    // Camera and display state
    let gridVisible = true;
    let freeCameraMode = false;
    let itemsCollected = 0;
    
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
    
    // Help key
    k.onKeyPress("h", () => {
        if (window.MessageSystem) {
            window.MessageSystem.addMessage('Help: WASD to move, SPACE to attack, I for inventory', 'info');
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
    
    k.onKeyPress("escape", () => k.go("menu"));
    
    console.log("🎮 Game scene created with camera system demo");
    console.log("📷 Camera following player at", CameraSystem.getPosition());
    console.log("🗺️ World size: 1600x1200 pixels (50x37.5 tiles)");
    
    // Now restore state if we have saved state (after all objects are created)
    if (hasState) {
        console.log("🔄 Restoring saved state to newly created objects...");
        GameState.restoreState(k);
    }
});

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

// Debug canvas information
const gameCanvas = document.getElementById('game-canvas');
console.log(" Canvas element:", gameCanvas);
console.log(" Canvas dimensions:", gameCanvas.width, "x", gameCanvas.height);
console.log(" Canvas style:", gameCanvas.style.cssText);
const ctx = gameCanvas.getContext('2d');
console.log("🎨 Canvas context:", ctx);

// Start with the menu scene for proper New Game functionality
console.log("🔄 About to switch to menu scene...");
console.log("🔍 Available scenes:", k.getScenes ? k.getScenes() : "getScenes not available");
k.go("menu");
console.log("✅ k.go('menu') called - should now be in menu scene");
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

}); // End of DOMContentLoaded event listener
