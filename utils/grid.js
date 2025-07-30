// Castles of the Wind Clone - Grid System Utilities
// Handles tile-based positioning and grid calculations

// Grid configuration - matches GAME_CONFIG
const GRID_CONFIG = {
    TILE_SIZE: 32,
    GRID_WIDTH: 32,  // Number of tiles horizontally
    GRID_HEIGHT: 18, // Number of tiles vertically
    OFFSET_X: 0,     // Grid offset from left edge
    OFFSET_Y: 0      // Grid offset from top edge
};

// Grid utility functions
const GridUtils = {
    
    /**
     * Convert grid coordinates to pixel coordinates
     * @param {number} gridX - Grid X coordinate (0-based)
     * @param {number} gridY - Grid Y coordinate (0-based)
     * @returns {Object} - {x, y} pixel coordinates
     */
    gridToPixel: function(gridX, gridY) {
        return {
            x: GRID_CONFIG.OFFSET_X + (gridX * GRID_CONFIG.TILE_SIZE),
            y: GRID_CONFIG.OFFSET_Y + (gridY * GRID_CONFIG.TILE_SIZE)
        };
    },
    
    /**
     * Convert pixel coordinates to grid coordinates
     * @param {number} pixelX - Pixel X coordinate
     * @param {number} pixelY - Pixel Y coordinate
     * @returns {Object} - {x, y} grid coordinates
     */
    pixelToGrid: function(pixelX, pixelY) {
        return {
            x: Math.floor((pixelX - GRID_CONFIG.OFFSET_X) / GRID_CONFIG.TILE_SIZE),
            y: Math.floor((pixelY - GRID_CONFIG.OFFSET_Y) / GRID_CONFIG.TILE_SIZE)
        };
    },
    
    /**
     * Get the center pixel position of a grid cell
     * @param {number} gridX - Grid X coordinate
     * @param {number} gridY - Grid Y coordinate
     * @returns {Object} - {x, y} center pixel coordinates
     */
    gridToPixelCenter: function(gridX, gridY) {
        const pixel = this.gridToPixel(gridX, gridY);
        return {
            x: pixel.x + GRID_CONFIG.TILE_SIZE / 2,
            y: pixel.y + GRID_CONFIG.TILE_SIZE / 2
        };
    },
    
    /**
     * Check if grid coordinates are within bounds
     * @param {number} gridX - Grid X coordinate
     * @param {number} gridY - Grid Y coordinate
     * @returns {boolean} - True if coordinates are valid
     */
    isValidGridPosition: function(gridX, gridY) {
        return gridX >= 0 && gridX < GRID_CONFIG.GRID_WIDTH &&
               gridY >= 0 && gridY < GRID_CONFIG.GRID_HEIGHT;
    },
    
    /**
     * Clamp grid coordinates to valid bounds
     * @param {number} gridX - Grid X coordinate
     * @param {number} gridY - Grid Y coordinate
     * @returns {Object} - {x, y} clamped grid coordinates
     */
    clampToGrid: function(gridX, gridY) {
        return {
            x: Math.max(0, Math.min(GRID_CONFIG.GRID_WIDTH - 1, gridX)),
            y: Math.max(0, Math.min(GRID_CONFIG.GRID_HEIGHT - 1, gridY))
        };
    },
    
    /**
     * Calculate distance between two grid positions
     * @param {number} x1 - First position X
     * @param {number} y1 - First position Y
     * @param {number} x2 - Second position X
     * @param {number} y2 - Second position Y
     * @returns {number} - Distance in grid units
     */
    gridDistance: function(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    /**
     * Calculate Manhattan distance between two grid positions
     * @param {number} x1 - First position X
     * @param {number} y1 - First position Y
     * @param {number} x2 - Second position X
     * @param {number} y2 - Second position Y
     * @returns {number} - Manhattan distance in grid units
     */
    manhattanDistance: function(x1, y1, x2, y2) {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    },
    
    /**
     * Get neighboring grid positions (4-directional)
     * @param {number} gridX - Grid X coordinate
     * @param {number} gridY - Grid Y coordinate
     * @param {boolean} includeInvalid - Include positions outside grid bounds
     * @returns {Array} - Array of {x, y} neighbor positions
     */
    getNeighbors: function(gridX, gridY, includeInvalid = false) {
        const neighbors = [
            { x: gridX, y: gridY - 1 }, // North
            { x: gridX + 1, y: gridY }, // East
            { x: gridX, y: gridY + 1 }, // South
            { x: gridX - 1, y: gridY }  // West
        ];
        
        if (includeInvalid) {
            return neighbors;
        }
        
        return neighbors.filter(pos => this.isValidGridPosition(pos.x, pos.y));
    },
    
    /**
     * Get neighboring grid positions (8-directional)
     * @param {number} gridX - Grid X coordinate
     * @param {number} gridY - Grid Y coordinate
     * @param {boolean} includeInvalid - Include positions outside grid bounds
     * @returns {Array} - Array of {x, y} neighbor positions
     */
    getNeighbors8: function(gridX, gridY, includeInvalid = false) {
        const neighbors = [
            { x: gridX - 1, y: gridY - 1 }, // Northwest
            { x: gridX, y: gridY - 1 },     // North
            { x: gridX + 1, y: gridY - 1 }, // Northeast
            { x: gridX + 1, y: gridY },     // East
            { x: gridX + 1, y: gridY + 1 }, // Southeast
            { x: gridX, y: gridY + 1 },     // South
            { x: gridX - 1, y: gridY + 1 }, // Southwest
            { x: gridX - 1, y: gridY }      // West
        ];
        
        if (includeInvalid) {
            return neighbors;
        }
        
        return neighbors.filter(pos => this.isValidGridPosition(pos.x, pos.y));
    },
    
    /**
     * Create a Kaplay position component for a grid coordinate
     * @param {number} gridX - Grid X coordinate
     * @param {number} gridY - Grid Y coordinate
     * @param {boolean} centered - Position at center of tile
     * @returns {Object} - Kaplay pos() component data
     */
    createGridPos: function(gridX, gridY, centered = false) {
        if (centered) {
            const center = this.gridToPixelCenter(gridX, gridY);
            return { x: center.x, y: center.y };
        } else {
            const pixel = this.gridToPixel(gridX, gridY);
            return { x: pixel.x, y: pixel.y };
        }
    },
    
    /**
     * Get all grid positions in a rectangular area
     * @param {number} startX - Starting grid X
     * @param {number} startY - Starting grid Y
     * @param {number} width - Width in grid units
     * @param {number} height - Height in grid units
     * @returns {Array} - Array of {x, y} grid positions
     */
    getGridRect: function(startX, startY, width, height) {
        const positions = [];
        for (let y = startY; y < startY + height; y++) {
            for (let x = startX; x < startX + width; x++) {
                if (this.isValidGridPosition(x, y)) {
                    positions.push({ x, y });
                }
            }
        }
        return positions;
    },
    
    /**
     * Get all grid positions in a circular area
     * @param {number} centerX - Center grid X
     * @param {number} centerY - Center grid Y
     * @param {number} radius - Radius in grid units
     * @returns {Array} - Array of {x, y} grid positions
     */
    getGridCircle: function(centerX, centerY, radius) {
        const positions = [];
        const radiusSquared = radius * radius;
        
        for (let y = centerY - radius; y <= centerY + radius; y++) {
            for (let x = centerX - radius; x <= centerX + radius; x++) {
                if (this.isValidGridPosition(x, y)) {
                    const dx = x - centerX;
                    const dy = y - centerY;
                    if (dx * dx + dy * dy <= radiusSquared) {
                        positions.push({ x, y });
                    }
                }
            }
        }
        return positions;
    },
    
    /**
     * Update grid configuration (useful for dynamic resizing)
     * @param {Object} newConfig - New grid configuration
     */
    updateConfig: function(newConfig) {
        Object.assign(GRID_CONFIG, newConfig);
    },
    
    /**
     * Get current grid configuration
     * @returns {Object} - Current grid configuration
     */
    getConfig: function() {
        return { ...GRID_CONFIG };
    },
    
    /**
     * Debug: Draw grid lines (for development)
     * @param {Object} k - Kaplay instance
     * @param {Object} options - Drawing options
     */
    drawDebugGrid: function(k, options = {}) {
        const opts = {
            color: [100, 100, 100],
            opacity: 0.3,
            lineWidth: 1,
            ...options
        };
        
        // Vertical lines
        for (let x = 0; x <= GRID_CONFIG.GRID_WIDTH; x++) {
            const pixelX = GRID_CONFIG.OFFSET_X + x * GRID_CONFIG.TILE_SIZE;
            k.add([
                k.rect(opts.lineWidth, GRID_CONFIG.GRID_HEIGHT * GRID_CONFIG.TILE_SIZE),
                k.pos(pixelX, GRID_CONFIG.OFFSET_Y),
                k.color(...opts.color),
                k.opacity(opts.opacity),
                k.z(1000), // High z-index for debug overlay
                "debug-grid"
            ]);
        }
        
        // Horizontal lines
        for (let y = 0; y <= GRID_CONFIG.GRID_HEIGHT; y++) {
            const pixelY = GRID_CONFIG.OFFSET_Y + y * GRID_CONFIG.TILE_SIZE;
            k.add([
                k.rect(GRID_CONFIG.GRID_WIDTH * GRID_CONFIG.TILE_SIZE, opts.lineWidth),
                k.pos(GRID_CONFIG.OFFSET_X, pixelY),
                k.color(...opts.color),
                k.opacity(opts.opacity),
                k.z(1000), // High z-index for debug overlay
                "debug-grid"
            ]);
        }
        
        console.log("🔲 Debug grid drawn");
    },
    
    /**
     * Remove debug grid
     * @param {Object} k - Kaplay instance
     */
    removeDebugGrid: function(k) {
        k.destroyAll("debug-grid");
        console.log("🔲 Debug grid removed");
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GridUtils, GRID_CONFIG };
}

// Make available globally for browser usage
window.GridUtils = GridUtils;
window.GRID_CONFIG = GRID_CONFIG;

console.log("🔲 Grid system utilities loaded");
