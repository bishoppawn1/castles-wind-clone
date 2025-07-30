// Castles of the Wind Clone - Asset Loading System
// Handles loading and management of all game assets (sprites, sounds, etc.)

function loadGameAssets(k) {
    console.log("🎨 Loading game assets...");
    
    // For now, we'll skip sprite loading and just log success
    // This allows the game to continue without asset loading issues
    console.log("✅ Asset loading skipped - using shapes for now");
    
    // TODO: Implement proper sprite loading later
    // For development, we'll use Kaplay's built-in shapes instead
}

// Fallback asset loading using simple shapes
function loadFallbackAssets(k) {
    console.log("🔄 Loading fallback assets...");
    
    // Use Kaplay's built-in shape generation instead of canvas
    const sprites = [
        { name: "player-idle", color: [100, 150, 255] },
        { name: "player-walk", color: [120, 170, 255] },
        { name: "floor", color: [80, 60, 40] },
        { name: "wall", color: [60, 60, 60] },
        { name: "door", color: [139, 69, 19] },
        { name: "stairs-up", color: [255, 255, 100] },
        { name: "stairs-down", color: [255, 200, 100] },
        { name: "rat", color: [100, 50, 50] },
        { name: "skeleton", color: [200, 200, 200] },
        { name: "orc", color: [50, 100, 50] },
        { name: "sword", color: [192, 192, 192] },
        { name: "shield", color: [139, 69, 19] },
        { name: "potion-health", color: [255, 100, 100] },
        { name: "potion-mana", color: [100, 100, 255] },
        { name: "gold", color: [255, 215, 0] },
        { name: "chest-closed", color: [139, 69, 19] },
        { name: "chest-open", color: [160, 82, 45] },
        { name: "ui-panel", color: [40, 40, 50] },
        { name: "button", color: [60, 60, 80] },
        { name: "spell-fire", color: [255, 100, 0] },
        { name: "spell-ice", color: [100, 200, 255] },
        { name: "spell-heal", color: [100, 255, 100] }
    ];
    
    sprites.forEach(sprite => {
        try {
            // Create a simple data URL for a colored square
            const size = sprite.name.includes('potion') || sprite.name.includes('gold') || sprite.name.includes('spell') ? 16 : 
                        sprite.name.includes('rat') ? 24 : 32;
            const dataUrl = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="rgb(${sprite.color.join(',')})"/></svg>`;
            
            k.loadSprite(sprite.name, dataUrl);
        } catch (e) {
            console.warn(`Failed to load sprite ${sprite.name}:`, e);
        }
    });
    
    console.log("✅ Fallback sprites loaded");
}

// Helper function to create colored rectangle sprites as placeholders
function createColoredSprite(width, height, color) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Fill with the main color
    ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    ctx.fillRect(0, 0, width, height);
    
    // Add a simple border for definition
    ctx.strokeStyle = `rgb(${Math.max(0, color[0] - 30)}, ${Math.max(0, color[1] - 30)}, ${Math.max(0, color[2] - 30)})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
    
    // Add a small highlight for 3D effect
    ctx.fillStyle = `rgb(${Math.min(255, color[0] + 40)}, ${Math.min(255, color[1] + 40)}, ${Math.min(255, color[2] + 40)})`;
    ctx.fillRect(1, 1, width - 2, 2);
    ctx.fillRect(1, 1, 2, height - 2);
    
    return canvas.toDataURL();
}

// Asset management utilities
const AssetManager = {
    // Check if all required assets are loaded
    checkAssetsLoaded: function(k, requiredAssets) {
        const missing = [];
        requiredAssets.forEach(asset => {
            try {
                k.getSprite(asset);
            } catch (e) {
                missing.push(asset);
            }
        });
        return missing;
    },
    
    // Get list of all loaded sprites
    getLoadedSprites: function(k) {
        // This would need to be implemented based on Kaplay's internal sprite registry
        // For now, return our known placeholder sprites
        return [
            "player-idle", "player-walk",
            "floor", "wall", "door", "stairs-up", "stairs-down",
            "rat", "skeleton", "orc",
            "sword", "shield", "potion-health", "potion-mana", "gold",
            "chest-closed", "chest-open",
            "ui-panel", "button",
            "spell-fire", "spell-ice", "spell-heal"
        ];
    },
    
    // Preload assets for a specific scene
    preloadForScene: function(k, sceneName) {
        const sceneAssets = {
            menu: ["ui-panel", "button"],
            game: ["player-idle", "player-walk", "floor", "wall", "door", "rat", "skeleton"],
            inventory: ["ui-panel", "button", "sword", "shield", "potion-health", "potion-mana"]
        };
        
        return sceneAssets[sceneName] || [];
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadGameAssets, AssetManager };
}

// Make available globally for browser usage
window.loadGameAssets = loadGameAssets;
window.AssetManager = AssetManager;
