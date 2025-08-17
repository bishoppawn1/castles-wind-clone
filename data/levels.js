// Level data for Castles of the Wind Clone

// Tile symbol mapping
const TILE_SYMBOLS = {
    // Floor tiles
    '.': 'floor',
    'f': 'floor_stone',
    'w': 'floor_wood',
    
    // Wall tiles
    '#': 'wall',
    'W': 'wall_stone',
    'B': 'wall_brick',
    
    // Special tiles
    'D': 'door',
    'S': 'stairs_down',
    'U': 'stairs_up',
    'E': 'entrance',
    'X': 'exit',
    
    // Interactive objects
    'T': 'treasure',
    'C': 'chest',
    'P': 'potion',
    'G': 'gold',
    'A': 'armor',
    'M': 'weapon',
    
    // Enemies (spawn points)
    'g': 'goblin',
    'o': 'orc',
    'r': 'rat',
    's': 'skeleton',
    
    // Player spawn
    '@': 'player_spawn'
};

// Level 1: Castle entrance
const LEVEL_1 = {
    id: 'level_1',
    name: 'Castle Entrance',
    width: 50,
    height: 38,
    tileSize: 32,
    
    // Level layout using symbols
    layout: [
        "##################################################",
        "#................................................#",
        "#.......T....................#...................#",
        "#..........#################.#...................#",
        "#..........D...............#.#...................#",
        "#..........#...g...........#.#...................#",
        "#..........#...............#.#...................#",
        "#..........#...............#.#...................#",
        "#..........#...............#.#...................#",
        "#..........#...............#.#...................#",
        "#..........########D########.#...................#",
        "#..........................#.#...................#",
        "#..........................#.#...................#",
        "#..........................#.#...................#",
        "#..........................#.#...................#",
        "#..........................#.#...................#",
        "#..........................#.#...................#",
        "#..........................#.#...................#",
        "#..........................#.#...................#",
        "#..........................#.#...................#",
        "#..........................#.#...................#",
        "#..........................#D#...................#",
        "#..........................#.#...................#",
        "#..........................#.#...................#",
        "#..........................#.#...................#",
        "#..........................#.#...................#",
        "#..........................#.#...................#",
        "#..........................#.#...................#",
        "#..........................#.#...................#",
        "#..........................#.#...................#",
        "#..........................#.#...................#",
        "#..........................#.#...................#",
        "#..........................#.#...................#",
        "#..........................#.#...................#",
        "#..........................#.#...................#",
        "#..........................#E#...................#",
        "#..........................#@#...................#",
        "##################################################"
    ],
    
    // Spawn points and special locations
    playerSpawn: { x: 28, y: 36 },
    
    // Items and treasures
    items: [
        { type: 'treasure', x: 8, y: 2, value: 100 },
        { type: 'potion', x: 15, y: 5, effect: 'heal' },
        { type: 'gold', x: 25, y: 10, value: 50 }
    ],

    // Enemy spawn points
    enemies: [
        { type: 'goblin', x: 15, y: 5, level: 1 },
        { type: 'goblin', x: 17, y: 5, level: 1 }
    ],
    
    // Environmental hazards and traps
    traps: [
        { type: 'spike_trap', x: 5, y: 15, damage: 10 },   // Left corridor
        { type: 'spike_trap', x: 15, y: 30, damage: 15 },  // Lower corridor
        { type: 'spike_trap', x: 35, y: 10, damage: 12 }   // Right side open area
    ],

    // Stairs for level progression
    stairs: [
        { type: 'down', x: 28, y: 35, targetLevel: 'level_2', description: 'Stairs leading deeper into the castle' }
    ],
    
    // Lighting configuration
    lighting: {
        ambient: 0.8,  // Increased from 0.3 to 0.8 for much better visibility
        torches: [
            { x: 5, y: 5, radius: 5, intensity: 0.8 },
            { x: 20, y: 15, radius: 4, intensity: 0.6 }
        ]
    },
    
    // Fog of war settings - Light fog for exploration without darkness
    fogOfWar: {
        enabled: true,
        visionRadius: 6,  // Large vision area
        exploredOpacity: 0.95,  // Very bright explored areas
        unexploredOpacity: 0.6  // Much lighter unexplored areas (was 0.1, now 0.6)
    }
};

