// Castles of the Wind Clone - Inventory Scene
// Displays player stats and inventory items

function createInventoryScene(k) {
    k.scene("inventory", () => {
        // Don't destroy everything - we want to preserve game state
        // k.destroyAll(); // REMOVED
        
        // Background
        k.add([
            k.rect(k.width(), k.height()),
            k.color(20, 20, 30),
            k.pos(0, 0),
            k.z(-10)
        ]);
        
        // Title
        k.add([
            k.text("INVENTORY", {
                size: 32,
                font: "monospace"
            }),
            k.pos(k.width() / 2, 40),
            k.anchor("center"),
            k.color(220, 180, 100)
        ]);
        
        // Get real player stats from GameState
        const playerStats = GameState.getPlayerStats();
        const statsText = [
            `Level: ${playerStats.level}`,
            `Health: ${playerStats.hp}/${playerStats.maxHp}`,
            `Mana: ${playerStats.mp}/${playerStats.maxMp}`,
            `Attack: ${playerStats.attack}`,
            `Defense: ${playerStats.defense}`,
            `Gold: ${playerStats.gold}`,
            `EXP: ${playerStats.exp}/${playerStats.expToNext}`
        ];
        
        // Stats panel
        k.add([
            k.rect(300, 200),
            k.color(30, 30, 40),
            k.pos(50, 100),
            k.outline(2, k.rgb(100, 100, 100))
        ]);
        
        k.add([
            k.text("PLAYER STATS", {
                size: 16,
                font: "monospace"
            }),
            k.pos(200, 120),
            k.anchor("center"),
            k.color(180, 180, 180)
        ]);
        
        statsText.forEach((line, index) => {
            k.add([
                k.text(line, {
                    size: 12,
                    font: "monospace"
                }),
                k.pos(70, 150 + index * 20),
                k.color(200, 200, 200)
            ]);
        });
        
        // Simple inventory display
        k.add([
            k.rect(600, 300),
            k.color(30, 30, 40),
            k.pos(374, 100),
            k.outline(2, k.rgb(100, 100, 100))
        ]);
        
        k.add([
            k.text("INVENTORY", {
                size: 16,
                font: "monospace"
            }),
            k.pos(674, 120),
            k.anchor("center"),
            k.color(180, 180, 180)
        ]);
        
        // Get real player inventory from GameState
        const playerInventory = GameState.getPlayerInventory();
        
        // Display inventory items or show empty message
        if (playerInventory.length === 0) {
            k.add([
                k.text("No items in inventory", {
                    size: 14,
                    font: "monospace"
                }),
                k.pos(674, 200),
                k.anchor("center"),
                k.color(150, 150, 150)
            ]);
        } else {
            // Display actual inventory items
            playerInventory.slice(0, 15).forEach((item, index) => { // Show max 15 items
                const x = 400 + (index % 5) * 60;
                const y = 160 + Math.floor(index / 5) * 60;
                
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
                
                k.add([
                    k.rect(40, 40),
                    k.color(...itemColor),
                    k.pos(x, y),
                    k.outline(1, k.rgb(80, 80, 80))
                ]);
                
                k.add([
                    k.text(item.name, {
                        size: 8,
                        font: "monospace"
                    }),
                    k.pos(x + 20, y + 50),
                    k.anchor("center"),
                    k.color(200, 200, 200)
                ]);
            });
        }
        
        // Controls
        k.add([
            k.text("ESC or I: Return to Game", {
                size: 14,
                font: "monospace"
            }),
            k.pos(k.width() / 2, k.height() - 30),
            k.anchor("center"),
            k.color(150, 150, 150)
        ]);
        
        // Input handling
        k.onKeyPress("escape", () => {
            k.go("game");
        });
        
        k.onKeyPress("i", () => {
            k.go("game");
        });
        
        console.log("🎒 Inventory scene created");
    });
}
