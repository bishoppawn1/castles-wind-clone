// Level management system for Castles of the Wind Clone
// Handles level loading, unloading, and transitions

import { LEVELS, TILE_SYMBOLS, LevelUtils } from '../data/levels.js';
import { TileSystem, TileInteractions } from '../data/tiles.js';

export const LevelSystem = {
    currentLevel: null,
    currentLevelData: null,
    levelTiles: [],
    levelItems: [],
    levelEnemies: [],
    
    // Load a level
    loadLevel(k, levelId) {
        console.log(`Loading level ${levelId}...`);
        
        // Clear existing level
        this.unloadLevel(k);
        
        // Get level data
        const levelData = LEVELS[levelId];
        if (!levelData) {
            console.error(`Level ${levelId} not found!`);
            return false;
        }
        
        this.currentLevel = levelId;
        this.currentLevelData = levelData;
        
        // Create tiles
        this.createLevelTiles(k, levelData);
        
        // Spawn items
        this.spawnLevelItems(k, levelData);
        
        // Spawn enemies
        this.spawnLevelEnemies(k, levelData);
        
        // Apply lighting
        this.applyLighting(k, levelData);
        
        // Initialize fog of war
        this.initializeFogOfWar(k, levelData);
        
        console.log(`Level ${levelId} loaded successfully`);
        return true;
    },
    
    // Load a level directly from provided data (procedural or dynamic)
    loadLevelData(k, levelData) {
        console.log(`Loading level from data object...`);
        
        // Clear existing level
        this.unloadLevel(k);
        
        if (!levelData || !levelData.layout) {
            console.error('Invalid level data provided to loadLevelData');
            return false;
        }
        
        this.currentLevel = levelData.id || 'procedural';
        this.currentLevelData = levelData;
        
        // Create tiles
        this.createLevelTiles(k, levelData);
        
        // Spawn items
        this.spawnLevelItems(k, levelData);
        
        // Spawn enemies
        this.spawnLevelEnemies(k, levelData);
        
        // Apply lighting
        this.applyLighting(k, levelData);
        
        // Initialize fog of war
        this.initializeFogOfWar(k, levelData);
        
        console.log(`Level ${this.currentLevel} loaded successfully (from data)`);
        return true;
    },
    
    // Unload current level
    unloadLevel(k) {
        if (!this.currentLevel) return;
        
        console.log(`Unloading level ${this.currentLevel}...`);
        
        // Destroy all level tiles
        this.levelTiles.forEach(tile => {
            if (tile.exists()) {
                k.destroy(tile);
            }
        });
        this.levelTiles = [];
        
        // Destroy all level items
        this.levelItems.forEach(item => {
            if (item.exists()) {
                k.destroy(item);
            }
        });
        this.levelItems = [];
        
        // Destroy all level enemies
        this.levelEnemies.forEach(enemy => {
            if (enemy.exists()) {
                k.destroy(enemy);
            }
        });
        this.levelEnemies = [];
        
        // Clear level references
        this.currentLevel = null;
        this.currentLevelData = null;
    },
    
    // Create tiles for the level
    createLevelTiles(k, levelData) {
        const layout = levelData?.layout;
        if (!Array.isArray(layout)) {
            console.error("Invalid level data: layout must be an array");
            return;
        }
        const tileSize = (typeof levelData?.tileSize === "number" && levelData.tileSize > 0) ? levelData.tileSize : 32;
        
        for (let y = 0; y < layout.length; y++) {
            const row = layout[y];
            if (!(typeof row === "string" || Array.isArray(row))) {
                console.warn(`Skipping invalid layout row at y=${y}`);
                continue;
            }
            for (let x = 0; x < row.length; x++) {
                const symbol = row[x];
                const tileType = TILE_SYMBOLS[symbol];
                
                if (tileType && !this.isEntitySymbol(symbol)) {
                    const tile = TileSystem.createTile(k, tileType, x, y, tileSize);
                    if (tile) {
                        this.levelTiles.push(tile);
                    }
                }
            }
        }
        
        console.log(`Created ${this.levelTiles.length} tiles`);
    },
    
    // Check if symbol represents an entity (not a tile)
    isEntitySymbol(symbol) {
        const entitySymbols = ['@', 'T', 'C', 'P', 'G', 'A', 'M', 'g', 'o', 'r', 's'];
        return entitySymbols.includes(symbol);
    },
    
    // Spawn items from level data
    spawnLevelItems(k, levelData) {
        // Basic guards
        if (!k || typeof k.add !== "function") {
            console.error('Kaboom context "k" is not ready in spawnLevelItems');
            return;
        }
        const layout = levelData?.layout;
        if (!Array.isArray(layout)) {
            console.error("Invalid level data: layout must be an array");
            return;
        }
        const tileSize = (typeof levelData?.tileSize === "number" && levelData.tileSize > 0) ? levelData.tileSize : 32;
        
        // Track spawned positions to avoid duplicates across sources
        const spawned = new Set();
        
        // Spawn items from layout symbols
        for (let y = 0; y < layout.length; y++) {
            const row = layout[y];
            if (!(typeof row === "string" || Array.isArray(row))) {
                console.warn(`Skipping invalid layout row at y=${y}`);
                continue;
            }
            for (let x = 0; x < row.length; x++) {
                const symbol = row[x];
                const itemType = this.getItemTypeFromSymbol(symbol);
                
                if (itemType) {
                    const key = `${itemType}@${x},${y}`;
                    if (spawned.has(key)) continue;
                    const item = this.createItem(k, itemType, x, y, tileSize);
                    if (item) {
                        this.levelItems.push(item);
                        spawned.add(key);
                    }
                }
            }
        }
        
        // Spawn items from explicit level data
        if (Array.isArray(levelData?.items)) {
            levelData.items.forEach(itemData => {
                if (!itemData || typeof itemData.x !== "number" || typeof itemData.y !== "number") {
                    console.warn("Skipping invalid itemData entry:", itemData);
                    return;
                }
                const itemType = itemData.type;
                const key = `${itemType}@${itemData.x},${itemData.y}`;
                if (spawned.has(key)) {
                    // Avoid duplicate spawn
                    return;
                }
                const item = this.createItem(k, itemType, itemData.x, itemData.y, tileSize, itemData);
                if (item) {
                    this.levelItems.push(item);
                    spawned.add(key);
                }
            });
        } else if (levelData?.items) {
            console.warn("levelData.items is not an array; skipping items spawn");
        }
        
        console.log(`Spawned ${this.levelItems.length} items`);
    },
    
    // Get item type from symbol
    getItemTypeFromSymbol(symbol) {
        const itemSymbols = {
            'T': 'treasure',
            'C': 'chest',
            'P': 'potion',
            'G': 'gold',
            'A': 'armor',
            'M': 'weapon'
        };
        return itemSymbols[symbol];
    },
    
    // Create an item
    createItem(k, itemType, gridX, gridY, tileSize, data = {}) {
        const pixelX = gridX * tileSize + tileSize / 2;
        const pixelY = gridY * tileSize + tileSize / 2;
        
        const itemColors = {
            treasure: [255, 215, 0],    // Gold
            chest: [139, 69, 19],       // Brown
            potion: [255, 0, 255],      // Magenta
            gold: [255, 255, 0],        // Yellow
            armor: [192, 192, 192],     // Silver
            weapon: [255, 165, 0]       // Orange
        };
        
        const color = itemColors[itemType] || [255, 255, 255];
        
        const item = k.add([
            k.rect(tileSize * 0.6, tileSize * 0.6),
            k.color(...color),
            k.pos(pixelX, pixelY),
            k.anchor("center"),
            k.z(5), // Items above tiles but below player
            k.outline(2, k.rgb(0, 0, 0)),
            "item",
            itemType,
            {
                gridX: gridX,
                gridY: gridY,
                itemType: itemType,
                value: data.value || 10,
                effect: data.effect || null,
                ...data
            }
        ]);
        
        // Add subtle animation
        item.onUpdate(() => {
            item.angle = Math.sin(k.time() * 2) * 5;
        });
        
        return item;
    },
    
    // Spawn enemies from level data
    spawnLevelEnemies(k, levelData) {
        // Basic guards
        if (!k || typeof k.add !== "function") {
            console.error('Kaboom context "k" is not ready in spawnLevelEnemies');
            return;
        }
        const layout = levelData?.layout;
        if (!Array.isArray(layout)) {
            console.error("Invalid level data: layout must be an array");
            return;
        }
        const tileSize = (typeof levelData?.tileSize === "number" && levelData.tileSize > 0) ? levelData.tileSize : 32;
        
        // Track spawned positions to avoid duplicates across sources
        const spawned = new Set();
        
        // Spawn enemies from layout symbols
        for (let y = 0; y < layout.length; y++) {
            const row = layout[y];
            if (!(typeof row === "string" || Array.isArray(row))) {
                console.warn(`Skipping invalid layout row at y=${y}`);
                continue;
            }
            for (let x = 0; x < row.length; x++) {
                const symbol = row[x];
                const enemyType = this.getEnemyTypeFromSymbol(symbol);
                
                if (enemyType) {
                    const key = `${enemyType}@${x},${y}`;
                    if (spawned.has(key)) continue;
                    const enemy = this.createEnemy(k, enemyType, x, y, tileSize);
                    if (enemy) {
                        this.levelEnemies.push(enemy);
                        spawned.add(key);
                    }
                }
            }
        }
        
        // Spawn enemies from explicit level data
        if (Array.isArray(levelData?.enemies)) {
            levelData.enemies.forEach(enemyData => {
                if (!enemyData || typeof enemyData.x !== "number" || typeof enemyData.y !== "number") {
                    console.warn("Skipping invalid enemyData entry:", enemyData);
                    return;
                }
                const enemyType = enemyData.type;
                const key = `${enemyType}@${enemyData.x},${enemyData.y}`;
                if (spawned.has(key)) {
                    // Avoid duplicate spawn
                    return;
                }
                const enemy = this.createEnemy(k, enemyType, enemyData.x, enemyData.y, tileSize, enemyData);
                if (enemy) {
                    this.levelEnemies.push(enemy);
                    spawned.add(key);
                }
            });
        } else if (levelData?.enemies) {
            console.warn("levelData.enemies is not an array; skipping enemies spawn");
        }
        
        console.log(`Spawned ${this.levelEnemies.length} enemies`);
    },
    
    // Get enemy type from symbol
    getEnemyTypeFromSymbol(symbol) {
        const enemySymbols = {
            'g': 'goblin',
            'o': 'orc',
            'r': 'rat',
            's': 'skeleton'
        };
        return enemySymbols[symbol];
    },
    
    // Create an enemy (placeholder)
    createEnemy(k, enemyType, gridX, gridY, tileSize, data = {}) {
        const pixelX = gridX * tileSize + tileSize / 2;
        const pixelY = gridY * tileSize + tileSize / 2;
        
        const enemyColors = {
            goblin: [0, 255, 0],      // Green
            orc: [255, 0, 0],         // Red
            rat: [139, 69, 19],       // Brown
            skeleton: [255, 255, 255] // White
        };
        
        const color = enemyColors[enemyType] || [255, 0, 0];
        
        const enemy = k.add([
            k.rect(tileSize * 0.8, tileSize * 0.8),
            k.color(...color),
            k.pos(pixelX, pixelY),
            k.anchor("center"),
            k.z(8), // Enemies above items
            k.outline(2, k.rgb(0, 0, 0)),
            "enemy",
            enemyType,
            {
                gridX: gridX,
                gridY: gridY,
                enemyType: enemyType,
                level: data.level || 1,
                health: data.health || 10,
                maxHealth: data.maxHealth || 10,
                attack: data.attack || 1,
                defense: data.defense || 0
            }
        ]);
        
        return enemy;
    },
    
    // Apply lighting effects
    applyLighting(k, levelData) {
        if (!levelData.lighting) return;
        
        const { ambient, torches } = levelData.lighting;
        
        // Apply ambient lighting to all tiles
        this.levelTiles.forEach(tile => {
            TileSystem.addLighting(k, tile, ambient);
        });
        
        // Apply torch lighting
        if (torches) {
            torches.forEach(torch => {
                this.applyTorchLight(k, torch, levelData.tileSize);
            });
        }
        
        console.log(`Applied lighting with ${torches?.length || 0} torches`);
    },
    
    // Apply light from a torch
    applyTorchLight(k, torch, tileSize) {
        const torchRadius = torch.radius;
        const torchIntensity = torch.intensity;
        
        // Create torch object
        const torchObj = k.add([
            k.rect(tileSize * 0.4, tileSize * 0.4),
            k.color(255, 200, 100),
            k.pos(torch.x * tileSize + tileSize / 2, torch.y * tileSize + tileSize / 2),
            k.anchor("center"),
            k.z(6),
            "torch",
            {
                gridX: torch.x,
                gridY: torch.y,
                lightRadius: torchRadius,
                lightIntensity: torchIntensity
            }
        ]);
        
        // Add flickering effect
        torchObj.onUpdate(() => {
            const flicker = 0.8 + Math.sin(k.time() * 8) * 0.2;
            torchObj.color = k.rgb(255 * flicker, 200 * flicker, 100 * flicker);
        });
        
        // Apply light to nearby tiles
        for (let dy = -torchRadius; dy <= torchRadius; dy++) {
            for (let dx = -torchRadius; dx <= torchRadius; dx++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= torchRadius) {
                    const tileX = torch.x + dx;
                    const tileY = torch.y + dy;
                    const tile = TileSystem.getTileAt(k, tileX, tileY);
                    
                    if (tile) {
                        const lightIntensity = torchIntensity * (1 - distance / torchRadius);
                        TileSystem.addLighting(k, tile, 1 + lightIntensity);
                    }
                }
            }
        }
    },
    
    // Initialize fog of war
    initializeFogOfWar(k, levelData) {
        if (!levelData.fogOfWar?.enabled) return;
        
        const { unexploredOpacity } = levelData.fogOfWar;
        
        // Apply fog to all tiles initially
        this.levelTiles.forEach(tile => {
            TileSystem.applyFogOfWar(tile, unexploredOpacity);
        });
        
        console.log("Fog of war initialized");
    },
    
    // Update fog of war around player
    updateFogOfWar(k, playerGridX, playerGridY) {
        if (!this.currentLevelData?.fogOfWar?.enabled) return;
        
        const { visionRadius, exploredOpacity } = this.currentLevelData.fogOfWar;
        
        // Reveal tiles around player
        for (let dy = -visionRadius; dy <= visionRadius; dy++) {
            for (let dx = -visionRadius; dx <= visionRadius; dx++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= visionRadius) {
                    const tileX = playerGridX + dx;
                    const tileY = playerGridY + dy;
                    const tile = TileSystem.getTileAt(k, tileX, tileY);
                    
                    if (tile) {
                        const visibility = exploredOpacity * (1 - distance / (visionRadius + 1));
                        TileSystem.revealTile(tile, Math.max(0.3, visibility));
                    }
                }
            }
        }

        // After revealing tiles, sync entity visibility (items, enemies) to fog of war
        try {
            this.updateEntityVisibility(k, playerGridX, playerGridY);
        } catch (e) {
            console.warn("updateEntityVisibility failed:", e);
        }
    },
    
    // Update visibility/opacity of non-tile entities based on fog of war
    updateEntityVisibility(k, playerGridX, playerGridY) {
        if (!this.currentLevelData?.fogOfWar?.enabled) return;
        const fog = this.currentLevelData.fogOfWar;
        const dims = LevelUtils.getDimensions(this.currentLevelData);
        const tileSize = dims.tileSize || 32;

        // Helper: derive grid position for an object
        const toGrid = (obj) => {
            if (typeof obj.gridX === "number" && typeof obj.gridY === "number") {
                return { x: obj.gridX, y: obj.gridY };
            }
            if (obj.pos) {
                // Most world entities are centered in tiles; floor works even with small bobbing
                return {
                    x: Math.floor(obj.pos.x / tileSize),
                    y: Math.floor(obj.pos.y / tileSize),
                };
            }
            return null;
        };

        const applyVisibility = (obj) => {
            const g = toGrid(obj);
            if (!g) return;
            const dx = g.x - playerGridX;
            const dy = g.y - playerGridY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Determine base alpha by distance to player
            let alpha = 1;
            if (dist <= fog.visionRadius) {
                alpha = 1;
            } else {
                // Dim entities in explored-but-not-currently-visible tiles
                alpha = Math.max(0, (fog.exploredOpacity ?? 0.4));
            }

            // Completely hide entities in fully unexplored tiles
            const tile = TileSystem.getTileAt(k, g.x, g.y);
            const tileOpacity = tile?.opacity ?? 1;
            const unexplored = (fog.unexploredOpacity != null)
                ? (tileOpacity <= (fog.unexploredOpacity + 0.01))
                : false;

            obj.opacity = (unexplored && dist > fog.visionRadius) ? 0 : alpha;
        };

        // Ground items (rich item entities)
        const groundItems = k.get("ground_item") || [];
        groundItems.forEach(applyVisibility);

        // Legacy/simple level items (spawned with gridX/gridY)
        const simpleItems = (k.get("item") || []).filter((it) =>
            typeof it.gridX === "number" && typeof it.gridY === "number"
        );
        simpleItems.forEach(applyVisibility);

        // Enemies
        const enemies = k.get("enemy") || [];
        enemies.forEach(applyVisibility);
    },
    
    // Get player spawn position for current level
    getPlayerSpawn() {
        return this.currentLevelData?.playerSpawn || { x: 1, y: 1 };
    },
    
    // Check if position is walkable in current level
    isWalkable(gridX, gridY) {
        if (!this.currentLevelData) return false;
        return LevelUtils.isWalkable(this.currentLevelData, gridX, gridY);
    },
    
    // Get level dimensions
    getLevelDimensions() {
        if (!this.currentLevelData) return { width: 50, height: 38, tileSize: 32 };
        return LevelUtils.getDimensions(this.currentLevelData);
    }
};

// Expose to global for non-module access (e.g., main.js)
if (typeof window !== 'undefined') {
    window.LevelSystem = LevelSystem;
    window.LevelUtils = LevelUtils;
    window.TILE_SYMBOLS = TILE_SYMBOLS;
}
