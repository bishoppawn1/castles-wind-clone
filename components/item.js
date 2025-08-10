/**
 * Item Component System for Castles of the Wind Clone
 * Handles item properties, weight tracking, and item behaviors
 */

// Item Component Factory
function createItemComponent(itemData) {
    if (!itemData) {
        console.error("Cannot create item component: no item data provided");
        return null;
    }
    

    
    return {
        id: "item",
        
        // Core item properties
        itemId: itemData.id || "unknown",
        name: itemData.name || "Unknown Item",
        description: itemData.description || "A mysterious item.",
        category: itemData.category || "misc",
        
        // Physical properties
        weight: itemData.weight || 1,
        bulk: itemData.bulk || 1,
        stackable: itemData.stackable || false,
        maxStack: itemData.maxStack || 1,
        currentStack: itemData.currentStack || 1,
        
        // Value and rarity
        value: itemData.value || 1,
        experience: itemData.experience || 0, // Experience gained when picked up
        rarity: itemData.rarity || "common", // common, uncommon, rare, epic, legendary
        
        // Usage properties
        consumable: itemData.consumable || false,
        usable: itemData.usable || false,
        equipable: itemData.equipable || false,
        equipSlot: itemData.equipSlot || null, // weapon, armor, accessory, etc.
        
        // Stats and effects
        stats: itemData.stats || {}, // { attack: 5, defense: 2, etc. }
        effects: itemData.effects || [], // Array of effect objects
        requirements: itemData.requirements || {}, // { level: 5, strength: 10, etc. }
        
        // Visual properties
        sprite: itemData.sprite || "item_unknown",
        color: itemData.color || [255, 255, 255],
        iconSize: itemData.iconSize || 16,
        
        // State tracking
        identified: itemData.identified !== false, // Items are identified by default
        cursed: itemData.cursed || false,
        blessed: itemData.blessed || false,
        enchantment: itemData.enchantment || 0,
        
        // Methods
        use: function(user) {
            if (!this.usable && !this.consumable) {
                return { success: false, message: `${this.name} cannot be used.` };
            }
            
            // Apply effects
            let results = [];
            for (let effect of this.effects) {
                const result = this.applyEffect(effect, user);
                results.push(result);
            }
            
            // Handle consumption
            if (this.consumable) {
                this.currentStack--;
                if (this.currentStack <= 0) {
                    return { 
                        success: true, 
                        consumed: true, 
                        message: `Used ${this.name}.`,
                        effects: results 
                    };
                }
            }
            
            return { 
                success: true, 
                consumed: false, 
                message: `Used ${this.name}.`,
                effects: results 
            };
        },
        
        applyEffect: function(effect, target) {
            // Timed effect routing: if an effect object includes a duration, prefer magic system handling
            if (effect && typeof effect === 'object' && typeof effect.duration === 'number' && effect.duration > 0) {
                try {
                    const ms = window.magicSystem || window.MagicSystemInstance || window.magic;
                    if (ms && typeof ms.applyEffectsToTarget === 'function') {
                        // Support multiple formats
                        if (effect.type === 'stat_boost' && effect.stat && typeof effect.amount === 'number') {
                            // Pass object-based stat boost so magic system can apply and track
                            ms.applyEffectsToTarget(target, [effect], effect.duration);
                            return { type: "timed_stat_boost", stat: effect.stat, amount: effect.amount, duration: effect.duration };
                        }
                        
                        // If an array of string effect IDs is provided
                        if (Array.isArray(effect.effects) && effect.effects.length > 0) {
                            ms.applyEffectsToTarget(target, effect.effects, effect.duration);
                            return { type: "timed_effects", effects: effect.effects, duration: effect.duration };
                        }
                        
                        // If the type itself is a magic effect ID (and not one of our core immediate types)
                        const coreImmediate = new Set(["heal", "mana", "damage", "stat_boost"]);
                        if (typeof effect.type === 'string' && !coreImmediate.has(effect.type)) {
                            ms.applyEffectsToTarget(target, [effect.type], effect.duration);
                            return { type: "timed_effect", effect: effect.type, duration: effect.duration };
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Failed to route timed effect via magic system:', e);
                }
                // Fallback to immediate handling below if routing didn't occur
            }
            
            switch (effect.type) {
                case "heal":
                    if (target.health && target.maxHealth) {
                        const healAmount = Math.min(effect.amount, target.maxHealth - target.health);
                        target.health += healAmount;
                        return { type: "heal", amount: healAmount };
                    }
                    break;
                    
                case "mana":
                    if (target.mana && target.maxMana) {
                        const manaAmount = Math.min(effect.amount, target.maxMana - target.mana);
                        target.mana += manaAmount;
                        return { type: "mana", amount: manaAmount };
                    }
                    break;
                    
                case "stat_boost":
                    // Immediate (non-timed) temporary stat boost
                    if (target) {
                        if (!target.tempStats) target.tempStats = {};
                        target.tempStats[effect.stat] = (target.tempStats[effect.stat] || 0) + effect.amount;
                        // Recalc player totals if applicable
                        try {
                            const inv = window.inventory;
                            const player = inv && typeof inv.getPlayer === 'function' ? inv.getPlayer() : null;
                            if (player && (target === player || (typeof target.is === 'function' && target.is('player')))) {
                                if (typeof inv.updatePlayerStats === 'function') inv.updatePlayerStats(target);
                                if (window.MessageSystem && typeof window.MessageSystem.addMessage === 'function') {
                                    const statName = effect.stat?.charAt(0).toUpperCase() + effect.stat?.slice(1);
                                    window.MessageSystem.addMessage(`${target.name || 'Target'} gains +${effect.amount} ${statName}.`, 'buff');
                                }
                            }
                        } catch (e) {
                            console.warn('⚠️ Failed to recalc after instant stat_boost:', e);
                        }
                        return { type: "stat_boost", stat: effect.stat, amount: effect.amount };
                    }
                    break;
                    
                case "damage":
                    if (target.takeDamage) {
                        target.takeDamage(effect.amount);
                        return { type: "damage", amount: effect.amount };
                    }
                    break;
            }
            return { type: "none" };
        },
        
        canStackWith: function(otherItem) {
            return this.stackable && 
                   otherItem.stackable && 
                   this.itemId === otherItem.itemId &&
                   this.enchantment === otherItem.enchantment &&
                   this.cursed === otherItem.cursed &&
                   this.blessed === otherItem.blessed;
        },
        
        getTotalWeight: function() {
            return this.weight * this.currentStack;
        },
        
        getTotalBulk: function() {
            return this.bulk * this.currentStack;
        },
        
        getTotalValue: function() {
            return this.value * this.currentStack;
        },
        
        getDisplayName: function() {
            let name = this.name;
            
            if (this.enchantment > 0) {
                name = `+${this.enchantment} ${name}`;
            } else if (this.enchantment < 0) {
                name = `${this.enchantment} ${name}`;
            }
            
            if (this.blessed) {
                name = `Blessed ${name}`;
            } else if (this.cursed) {
                name = `Cursed ${name}`;
            }
            
            if (this.currentStack > 1) {
                name = `${name} (${this.currentStack})`;
            }
            
            return name;
        },
        
        getTooltipText: function() {
            let tooltip = `${this.getDisplayName()}\n`;
            tooltip += `${this.description}\n\n`;
            
            if (this.category) {
                tooltip += `Category: ${this.category}\n`;
            }
            
            if (this.weight > 0) {
                tooltip += `Weight: ${this.getTotalWeight()}\n`;
            }
            
            if (this.value > 0) {
                tooltip += `Value: ${this.getTotalValue()} gold\n`;
            }
            
            // Show stats
            if (Object.keys(this.stats).length > 0) {
                tooltip += "\nStats:\n";
                for (let [stat, value] of Object.entries(this.stats)) {
                    tooltip += `  ${stat}: ${value > 0 ? '+' : ''}${value}\n`;
                }
            }
            
            // Show requirements
            if (Object.keys(this.requirements).length > 0) {
                tooltip += "\nRequirements:\n";
                for (let [req, value] of Object.entries(this.requirements)) {
                    tooltip += `  ${req}: ${value}\n`;
                }
            }
            
            return tooltip.trim();
        },
        
        clone: function() {
            return createItemComponent({
                id: this.itemId,
                name: this.name,
                description: this.description,
                category: this.category,
                weight: this.weight,
                bulk: this.bulk,
                stackable: this.stackable,
                maxStack: this.maxStack,
                currentStack: this.currentStack,
                value: this.value,
                experience: this.experience,
                rarity: this.rarity,
                consumable: this.consumable,
                usable: this.usable,
                equipable: this.equipable,
                equipSlot: this.equipSlot,
                stats: { ...this.stats },
                effects: [...this.effects],
                requirements: { ...this.requirements },
                sprite: this.sprite,
                color: [...this.color],
                iconSize: this.iconSize,
                identified: this.identified,
                cursed: this.cursed,
                blessed: this.blessed,
                enchantment: this.enchantment
            });
        }
    };
}

// Item rarity colors for UI
const ITEM_RARITY_COLORS = {
    common: [200, 200, 200],     // Light gray
    uncommon: [100, 255, 100],   // Green
    rare: [100, 100, 255],       // Blue
    epic: [255, 100, 255],       // Purple
    legendary: [255, 200, 0]     // Gold
};

// Item category icons
const ITEM_CATEGORY_ICONS = {
    weapon: "weapon_icon",
    armor: "armor_icon",
    potion: "potion_icon",
    scroll: "scroll_icon",
    key: "key_icon",
    treasure: "treasure_icon",
    food: "food_icon",
    misc: "misc_icon"
};

// Export for global access
if (typeof window !== 'undefined') {
    window.ItemComponent = {
        create: createItemComponent,
        RARITY_COLORS: ITEM_RARITY_COLORS,
        CATEGORY_ICONS: ITEM_CATEGORY_ICONS
    };
}