// Level 2: Deeper into the castle
const LEVEL_2 = {
    id: 'level_2',
    name: 'Castle Corridors',
    width: 50,
    height: 38,
    tileSize: 32,
    
    layout: [
        "##################################################",
        "#................................................#",
        "#.#####.#####.#####.#####.#####.#####.#####......#",
        "#.#...#.#...#.#...#.#...#.#...#.#...#.#...#.....#",
        "#.#.g.#.#.o.#.#.r.#.#.s.#.#.T.#.#.C.#.#.A.#......#",
        "#.#...#.#...#.#...#.#...#.#...#.#...#.#...#......#",
        "#.#D###.#D###.#D###.#D###.#D###.#D###.#D###......#",
        "#................................................#",
        "#................................................#",
        "#.#####.#####.#####.#####.#####.#####.#####......#",
        "#.#...#.#...#.#...#.#...#.#...#.#...#.#...#......#",
        "#.#.P.#.#.G.#.#.M.#.#...#.#...#.#...#.#...#......#",
        "#.#...#.#...#.#...#.#...#.#...#.#...#.#...#......#",
        "#.#D###.#D###.#D###.#D###.#D###.#D###.#D###......#",
        "#................................................#",
        "#................................................#",
        "#................................................#",
        "#@...............................................#",
        "#U...............................................#",
        "#................................................#",
        "#................................................#",
        "#................................................#",
        "#................................................#",
        "#................................................#",
        "#................................................#",
        "#................................................#",
        "#................................................#",
        "#................................................#",
        "#................................................#",
        "#................................................#",
        "#................................................#",
        "#................................................#",
        "#................................................#",
        "#................................................#",
        "#................................................#",
        "#................................................#",
        "##################################################"
    ],
    
    playerSpawn: { x: 1, y: 17 },
    
    items: [
        { type: 'treasure', x: 29, y: 4, value: 200 },
        { type: 'chest', x: 36, y: 4, contents: ['potion', 'gold'] },
        { type: 'armor', x: 43, y: 4, defense: 5 },
        { type: 'potion', x: 8, y: 11, effect: 'heal' },
        { type: 'gold', x: 15, y: 11, value: 75 },
        { type: 'weapon', x: 22, y: 11, attack: 3 }
    ],
    
    enemies: [
        { type: 'goblin', x: 8, y: 4, level: 1 },
        { type: 'orc', x: 15, y: 4, level: 2 },
        { type: 'rat', x: 22, y: 4, level: 1 },
        { type: 'skeleton', x: 29, y: 4, level: 3 }
    ],

    // Stairs for level progression
    stairs: [
        { type: 'up', x: 1, y: 18, targetLevel: 'level_1', description: 'Stairs leading back to the castle entrance' }
    ],
    
    lighting: {
        ambient: 0.8,  // Increased from 0.2 to 0.8 for much better visibility
        doors: [
            { x: 15, y: 10, isOpen: false, locked: false },
            { x: 20, y: 15, isOpen: false, locked: false },
            { x: 25, y: 8, isOpen: false, locked: false }
        ],
        torches: [
            { x: 10, y: 10, radius: 4, intensity: 0.7 },
            { x: 25, y: 10, radius: 4, intensity: 0.7 },
            { x: 40, y: 10, radius: 4, intensity: 0.7 }
        ]
    },
    
    chests: [
        { x: 12, y: 8, type: 'wooden', locked: false, contents: [
            { type: 'gold', amount: 25 },
            { type: 'item', id: 'health_potion', name: 'Health Potion', category: 'potion' }
        ]},
        { x: 30, y: 12, type: 'wooden', locked: true, keyRequired: 'Iron Key', contents: [
            { type: 'gold', amount: 50 },
            { type: 'item', name: 'Ring of Strength', category: 'equipment' }
        ]},
        { x: 18, y: 20, type: 'wooden', locked: false, contents: [
            { type: 'experience', amount: 15 },
            { type: 'item', id: 'mana_potion', name: 'Mana Potion', category: 'potion' }
        ]},
        { x: 10, y: 8, type: 'wooden', locked: false, contents: [
            { type: 'gold', amount: 30 },
            { type: 'item', id: 'health_potion', name: 'Health Potion', category: 'potion' }
        ]}
    ],
    
    fogOfWar: {
        enabled: true,
        visionRadius: 6,  // Large vision area
        exploredOpacity: 0.95,  // Very bright explored areas
        unexploredOpacity: 0.6  // Much lighter unexplored areas for better visibility
    }
};

// Global levels object
const LEVELS = {
    1: LEVEL_1,
    level_1: LEVEL_1,
    2: LEVEL_2,
    level_2: LEVEL_2
};

// Level utilities
const LevelUtils = {
    // Get tile type at position
    getTileAt(level, x, y) {
        if (y < 0 || y >= level.layout.length || x < 0 || x >= level.layout[0].length) {
            return null;
        }
        const symbol = level.layout[y][x];
        return TILE_SYMBOLS[symbol] || 'unknown';
    },
    
    // Check if position is walkable
    isWalkable(level, x, y) {
        // Bounds check
        if (y < 0 || y >= level.layout.length || x < 0 || x >= level.layout[0].length) {
            return false;
        }

        const symbol = level.layout[y][x];

        // Treat entity placeholders as walkable (items/spawn are placed on floor)
        // These symbols do not create tiles but should not block movement
        const entitySymbolsOnFloor = new Set(['@', 'T', 'C', 'P', 'G', 'A', 'M', 'g', 'o', 'r', 's']);
        if (entitySymbolsOnFloor.has(symbol)) {
            return true;
        }

        const tileType = this.getTileAt(level, x, y);
        if (!tileType || tileType === 'unknown') return false;

        // Prefer tile configuration if available globally
        if (typeof window !== 'undefined' && window.TILE_CONFIG && window.TILE_CONFIG[tileType]) {
            return !!window.TILE_CONFIG[tileType].walkable;
        }

        // Fallback list for environments without TILE_CONFIG
        const walkableTiles = ['floor', 'floor_stone', 'floor_wood', 'door', 'stairs_down', 'stairs_up', 'entrance', 'exit'];
        return walkableTiles.includes(tileType);
    },
    
    // Get all positions of a specific tile type
    findTiles(level, tileType) {
        const positions = [];
        const symbol = Object.keys(TILE_SYMBOLS).find(key => TILE_SYMBOLS[key] === tileType);
        if (!symbol) return positions;
        
        for (let y = 0; y < level.layout.length; y++) {
            for (let x = 0; x < level.layout[y].length; x++) {
                if (level.layout[y][x] === symbol) {
                    positions.push({ x, y });
                }
            }
        }
        return positions;
    },
    
    // Get level dimensions
    getDimensions(level) {
        return {
            width: level.width,
            height: level.height,
            tileSize: level.tileSize
        };
    }
};

// Make LEVELS, TILE_SYMBOLS, and LevelUtils globally available
if (typeof window !== 'undefined') {
    window.LEVELS = LEVELS;
    window.TILE_SYMBOLS = TILE_SYMBOLS;
    window.LevelUtils = LevelUtils;
}

console.log('📊 Level data loaded successfully');
