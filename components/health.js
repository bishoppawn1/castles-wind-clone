// Health Component System for Castles of the Wind Clone
// Provides reusable health functionality for entities

// Health component factory
const HealthComponent = {
    // Create a health component for an entity
    create(maxHealth, currentHealth = null) {
        return {
            maxHealth: maxHealth,
            health: currentHealth !== null ? currentHealth : maxHealth,
            isDead: false,
            
            // Take damage and return actual damage dealt
            takeDamage(amount, source = null) {
                if (this.isDead) return 0;
                
                const actualDamage = Math.max(0, amount);
                const oldHealth = this.health;
                this.health = Math.max(0, this.health - actualDamage);
                
                const damageDealt = oldHealth - this.health;
                
                if (this.health <= 0 && !this.isDead) {
                    this.isDead = true;
                    this.onDeath && this.onDeath(source);
                }
                
                this.onDamage && this.onDamage(damageDealt, source);
                
                return damageDealt;
            },
            
            // Heal and return actual healing done
            heal(amount, source = null) {
                if (this.isDead) return 0;
                
                const actualHealing = Math.max(0, amount);
                const oldHealth = this.health;
                this.health = Math.min(this.maxHealth, this.health + actualHealing);
                
                const healingDone = this.health - oldHealth;
                
                this.onHeal && this.onHeal(healingDone, source);
                
                return healingDone;
            },
            
            // Set maximum health and optionally current health
            setMaxHealth(newMaxHealth, adjustCurrent = true) {
                const ratio = adjustCurrent ? this.health / this.maxHealth : 0;
                this.maxHealth = newMaxHealth;
                
                if (adjustCurrent) {
                    this.health = Math.min(this.maxHealth, Math.floor(this.maxHealth * ratio));
                } else {
                    this.health = Math.min(this.maxHealth, this.health);
                }
            },
            
            // Get health as percentage (0.0 to 1.0)
            getHealthPercent() {
                return this.maxHealth > 0 ? this.health / this.maxHealth : 0;
            },
            
            // Check if health is below a certain percentage
            isHealthBelow(percent) {
                return this.getHealthPercent() < percent;
            },
            
            // Check if at full health
            isFullHealth() {
                return this.health >= this.maxHealth;
            },
            
            // Revive with specified health
            revive(healthAmount = null) {
                this.isDead = false;
                this.health = healthAmount !== null ? 
                    Math.min(this.maxHealth, healthAmount) : 
                    this.maxHealth;
                
                this.onRevive && this.onRevive();
            },
            
            // Get health status info
            getStatus() {
                return {
                    health: this.health,
                    maxHealth: this.maxHealth,
                    percent: this.getHealthPercent(),
                    isDead: this.isDead,
                    isLow: this.isHealthBelow(0.25),
                    isCritical: this.isHealthBelow(0.1)
                };
            },
            
            // Event handlers (can be overridden)
            onDamage: null,
            onHeal: null,
            onDeath: null,
            onRevive: null
        };
    },
    
    // Create health component with event handlers
    createWithEvents(maxHealth, events = {}) {
        const health = this.create(maxHealth);
        
        // Set event handlers
        health.onDamage = events.onDamage || null;
        health.onHeal = events.onHeal || null;
        health.onDeath = events.onDeath || null;
        health.onRevive = events.onRevive || null;
        
        return health;
    },
    
    // Add health component to a Kaplay entity
    addToEntity(k, entity, maxHealth, events = {}) {
        const health = this.createWithEvents(maxHealth, events);
        
        // Add health properties to entity
        entity.health = health.health;
        entity.maxHealth = health.maxHealth;
        entity.isDead = health.isDead;
        
        // Add health methods to entity
        entity.takeDamage = function(amount, source = null) {
            const damage = health.takeDamage(amount, source);
            
            // Update entity properties
            this.health = health.health;
            this.isDead = health.isDead;
            
            return damage;
        };
        
        entity.heal = function(amount, source = null) {
            const healing = health.heal(amount, source);
            
            // Update entity properties
            this.health = health.health;
            
            return healing;
        };
        
        entity.getHealthPercent = () => health.getHealthPercent();
        entity.isHealthBelow = (percent) => health.isHealthBelow(percent);
        entity.isFullHealth = () => health.isFullHealth();
        entity.getHealthStatus = () => health.getStatus();
        
        entity.revive = function(healthAmount = null) {
            health.revive(healthAmount);
            this.health = health.health;
            this.isDead = health.isDead;
        };
        
        return health;
    }
};

