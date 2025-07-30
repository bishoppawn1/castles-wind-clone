// Castles of the Wind Clone - Camera System
// Handles camera movement, following, and viewport management

// Camera configuration
const CAMERA_CONFIG = {
    // Follow settings
    FOLLOW_SPEED: 0.1,        // How quickly camera follows target (0-1)
    FOLLOW_OFFSET_X: 0,       // Offset from target X
    FOLLOW_OFFSET_Y: 0,       // Offset from target Y
    
    // Boundaries
    ENABLE_BOUNDARIES: true,   // Whether to constrain camera to world bounds
    WORLD_WIDTH: 1600,        // World width in pixels
    WORLD_HEIGHT: 1200,       // World height in pixels
    
    // Smooth movement
    SMOOTH_MOVEMENT: true,    // Enable smooth camera transitions
    SMOOTH_FACTOR: 0.15,      // Smoothing factor (lower = smoother)
    
    // Shake effects
    SHAKE_INTENSITY: 10,      // Maximum shake distance
    SHAKE_DURATION: 500,      // Shake duration in milliseconds
    
    // Zoom settings
    MIN_ZOOM: 0.5,           // Minimum zoom level
    MAX_ZOOM: 2.0,           // Maximum zoom level
    DEFAULT_ZOOM: 1.0,       // Default zoom level
    ZOOM_SPEED: 0.1          // Zoom transition speed
};

// Camera state
let cameraState = {
    target: null,             // Object to follow
    currentPos: { x: 0, y: 0 }, // Current camera position
    targetPos: { x: 0, y: 0 },  // Target camera position
    isFollowing: false,       // Whether camera is following a target
    shake: {
        active: false,
        intensity: 0,
        duration: 0,
        startTime: 0,
        offsetX: 0,
        offsetY: 0
    },
    zoom: {
        current: CAMERA_CONFIG.DEFAULT_ZOOM,
        target: CAMERA_CONFIG.DEFAULT_ZOOM,
        transitioning: false
    },
    boundaries: {
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0
    }
};

