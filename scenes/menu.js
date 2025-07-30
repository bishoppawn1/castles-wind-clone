// Castles of the Wind Clone - Main Menu Scene
// Handles the main menu interface and navigation

function createMenuScene(k) {
    // Define the main menu scene
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
                        GameState.resetForNewGame();
                        console.log("✅ resetForNewGame() completed");
                    } else {
                        console.error("❌ GameState not available on window object!");
                    }
                    
                    console.log("🎮 Switching to game scene...");
                    k.go("game");
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
}

// Export the scene creation function
if (typeof module !== 'undefined' && module.exports) {
    module.exports = createMenuScene;
}
