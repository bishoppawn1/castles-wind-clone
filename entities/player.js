// Player Entity System for Castles of the Wind Clone
// Handles player creation, stats, animations, and game mechanics

// Player Entity System
const PlayerEntity = {
    // Create a new player entity
    create(k, gridX, gridY, options = {}) {
        const config = {
            SPRITE_SIZE: options.SPRITE_SIZE || 24,
            SPRITE_COLOR: options.SPRITE_COLOR || [100, 150, 255],
            HEALTH: options.HEALTH || 100,
            MANA: options.MANA || 50,
            ATTACK: options.ATTACK || 10,
            DEFENSE: options.DEFENSE || 5,
            LEVEL: options.LEVEL || 1,
            EXPERIENCE: options.EXPERIENCE || 0,
            GOLD: options.GOLD || 0
        };

        // Calculate pixel position from grid coordinates (center of grid cell)
        const pixelPos = GridUtils.createGridPos(gridX, gridY, true);
        console.log(`👤 Player positioning: grid(${gridX}, ${gridY}) -> pixel(${pixelPos.x}, ${pixelPos.y}) [PLAYER CENTERED]`);
        
        // Create the player game object
        const player = k.add([
            k.rect(config.SPRITE_SIZE, config.SPRITE_SIZE),
            k.color(...config.SPRITE_COLOR),
            k.pos(pixelPos.x, pixelPos.y),
            k.anchor("center"),
            k.area(),
            k.z(10),
            "player",
            {
                // Grid position
                gridX: gridX,
                gridY: gridY,
                
                // Movement state
                isMoving: false,
                facing: 'down',
                
                // Stats
                health: config.HEALTH,
                maxHealth: config.HEALTH,
                mana: config.MANA,
                maxMana: config.MANA,
                attack: config.ATTACK,
                defense: config.DEFENSE,
                level: config.LEVEL,
                experience: config.EXPERIENCE,
                experienceToNext: PlayerEntity.calculateExperienceToNext(config.LEVEL),
                gold: config.GOLD,
                
                // Persistent base stats (used by InventorySystem to derive totals)
                baseStats: {
                    attack: config.ATTACK,
                    defense: config.DEFENSE,
                    health: config.HEALTH,
                    mana: config.MANA
                },
                
                // Inventory
                inventory: [],
                inventoryMax: 20,
                
                // Animation state
                currentAnimation: 'idle',
                animationTime: 0,
                animationDuration: 0.5,
                
                // Animation colors for different states
                baseColor: [...config.SPRITE_COLOR],
                idleColor: [...config.SPRITE_COLOR],
                walkColor: [120, 170, 255],
                attackColor: [255, 100, 100],
                hurtColor: [255, 50, 50],
                levelupColor: [255, 215, 0],
                
                // Methods
                updateFacing(direction) {
                    this.facing = direction;
                    // console.log(`👤 Player facing: ${direction}`); // Disabled for performance
                },
                
                playAnimation(animationType) {
                    if (this.currentAnimation !== animationType) {
                        this.currentAnimation = animationType;
                        this.animationTime = 0;
                        // console.log(`🎭 Playing animation: ${animationType}`); // Disabled for performance
                    }
                },
                
                heal(amount) {
                    const oldHealth = this.health;
                    this.health = Math.min(this.maxHealth, this.health + amount);
                    const actualHealing = this.health - oldHealth;
                    if (actualHealing > 0) {
                        console.log(`💚 Healed ${actualHealing} HP! (${this.health}/${this.maxHealth})`);
                        this.playAnimation('heal');
                    }
                    return actualHealing;
                },
                
                takeDamage(amount) {
                    const actualDamage = Math.max(1, amount - this.defense);
                    this.health = Math.max(0, this.health - actualDamage);
                    console.log(`💔 Took ${actualDamage} damage! (${this.health}/${this.maxHealth})`);
                    this.playAnimation('hurt');
                    
                    if (this.health <= 0) {
                        console.log('💀 Player died!');
                        this.isDead = true;
                        
                        // Notify combat UI of player defeat
                        if (window.CombatUI) {
                            CombatUI.onCombatEvent('defeat');
                        }
                        
                        // End combat if active
                        if (window.CombatSystem && window.CombatSystem.combatActive) {
                            window.CombatSystem.endCombat();
                        }
                        
                        // Trigger respawn screen after a short delay
                        setTimeout(() => {
                            if (window.ProgressionSystem) {
                                ProgressionSystem.triggerDeathScreen(
                                    'You have been defeated in combat!',
                                    'combat'
                                );
                            } else {
                                // Fallback to old game over system if ProgressionSystem not available
                                const stats = {
                                    level: this.level,
                                    enemiesKilled: this.enemiesKilled || 0,
                                    itemsCollected: this.itemsCollected || 0,
                                    gold: this.gold
                                };
                                
                                if (window.k) {
                                    window.k.go('gameover', {
                                        message: 'You have been defeated in combat!',
                                        stats: stats
                                    });
                                }
                            }
                        }, 1500); // 1.5 second delay for dramatic effect
                    }
                    return actualDamage;
                },
                
                gainExperience(amount) {
                    this.experience += amount;
                    console.log(`⭐ Gained ${amount} experience! (${this.experience}/${this.experienceToNext})`);
                    
                    // Check for level up
                    while (this.experience >= this.experienceToNext) {
                        this.levelUp();
                    }
                },
                
                levelUp() {
                    this.level++;
                    this.experience -= this.experienceToNext;
                    this.experienceToNext = PlayerEntity.calculateExperienceToNext(this.level);
                    
                    // Increase stats
                    const healthIncrease = 15 + Math.floor(this.level / 2);
                    const manaIncrease = 10 + Math.floor(this.level / 3);
                    const attackIncrease = 2 + Math.floor(this.level / 4);
                    const defenseIncrease = 1 + Math.floor(this.level / 5);
                    
                    // Update persistent base stats when available so recalculation preserves gains
                    if (this.baseStats) {
                        this.baseStats.health += healthIncrease;
                        this.baseStats.mana += manaIncrease;
                        this.baseStats.attack += attackIncrease;
                        this.baseStats.defense += defenseIncrease;
                        try {
                            if (window.inventory && typeof window.inventory.updatePlayerStats === 'function') {
                                // Recalculate derived totals from base + equipment + temporary
                                window.inventory.updatePlayerStats(this);
                            } else {
                                // Fallback if inventory system not ready yet
                                this.maxHealth += healthIncrease;
                                this.maxMana += manaIncrease;
                                this.attack += attackIncrease;
                                this.defense += defenseIncrease;
                            }
                        } catch (e) {
                            console.warn('⚠️ Failed to update stats after level up, using fallback', e);
                            this.maxHealth += healthIncrease;
                            this.maxMana += manaIncrease;
                            this.attack += attackIncrease;
                            this.defense += defenseIncrease;
                        }
                    } else {
                        // No baseStats yet, adjust current totals; inventory will capture later
                        this.maxHealth += healthIncrease;
                        this.maxMana += manaIncrease;
                        this.attack += attackIncrease;
                        this.defense += defenseIncrease;
                    }
                    
                    // Full restore after leveling up
                    this.health = this.maxHealth;
                    this.mana = this.maxMana;
                    
                    console.log(`🎉 LEVEL UP! Now level ${this.level}`);
                    console.log(`📈 Stats increased: +${healthIncrease} HP, +${manaIncrease} MP, +${attackIncrease} ATK, +${defenseIncrease} DEF`);
                    
                    this.playAnimation('levelup');
                },
                
                getStats() {
                    return {
                        level: this.level,
                        health: this.health,
                        maxHealth: this.maxHealth,
                        mana: this.mana,
                        maxMana: this.maxMana,
                        attack: this.attack,
                        defense: this.defense,
                        experience: this.experience,
                        experienceToNext: this.experienceToNext,
                        gold: this.gold,
                        inventoryCount: this.inventory.length,
                        inventoryMax: this.inventoryMax
                    };
                },
                
                addToInventory(item) {
                    if (this.inventory.length < this.inventoryMax) {
                        this.inventory.push(item);
                        console.log(`🎒 Added ${item.name || item} to inventory (${this.inventory.length}/${this.inventoryMax})`);
                        return true;
                    } else {
                        console.log('🎒 Inventory full!');
                        return false;
                    }
                },
                
                removeFromInventory(itemIndex) {
                    if (itemIndex >= 0 && itemIndex < this.inventory.length) {
                        const item = this.inventory.splice(itemIndex, 1)[0];
                        console.log(`🎒 Removed ${item.name || item} from inventory`);
                        return item;
                    }
                    return null;
                },
                
                castSpell(spellName, targetX, targetY) {
                    // Basic spell system - can be expanded
                    const spellCosts = {
                        'heal': 10,
                        'fireball': 15,
                        'lightning': 20,
                        'teleport': 25
                    };
                    
                    const cost = spellCosts[spellName] || 10;
                    
                    if (this.mana >= cost) {
                        this.mana -= cost;
                        console.log(`✨ Cast ${spellName}! Mana: ${this.mana}/${this.maxMana}`);
                        this.playAnimation('attack'); // Use attack animation for spells
                        return true;
                    } else {
                        console.log('💙 Not enough mana!');
                        return false;
                    }
                }
            }
        ]);
        
        console.log(`👤 Player created at grid (${gridX}, ${gridY}) with stats:`, player.getStats());
        return player;
    },
    
    // Calculate experience needed for next level
    calculateExperienceToNext(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    },
    
    // Update player animations
    updateAnimation(k, player, deltaTime) {
        if (!player || !player.currentAnimation) return;
        
        player.animationTime += deltaTime;
        
        // Handle different animation types
        switch (player.currentAnimation) {
            case 'idle':
                player.color = k.rgb(...player.idleColor);
                break;
                
            case 'walk':
                // Pulsing effect while walking
                const walkPulse = Math.sin(player.animationTime * 8) * 0.2 + 1;
                player.color = k.rgb(
                    player.walkColor[0] * walkPulse,
                    player.walkColor[1] * walkPulse,
                    player.walkColor[2] * walkPulse
                );
                
                // Return to idle after movement completes
                if (!player.isMoving && player.animationTime > 0.2) {
                    player.currentAnimation = 'idle';
                    player.animationTime = 0;
                }
                break;
                
            case 'attack':
                // Flash red for attack
                const attackFlash = Math.sin(player.animationTime * 20) * 0.5 + 0.5;
                player.color = k.rgb(
                    player.attackColor[0] * attackFlash + player.baseColor[0] * (1 - attackFlash),
                    player.attackColor[1] * attackFlash + player.baseColor[1] * (1 - attackFlash),
                    player.attackColor[2] * attackFlash + player.baseColor[2] * (1 - attackFlash)
                );
                
                if (player.animationTime > player.animationDuration) {
                    player.currentAnimation = 'idle';
                    player.animationTime = 0;
                }
                break;
                
            case 'hurt':
                // Flash red for damage
                const hurtFlash = Math.sin(player.animationTime * 15) * 0.7 + 0.3;
                player.color = k.rgb(
                    player.hurtColor[0] * hurtFlash,
                    player.hurtColor[1] * hurtFlash,
                    player.hurtColor[2] * hurtFlash
                );
                
                if (player.animationTime > 0.6) {
                    player.currentAnimation = 'idle';
                    player.animationTime = 0;
                }
                break;
                
            case 'levelup':
                // Golden glow for level up
                const levelupPulse = Math.sin(player.animationTime * 6) * 0.5 + 0.5;
                player.color = k.rgb(
                    player.levelupColor[0] * levelupPulse + player.baseColor[0] * (1 - levelupPulse),
                    player.levelupColor[1] * levelupPulse + player.baseColor[1] * (1 - levelupPulse),
                    player.levelupColor[2] * levelupPulse + player.baseColor[2] * (1 - levelupPulse)
                );
                
                if (player.animationTime > 2.0) {
                    player.currentAnimation = 'idle';
                    player.animationTime = 0;
                }
                break;
                
            case 'heal':
                // Green glow for healing
                const healPulse = Math.sin(player.animationTime * 10) * 0.4 + 0.6;
                player.color = k.rgb(
                    player.baseColor[0] * 0.7,
                    255 * healPulse,
                    player.baseColor[2] * 0.7
                );
                
                if (player.animationTime > 1.0) {
                    player.currentAnimation = 'idle';
                    player.animationTime = 0;
                }
                break;
                
            default:
                player.currentAnimation = 'idle';
                break;
        }
    },
    
    // Save player state
    saveState(player) {
        return {
            gridX: player.gridX,
            gridY: player.gridY,
            facing: player.facing,
            health: player.health,
            maxHealth: player.maxHealth,
            mana: player.mana,
            maxMana: player.maxMana,
            attack: player.attack,
            defense: player.defense,
            level: player.level,
            experience: player.experience,
            experienceToNext: player.experienceToNext,
            gold: player.gold,
            inventory: [...player.inventory],
            baseStats: player.baseStats ? { ...player.baseStats } : null
        };
    },
    
    // Restore player state
    restoreState(player, state) {
        player.gridX = state.gridX;
        player.gridY = state.gridY;
        player.facing = state.facing;
        player.health = state.health;
        player.maxHealth = state.maxHealth;
        player.mana = state.mana;
        player.maxMana = state.maxMana;
        player.attack = state.attack;
        player.defense = state.defense;
        player.level = state.level;
        player.experience = state.experience;
        player.experienceToNext = state.experienceToNext;
        player.gold = state.gold;
        player.inventory = [...state.inventory];
        
        // Restore base stats if present, otherwise initialize from current totals
        if (state.baseStats) {
            player.baseStats = { ...state.baseStats };
        } else if (!player.baseStats) {
            player.baseStats = {
                attack: player.attack,
                defense: player.defense,
                health: player.maxHealth,
                mana: player.maxMana
            };
        }
        
        // Update position (center of grid cell)
        const pixelPos = GridUtils.createGridPos(player.gridX, player.gridY, true);
        player.pos = k.vec2(pixelPos.x, pixelPos.y);
        
        // Recalculate derived stats from base/equipment/temp to ensure consistency
        try {
            if (window.inventory && typeof window.inventory.updatePlayerStats === 'function') {
                window.inventory.updatePlayerStats(player);
            }
        } catch (e) {
            console.warn('⚠️ Failed to recalc stats on restoreState', e);
        }
        
        console.log('🔄 Player state restored:', player.getStats());
    }
};

// Make PlayerEntity globally available
window.PlayerEntity = PlayerEntity;

console.log('👤 PlayerEntity system loaded successfully');
