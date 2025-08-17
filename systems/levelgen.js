// Level Generation System for Castles of the Wind Clone
// Handles treasure placement, spawn points, and level features

const LevelGenSystem = {
    k: null,

    init(kaboomContext) {
        this.k = kaboomContext;
        console.log('LevelGenSystem initialized');
    },

    // Place treasures from level data using Kaplay spawn points
    placeTreasures(levelData) {
        if (!levelData.items) {
            console.log(`⚠️ No items defined for level ${levelData.name}`);
            return;
        }

        console.log(`🔍 Checking ${levelData.items.length} potential treasures in ${levelData.name}`);
        console.log(`🔍 GameState available:`, typeof window.GameState !== 'undefined');
        if (typeof window.GameState !== 'undefined') {
            console.log(`🔍 Items collected array:`, window.GameState.worldState.itemsCollected);
        }

        let spawnedCount = 0;
        levelData.items.forEach(item => {
            const itemId = `${item.type}_${item.x}_${item.y}`;
            console.log(`🔍 Checking item ${itemId}...`);
            
            // Check if this item has already been collected
            if (!this.isItemCollected(item, levelData.name)) {
                console.log(`✅ Spawning item ${itemId} at (${item.x}, ${item.y})`);
                this.spawnTreasureItem(item);
                spawnedCount++;
            } else {
                console.log(`⏭️ Skipping already collected item ${itemId} at (${item.x}, ${item.y})`);
            }
        });
        
        console.log(`📦 Final result: Spawned ${spawnedCount} new treasures (${levelData.items.length - spawnedCount} already collected)`);
    },

    // Check if an item has already been collected
    isItemCollected(itemData, levelName) {
        if (typeof window.GameState === 'undefined' || !window.GameState.worldState.itemsCollected) {
            return false;
        }
        
        // Create unique identifier for this item (matching format used in main.js)
        const itemId = `${itemData.type}_${itemData.x}_${itemData.y}`;
        
        return window.GameState.worldState.itemsCollected.includes(itemId);
    },

    // Spawn individual treasure item
    spawnTreasureItem(itemData) {
        const { type, x, y, value, effect, defense, attack, contents } = itemData;
        
        // Calculate world position from grid coordinates
        const worldX = x * 32 + 16; // Center in tile
        const worldY = y * 32 + 16;

        let treasureObj;

        switch (type) {
            case 'treasure':
                treasureObj = this.k.add([
                    this.k.rect(20, 20),
                    this.k.color(255, 215, 0), // Gold color
                    this.k.pos(worldX, worldY),
                    this.k.anchor("center"),
                    this.k.area(),
                    this.k.z(10),
                    "treasure",
                    "interactive",
                    {
                        gridX: x,
                        gridY: y,
                        value: value || 100,
                        itemType: 'treasure',
                        collected: false
                    }
                ]);
                break;

            case 'potion':
                treasureObj = this.k.add([
                    this.k.circle(8),
                    this.k.color(255, 0, 255), // Magenta for magic potion
                    this.k.pos(worldX, worldY),
                    this.k.anchor("center"),
                    this.k.area(),
                    this.k.z(10),
                    "potion",
                    "interactive",
                    {
                        gridX: x,
                        gridY: y,
                        effect: effect || 'heal',
                        itemType: 'potion',
                        collected: false
                    }
                ]);
                break;

            case 'gold':
                treasureObj = this.k.add([
                    this.k.circle(6),
                    this.k.color(255, 215, 0), // Gold color
                    this.k.pos(worldX, worldY),
                    this.k.anchor("center"),
                    this.k.area(),
                    this.k.z(10),
                    "gold",
                    "interactive",
                    {
                        gridX: x,
                        gridY: y,
                        value: value || 25,
                        itemType: 'gold',
                        collected: false
                    }
                ]);
                break;

            case 'armor':
                treasureObj = this.k.add([
                    this.k.rect(16, 20),
                    this.k.color(150, 150, 150), // Silver armor
                    this.k.pos(worldX, worldY),
                    this.k.anchor("center"),
                    this.k.area(),
                    this.k.z(10),
                    "armor",
                    "interactive",
                    {
                        gridX: x,
                        gridY: y,
                        defense: defense || 2,
                        itemType: 'armor',
                        collected: false
                    }
                ]);
                break;

            case 'weapon':
                treasureObj = this.k.add([
                    this.k.rect(4, 24),
                    this.k.color(139, 69, 19), // Brown handle
                    this.k.pos(worldX, worldY),
                    this.k.anchor("center"),
                    this.k.area(),
                    this.k.z(10),
                    "weapon",
                    "interactive",
                    {
                        gridX: x,
                        gridY: y,
                        attack: attack || 3,
                        itemType: 'weapon',
                        collected: false
                    }
                ]);
                break;

            case 'chest':
                treasureObj = this.k.add([
                    this.k.rect(24, 16),
                    this.k.color(139, 69, 19), // Brown chest
                    this.k.pos(worldX, worldY),
                    this.k.anchor("center"),
                    this.k.area(),
                    this.k.z(10),
                    "chest",
                    "interactive",
                    {
                        gridX: x,
                        gridY: y,
                        contents: contents || ['gold'],
                        itemType: 'chest',
                        opened: false
                    }
                ]);
                break;
        }

        // Add pickup interaction
        if (treasureObj) {
            treasureObj.onCollide("player", () => {
                this.collectTreasure(treasureObj);
            });

            console.log(`Spawned ${type} at (${x}, ${y}) with value/effect:`, value || effect || defense || attack);
        }
    },

    // Handle treasure collection
    collectTreasure(treasureObj) {
        if (treasureObj.collected || treasureObj.opened) return;

        const player = this.k.get("player")[0];
        if (!player) return;

        switch (treasureObj.itemType) {
            case 'treasure':
            case 'gold':
                // Add to player's gold
                if (player.gold !== undefined) {
                    player.gold += treasureObj.value;
                } else {
                    player.gold = treasureObj.value;
                }
                console.log(`Collected ${treasureObj.value} gold! Total: ${player.gold}`);
                break;

            case 'potion':
                // Heal player
                if (treasureObj.effect === 'heal' && player.health !== undefined) {
                    const healAmount = 20;
                    player.health = Math.min(player.maxHealth || 100, player.health + healAmount);
                    console.log(`Used healing potion! Health: ${player.health}`);
                }
                break;

            case 'armor':
                // Increase defense
                if (player.defense !== undefined) {
                    player.defense += treasureObj.defense;
                } else {
                    player.defense = treasureObj.defense;
                }
                console.log(`Equipped armor! Defense: ${player.defense}`);
                break;

            case 'weapon':
                // Increase attack
                if (player.attack !== undefined) {
                    player.attack += treasureObj.attack;
                } else {
                    player.attack = treasureObj.attack;
                }
                console.log(`Equipped weapon! Attack: ${player.attack}`);
                break;

            case 'chest':
                // Open chest and spawn contents
                treasureObj.opened = true;
                treasureObj.color = this.k.color(101, 67, 33); // Darker brown for opened chest
                
                if (treasureObj.contents) {
                    treasureObj.contents.forEach(contentType => {
                        // Spawn content items nearby
                        const offsetX = (Math.random() - 0.5) * 32;
                        const offsetY = (Math.random() - 0.5) * 32;
                        
                        this.spawnTreasureItem({
                            type: contentType,
                            x: treasureObj.gridX,
                            y: treasureObj.gridY,
                            value: contentType === 'gold' ? 50 : undefined
                        });
                    });
                }
                console.log(`Opened chest! Contents: ${treasureObj.contents.join(', ')}`);
                return; // Don't destroy chest, just mark as opened
        }

        // Mark as collected and destroy
        treasureObj.collected = true;
        treasureObj.destroy();
    },

    // Create entrance/exit points with special tile behaviors
    createEntranceExit(levelData) {
        const entrances = this.findTilePositions(levelData, 'entrance');
        const exits = this.findTilePositions(levelData, 'exit');

        // Create entrance tiles
        entrances.forEach(pos => {
            const worldX = pos.x * 32 + 16;
            const worldY = pos.y * 32 + 16;

            this.k.add([
                this.k.rect(32, 32),
                this.k.color(0, 255, 0), // Green for entrance
                this.k.pos(worldX, worldY),
                this.k.anchor("center"),
                this.k.area(),
                this.k.z(1),
                "entrance",
                {
                    gridX: pos.x,
                    gridY: pos.y,
                    tileType: 'entrance'
                }
            ]);
        });

        // Create exit tiles
        exits.forEach(pos => {
            const worldX = pos.x * 32 + 16;
            const worldY = pos.y * 32 + 16;

            this.k.add([
                this.k.rect(32, 32),
                this.k.color(255, 0, 0), // Red for exit
                this.k.pos(worldX, worldY),
                this.k.anchor("center"),
                this.k.area(),
                this.k.z(1),
                "exit",
                "interactive",
                {
                    gridX: pos.x,
                    gridY: pos.y,
                    tileType: 'exit'
                }
            ]);
        });

        console.log(`Created ${entrances.length} entrances and ${exits.length} exits`);
    },

    // Find positions of specific tile types in level
    findTilePositions(levelData, tileType) {
        const positions = [];
        const symbol = this.getTileSymbol(tileType);
        
        if (!symbol) return positions;

        for (let y = 0; y < levelData.layout.length; y++) {
            for (let x = 0; x < levelData.layout[y].length; x++) {
                if (levelData.layout[y][x] === symbol) {
                    positions.push({ x, y });
                }
            }
        }

        return positions;
    },

    // Get symbol for tile type (reverse lookup)
    getTileSymbol(tileType) {
        const TILE_SYMBOLS = {
            'floor': '.',
            'wall': '#',
            'door': 'D',
            'stairs_down': 'S',
            'stairs_up': 'U',
            'entrance': 'E',
            'exit': 'X',
            'treasure': 'T',
            'chest': 'C',
            'potion': 'P',
            'gold': 'G',
            'armor': 'A',
            'weapon': 'M'
        };

        return Object.keys(TILE_SYMBOLS).find(key => TILE_SYMBOLS[key] === tileType);
    },

    // Generate level features and spawn all elements
    generateLevel(levelData) {
        console.log(`Generating level: ${levelData.name}`);
        
        // Place treasures and items
        this.placeTreasures(levelData);
        
        // Create entrance/exit points
        this.createEntranceExit(levelData);
        
        console.log(`Level generation complete for ${levelData.name}`);
    }
};
