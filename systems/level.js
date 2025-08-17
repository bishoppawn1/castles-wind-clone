// Level management system for Castles of the Wind Clone
// Handles level loading, unloading, and transitions

const LevelSystem = {
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
        
        // Initialize systems
        LevelGenSystem.init(k);
        EnvironmentSystem.init(k);
        
        // Create tiles
        this.createLevelTiles(k, levelData);
        
        // Spawn doors
        this.spawnLevelDoors(k, levelData);
        
        // Spawn items
        this.spawnLevelItems(k, levelData);
        
        // Spawn enemies
        this.spawnLevelEnemies(k, levelData);
        
        // Apply lighting
        this.applyLighting(k, levelData);
        
        // Create environmental features (stairs, traps, etc.)
        if (typeof EnvironmentSystem !== 'undefined') {
            EnvironmentSystem.createEnvironmentalFeatures(levelData);
        }
        
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
        
        // Spawn doors
        this.spawnLevelDoors(k, levelData);
        
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
        const entitySymbols = ['@', 'T', 'C', 'P', 'G', 'A', 'M', 'g', 'o', 'r', 's', 'D'];
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
                    
                    // Check if this item has already been collected
                    const itemId = `${itemType}_${x}_${y}`;
                    if (this.isItemCollected(itemId)) {
                        console.log(`⏭️ Skipping collected layout item ${itemId} at (${x}, ${y})`);
                        continue;
                    }
                    
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
                
                // Check if this item has already been collected
                const itemId = `${itemType}_${itemData.x}_${itemData.y}`;
                if (this.isItemCollected(itemId)) {
                    console.log(`⏭️ Skipping collected level data item ${itemId} at (${itemData.x}, ${itemData.y})`);
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
        
        // Spawn chests from explicit level data
        if (Array.isArray(levelData?.chests)) {
            levelData.chests.forEach(chestData => {
                if (!chestData || typeof chestData.x !== "number" || typeof chestData.y !== "number") {
                    console.warn("Skipping invalid chestData entry:", chestData);
                    return;
                }
                
                const key = `chest@${chestData.x},${chestData.y}`;
                if (spawned.has(key)) {
                    return; // Avoid duplicate spawn
                }
                
                // Check if this chest has already been opened
                const chestId = `chest_${chestData.x}_${chestData.y}`;
                if (this.isChestOpened(chestId)) {
                    console.log(`⏭️ Skipping opened chest ${chestId} at (${chestData.x}, ${chestData.y})`);
                    return;
                }
                
                const chest = this.createChest(k, chestData.x, chestData.y, tileSize, chestData);
                if (chest) {
                    this.levelItems.push(chest);
                    spawned.add(key);
                }
            });
        }
        
        console.log(`Spawned ${this.levelItems.length} items and chests`);
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

    // Check if an item has already been collected
    isItemCollected(itemId) {
        if (typeof window.GameState === 'undefined' || !window.GameState.worldState.itemsCollected) {
            return false;
        }
        
        return window.GameState.worldState.itemsCollected.includes(itemId);
    },

    // Check if an enemy has already been defeated
    isEnemyDefeated(enemyId) {
        if (typeof window.GameState === 'undefined' || !window.GameState.worldState.enemiesDefeated) {
            return false;
        }
        
        return window.GameState.worldState.enemiesDefeated.includes(enemyId);
    },

    // Check if a chest has already been opened
    isChestOpened(chestId) {
        if (typeof window.GameState === 'undefined' || !window.GameState.worldState.chestsOpened) {
            return false;
        }
        
        return window.GameState.worldState.chestsOpened.includes(chestId);
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

    // Create a chest
    createChest(k, gridX, gridY, tileSize, chestData = {}) {
        // Use ChestEntity system if available
        if (typeof window !== 'undefined' && window.ChestEntity) {
            console.log(`📦 Creating chest via ChestEntity at (${gridX}, ${gridY}):`, chestData);
            return window.ChestEntity.createChest(gridX, gridY, chestData);
        }
        
        // Fallback: basic chest creation
        const pixelX = gridX * tileSize + tileSize / 2;
        const pixelY = gridY * tileSize + tileSize / 2;
        
        const chest = k.add([
            k.rect(tileSize * 0.8, tileSize * 0.6),
            k.color(139, 69, 19), // Brown
            k.pos(pixelX, pixelY),
            k.anchor("center"),
            k.z(5),
            k.outline(2, k.rgb(0, 0, 0)),
            "chest",
            "interactive",
            {
                gridX: gridX,
                gridY: gridY,
                type: chestData.type || 'wooden',
                locked: chestData.locked || false,
                opened: false,
                keyRequired: chestData.keyRequired || null,
                contents: chestData.contents || [],
                id: `chest_${gridX}_${gridY}`
            }
        ]);
        
        console.log(`Created chest at (${gridX}, ${gridY}) with ${chestData.contents?.length || 0} items`);
        return chest;
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
                    
                    // Check if this enemy has already been defeated
                    const enemyId = `${enemyType}_${x}_${y}`;
                    console.log(`🔍 SPAWN DEBUG: Checking enemy ${enemyId} at (${x}, ${y})`);
                    console.log(`🔍 SPAWN DEBUG: GameState exists:`, typeof window.GameState !== 'undefined');
                    console.log(`🔍 SPAWN DEBUG: Defeated enemies:`, window.GameState?.worldState?.enemiesDefeated);
                    
                    if (this.isEnemyDefeated(enemyId)) {
                        console.log(`⚔️ Skipping defeated layout enemy ${enemyId} at (${x}, ${y})`);
                        continue;
                    }
                    
                    console.log(`✅ SPAWN DEBUG: Spawning enemy ${enemyId} at (${x}, ${y})`);
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
                
                // Check if this enemy has already been defeated
                const enemyId = `${enemyType}_${enemyData.x}_${enemyData.y}`;
                console.log(`🔍 EXPLICIT SPAWN DEBUG: Checking enemy ${enemyId} at (${enemyData.x}, ${enemyData.y})`);
                console.log(`🔍 EXPLICIT SPAWN DEBUG: Defeated enemies:`, window.GameState?.worldState?.enemiesDefeated);
                
                if (this.isEnemyDefeated(enemyId)) {
                    console.log(`⚔️ Skipping defeated level data enemy ${enemyId} at (${enemyData.x}, ${enemyData.y})`);
                    return;
                }
                
                console.log(`✅ EXPLICIT SPAWN DEBUG: Spawning enemy ${enemyId} at (${enemyData.x}, ${enemyData.y})`);
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
        // Prefer the full EnemyEntity-based creation so enemies have correct metadata (enemyId, ai, stats)
        try {
            // Resolve enemy type object
            let typeObj = (enemyType && typeof enemyType === "object" && enemyType.id)
                ? enemyType
                : undefined;

            if (!typeObj && typeof enemyType === "string") {
                if (typeof window !== "undefined" && window.ENEMY_TYPES && window.ENEMY_TYPES[enemyType]) {
                    typeObj = window.ENEMY_TYPES[enemyType];
                }
                // If symbol or unknown key, try lookup by symbol via EnemyUtils
                if (!typeObj && typeof window !== "undefined" && window.EnemyUtils && typeof window.EnemyUtils.getEnemyBySymbol === "function") {
                    const bySymbol = window.EnemyUtils.getEnemyBySymbol(enemyType);
                    if (bySymbol) typeObj = bySymbol;
                }
            }

            if (typeof window !== "undefined" && window.EnemyEntity && typeObj) {
                // Use the canonical creation path
                return window.EnemyEntity.create(k, typeObj, gridX, gridY, data);
            }
        } catch (e) {
            console.warn("LevelSystem.createEnemy: EnemyEntity path failed, falling back to placeholder creation", e);
        }

        // Fallback: create a very simple enemy, but ensure it still has an enemyId and 'enemy' tag
        const pixelX = gridX * tileSize + tileSize / 2;
        const pixelY = gridY * tileSize + tileSize / 2;

        const fallbackId = (enemyType && typeof enemyType === "object" && enemyType.id)
            ? enemyType.id
            : (typeof enemyType === "string" ? enemyType : "enemy");

        const enemy = k.add([
            k.rect(tileSize * 0.8, tileSize * 0.8),
            k.color(255, 0, 0),
            k.pos(pixelX, pixelY),
            k.anchor("center"),
            k.z(8),
            k.outline(2, k.rgb(0, 0, 0)),
            "enemy",
            fallbackId,
            {
                gridX: gridX,
                gridY: gridY,
                enemyId: fallbackId,
                name: fallbackId.charAt(0).toUpperCase() + fallbackId.slice(1),
                enemyType: (typeof enemyType === "object" && enemyType) || { id: fallbackId, name: fallbackId },
                level: data.level || 1,
                health: data.health || 10,
                maxHealth: data.maxHealth || 10,
                attack: data.attack || 1,
                defense: data.defense || 0
            }
        ]);

        return enemy;
    },
    
    // Spawn doors from level data
    spawnLevelDoors(k, levelData) {
        console.log('🚪 Starting door spawning process...');
        const layout = levelData?.layout;
        if (!Array.isArray(layout)) {
            console.log('❌ No layout found for door spawning');
            return;
        }
        
        const tileSize = (typeof levelData?.tileSize === "number" && levelData.tileSize > 0) ? levelData.tileSize : 32;
        console.log(`🚪 Scanning layout for doors (${layout.length} rows, tileSize: ${tileSize})`);
        
        let doorsFound = 0;
        for (let y = 0; y < layout.length; y++) {
            const row = layout[y];
            if (!(typeof row === "string" || Array.isArray(row))) continue;
            
            for (let x = 0; x < row.length; x++) {
                const symbol = row[x];
                if (symbol === 'D') {
                    doorsFound++;
                    console.log(`🚪 Found door symbol at position (${x}, ${y})`);
                    
                    // Create floor tile underneath the door
                    const floorTile = TileSystem.createTile(k, 'floor', x, y, tileSize);
                    if (floorTile) {
                        this.levelTiles.push(floorTile);
                        console.log(`🚪 Created floor tile under door at (${x}, ${y})`);
                    }
                    
                    // Create door entity
                    const door = this.createDoor(k, x, y, tileSize);
                    if (door) {
                        this.levelItems.push(door); // Track doors with items for cleanup
                        console.log(`🚪 Successfully created door entity at (${x}, ${y})`);
                    } else {
                        console.error(`❌ Failed to create door entity at (${x}, ${y})`);
                    }
                }
            }
        }
        
        console.log(`🚪 Door spawning complete: Found ${doorsFound} door symbols, spawned ${this.getAllDoors(k).length} door entities`);
    },
    
    // Create a door entity
    createDoor(k, gridX, gridY, tileSize, doorData = {}) {
        // Use DoorEntity system if available
        if (typeof window !== 'undefined' && window.DoorEntity) {
            return window.DoorEntity.create(k, gridX, gridY, tileSize, doorData);
        }
        
        // Fallback: create basic door
        const pixelX = gridX * tileSize + tileSize / 2;
        const pixelY = gridY * tileSize + tileSize / 2;
        
        const door = k.add([
            k.rect(tileSize, tileSize),
            k.color(100, 60, 30),
            k.pos(pixelX, pixelY),
            k.anchor("center"),
            k.area(),
            k.z(1),
            k.outline(2, k.rgb(40, 20, 10)),
            "door",
            "interactive",
            {
                gridX: gridX,
                gridY: gridY,
                isOpen: false,
                solid: true,
                walkable: false,
                description: 'Wooden door'
            }
        ]);
        
        return door;
    },
    
    // Get all doors in the level
    getAllDoors(k) {
        return k.get("door");
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
    
    // Dynamic player-centered lighting (brighter near player)
    // Recomputes a local area around the player using baseline (ambient + torches)
    // and adds a smooth player boost, avoiding light trails.
    applyPlayerLight(k, playerGridX, playerGridY) {
        const fog = this.currentLevelData?.fogOfWar || {};
        const visRadius = fog.visionRadius ?? 3;
        const radius = Math.max(1, visRadius); // lighting radius
        const maxBoost = 0.6; // up to +60% brighter at the center
        const ambient = this.currentLevelData?.lighting?.ambient ?? 1;

        // Gather torch sources (placed in applyTorchLight)
        const torches = k.get("torch") || [];

        // Recompute lighting for a small area around the player
        for (let dy = -(radius + 1); dy <= (radius + 1); dy++) {
            for (let dx = -(radius + 1); dx <= (radius + 1); dx++) {
                const tileX = playerGridX + dx;
                const tileY = playerGridY + dy;
                const tile = TileSystem.getTileAt(k, tileX, tileY);
                if (!tile) continue;

                const dist = Math.sqrt(dx * dx + dy * dy);

                // Baseline intensity from ambient and any torches affecting this tile
                let baseline = ambient;
                for (const t of torches) {
                    const tdx = tileX - (t.gridX ?? 0);
                    const tdy = tileY - (t.gridY ?? 0);
                    const td = Math.sqrt(tdx * tdx + tdy * tdy);
                    const tr = t.lightRadius ?? 0;
                    if (tr > 0 && td <= tr) {
                        const torchBoost = (t.lightIntensity ?? 0) * (1 - td / tr);
                        baseline = Math.max(baseline, 1 + torchBoost);
                    }
                }

                // Player boost (only within radius)
                let playerFactor = 1;
                if (dist <= radius) {
                    const frac = 1 - (dist / (radius + 0.0001));
                    const boost = maxBoost * Math.max(0, Math.min(1, frac));
                    playerFactor = 1 + boost;
                }

                const finalIntensity = Math.max(baseline, playerFactor);
                TileSystem.addLighting(k, tile, finalIntensity);
            }
        }
    },
    
    // Initialize fog of war
    initializeFogOfWar(k, levelData) {
        if (!levelData.fogOfWar?.enabled) return;
        
        const { unexploredOpacity } = levelData.fogOfWar;
        
        // Apply fog to all tiles initially - DISABLED to prevent black tiles
        this.levelTiles.forEach(tile => {
            // Keep tiles fully visible instead of applying fog opacity
            tile.opacity = 1.0;
        });
        
        console.log("Fog of war initialized");
    },
    
    // Update fog of war around player - OPTIMIZED for performance
    updateFogOfWar(k, playerGridX, playerGridY) {
        if (!this.currentLevelData?.fogOfWar?.enabled) return;
        
        // Performance optimization: Only update fog of war if player moved
        if (this.lastFogUpdateX === playerGridX && this.lastFogUpdateY === playerGridY) {
            return; // Skip update if player hasn't moved
        }
        this.lastFogUpdateX = playerGridX;
        this.lastFogUpdateY = playerGridY;
        
        const { visionRadius, exploredOpacity } = this.currentLevelData.fogOfWar;
        
        // Simplified fog of war - just set tiles to visible in vision range
        for (let dy = -visionRadius; dy <= visionRadius; dy++) {
            for (let dx = -visionRadius; dx <= visionRadius; dx++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= visionRadius) {
                    const tileX = playerGridX + dx;
                    const tileY = playerGridY + dy;
                    const tile = TileSystem.getTileAt(k, tileX, tileY);
                    
                    if (tile) {
                        // Simplified: just set to full visibility in vision range
                        TileSystem.revealTile(tile, 1.0);
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
        
        // Brighten tiles around the player after fog reveal
        try {
            this.applyPlayerLight(k, playerGridX, playerGridY);
        } catch (e) {
            console.warn("applyPlayerLight failed:", e);
        }
    },
    
    // Update visibility/opacity of non-tile entities based on fog of war
    updateEntityVisibility(k, playerGridX, playerGridY) {
        if (!this.currentLevelData?.fogOfWar?.enabled) return;
        const fog = this.currentLevelData.fogOfWar;
        const dims = (typeof window !== 'undefined' && window.LevelUtils) 
            ? window.LevelUtils.getDimensions(this.currentLevelData)
            : { width: this.currentLevelData.width, height: this.currentLevelData.height, tileSize: this.currentLevelData.tileSize || 32 };
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
        
        // First check if the tile itself is walkable
        const tileWalkable = (typeof window !== 'undefined' && window.LevelUtils) 
            ? window.LevelUtils.isWalkable(this.currentLevelData, gridX, gridY)
            : this.fallbackIsWalkable(gridX, gridY);
        if (!tileWalkable) return false;
        
        // Then check for closed doors at this position
        // console.log(`🔧 LevelSystem.isWalkable: this.k = ${typeof this.k}, window.k = ${typeof window.k}`);
        const k = this.k || window.k;
        if (k && typeof k.get === 'function') {
            const doors = k.get('door');
            // console.log(`🔧 Checking walkability at (${gridX}, ${gridY}) - found ${doors.length} doors`);
            for (let door of doors) {
                // console.log(`🔧 Door at (${door.gridX}, ${door.gridY}) - solid: ${door.solid}, isOpen: ${door.isOpen}`);
                if (door.gridX === gridX && door.gridY === gridY && door.solid) {
                    // console.log(`🚪 Movement blocked by closed door at (${gridX}, ${gridY})`);
                    return false;
                }
            }
        }
        
        return true;
    },
    
    // Get level dimensions
    getLevelDimensions() {
        if (!this.currentLevelData) return { width: 50, height: 38, tileSize: 32 };
        return (typeof window !== 'undefined' && window.LevelUtils) 
            ? window.LevelUtils.getDimensions(this.currentLevelData)
            : { width: this.currentLevelData.width, height: this.currentLevelData.height, tileSize: this.currentLevelData.tileSize || 32 };
    },
    
    // Fallback walkability check when LevelUtils is not available
    fallbackIsWalkable(gridX, gridY) {
        if (!this.currentLevelData || !this.currentLevelData.layout) return false;
        if (gridY < 0 || gridY >= this.currentLevelData.layout.length || 
            gridX < 0 || gridX >= this.currentLevelData.layout[0].length) {
            return false;
        }
        
        const symbol = this.currentLevelData.layout[gridY][gridX];
        
        // Entity symbols on floor are walkable
        const entitySymbolsOnFloor = new Set(['@', 'T', 'C', 'P', 'G', 'A', 'M', 'g', 'o', 'r', 's', 'E']);
        if (entitySymbolsOnFloor.has(symbol)) {
            return true;
        }
        
        // Basic walkable tiles
        const walkableSymbols = new Set(['.', 'f', 'w', 'D', 'E']);
        return walkableSymbols.has(symbol);
    }
};

// Make globally available
if (typeof window !== 'undefined') {
    window.LevelSystem = LevelSystem;
}

console.log('🏰 Level System loaded successfully');

// Expose to global for non-module access (e.g., main.js)
if (typeof window !== 'undefined') {
    window.LevelSystem = LevelSystem;
}