// Camera utility functions
const CameraSystem = {
    
    /**
     * Initialize the camera system
     * @param {Object} k - Kaplay instance
     * @param {Object} config - Camera configuration overrides
     */
    init: function(k, config = {}) {
        // Merge configuration
        Object.assign(CAMERA_CONFIG, config);
        
        // Calculate camera boundaries based on world size and viewport
        this.updateBoundaries(k);
        
        // Set initial camera position
        cameraState.currentPos = { x: 0, y: 0 };
        cameraState.targetPos = { x: 0, y: 0 };
        
        console.log("📷 Camera system initialized");
        console.log("🌍 World size:", CAMERA_CONFIG.WORLD_WIDTH, "x", CAMERA_CONFIG.WORLD_HEIGHT);
        console.log("📺 Viewport:", k.width(), "x", k.height());
    },
    
    /**
     * Update camera boundaries based on world and viewport size
     * @param {Object} k - Kaplay instance
     */
    updateBoundaries: function(k) {
        const halfViewWidth = k.width() / 2;
        const halfViewHeight = k.height() / 2;
        
        cameraState.boundaries = {
            minX: halfViewWidth,
            maxX: CAMERA_CONFIG.WORLD_WIDTH - halfViewWidth,
            minY: halfViewHeight,
            maxY: CAMERA_CONFIG.WORLD_HEIGHT - halfViewHeight
        };
        
        // Ensure boundaries are valid
        if (cameraState.boundaries.minX > cameraState.boundaries.maxX) {
            cameraState.boundaries.minX = cameraState.boundaries.maxX = CAMERA_CONFIG.WORLD_WIDTH / 2;
        }
        if (cameraState.boundaries.minY > cameraState.boundaries.maxY) {
            cameraState.boundaries.minY = cameraState.boundaries.maxY = CAMERA_CONFIG.WORLD_HEIGHT / 2;
        }
    },
    
    /**
     * Set camera to follow a target object
     * @param {Object} target - Object to follow (must have pos property)
     * @param {boolean} immediate - Whether to snap to target immediately
     */
    followTarget: function(target, immediate = false) {
        cameraState.target = target;
        cameraState.isFollowing = true;
        
        if (immediate && target) {
            const targetX = target.pos.x + CAMERA_CONFIG.FOLLOW_OFFSET_X;
            const targetY = target.pos.y + CAMERA_CONFIG.FOLLOW_OFFSET_Y;
            cameraState.currentPos.x = targetX;
            cameraState.currentPos.y = targetY;
            cameraState.targetPos.x = targetX;
            cameraState.targetPos.y = targetY;
        }
        
        console.log("📷 Camera following target:", target ? "enabled" : "disabled");
    },
    
    /**
     * Stop following target
     */
    stopFollowing: function() {
        cameraState.target = null;
        cameraState.isFollowing = false;
        console.log("📷 Camera stopped following");
    },
    
    /**
     * Move camera to specific position
     * @param {number} x - Target X position
     * @param {number} y - Target Y position
     * @param {boolean} immediate - Whether to snap immediately
     */
    moveTo: function(x, y, immediate = false) {
        cameraState.targetPos.x = x;
        cameraState.targetPos.y = y;
        
        if (immediate) {
            cameraState.currentPos.x = x;
            cameraState.currentPos.y = y;
        }
    },
    
    /**
     * Move camera by offset
     * @param {number} dx - X offset
     * @param {number} dy - Y offset
     * @param {boolean} immediate - Whether to apply immediately
     */
    moveBy: function(dx, dy, immediate = false) {
        cameraState.targetPos.x += dx;
        cameraState.targetPos.y += dy;
        
        if (immediate) {
            cameraState.currentPos.x += dx;
            cameraState.currentPos.y += dy;
        }
    },
    
    /**
     * Start camera shake effect
     * @param {number} intensity - Shake intensity (optional)
     * @param {number} duration - Shake duration in ms (optional)
     */
    shake: function(intensity = CAMERA_CONFIG.SHAKE_INTENSITY, duration = CAMERA_CONFIG.SHAKE_DURATION) {
        cameraState.shake.active = true;
        cameraState.shake.intensity = intensity;
        cameraState.shake.duration = duration;
        cameraState.shake.startTime = Date.now();
        console.log(`📷 Camera shake: ${intensity}px for ${duration}ms`);
    },
    
    /**
     * Stop camera shake
     */
    stopShake: function() {
        cameraState.shake.active = false;
        cameraState.shake.offsetX = 0;
        cameraState.shake.offsetY = 0;
    },
    
    /**
     * Set camera zoom level
     * @param {number} zoom - Zoom level (0.5 - 2.0)
     * @param {boolean} immediate - Whether to apply immediately
     */
    setZoom: function(zoom, immediate = false) {
        zoom = Math.max(CAMERA_CONFIG.MIN_ZOOM, Math.min(CAMERA_CONFIG.MAX_ZOOM, zoom));
        cameraState.zoom.target = zoom;
        
        if (immediate) {
            cameraState.zoom.current = zoom;
            cameraState.zoom.transitioning = false;
        } else {
            cameraState.zoom.transitioning = true;
        }
        
        console.log(`📷 Camera zoom: ${zoom}x`);
    },
    
    /**
     * Zoom in by factor
     * @param {number} factor - Zoom factor (default 1.2)
     */
    zoomIn: function(factor = 1.2) {
        this.setZoom(cameraState.zoom.target * factor);
    },
    
    /**
     * Zoom out by factor
     * @param {number} factor - Zoom factor (default 0.8)
     */
    zoomOut: function(factor = 0.8) {
        this.setZoom(cameraState.zoom.target * factor);
    },
    
    /**
     * Reset zoom to default
     */
    resetZoom: function() {
        this.setZoom(CAMERA_CONFIG.DEFAULT_ZOOM);
    },
    
    /**
     * Check if camera is following a target
     * @returns {boolean} - Whether camera is following
     */
    isFollowing: function() {
        return cameraState.isFollowing;
    },
    
    /**
     * Apply camera boundaries to position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Object} - Constrained {x, y} position
     */
    applyBoundaries: function(x, y) {
        if (!CAMERA_CONFIG.ENABLE_BOUNDARIES) {
            return { x, y };
        }
        
        return {
            x: Math.max(cameraState.boundaries.minX, Math.min(cameraState.boundaries.maxX, x)),
            y: Math.max(cameraState.boundaries.minY, Math.min(cameraState.boundaries.maxY, y))
        };
    },
    
    /**
     * Update camera system (call this every frame)
     * @param {Object} k - Kaplay instance
     */
    update: function(k) {
        // Update target position if following
        if (cameraState.isFollowing && cameraState.target) {
            const targetX = cameraState.target.pos.x + CAMERA_CONFIG.FOLLOW_OFFSET_X;
            const targetY = cameraState.target.pos.y + CAMERA_CONFIG.FOLLOW_OFFSET_Y;
            
            if (CAMERA_CONFIG.SMOOTH_MOVEMENT) {
                // Smooth following
                cameraState.targetPos.x = targetX;
                cameraState.targetPos.y = targetY;
            } else {
                // Immediate following
                cameraState.currentPos.x = targetX;
                cameraState.currentPos.y = targetY;
            }
        }
        
        // Apply smooth movement
        if (CAMERA_CONFIG.SMOOTH_MOVEMENT) {
            const smoothFactor = CAMERA_CONFIG.SMOOTH_FACTOR;
            cameraState.currentPos.x += (cameraState.targetPos.x - cameraState.currentPos.x) * smoothFactor;
            cameraState.currentPos.y += (cameraState.targetPos.y - cameraState.currentPos.y) * smoothFactor;
        }
        
        // Apply boundaries
        const constrainedPos = this.applyBoundaries(cameraState.currentPos.x, cameraState.currentPos.y);
        cameraState.currentPos.x = constrainedPos.x;
        cameraState.currentPos.y = constrainedPos.y;
        
        // Update shake effect
        if (cameraState.shake.active) {
            const elapsed = Date.now() - cameraState.shake.startTime;
            const progress = elapsed / cameraState.shake.duration;
            
            if (progress >= 1.0) {
                this.stopShake();
            } else {
                // Decrease shake intensity over time
                const currentIntensity = cameraState.shake.intensity * (1 - progress);
                cameraState.shake.offsetX = (Math.random() - 0.5) * 2 * currentIntensity;
                cameraState.shake.offsetY = (Math.random() - 0.5) * 2 * currentIntensity;
            }
        }
        
        // Update zoom
        if (cameraState.zoom.transitioning) {
            const zoomDiff = cameraState.zoom.target - cameraState.zoom.current;
            if (Math.abs(zoomDiff) < 0.01) {
                cameraState.zoom.current = cameraState.zoom.target;
                cameraState.zoom.transitioning = false;
            } else {
                cameraState.zoom.current += zoomDiff * CAMERA_CONFIG.ZOOM_SPEED;
            }
        }
        
        // Apply camera position to Kaplay
        const finalX = cameraState.currentPos.x + cameraState.shake.offsetX;
        const finalY = cameraState.currentPos.y + cameraState.shake.offsetY;
        
        k.camPos(finalX, finalY);
        k.camScale(cameraState.zoom.current);
    },
    
    /**
     * Get current camera position
     * @returns {Object} - {x, y} camera position
     */
    getPosition: function() {
        return { ...cameraState.currentPos };
    },
    
    /**
     * Get current camera zoom
     * @returns {number} - Current zoom level
     */
    getZoom: function() {
        return cameraState.zoom.current;
    },
    
    /**
     * Check if position is visible in camera viewport
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} k - Kaplay instance
     * @returns {boolean} - True if position is visible
     */
    isVisible: function(x, y, k) {
        const camX = cameraState.currentPos.x;
        const camY = cameraState.currentPos.y;
        const halfWidth = k.width() / 2 / cameraState.zoom.current;
        const halfHeight = k.height() / 2 / cameraState.zoom.current;
        
        return x >= camX - halfWidth && x <= camX + halfWidth &&
               y >= camY - halfHeight && y <= camY + halfHeight;
    },
    
    /**
     * Convert screen coordinates to world coordinates
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     * @param {Object} k - Kaplay instance
     * @returns {Object} - {x, y} world coordinates
     */
    screenToWorld: function(screenX, screenY, k) {
        const camX = cameraState.currentPos.x;
        const camY = cameraState.currentPos.y;
        const zoom = cameraState.zoom.current;
        
        return {
            x: camX + (screenX - k.width() / 2) / zoom,
            y: camY + (screenY - k.height() / 2) / zoom
        };
    },
    
    /**
     * Convert world coordinates to screen coordinates
     * @param {number} worldX - World X coordinate
     * @param {number} worldY - World Y coordinate
     * @param {Object} k - Kaplay instance
     * @returns {Object} - {x, y} screen coordinates
     */
    worldToScreen: function(worldX, worldY, k) {
        const camX = cameraState.currentPos.x;
        const camY = cameraState.currentPos.y;
        const zoom = cameraState.zoom.current;
        
        return {
            x: (worldX - camX) * zoom + k.width() / 2,
            y: (worldY - camY) * zoom + k.height() / 2
        };
    },
    
    /**
     * Get camera state for debugging
     * @returns {Object} - Camera state information
     */
    getDebugInfo: function() {
        return {
            position: { ...cameraState.currentPos },
            target: cameraState.target ? "following" : "free",
            zoom: cameraState.zoom.current,
            shake: cameraState.shake.active,
            boundaries: { ...cameraState.boundaries }
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CameraSystem, CAMERA_CONFIG };
}

// Make available globally for browser usage
window.CameraSystem = CameraSystem;
window.CAMERA_CONFIG = CAMERA_CONFIG;

console.log("📷 Camera system loaded");
