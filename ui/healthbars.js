// Health Bar UI System for Castles of the Wind Clone
// Creates floating health bars above entities and fixed UI health displays

const HealthBarUI = {
    // Initialize health bar system
    init(k) {
        this.k = k;
        this.healthBars = new Map(); // Track health bars for entities
        this.playerHealthBar = null;
        
        console.log('❤️ Health Bar UI initialized');
    },
    
    // Update health bar for any entity (player or enemy)
    updateHealthBar(entity) {
        if (!entity) return;
        
        // Check if this is the player
        if (entity === window.currentPlayer) {
            this.updatePlayerHealthBar();
        } else {
            // This is an enemy, update floating health bar
            this.updateFloatingHealthBar(entity);
        }
    },
    
    // Create floating health bar above entity
    createFloatingHealthBar(entity) {
        if (!entity || this.healthBars.has(entity)) return;
        
        const maxHp = entity.maxHealth || entity.maxHp || entity.health || 100;
        const currentHp = entity.health || entity.hp || maxHp;
        
        // Health bar background (dark border)
        const healthBarBg = this.k.add([
            this.k.rect(32, 4),
            this.k.color(40, 40, 40), // Darker background
            this.k.pos(entity.pos.x - 16, entity.pos.y - 25),
            this.k.anchor("left"),
            this.k.z(50)
        ]);
        
        // Health bar fill (the part that scales)
        const healthBarFill = this.k.add([
            this.k.rect(30, 2),
            this.k.color(100, 255, 100), // Green health
            this.k.pos(entity.pos.x - 15, entity.pos.y - 24),
            this.k.anchor("left"),
            this.k.z(52) // Higher z-index to be on top
        ]);
        
        // Health bar border (thin light border)
        const healthBarBorder = this.k.add([
            this.k.rect(32, 4),
            this.k.color(0, 0, 0, 0), // Transparent fill
            this.k.outline(1, this.k.rgb(150, 150, 150)), // Thin gray outline
            this.k.pos(entity.pos.x - 16, entity.pos.y - 25),
            this.k.anchor("left"),
            this.k.z(51) // Lower than fill
        ]);
        
        const healthBarData = {
            background: healthBarBg,
            fill: healthBarFill,
            border: healthBarBorder,
            entity: entity,
            maxHp: maxHp,
            visible: true
        };
        
        this.healthBars.set(entity, healthBarData);
        
        // Hide health bar initially, show only during combat or when damaged
        this.hideHealthBar(entity);
        
        return healthBarData;
    },
    
    // Update floating health bar
    updateFloatingHealthBar(entity) {
        const healthBarData = this.healthBars.get(entity);
        if (!healthBarData) return;
        
        const currentHp = Math.max(0, entity.health || entity.hp || 0);
        const maxHp = healthBarData.maxHp;
        const healthPercent = currentHp / maxHp;
        
        // Update position to follow entity
        const x = entity.pos.x - 16;
        const y = entity.pos.y - 25;
        
        healthBarData.background.pos = this.k.vec2(x, y);
        healthBarData.fill.pos = this.k.vec2(x + 1, y + 1);
        healthBarData.border.pos = this.k.vec2(x, y);
        
        // Update health bar width by recreating the fill rectangle
        const newWidth = Math.max(1, Math.round(30 * healthPercent)); // Minimum 1px width
        
        // Remove old fill
        healthBarData.fill.destroy();
        
        // Create new fill with correct width
        healthBarData.fill = this.k.add([
            this.k.rect(newWidth, 2),
            this.k.color(100, 255, 100), // Will be updated below
            this.k.pos(x + 1, y + 1),
            this.k.anchor("left"),
            this.k.z(52)
        ]);
        
        // Color based on health percentage
        if (healthPercent > 0.6) {
            healthBarData.fill.color = this.k.rgb(100, 255, 100); // Green
        } else if (healthPercent > 0.3) {
            healthBarData.fill.color = this.k.rgb(255, 255, 100); // Yellow
        } else {
            healthBarData.fill.color = this.k.rgb(255, 100, 100); // Red
        }
        
        // Show health bar when damaged or in combat
        if (currentHp < maxHp || (entity.inCombat)) {
            this.showHealthBar(entity);
        }
    },
    
    // Show floating health bar
    showHealthBar(entity) {
        const healthBarData = this.healthBars.get(entity);
        if (!healthBarData || healthBarData.visible) return;
        
        healthBarData.background.opacity = 0.8;
        healthBarData.fill.opacity = 1.0;
        healthBarData.border.opacity = 1.0;
        healthBarData.visible = true;
    },
    
    // Hide floating health bar
    hideHealthBar(entity) {
        const healthBarData = this.healthBars.get(entity);
        if (!healthBarData || !healthBarData.visible) return;
        
        healthBarData.background.opacity = 0;
        healthBarData.fill.opacity = 0;
        healthBarData.border.opacity = 0;
        healthBarData.visible = false;
    },
    
    // Remove floating health bar
    removeHealthBar(entity) {
        const healthBarData = this.healthBars.get(entity);
        if (!healthBarData) return;
        
        this.k.destroy(healthBarData.background);
        this.k.destroy(healthBarData.fill);
        this.k.destroy(healthBarData.border);
        
        this.healthBars.delete(entity);
    },
    
    // Create fixed player health bar in UI
    createPlayerHealthBar(player) {
        if (this.playerHealthBar) {
            this.removePlayerHealthBar();
        }
        
        const maxHp = player.maxHealth || 100;
        const currentHp = player.health || maxHp;
        
        // Health bar background
        const healthBarBg = this.k.add([
            this.k.rect(160, 20),
            this.k.color(40, 40, 40),
            this.k.pos(20, 160),
            this.k.fixed(),
            this.k.z(100)
        ]);
        
        // Health bar fill (the part that scales)
        const healthBarFill = this.k.add([
            this.k.rect(156, 16),
            this.k.color(100, 255, 100),
            this.k.pos(22, 162),
            this.k.anchor("left"), // Important: anchor left for scaling
            this.k.fixed(),
            this.k.z(102) // Higher z-index to be on top
        ]);
        
        // Health bar border
        const healthBarBorder = this.k.add([
            this.k.rect(160, 20),
            this.k.color(0, 0, 0, 0), // Transparent fill
            this.k.outline(2, this.k.rgb(150, 150, 150)), // Thin gray outline
            this.k.pos(20, 160),
            this.k.fixed(),
            this.k.z(101) // Lower than fill
        ]);
        
        // Health text
        const healthText = this.k.add([
            this.k.text(`${currentHp}/${maxHp}`),
            this.k.pos(100, 170),
            this.k.anchor("center"),
            this.k.scale(0.3),
            this.k.color(255, 255, 255),
            this.k.fixed(),
            this.k.z(103)
        ]);
        
        this.playerHealthBar = {
            background: healthBarBg,
            fill: healthBarFill,
            border: healthBarBorder,
            text: healthText,
            player: player,
            maxHp: maxHp
        };
        
        return this.playerHealthBar;
    },
    
    // Update fixed player health bar
    updatePlayerHealthBar() {
        if (!this.playerHealthBar) return;
        
        const player = this.playerHealthBar.player;
        const currentHp = Math.max(0, player.health || 0);
        const maxHp = this.playerHealthBar.maxHp;
        const healthPercent = currentHp / maxHp;
        
        // Update health bar width by recreating the fill rectangle
        const newWidth = Math.max(1, Math.round(156 * healthPercent)); // Minimum 1px width
        
        // Remove old fill
        this.playerHealthBar.fill.destroy();
        
        // Create new fill with correct width
        this.playerHealthBar.fill = this.k.add([
            this.k.rect(newWidth, 16),
            this.k.color(100, 255, 100), // Will be updated below
            this.k.pos(22, 162),
            this.k.anchor("left"),
            this.k.fixed(),
            this.k.z(102)
        ]);
        
        // Color based on health percentage
        if (healthPercent > 0.6) {
            this.playerHealthBar.fill.color = this.k.rgb(100, 255, 100); // Green
        } else if (healthPercent > 0.3) {
            this.playerHealthBar.fill.color = this.k.rgb(255, 255, 100); // Yellow
        } else {
            this.playerHealthBar.fill.color = this.k.rgb(255, 100, 100); // Red
        }
        
        // Update text
        this.playerHealthBar.text.text = `HP: ${currentHp}/${maxHp}`;
    },
    
    // Remove fixed player health bar
    removePlayerHealthBar() {
        if (!this.playerHealthBar) return;
        
        this.k.destroy(this.playerHealthBar.background);
        this.k.destroy(this.playerHealthBar.fill);
        this.k.destroy(this.playerHealthBar.border);
        this.k.destroy(this.playerHealthBar.text);
        
        this.playerHealthBar = null;
    },
    
    // Show health bars for all entities in combat
    showCombatHealthBars() {
        const enemies = this.k.get("enemy").filter(e => !e.isDead);
        enemies.forEach(enemy => {
            if (!this.healthBars.has(enemy)) {
                this.createFloatingHealthBar(enemy);
            }
            this.showHealthBar(enemy);
        });
    },
    
    // Hide health bars when combat ends
    hideCombatHealthBars() {
        const enemies = this.k.get("enemy");
        enemies.forEach(enemy => {
            if (this.healthBars.has(enemy)) {
                // Only hide if at full health
                const currentHp = enemy.health || enemy.hp || 0;
                const maxHp = enemy.maxHealth || enemy.maxHp || currentHp;
                if (currentHp >= maxHp) {
                    this.hideHealthBar(enemy);
                }
            }
        });
    },
    
    // Update all health bars
    update() {
        // Check if system is initialized
        if (!this.healthBars) {
            return; // System not initialized yet
        }
        
        // Update floating health bars
        this.healthBars.forEach((healthBarData, entity) => {
            if (entity && entity.exists && entity.exists()) {
                this.updateFloatingHealthBar(entity);
            } else {
                // Entity was destroyed, remove health bar
                this.removeHealthBar(entity);
            }
        });
        
        // Update player health bar if it exists
        if (this.playerHealthBar && window.currentPlayer) {
            const player = window.currentPlayer;
            const healthPercent = player.health / player.maxHealth;
            const fillWidth = Math.max(0, (this.playerHealthBar.width - 4) * healthPercent);
            
            // Update fill width
            if (this.playerHealthBar.fill) {
                this.playerHealthBar.fill.width = fillWidth;
            }
            
            // Update health text
            if (this.playerHealthBar.text) {
                this.playerHealthBar.text.text = `${player.health}/${player.maxHealth}`;
            }
        }
    },
    
    // Clean up health bar system
    cleanup() {
        // Remove all health bars
        this.healthBars.forEach((healthBarData, entity) => {
            this.removeHealthBar(entity);
        });
        this.removePlayerHealthBar();
        console.log('❤️ Health Bar UI cleaned up');
    }
};

// Make HealthBarUI globally available
window.HealthBarUI = HealthBarUI;

console.log('❤️ Health Bar UI system loaded successfully');