// Health bar rendering utilities
const HealthBar = {
    // Create a health bar above an entity
    create(k, entity, options = {}) {
        const opts = {
            width: options.width || 30,
            height: options.height || 4,
            offsetY: options.offsetY || -25,
            backgroundColor: options.backgroundColor || [60, 60, 60],
            healthColor: options.healthColor || [100, 255, 100],
            lowHealthColor: options.lowHealthColor || [255, 255, 100],
            criticalHealthColor: options.criticalHealthColor || [255, 100, 100],
            borderColor: options.borderColor || [200, 200, 200],
            showWhenFull: options.showWhenFull !== undefined ? options.showWhenFull : false,
            ...options
        };
        
        const healthBarBg = k.add([
            k.rect(opts.width, opts.height),
            k.color(...opts.backgroundColor),
            k.pos(entity.pos.x - opts.width/2, entity.pos.y + opts.offsetY),
            k.outline(1, k.rgb(...opts.borderColor)),
            k.z(entity.z + 1),
            k.opacity(0.8),
            "healthbar"
        ]);
        
        const healthBarFg = k.add([
            k.rect(opts.width, opts.height),
            k.color(...opts.healthColor),
            k.pos(entity.pos.x - opts.width/2, entity.pos.y + opts.offsetY),
            k.z(entity.z + 2),
            "healthbar"
        ]);
        
        // Update function
        const updateHealthBar = () => {
            if (!entity.exists() || entity.isDead) {
                if (healthBarBg.exists()) k.destroy(healthBarBg);
                if (healthBarFg.exists()) k.destroy(healthBarFg);
                return;
            }
            
            const healthPercent = entity.getHealthPercent ? entity.getHealthPercent() : 
                (entity.health / entity.maxHealth);
            
            // Hide when full health if option is set
            if (!opts.showWhenFull && healthPercent >= 1.0) {
                healthBarBg.opacity = 0;
                healthBarFg.opacity = 0;
                return;
            } else {
                healthBarBg.opacity = 0.8;
                healthBarFg.opacity = 1.0;
            }
            
            // Update position
            healthBarBg.pos = k.vec2(entity.pos.x - opts.width/2, entity.pos.y + opts.offsetY);
            healthBarFg.pos = k.vec2(entity.pos.x - opts.width/2, entity.pos.y + opts.offsetY);
            
            // Update width based on health
            const healthWidth = opts.width * healthPercent;
            healthBarFg.width = healthWidth;
            
            // Update color based on health percentage
            if (healthPercent <= 0.1) {
                healthBarFg.color = k.rgb(...opts.criticalHealthColor);
            } else if (healthPercent <= 0.3) {
                healthBarFg.color = k.rgb(...opts.lowHealthColor);
            } else {
                healthBarFg.color = k.rgb(...opts.healthColor);
            }
        };
        
        return {
            background: healthBarBg,
            foreground: healthBarFg,
            update: updateHealthBar,
            destroy: () => {
                if (healthBarBg.exists()) k.destroy(healthBarBg);
                if (healthBarFg.exists()) k.destroy(healthBarFg);
            }
        };
    },
    
    // Create a UI health bar (fixed position)
    createUI(k, x, y, width, height, entity, options = {}) {
        const opts = {
            backgroundColor: options.backgroundColor || [60, 60, 60],
            healthColor: options.healthColor || [100, 255, 100],
            lowHealthColor: options.lowHealthColor || [255, 255, 100],
            criticalHealthColor: options.criticalHealthColor || [255, 100, 100],
            borderColor: options.borderColor || [200, 200, 200],
            showText: options.showText !== undefined ? options.showText : true,
            textColor: options.textColor || [255, 255, 255],
            ...options
        };
        
        const healthBarBg = k.add([
            k.rect(width, height),
            k.color(...opts.backgroundColor),
            k.pos(x, y),
            k.outline(1, k.rgb(...opts.borderColor)),
            k.fixed(),
            k.z(100),
            "ui-healthbar"
        ]);
        
        const healthBarFg = k.add([
            k.rect(width, height),
            k.color(...opts.healthColor),
            k.pos(x, y),
            k.fixed(),
            k.z(101),
            "ui-healthbar"
        ]);
        
        let healthText = null;
        if (opts.showText) {
            healthText = k.add([
                k.text(""),
                k.pos(x + width/2, y + height/2),
                k.anchor("center"),
                k.scale(0.3),
                k.color(...opts.textColor),
                k.fixed(),
                k.z(102),
                "ui-healthbar"
            ]);
        }
        
        // Update function
        const updateUIHealthBar = () => {
            if (!entity || !entity.exists || !entity.exists()) {
                return;
            }
            
            const healthPercent = entity.getHealthPercent ? entity.getHealthPercent() : 
                (entity.health / entity.maxHealth);
            
            // Update width based on health
            const healthWidth = width * healthPercent;
            healthBarFg.width = healthWidth;
            
            // Update color based on health percentage
            if (healthPercent <= 0.1) {
                healthBarFg.color = k.rgb(...opts.criticalHealthColor);
            } else if (healthPercent <= 0.3) {
                healthBarFg.color = k.rgb(...opts.lowHealthColor);
            } else {
                healthBarFg.color = k.rgb(...opts.healthColor);
            }
            
            // Update text
            if (healthText) {
                healthText.text = `${entity.health}/${entity.maxHealth}`;
            }
        };
        
        return {
            background: healthBarBg,
            foreground: healthBarFg,
            text: healthText,
            update: updateUIHealthBar,
            destroy: () => {
                if (healthBarBg.exists()) k.destroy(healthBarBg);
                if (healthBarFg.exists()) k.destroy(healthBarFg);
                if (healthText && healthText.exists()) k.destroy(healthText);
            }
        };
    }
};

// Make components globally available
if (typeof window !== 'undefined') {
    window.HealthComponent = HealthComponent;
    window.HealthBar = HealthBar;
}

console.log('❤️ Health Component system loaded successfully');
