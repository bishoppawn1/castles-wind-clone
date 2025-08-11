// Level data structure for Castles of the Wind Clone
// Compatible with Kaplay's level system

import { TILE_CONFIG } from './tiles.js';

// Tile symbols for level mapping
export const TILE_SYMBOLS = {
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

// Level 1: Tutorial/Starting Area
export const LEVEL_1 = {
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
        "#..........................#.#...................#",
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
        { type: 'goblin', x: 17, y: 5, level: 1 }
    ],
    
    // Lighting configuration
    lighting: {
        ambient: 0.3,
        torches: [
            { x: 5, y: 5, radius: 5, intensity: 0.8 },
            { x: 20, y: 15, radius: 4, intensity: 0.6 }
        ]
    },
    
    // Fog of war settings
    fogOfWar: {
        enabled: true,
        visionRadius: 3,
        exploredOpacity: 0.7,
        unexploredOpacity: 0.1
    }
};

// Level 2: Deeper into the castle
export const LEVEL_2 = {
    id: 'level_2',
    name: 'Castle Corridors',
    width: 50,
    height: 38,
    tileSize: 32,
    
    layout: [
        "##################################################",
        "#................................................#",
        "#.#####.#####.#####.#####.#####.#####.#####.....#",
        "#.#...#.#...#.#...#.#...#.#...#.#...#.#...#.....#",
        "#.#.g.#.#.o.#.#.r.#.#.s.#.#.T.#.#.C.#.#.A.#.....#",
        "#.#...#.#...#.#...#.#...#.#...#.#...#.#...#.....#",
        "#.#D###.#D###.#D###.#D###.#D###.#D###.#D###.....#",
        "#................................................#",
        "#................................................#",
        "#.#####.#####.#####.#####.#####.#####.#####.....#",
        "#.#...#.#...#.#...#.#...#.#...#.#...#.#...#.....#",
        "#.#.P.#.#.G.#.#.M.#.#...#.#...#.#...#.#...#.....#",
        "#.#...#.#...#.#...#.#...#.#...#.#...#.#...#.....#",
        "#.#D###.#D###.#D###.#D###.#D###.#D###.#D###.....#",
        "#................................................#",
        "#................................................#",
        "#................................................#",
        "#@...............................................#",
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
    
    lighting: {
        ambient: 0.2,
        torches: [
            { x: 10, y: 10, radius: 4, intensity: 0.7 },
            { x: 25, y: 10, radius: 4, intensity: 0.7 },
            { x: 40, y: 10, radius: 4, intensity: 0.7 }
        ]
    },
    
    fogOfWar: {
        enabled: true,
        visionRadius: 3,
        exploredOpacity: 0.7,
        unexploredOpacity: 0.05
    }
};

// Export all levels
export const LEVELS = {
    1: LEVEL_1,
    2: LEVEL_2
};

// Level utilities
export const LevelUtils = {
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

        // Prefer tile configuration if available
        if (typeof TILE_CONFIG === 'object' && TILE_CONFIG[tileType]) {
            return !!TILE_CONFIG[tileType].walkable;
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
