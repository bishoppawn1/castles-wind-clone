// Game Over Scene for Castles of the Wind Clone
// Displays when player dies and allows restart

function createGameOverScene(k) {
    k.scene("gameover", (data = {}) => {
        // Background
        k.add([
            k.rect(k.width(), k.height()),
            k.color(20, 20, 30),
            k.pos(0, 0),
            k.z(-10)
        ]);
        
        // Game Over title
        k.add([
            k.text("GAME OVER", {
                size: 48,
                font: "monospace"
            }),
            k.pos(k.width() / 2, k.height() / 2 - 100),
            k.anchor("center"),
            k.color(255, 100, 100)
        ]);
        
        // Death message
        const deathMessage = data.message || "You have been defeated!";
        k.add([
            k.text(deathMessage, {
                size: 16,
                font: "monospace"
            }),
            k.pos(k.width() / 2, k.height() / 2 - 40),
            k.anchor("center"),
            k.color(200, 200, 200)
        ]);
        
        // Stats display
        if (data.stats) {
            const statsText = [
                `Level Reached: ${data.stats.level || 1}`,
                `Enemies Defeated: ${data.stats.enemiesKilled || 0}`,
                `Items Collected: ${data.stats.itemsCollected || 0}`,
                `Gold Earned: ${data.stats.gold || 0}`
            ];
            
            statsText.forEach((line, index) => {
                k.add([
                    k.text(line, {
                        size: 14,
                        font: "monospace"
                    }),
                    k.pos(k.width() / 2, k.height() / 2 + 20 + index * 25),
                    k.anchor("center"),
                    k.color(180, 180, 180)
                ]);
            });
        }
        
        // Restart button
        const restartButton = k.add([
            k.rect(200, 40),
            k.color(60, 60, 80),
            k.pos(k.width() / 2 - 100, k.height() / 2 + 150),
            k.outline(2, k.rgb(100, 100, 100)),
            k.area(),
            "button"
        ]);
        
        k.add([
            k.text("RESTART GAME", {
                size: 16,
                font: "monospace"
            }),
            k.pos(k.width() / 2, k.height() / 2 + 170),
            k.anchor("center"),
            k.color(255, 255, 255)
        ]);
        
        // Menu button
        const menuButton = k.add([
            k.rect(200, 40),
            k.color(60, 60, 80),
            k.pos(k.width() / 2 - 100, k.height() / 2 + 200),
            k.outline(2, k.rgb(100, 100, 100)),
            k.area(),
            "button"
        ]);
        
        k.add([
            k.text("MAIN MENU", {
                size: 16,
                font: "monospace"
            }),
            k.pos(k.width() / 2, k.height() / 2 + 220),
            k.anchor("center"),
            k.color(255, 255, 255)
        ]);
        
        // Button hover effects
        k.get("button").forEach(button => {
            button.onHover(() => {
                button.color = k.rgb(80, 80, 100);
            });
            
            button.onHoverEnd(() => {
                button.color = k.rgb(60, 60, 80);
            });
        });
        
        // Button click handlers
        restartButton.onClick(() => {
            console.log("🔄 Restarting game...");
            // Reset game state
            if (window.GameState) {
                GameState.resetForNewGame();
            }
            k.go("game");
        });
        
        menuButton.onClick(() => {
            console.log("🏠 Returning to main menu...");
            k.go("menu");
        });
        
        // Keyboard controls
        k.onKeyPress("space", () => {
            // Reset game state
            if (window.GameState) {
                GameState.resetForNewGame();
            }
            k.go("game");
        });
        
        k.onKeyPress("escape", () => {
            k.go("menu");
        });
        
        // Controls info
        k.add([
            k.text("SPACE: Restart | ESC: Menu", {
                size: 12,
                font: "monospace"
            }),
            k.pos(k.width() / 2, k.height() - 30),
            k.anchor("center"),
            k.color(150, 150, 150)
        ]);
        
        console.log("💀 Game Over scene created");
    });
}

console.log("💀 Game Over scene loaded successfully");
