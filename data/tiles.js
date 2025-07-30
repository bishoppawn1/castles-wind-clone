// Tile system for Castles of the Wind Clone
// Defines tile properties and creates tile game objects

// Tile configurations
export const TILE_CONFIG = {
    // Floor tiles
    floor: {
        color: [60, 60, 80],
        solid: false,
        walkable: true,
        description: 'Stone floor'
    },
    floor_stone: {
        color: [70, 70, 90],
        solid: false,
        walkable: true,
        description: 'Polished stone floor'
    },
    floor_wood: {
        color: [80, 60, 40],
        solid: false,
        walkable: true,
        description: 'Wooden floor'
    },
    
    // Wall tiles
    wall: {
        color: [40, 40, 40],
        solid: true,
        walkable: false,
        description: 'Stone wall'
    },
    wall_stone: {
        color: [50, 50, 50],
        solid: true,
        walkable: false,
        description: 'Reinforced stone wall'
    },
    wall_brick: {
        color: [60, 40, 30],
        solid: true,
        walkable: false,
        description: 'Brick wall'
    },
    
    // Special tiles
    door: {
        color: [100, 60, 30],
        solid: false,
        walkable: true,
        description: 'Wooden door',
        interactive: true
    },
    stairs_down: {
        color: [80, 80, 60],
        solid: false,
        walkable: true,
        description: 'Stairs leading down',
        interactive: true
    },
    stairs_up: {
        color: [90, 90, 70],
        solid: false,
        walkable: true,
        description: 'Stairs leading up',
        interactive: true
    },
    entrance: {
        color: [60, 80, 60],
        solid: false,
        walkable: true,
        description: 'Castle entrance',
        interactive: true
    },
    exit: {
        color: [80, 60, 80],
        solid: false,
        walkable: true,
        description: 'Exit',
        interactive: true
    }
};

// Tile creation utilities
export const TileSystem = {
    // Create a tile game object
    createTile(k, tileType, gridX, gridY, tileSize = 32) {
        const config = TILE_CONFIG[tileType];
        if (!config) {
            console.warn(`Unknown tile type: ${tileType}`);
            return null;
        }
        
        const pixelX = gridX * tileSize + tileSize / 2;
        const pixelY = gridY * tileSize + tileSize / 2;
        
        const tile = k.add([
            k.rect(tileSize, tileSize),
            k.color(...config.color),
            k.pos(pixelX, pixelY),
            k.anchor("center"),
            k.z(0), // Tiles are at the bottom layer
            "tile",
            tileType,
            {
                gridX: gridX,
                gridY: gridY,
                tileType: tileType,
                solid: config.solid,
                walkable: config.walkable,
                description: config.description,
                interactive: config.interactive || false
            }
        ]);
        
        // Add outline for better visibility
        if (config.solid) {
            tile.add([
                k.outline(2, k.rgb(20, 20, 20))
            ]);
        }
        
        return tile;
    },
    
    // Create all tiles for a level
    createLevelTiles(k, level, tileSize = 32) {
        const tiles = [];
        
        for (let y = 0; y < level.layout.length; y++) {
            for (let x = 0; x < level.layout[y].length; x++) {
                const symbol = level.layout[y][x];
                const tileType = level.tileSymbols?.[symbol] || this.getDefaultTileType(symbol);
                
                if (tileType && TILE_CONFIG[tileType]) {
                    const tile = this.createTile(k, tileType, x, y, tileSize);
                    if (tile) {
                        tiles.push(tile);
                    }
                }
            }
        }
        
        console.log(`Created ${tiles.length} tiles for level ${level.id}`);
        return tiles;
    },
    
    // Get default tile type from symbol
    getDefaultTileType(symbol) {
        const symbolMap = {
            '#': 'wall',
            '.': 'floor',
            'W': 'wall_stone',
            'B': 'wall_brick',
            'f': 'floor_stone',
            'w': 'floor_wood',
            'D': 'door',
            'S': 'stairs_down',
            'U': 'stairs_up',
            'E': 'entrance',
            'X': 'exit'
        };
        
        return symbolMap[symbol] || null;
    },
    
    // Get tile at grid position
    getTileAt(k, gridX, gridY) {
        const tiles = k.get("tile");
        return tiles.find(tile => tile.gridX === gridX && tile.gridY === gridY);
    },
    
    // Check if position is walkable
    isWalkable(k, gridX, gridY) {
        const tile = this.getTileAt(k, gridX, gridY);
        return tile ? tile.walkable : false;
    },
    
    // Get all tiles of a specific type
    getTilesByType(k, tileType) {
        return k.get(tileType);
    },
    
    // Add lighting effect to tile
    addLighting(tile, intensity = 1.0) {
        const originalColor = tile.color;
        const lightedColor = [
            Math.min(255, originalColor[0] * intensity),
            Math.min(255, originalColor[1] * intensity),
            Math.min(255, originalColor[2] * intensity)
        ];
        tile.color = k.rgb(...lightedColor);
    },
    
    // Apply fog of war to tile
    applyFogOfWar(tile, visibility = 0.1) {
        tile.opacity = visibility;
    },
    
    // Remove fog of war from tile
    revealTile(tile, visibility = 1.0) {
        tile.opacity = visibility;
    },
    
    // Highlight tile (for interaction feedback)
    highlightTile(k, tile, duration = 0.5) {
        const originalColor = tile.color;
        tile.color = k.rgb(255, 255, 255);
        
        k.wait(duration, () => {
            if (tile.exists()) {
                tile.color = originalColor;
            }
        });
    }
};

// Interactive tile behaviors
export const TileInteractions = {
    // Handle tile interaction
    interact(k, tile, player) {
        if (!tile.interactive) return false;
        
        switch (tile.tileType) {
            case 'door':
                return this.openDoor(k, tile, player);
            case 'stairs_down':
                return this.useStairs(k, tile, player, 'down');
            case 'stairs_up':
                return this.useStairs(k, tile, player, 'up');
            case 'entrance':
                return this.useEntrance(k, tile, player);
            case 'exit':
                return this.useExit(k, tile, player);
            default:
                return false;
        }
    },
    
    // Open door
    openDoor(k, tile, player) {
        console.log("Opening door...");
        TileSystem.highlightTile(k, tile);
        // TODO: Implement door opening logic
        return true;
    },
    
    // Use stairs
    useStairs(k, tile, player, direction) {
        console.log(`Using stairs ${direction}...`);
        TileSystem.highlightTile(k, tile);
        // TODO: Implement level transition
        return true;
    },
    
    // Use entrance
    useEntrance(k, tile, player) {
        console.log("Entering castle...");
        TileSystem.highlightTile(k, tile);
        // TODO: Implement entrance logic
        return true;
    },
    
    // Use exit
    useExit(k, tile, player) {
        console.log("Exiting...");
        TileSystem.highlightTile(k, tile);
        // TODO: Implement exit logic
        return true;
    }
};
