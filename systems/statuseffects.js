// Status Effect System for Castles of the Wind Clone
// Handles temporary buffs, debuffs, and status effects

const StatusEffectSystem = {
    k: null,
    activeEffects: new Map(), // entityId -> [effects]
    
    // Initialize the status effect system
    init(kaplayInstance) {
        this.k = kaplayInstance;
        console.log('✨ Status Effect System initialized');
        
        // Set up update loop for status effects
        this.k.onUpdate(() => {
            this.updateEffects();
        });
        
        return this;
    },
    
    // Apply a status effect to an entity
    applyEffect(entity, effect) {
        if (!entity || !effect) return;
        
        const entityId = entity.id || `${entity.pos?.x || 0}_${entity.pos?.y || 0}`;
        
        // Create effect object with timestamp
        const statusEffect = {
            type: effect.type,
            duration: effect.duration || 30, // Default 30 seconds
            startTime: Date.now(),
            effects: effect.effects || {},
            description: effect.description || 'Unknown effect',
            originalStats: {} // Store original stats for restoration
        };
        
        // Store original stats for restoration
        if (effect.effects) {
            Object.keys(effect.effects).forEach(stat => {
                if (entity[stat] !== undefined) {
                    statusEffect.originalStats[stat] = entity[stat];
                }
            });
        }
        
        // Apply the effect immediately
        this.applyEffectToEntity(entity, statusEffect);
        
        // Store in active effects
        if (!this.activeEffects.has(entityId)) {
            this.activeEffects.set(entityId, []);
        }
        this.activeEffects.get(entityId).push(statusEffect);
        
        console.log(`✨ Applied ${effect.type} to entity for ${effect.duration}s`);
        
        // Show visual indicator
        this.showEffectIndicator(entity, effect);
    },
    
    // Apply effect stats to entity
    applyEffectToEntity(entity, effect) {
        if (!effect.effects) return;
        
        Object.entries(effect.effects).forEach(([stat, value]) => {
            if (entity[stat] !== undefined) {
                entity[stat] += value;
                console.log(`📊 ${stat}: ${entity[stat]} (${value > 0 ? '+' : ''}${value})`);
            }
        });
    },
    
    // Remove effect stats from entity
    removeEffectFromEntity(entity, effect) {
        if (!effect.effects || !effect.originalStats) return;
        
        Object.keys(effect.effects).forEach(stat => {
            if (effect.originalStats[stat] !== undefined) {
                entity[stat] = effect.originalStats[stat];
                console.log(`🔄 Restored ${stat} to ${entity[stat]}`);
            }
        });
    },
    
    // Update all active effects
    updateEffects() {
        const currentTime = Date.now();
        
        for (const [entityId, effects] of this.activeEffects.entries()) {
            // Find entity by ID (simplified lookup)
            const entity = this.findEntityById(entityId);
            if (!entity) {
                // Entity no longer exists, remove effects
                this.activeEffects.delete(entityId);
                continue;
            }
            
            // Check for expired effects
            const expiredEffects = [];
            effects.forEach((effect, index) => {
                const elapsed = (currentTime - effect.startTime) / 1000;
                if (elapsed >= effect.duration) {
                    expiredEffects.push(index);
                }
            });
            
            // Remove expired effects (in reverse order to maintain indices)
            expiredEffects.reverse().forEach(index => {
                const expiredEffect = effects[index];
                this.removeEffectFromEntity(entity, expiredEffect);
                effects.splice(index, 1);
                console.log(`⏰ ${expiredEffect.type} effect expired`);
            });
            
            // Remove entity from map if no effects remain
            if (effects.length === 0) {
                this.activeEffects.delete(entityId);
            }
        }
    },
    
    // Find entity by ID (simplified implementation)
    findEntityById(entityId) {
        // Try to find player first
        const players = this.k.get('player');
        if (players.length > 0) {
            const playerId = players[0].id || `${players[0].pos?.x || 0}_${players[0].pos?.y || 0}`;
            if (playerId === entityId) {
                return players[0];
            }
        }
        
        // Try to find enemies
        const enemies = this.k.get('enemy');
        for (const enemy of enemies) {
            const enemyId = enemy.id || `${enemy.pos?.x || 0}_${enemy.pos?.y || 0}`;
            if (enemyId === entityId) {
                return enemy;
            }
        }
        
        return null;
    },
    
    // Show visual indicator for status effect
    showEffectIndicator(entity, effect) {
        if (!this.k || !entity.pos) return;
        
        // Choose color based on effect type
        let color = [255, 255, 255];
        if (effect.type.includes('weakness') || effect.type.includes('debuff')) {
            color = [255, 100, 100]; // Red for debuffs
        } else if (effect.type.includes('buff') || effect.type.includes('strength')) {
            color = [100, 255, 100]; // Green for buffs
        } else if (effect.type.includes('poison')) {
            color = [100, 255, 100]; // Green for poison
        } else if (effect.type.includes('burn')) {
            color = [255, 150, 0]; // Orange for burn
        }
        
        // Create floating text indicator
        this.k.add([
            this.k.text(effect.description || effect.type, { size: 10 }),
            this.k.color(...color),
            this.k.pos(entity.pos.x, entity.pos.y - 40),
            this.k.anchor("center"),
            this.k.opacity(0.8),
            this.k.z(100),
            this.k.lifespan(2),
            {
                velocity: this.k.vec2(0, -20)
            }
        ]);
    },
    
    // Get active effects for an entity
    getActiveEffects(entity) {
        if (!entity) return [];
        
        const entityId = entity.id || `${entity.pos?.x || 0}_${entity.pos?.y || 0}`;
        return this.activeEffects.get(entityId) || [];
    },
    
    // Remove all effects from an entity
    clearEffects(entity) {
        if (!entity) return;
        
        const entityId = entity.id || `${entity.pos?.x || 0}_${entity.pos?.y || 0}`;
        const effects = this.activeEffects.get(entityId) || [];
        
        // Remove all effect stats
        effects.forEach(effect => {
            this.removeEffectFromEntity(entity, effect);
        });
        
        // Clear from active effects
        this.activeEffects.delete(entityId);
        
        console.log(`🧹 Cleared all effects from entity`);
    },
    
    // Check if entity has specific effect type
    hasEffect(entity, effectType) {
        const effects = this.getActiveEffects(entity);
        return effects.some(effect => effect.type === effectType);
    }
};

// Make globally available
if (typeof window !== 'undefined') {
    window.StatusEffectSystem = StatusEffectSystem;
}

console.log('✨ Status Effect System loaded successfully');
