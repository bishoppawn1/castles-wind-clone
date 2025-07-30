// Castles of the Wind Clone - Inventory Scene
// Displays player stats and inventory items

function createInventoryScene(k) {
    k.scene("inventory", () => {
        k.destroyAll();
        
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
        
        // Simple stats display
        const statsText = [
            "Level: 1",
            "Health: 100/100",
            "Mana: 50/50",
            "Attack: 10",
            "Defense: 5",
            "Gold: 100"
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
        
        // Sample items
        const sampleItems = [
            { name: "Gold Coins", color: [255, 215, 0] },
            { name: "Health Potion", color: [255, 100, 100] },
            { name: "Iron Sword", color: [192, 192, 192] }
        ];
        
        sampleItems.forEach((item, index) => {
            const x = 400 + (index % 3) * 60;
            const y = 160 + Math.floor(index / 3) * 60;
            
            k.add([
                k.rect(40, 40),
                k.color(...item.color),
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
