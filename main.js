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

// Menu scene is loaded from scenes/menu.js with proper New Game state reset functionality
if (typeof createMenuScene === 'function') {
    createMenuScene(k);
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
    // Initialize game state manager
    if (!GameState.isInitialized) {
        GameState.init();
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
    
    // Create simple level tiles for demonstration
    // This will be replaced by the level system
    createDemoLevel(k);
    
    // Draw debug grid (optional)
    let levelGridVisible = false;
    if (levelGridVisible) {
        GridUtils.drawDebugGrid(k, {
            color: [80, 80, 100],
            opacity: 0.3
        });
    }
    
    // Create player using PlayerEntity system
    const playerGridPos = { x: 23, y: 17 }; // Center of ~47x34 grid
    const player = PlayerEntity.create(k, playerGridPos.x, playerGridPos.y, {
        SPRITE_SIZE: 24,
        SPRITE_COLOR: [100, 150, 255]
    });
    
    // Set camera to follow player
    CameraSystem.followTarget(player, true);
    
    // Make player globally accessible for inventory scene
    window.currentPlayer = player;
    
    // Create multiple rooms/areas across the world
    
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
        k.text("STARTING ROOM", { size: 16, font: "monospace" }),
        k.pos(GridUtils.createGridPos(22, 14, true).x, GridUtils.createGridPos(22, 14, true).y),
        k.anchor("center"),
        k.color(150, 150, 150),
        k.z(15)
    ]);
    
    k.add([
        k.text("TREASURE ROOM", { size: 12, font: "monospace" }),
        k.pos(GridUtils.createGridPos(8, 5, true).x, GridUtils.createGridPos(8, 5, true).y),
        k.anchor("center"),
        k.color(150, 150, 150),
        k.z(15)
    ]);
    
    k.add([
        k.text("ARMORY", { size: 12, font: "monospace" }),
        k.pos(GridUtils.createGridPos(38, 27, true).x, GridUtils.createGridPos(38, 27, true).y),
        k.anchor("center"),
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
        k.text("CAMERA SYSTEM DEMO", {
            size: 24,
            font: "monospace"
        }),
        k.pos(k.width() / 2, 20),
        k.anchor("center"),
        k.color(220, 180, 100)
    ]);
    
    // Controls info (fixed position)
    uiLayer.add([
        k.text("WASD: Move | I: Inventory | G: Grid | C: Free Cam | Z/X: Zoom | SPACE: Shake | ESC: Menu", {
            size: 10,
            font: "monospace"
        }),
        k.pos(k.width() / 2, k.height() - 20),
        k.anchor("center"),
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
        k.text("", {
            size: 10,
            font: "monospace"
        }),
        k.pos(k.width() - 205, 15),
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
        k.text("", {
            size: 9,
            font: "monospace"
        }),
        k.pos(15, 15),
        k.color(200, 200, 200)
    ]);
    
    // Add player stats title
    uiLayer.add([
        k.text("PLAYER STATS", {
            size: 10,
            font: "monospace"
        }),
        k.pos(15, 15),
        k.color(220, 180, 100)
    ]);
    
    // Player movement using grid system
    function movePlayer(dx, dy) {
        const newGridX = player.gridX + dx;
        const newGridY = player.gridY + dy;
        
        // Check if new position is valid and not blocked by walls
        if (GridUtils.isValidGridPosition(newGridX, newGridY)) {
            // Check for wall collision
            const walls = k.get("wall");
            const blocked = walls.some(wall => wall.gridX === newGridX && wall.gridY === newGridY);
            
            if (!blocked) {
                player.gridX = newGridX;
                player.gridY = newGridY;
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
            }
        }
    }
    
    // Smooth movement function for mouse-based movement
    function movePlayerSmooth(dx, dy) {
        const newGridX = player.gridX + dx;
        const newGridY = player.gridY + dy;
        
        // Check if new position is valid and not blocked by walls
        if (GridUtils.isValidGridPosition(newGridX, newGridY)) {
            // Check for wall collision
            const walls = k.get("wall");
            const blocked = walls.some(wall => wall.gridX === newGridX && wall.gridY === newGridY);
            
            if (!blocked) {
                // Update grid position
                player.gridX = newGridX;
                player.gridY = newGridY;
                
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
        player.updateFacing('up');
        player.playAnimation('walk');
        movePlayer(0, -1);
    });
    k.onKeyPress("s", () => {
        player.updateFacing('down');
        player.playAnimation('walk');
        movePlayer(0, 1);
    });
    k.onKeyPress("a", () => {
        player.updateFacing('left');
        player.playAnimation('walk');
        movePlayer(-1, 0);
    });
    k.onKeyPress("d", () => {
        player.updateFacing('right');
        player.playAnimation('walk');
        movePlayer(1, 0);
    });
    
    // Attack animation for testing
    k.onKeyPress("space", () => {
        player.playAnimation('attack');
        CameraSystem.shake(15, 300);
        console.log("⚔️ Player attacks!");
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
    
    // Toggle free camera mode
    k.onKeyPress("c", () => {
        freeCameraMode = !freeCameraMode;
        if (freeCameraMode) {
            CameraSystem.stopFollowing();
            console.log("📷 Free camera mode enabled - use arrow keys to move camera");
        } else {
            CameraSystem.followTarget(player);
            console.log("📷 Following player again");
        }
    });
    
    // Camera zoom controls
    k.onKeyPress("z", () => {
        CameraSystem.zoomOut();
        console.log(`📷 Zoom: ${CameraSystem.getZoom().toFixed(2)}x`);
    });
    
    k.onKeyPress("x", () => {
        CameraSystem.zoomIn();
        console.log(`📷 Zoom: ${CameraSystem.getZoom().toFixed(2)}x`);
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
    
    // Open inventory
    k.onKeyPress("i", () => {
        console.log("🎒 Opening inventory...");
        // Save current game state before switching to inventory
        GameState.saveState(k);
        k.go("inventory");
    });
    
    // Arrow key movement (when not in free camera mode) and free camera movement
    k.onKeyPress("up", () => {
        if (!freeCameraMode) {
            player.updateFacing('up');
            player.playAnimation('walk');
            movePlayer(0, -1);
        }
    });
    
    k.onKeyPress("down", () => {
        if (!freeCameraMode) {
            player.updateFacing('down');
            player.playAnimation('walk');
            movePlayer(0, 1);
        }
    });
    
    k.onKeyPress("left", () => {
        if (!freeCameraMode) {
            player.updateFacing('left');
            player.playAnimation('walk');
            movePlayer(-1, 0);
        }
    });
    
    k.onKeyPress("right", () => {
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
        // Update camera system
        CameraSystem.update(k);
        
        // Update player animations
        PlayerEntity.updateAnimation(k, player, k.dt());
        
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

// Create inventory scene
createInventoryScene(k);

// Debug canvas information
const gameCanvas = document.getElementById('game-canvas');
console.log("🖼️ Canvas element:", gameCanvas);
console.log("🖼️ Canvas dimensions:", gameCanvas.width, "x", gameCanvas.height);
console.log("🖼️ Canvas style:", gameCanvas.style.cssText);
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
