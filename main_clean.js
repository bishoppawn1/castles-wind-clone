// Castles of the Wind Clone - Clean Working Version
// Simplified to get the game running without errors

// Game configuration
const GAME_CONFIG = {
    TILE_SIZE: 32,
    GRID_WIDTH: 32,
    GRID_HEIGHT: 18,
    DEBUG_MODE: true,
    BASE_WIDTH: 1024,
    FIXED_SCALE: 1.0
};

// Initialize Kaplay
const k = kaplay({
    canvas: document.getElementById('game-canvas'),
    width: 1024,
    height: 576,
    scale: 1.0,
    crisp: true,
    stretch: false,
    letterbox: true,
    debug: GAME_CONFIG.DEBUG_MODE
});

// Simple menu scene
k.scene("menu", () => {
    // Background
    k.add([
        k.rect(k.width(), k.height()),
        k.color(15, 15, 25),
        k.pos(0, 0),
        k.z(-10)
    ]);
    
    // Title
    k.add([
        k.text("CASTLES OF THE WIND", {
            size: 48,
            font: "monospace"
        }),
        k.pos(k.width() / 2, 120),
        k.anchor("center"),
        k.color(220, 180, 100)
    ]);
    
    // Subtitle
    k.add([
        k.text("A Roguelike Adventure", {
            size: 20,
            font: "monospace"
        }),
        k.pos(k.width() / 2, 180),
        k.anchor("center"),
        k.color(180, 180, 180)
    ]);
    
    // Menu options
    const menuOptions = [
        { text: "New Game", action: () => k.go("game") },
        { text: "Load Game", action: () => console.log("Load game not implemented") },
        { text: "Settings", action: () => console.log("Settings not implemented") },
        { text: "Exit", action: () => console.log("Exit game") }
    ];
    
    let selectedOption = 0;
    
    menuOptions.forEach((option, index) => {
        const isSelected = index === selectedOption;
        k.add([
            k.text(option.text, {
                size: 24,
                font: "monospace"
            }),
            k.pos(k.width() / 2, 280 + index * 50),
            k.anchor("center"),
            k.color(isSelected ? 255 : 150, isSelected ? 255 : 150, isSelected ? 255 : 150),
            `menu-option-${index}`
        ]);
    });
    
    // Menu controls
    k.onKeyPress("enter", () => {
        menuOptions[selectedOption].action();
    });
    
    k.onKeyPress("up", () => {
        selectedOption = (selectedOption - 1 + menuOptions.length) % menuOptions.length;
        k.go("menu"); // Refresh menu
    });
    
    k.onKeyPress("down", () => {
        selectedOption = (selectedOption + 1) % menuOptions.length;
        k.go("menu"); // Refresh menu
    });
    
    console.log("📋 Menu scene created");
});

// Simple game scene
k.scene("game", () => {
    // Background
    k.add([
        k.rect(k.width(), k.height()),
        k.color(25, 25, 35),
        k.pos(0, 0),
        k.z(-10)
    ]);
    
    // Game area
    k.add([
        k.rect(800, 500),
        k.color(35, 35, 45),
        k.pos(112, 38),
        k.outline(2, k.rgb(100, 100, 100)),
        k.z(-5)
    ]);
    
    // Simple player
    const player = k.add([
        k.rect(24, 24),
        k.color(70, 130, 180),
        k.outline(2, k.rgb(40, 40, 40)),
        k.pos(512, 288), // Center of screen
        k.anchor("center"),
        k.area(),
        k.z(10),
        "player",
        {
            gridX: 16,
            gridY: 9,
            health: 100,
            level: 1
        }
    ]);
    
    // Some walls
    const walls = [
        { x: 200, y: 200 }, { x: 232, y: 200 }, { x: 264, y: 200 },
        { x: 200, y: 232 }, { x: 264, y: 232 },
        { x: 200, y: 264 }, { x: 232, y: 264 }, { x: 264, y: 264 }
    ];
    
    walls.forEach(wall => {
        k.add([
            k.rect(32, 32),
            k.color(60, 60, 60),
            k.pos(wall.x, wall.y),
            k.outline(1, k.rgb(40, 40, 40)),
            k.z(5),
            "wall"
        ]);
    });
    
    // Some items
    const items = [
        { x: 400, y: 200, color: [255, 215, 0], type: "gold" },
        { x: 600, y: 300, color: [255, 100, 100], type: "potion" },
        { x: 300, y: 400, color: [192, 192, 192], type: "sword" }
    ];
    
    items.forEach(item => {
        k.add([
            k.rect(16, 16),
            k.color(...item.color),
            k.pos(item.x, item.y),
            k.anchor("center"),
            k.z(8),
            "item",
            { itemType: item.type }
        ]);
    });
    
    // UI
    k.add([
        k.text("CASTLES OF THE WIND - DEMO", {
            size: 24,
            font: "monospace"
        }),
        k.pos(k.width() / 2, 20),
        k.anchor("center"),
        k.color(220, 180, 100)
    ]);
    
    k.add([
        k.text("WASD: Move | ESC: Menu", {
            size: 12,
            font: "monospace"
        }),
        k.pos(k.width() / 2, k.height() - 20),
        k.anchor("center"),
        k.color(150, 150, 150)
    ]);
    
    // Player stats
    const statsText = k.add([
        k.text("", {
            size: 12,
            font: "monospace"
        }),
        k.pos(20, 20),
        k.color(200, 200, 200)
    ]);
    
    // Movement
    function movePlayer(dx, dy) {
        const newX = player.pos.x + dx * 32;
        const newY = player.pos.y + dy * 32;
        
        // Simple boundary check
        if (newX >= 130 && newX <= 894 && newY >= 56 && newY <= 520) {
            // Check for wall collision
            const walls = k.get("wall");
            const blocked = walls.some(wall => 
                Math.abs(wall.pos.x + 16 - newX) < 24 && 
                Math.abs(wall.pos.y + 16 - newY) < 24
            );
            
            if (!blocked) {
                player.pos.x = newX;
                player.pos.y = newY;
                
                // Check for item pickup
                const items = k.get("item");
                items.forEach(item => {
                    if (Math.abs(item.pos.x - newX) < 20 && Math.abs(item.pos.y - newY) < 20) {
                        console.log(`Picked up ${item.itemType}!`);
                        k.destroy(item);
                    }
                });
            }
        }
    }
    
    // Controls
    k.onKeyPress("w", () => movePlayer(0, -1));
    k.onKeyPress("s", () => movePlayer(0, 1));
    k.onKeyPress("a", () => movePlayer(-1, 0));
    k.onKeyPress("d", () => movePlayer(1, 0));
    k.onKeyPress("escape", () => k.go("menu"));
    
    // Update stats
    k.onUpdate(() => {
        statsText.text = `Level: ${player.level}\nHealth: ${player.health}\nPos: ${Math.round(player.pos.x)}, ${Math.round(player.pos.y)}`;
    });
    
    console.log("🎮 Game scene created");
});

// Start the game
k.go("menu");
console.log("✅ Game initialized successfully!");
