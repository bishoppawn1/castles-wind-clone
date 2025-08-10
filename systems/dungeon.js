// Procedural dungeon generator for Castles of the Wind Clone
// Outputs a levelData object compatible with LevelSystem.loadLevelData()

// NOTE: This file is loaded as a module and also exposes a global for main.js usage

export const DungeonGenerator = {
    // Generate a dungeon level
    // width/height in tiles
    // options: { tileSize }
    generate(width = 50, height = 38, options = {}) {
        const tileSize = options.tileSize || 32;
        const maxRooms = options.maxRooms || 12;
        const minRooms = options.minRooms || 8;
        const roomMinSize = options.roomMinSize || 4;
        const roomMaxSize = options.roomMaxSize || 10;
        const rng = options.rng || Math.random;

        // Initialize grid with walls
        const grid = Array.from({ length: height }, () => Array.from({ length: width }, () => '#'));

        // Helper to carve a rectangle area to floors
        function carveRoom(x, y, w, h) {
            for (let yy = y; yy < y + h; yy++) {
                for (let xx = x; xx < x + w; xx++) {
                    if (xx > 0 && xx < width - 1 && yy > 0 && yy < height - 1) {
                        grid[yy][xx] = '.';
                    }
                }
            }
        }

        // Helper to carve a corridor between two points (L-shaped)
        function carveCorridor(x1, y1, x2, y2) {
            // Randomly choose horizontal-first or vertical-first
            if (rng() < 0.5) {
                // Horizontal then vertical
                for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                    if (x > 0 && x < width - 1) grid[y1][x] = '.';
                }
                for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                    if (y > 0 && y < height - 1) grid[y][x2] = '.';
                }
            } else {
                // Vertical then horizontal
                for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                    if (y > 0 && y < height - 1) grid[y][x1] = '.';
                }
                for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                    if (x > 0 && x < width - 1) grid[y2][x] = '.';
                }
            }
        }

        // Store rooms
        const rooms = [];
        const attempts = 100;
        const targetRooms = Math.floor(rng() * (maxRooms - minRooms + 1)) + minRooms;

        // Try to place rooms
        for (let i = 0; i < attempts && rooms.length < targetRooms; i++) {
            const rw = Math.floor(rng() * (roomMaxSize - roomMinSize + 1)) + roomMinSize;
            const rh = Math.floor(rng() * (roomMaxSize - roomMinSize + 1)) + roomMinSize;
            const rx = Math.floor(rng() * (width - rw - 2)) + 1; // leave 1-tile border
            const ry = Math.floor(rng() * (height - rh - 2)) + 1;

            const rect = { x: rx, y: ry, w: rw, h: rh };

            // Check overlap (with 1-tile padding)
            let overlaps = false;
            for (const r of rooms) {
                if (
                    rx - 1 < r.x + r.w + 1 &&
                    rx + rw + 1 > r.x - 1 &&
                    ry - 1 < r.y + r.h + 1 &&
                    ry + rh + 1 > r.y - 1
                ) {
                    overlaps = true;
                    break;
                }
            }
            if (overlaps) continue;

            carveRoom(rx, ry, rw, rh);
            rooms.push(rect);
        }

        // Ensure at least one big central room if none placed
        if (rooms.length === 0) {
            const rw = Math.min(10, Math.max(6, Math.floor(width / 3)));
            const rh = Math.min(8, Math.max(5, Math.floor(height / 3)));
            const rx = Math.floor((width - rw) / 2);
            const ry = Math.floor((height - rh) / 2);
            carveRoom(rx, ry, rw, rh);
            rooms.push({ x: rx, y: ry, w: rw, h: rh });
        }

        // Connect rooms with corridors
        function centerOf(r) {
            return { cx: Math.floor(r.x + r.w / 2), cy: Math.floor(r.y + r.h / 2) };
        }

        for (let i = 1; i < rooms.length; i++) {
            const a = centerOf(rooms[i - 1]);
            const b = centerOf(rooms[i]);
            carveCorridor(a.cx, a.cy, b.cx, b.cy);
        }

        // Optional: add a few doors where corridor meets room edges
        function addDoors() {
            const dirs = [
                [1, 0], [-1, 0], [0, 1], [0, -1]
            ];
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    if (grid[y][x] !== '.') continue;
                    let wallNeighbors = 0;
                    for (const [dx, dy] of dirs) {
                        const nx = x + dx, ny = y + dy;
                        if (grid[ny][nx] === '#') wallNeighbors++;
                    }
                    // A floor tile flanked by at least 3 walls likely marks a doorway
                    if (wallNeighbors >= 3) {
                        grid[y][x] = 'D';
                    }
                }
            }
        }
        addDoors();

        // Pick spawn and exit
        const startRoom = rooms[0];
        const endRoom = rooms[rooms.length - 1];
        const spawn = centerOf(startRoom);
        const exit = centerOf(endRoom);

        // Mark on grid (keep underlying floors for walkability, these are entity symbols)
        grid[spawn.cy][spawn.cx] = '@';
        grid[exit.cy][exit.cx] = 'X';

        // Scatter items and enemies in random rooms (not too many)
        function randFrom(arr) { return arr[Math.floor(rng() * arr.length)]; }
        const itemSymbols = ['P', 'G', 'T'];
        const enemySymbols = ['g', 'r', 'o', 's'];

        const itemCount = Math.floor(rng() * 8) + 6; // 6-13 items
        const enemyCount = Math.floor(rng() * 8) + 6; // 6-13 enemies

        function placeSymbol(symbol) {
            let tries = 0;
            while (tries++ < 200) {
                const room = randFrom(rooms);
                const x = Math.floor(rng() * (room.w - 2)) + room.x + 1;
                const y = Math.floor(rng() * (room.h - 2)) + room.y + 1;
                if (grid[y][x] === '.') {
                    grid[y][x] = symbol;
                    return true;
                }
            }
            return false;
        }

        for (let i = 0; i < itemCount; i++) placeSymbol(randFrom(itemSymbols));
        for (let i = 0; i < enemyCount; i++) placeSymbol(randFrom(enemySymbols));

        // Ensure border walls
        for (let x = 0; x < width; x++) {
            grid[0][x] = '#';
            grid[height - 1][x] = '#';
        }
        for (let y = 0; y < height; y++) {
            grid[y][0] = '#';
            grid[y][width - 1] = '#';
        }

        // Convert to array of strings
        const layout = grid.map(row => row.join(''));

        // Build level data object
        const levelData = {
            id: options.id || `proc_${Date.now()}`,
            name: options.name || 'Procedural Dungeon',
            width,
            height,
            tileSize,
            layout,
            playerSpawn: { x: spawn.cx, y: spawn.cy },
            lighting: {
                ambient: 0.25,
                torches: [
                    { x: Math.max(2, spawn.cx - 3), y: Math.max(2, spawn.cy - 3), radius: 4, intensity: 0.6 },
                    { x: Math.min(width - 3, exit.cx + 3), y: Math.min(height - 3, exit.cy + 3), radius: 4, intensity: 0.6 },
                ],
            },
            fogOfWar: {
                enabled: true,
                visionRadius: 4,
                exploredOpacity: 0.8,
                unexploredOpacity: 0.08,
            },
        };

        return levelData;
    },
};

// Expose globally so non-module main.js can use it
if (typeof window !== 'undefined') {
    window.DungeonGenerator = DungeonGenerator;
}
