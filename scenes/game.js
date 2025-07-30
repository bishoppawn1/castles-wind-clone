// Castles of the Wind Clone - Game Scene
// Main gameplay scene where the action happens

function createGameScene(k) {
    // Define the main game scene
    k.scene("game", () => {
        // Clear any existing objects
        k.destroyAll();
        
        // Background
        k.add([
            k.rect(k.width(), k.height()),
            k.color(25, 25, 35), // Darker background for gameplay
            k.pos(0, 0),
            k.z(-10)
        ]);
        
        // Game area (where the dungeon will be rendered)
        const gameArea = k.add([
            k.rect(800, 500),
            k.color(40, 40, 50),
            k.pos(50, 50),
            k.outline(2, k.rgb(100, 100, 100)),
            "game-area"
        ]);
        
        // Temporary placeholder for the game world
        k.add([
            k.text("GAME WORLD", {
                size: 32,
                font: "monospace"
            }),
            k.pos(gameArea.pos.x + gameArea.width / 2, gameArea.pos.y + gameArea.height / 2),
            k.anchor("center"),
            k.color(150, 150, 150),
            "placeholder"
        ]);
        
        // UI Panel (right side)
        const uiPanel = k.add([
            k.rect(150, 500),
            k.color(30, 30, 40),
            k.pos(870, 50),
            k.outline(2, k.rgb(100, 100, 100)),
            "ui-panel"
        ]);
        
        // Player stats placeholder
        k.add([
            k.text("PLAYER", {
                size: 16,
                font: "monospace",
                weight: "bold"
            }),
            k.pos(uiPanel.pos.x + 10, uiPanel.pos.y + 20),
            k.color(220, 180, 100),
            "player-label"
        ]);
        
        k.add([
            k.text("Health: 100/100", {
                size: 12,
                font: "monospace"
            }),
            k.pos(uiPanel.pos.x + 10, uiPanel.pos.y + 50),
            k.color(200, 100, 100),
            "health-display"
        ]);
        
        k.add([
            k.text("Mana: 50/50", {
                size: 12,
                font: "monospace"
            }),
            k.pos(uiPanel.pos.x + 10, uiPanel.pos.y + 70),
            k.color(100, 100, 200),
            "mana-display"
        ]);
        
        k.add([
            k.text("Level: 1", {
                size: 12,
                font: "monospace"
            }),
            k.pos(uiPanel.pos.x + 10, uiPanel.pos.y + 90),
            k.color(180, 180, 180),
            "level-display"
        ]);
        
        // Inventory section
        k.add([
            k.text("INVENTORY", {
                size: 14,
                font: "monospace",
                weight: "bold"
            }),
            k.pos(uiPanel.pos.x + 10, uiPanel.pos.y + 130),
            k.color(220, 180, 100),
            "inventory-label"
        ]);
        
        // Placeholder inventory slots
        for (let i = 0; i < 6; i++) {
            k.add([
                k.rect(20, 20),
                k.color(50, 50, 60),
                k.pos(uiPanel.pos.x + 10 + (i % 3) * 25, uiPanel.pos.y + 160 + Math.floor(i / 3) * 25),
                k.outline(1, k.rgb(80, 80, 90)),
                "inventory-slot"
            ]);
        }
        
        // Spells section
        k.add([
            k.text("SPELLS", {
                size: 14,
                font: "monospace",
                weight: "bold"
            }),
            k.pos(uiPanel.pos.x + 10, uiPanel.pos.y + 230),
            k.color(220, 180, 100),
            "spells-label"
        ]);
        
        // Placeholder spell slots
        const spells = ["Heal", "Fire", "Ice", "Light"];
        spells.forEach((spell, index) => {
            k.add([
                k.text(`${index + 1}. ${spell}`, {
                    size: 10,
                    font: "monospace"
                }),
                k.pos(uiPanel.pos.x + 10, uiPanel.pos.y + 250 + index * 20),
                k.color(150, 150, 200),
                "spell-slot"
            ]);
        });
        
        // Message log area
        const messageArea = k.add([
            k.rect(k.width() - 100, 80),
            k.color(20, 20, 30),
            k.pos(50, k.height() - 130),
            k.outline(2, k.rgb(100, 100, 100)),
            "message-area"
        ]);
        
        k.add([
            k.text("MESSAGE LOG", {
                size: 12,
                font: "monospace",
                weight: "bold"
            }),
            k.pos(messageArea.pos.x + 10, messageArea.pos.y + 10),
            k.color(220, 180, 100),
            "message-label"
        ]);
        
        k.add([
            k.text("Welcome to Castles of the Wind!", {
                size: 10,
                font: "monospace"
            }),
            k.pos(messageArea.pos.x + 10, messageArea.pos.y + 30),
            k.color(180, 180, 180),
            "message-text"
        ]);
        
        k.add([
            k.text("Use WASD or arrow keys to move.", {
                size: 10,
                font: "monospace"
            }),
            k.pos(messageArea.pos.x + 10, messageArea.pos.y + 45),
            k.color(150, 150, 150),
            "message-text"
        ]);
        
        // Game controls
        k.onKeyPress("escape", () => {
            console.log("Returning to menu...");
            k.go("menu");
        });
        
        k.onKeyPress("i", () => {
            console.log("Opening inventory...");
            k.go("inventory");
        });
        
        k.onKeyPress("tab", () => {
            console.log("Opening inventory...");
            k.go("inventory");
        });
        
        // Movement keys (placeholder - will be implemented in movement system)
        k.onKeyPress("w", () => console.log("Move up"));
        k.onKeyPress("a", () => console.log("Move left"));
        k.onKeyPress("s", () => console.log("Move down"));
        k.onKeyPress("d", () => console.log("Move right"));
        
        k.onKeyPress("up", () => console.log("Move up"));
        k.onKeyPress("left", () => console.log("Move left"));
        k.onKeyPress("down", () => console.log("Move down"));
        k.onKeyPress("right", () => console.log("Move right"));
        
        // Spell casting (placeholder)
        for (let i = 1; i <= 4; i++) {
            k.onKeyPress(i.toString(), () => {
                console.log(`Cast spell ${i}`);
            });
        }
        
        // Debug info
        if (window.GAME_CONFIG && window.GAME_CONFIG.DEBUG_MODE) {
            k.add([
                k.text("GAME SCENE - ESC: Menu | I/TAB: Inventory | WASD: Move | 1-4: Spells", {
                    size: 10,
                    font: "monospace"
                }),
                k.pos(10, 10),
                k.color(255, 100, 100),
                "debug-controls"
            ]);
        }
        
        console.log("🎮 Game scene loaded");
    });
}

// Export the scene creation function
if (typeof module !== 'undefined' && module.exports) {
    module.exports = createGameScene;
}
