// Enemy Entity System for Castles of the Wind Clone
// Handles enemy creation, stats, animations, and behaviors

// Enemy Entity System
const EnemyEntity = {
    // Create a new enemy entity
    create(k, enemyType, gridX, gridY, options = {}) {
        if (!enemyType) {
            console.error('❌ EnemyEntity.create: enemyType is required');
            return null;
        }
        
        // Calculate pixel position - get center of grid cell then offset by half sprite size
        const gridCenter = GridUtils.createGridPos(gridX, gridY, true);
        const spriteSize = enemyType.sprite.size; // Use original enemy size
        const pixelPos = {
            x: gridCenter.x - spriteSize / 2 + 1, // Offset by half sprite width + 1 pixel adjustment
            y: gridCenter.y - spriteSize / 2 + 1  // Offset by half sprite height + 1 pixel adjustment
        };
        
        // Create the enemy game object
        const enemy = k.add([
            k.rect(spriteSize, spriteSize),
            k.color(...enemyType.sprite.color),
            k.pos(pixelPos.x, pixelPos.y),
            // No anchor - using top-left positioning with manual centering
            k.area(),
            k.z(8), // Below player (z=10) but above items
            "enemy",
            enemyType.id, // Tag with enemy type
            {
                // Enemy type and identity
                enemyType: enemyType,
                enemyId: enemyType.id,
                name: enemyType.name,
                
                // Grid position
                gridX: gridX,
                gridY: gridY,
                spawnX: gridX, // Remember spawn position
                spawnY: gridY,
                
                // Stats
                health: enemyType.stats.health,
                maxHealth: enemyType.stats.maxHealth,
                attack: enemyType.stats.attack,
                defense: enemyType.stats.defense,
                speed: enemyType.stats.speed,
                experience: enemyType.stats.experience,
                gold: enemyType.stats.gold,
                
                // Movement and AI state
                isMoving: false,
                facing: 'down',
                lastMoveTime: 0,
                
                // AI state
                aiState: 'idle', // idle, patrol, chase, attack, flee, return
                aiTarget: null, // Current target (usually player)
                aiLastSeen: null, // Last known player position
                aiPatrolTarget: null, // Current patrol destination
                aiStateTime: 0, // Time in current state
                
                // Animation state
                currentAnimation: 'idle',
                animationTime: 0,
                
                // Animation colors for different states
                baseColor: [...enemyType.sprite.color],
                idleColor: [...enemyType.animations.idle.color],
                walkColor: [...enemyType.animations.walk.color],
                attackColor: [...enemyType.animations.attack.color],
                hurtColor: [...enemyType.animations.hurt.color],
                deathColor: [...enemyType.animations.death.color],
                
                // Status flags
                isDead: false,
                isStunned: false,
                stunTime: 0,
                
                // Methods
                takeDamage(amount) {
                    if (this.isDead) return 0;
                    
                    const actualDamage = Math.max(1, amount - this.defense);
                    this.health = Math.max(0, this.health - actualDamage);
                    
                    console.log(`💔 ${this.name} took ${actualDamage} damage! (${this.health}/${this.maxHealth})`);
                    this.playAnimation('hurt');
                    
                    // Check for death
                    if (this.health <= 0) {
                        this.die();
                    } else {
                        // Update AI state based on damage
                        const behavior = EnemyUtils.getAIBehavior(this.enemyType.ai.type);
                        if (behavior.fleeWhenLowHealth && this.health < this.maxHealth * 0.3) {
                            this.aiState = 'flee';
                            this.aiStateTime = 0;
                        }
                    }
                    
                    return actualDamage;
                },
                
                die() {
                    if (this.isDead) return;
                    
                    this.isDead = true;
                    this.aiState = 'dead';
                    this.playAnimation('death');
                    if (enemy) {
                        console.log(`👹 Spawned ${enemyType.name} at (${gridX}, ${gridY})`);
                        console.log(`🔍 Enemy final position: (${enemy.pos.x}, ${enemy.pos.y}), anchor: ${enemy.anchor}, size: ${enemyType.sprite.size}`);
                    }
                    
                    console.log(`💀 ${this.name} died!`);
                    
                    // Award experience and gold to player
                    console.log('Enemy died, attempting to award XP...', {
                        enemy: this.name,
                        experience: this.experience,
                        gold: this.gold,
                        currentPlayerExists: !!window.currentPlayer,
                        playerExists: !!window.player,
                        windowKeys: Object.keys(window).filter(k => ['currentPlayer', 'player'].includes(k))
                    });
                    
                    // Try multiple ways to get player reference
                    const player = window.currentPlayer || window.player || 
                        (window.game && window.game.player) || 
                        (window.scene && window.scene.player);
                        
                    console.log('Found player reference:', {
                        player,
                        hasGainExperience: player && typeof player.gainExperience,
                        playerKeys: player ? Object.keys(player) : 'no player'
                    });
                    
                    if (player && typeof player.gainExperience === 'function') {
                        try {
                            const beforeXP = player.experience;
                            const beforeGold = player.gold || 0;
                            
                            player.gainExperience(this.experience);
                            player.gold = (player.gold || 0) + this.gold;
                            
                            console.log(`⭐ Player gained ${this.experience} XP (${beforeXP} → ${player.experience}) and ${this.gold} gold (${beforeGold} → ${player.gold})!`);
                            
                            // Force UI update if available
                            if (window.inventory && typeof window.inventory.updatePlayerStats === 'function') {
                                window.inventory.updatePlayerStats();
                                console.log('Updated player stats UI');
                            }
                        } catch (error) {
                            console.error('Error awarding XP:', error);
                        }
                    } else {
                        console.warn('Could not award XP: Player reference not found or invalid', {
                            player,
                            hasGainExperience: player ? typeof player.gainExperience : 'no player',
                            windowKeys: Object.keys(window)
                        });
                    }
                    
                    // Generate loot
                    const loot = EnemyUtils.calculateLoot(this.enemyType);
                    this.dropLoot(loot);
                    
                    // Schedule removal after death animation
                    setTimeout(() => {
                        if (this.exists()) {
                            k.destroy(this);
                        }
                    }, this.enemyType.animations.death.duration * 1000);
                },
                
                dropLoot(lootItems) {
                    lootItems.forEach((lootItem, index) => {
                        // Scatter loot around the enemy position
                        const offsetX = (Math.random() - 0.5) * 2;
                        const offsetY = (Math.random() - 0.5) * 2;
                        const lootGridX = Math.round(this.gridX + offsetX);
                        const lootGridY = Math.round(this.gridY + offsetY);
                        
                        // Create loot item (simplified for now)
                        const lootPos = GridUtils.createGridPos(lootGridX, lootGridY, true);
                        const lootColor = this.getLootColor(lootItem.item);
                        
                        k.add([
                            k.rect(12, 12),
                            k.color(...lootColor),
                            k.pos(lootPos.x, lootPos.y),
                            k.anchor("center"),
                            k.z(5),
                            "item",
                            {
                                gridX: lootGridX,
                                gridY: lootGridY,
                                itemType: lootItem.item,
                                amount: lootItem.amount
                            }
                        ]);
                        
                        console.log(`💰 ${this.name} dropped ${lootItem.amount}x ${lootItem.item}`);
                    });
                },
                
                getLootColor(itemType) {
                    const colors = {
                        'gold': [255, 215, 0],
                        'potion': [255, 100, 100],
                        'weapon': [150, 150, 255],
                        'armor': [200, 200, 200],
                        'key': [255, 255, 100]
                    };
                    return colors[itemType] || [150, 150, 150];
                },
                
                playAnimation(animationType) {
                    if (this.currentAnimation !== animationType) {
                        this.currentAnimation = animationType;
                        this.animationTime = 0;
                        console.log(`🎭 ${this.name} playing animation: ${animationType}`);
                    }
                },
                
                updateFacing(direction) {
                    this.facing = direction;
                },
                
                // Get distance to target (usually player)
                getDistanceToTarget(target) {
                    if (!target) return Infinity;
                    return GridUtils.manhattanDistance(this.gridX, this.gridY, target.gridX, target.gridY);
                },
                
                // Check if target is in line of sight
                hasLineOfSight(target) {
                    if (!target) return false;
                    
                    // Simple line of sight - check if there are walls between enemy and target
                    const dx = target.gridX - this.gridX;
                    const dy = target.gridY - this.gridY;
                    const distance = Math.max(Math.abs(dx), Math.abs(dy));
                    
                    if (distance === 0) return true;
                    
                    const stepX = dx / distance;
                    const stepY = dy / distance;
                    
                    for (let i = 1; i < distance; i++) {
                        const checkX = Math.round(this.gridX + stepX * i);
                        const checkY = Math.round(this.gridY + stepY * i);
                        
                        // Check for walls at this position
                        const walls = k.get("wall");
                        const blocked = walls.some(wall => wall.gridX === checkX && wall.gridY === checkY);
                        if (blocked) return false;
                    }
                    
                    return true;
                },
                
                // Move towards a target position
                moveTowards(targetGridX, targetGridY) {
                    if (this.isMoving || this.isDead) return false;
                    
                    const dx = targetGridX - this.gridX;
                    const dy = targetGridY - this.gridY;
                    
                    // Determine movement direction (one step at a time)
                    let moveX = 0, moveY = 0;
                    
                    if (Math.abs(dx) > Math.abs(dy)) {
                        moveX = dx > 0 ? 1 : -1;
                    } else if (dy !== 0) {
                        moveY = dy > 0 ? 1 : -1;
                    }
                    
                    const newGridX = this.gridX + moveX;
                    const newGridY = this.gridY + moveY;
                    
                    // Check if new position is valid and not blocked
                    if (GridUtils.isValidGridPosition(newGridX, newGridY)) {
                        const walls = k.get("wall");
                        const blocked = walls.some(wall => wall.gridX === newGridX && wall.gridY === newGridY);
                        
                        if (!blocked) {
                            // Check for other enemies at target position
                            const enemies = k.get("enemy");
                            const enemyBlocked = enemies.some(enemy => 
                                enemy !== this && enemy.gridX === newGridX && enemy.gridY === newGridY
                            );
                            
                            if (!enemyBlocked) {
                                this.moveToPosition(newGridX, newGridY);
                                return true;
                            }
                        }
                    }
                    
                    return false;
                },
                
                // Actually move to a position with animation
                moveToPosition(newGridX, newGridY) {
                    this.isMoving = true;
                    this.gridX = newGridX;
                    this.gridY = newGridY;
                    this.playAnimation('walk');
                    
                    // Update facing direction
                    const dx = newGridX - this.gridX;
                    const dy = newGridY - this.gridY;
                    if (Math.abs(dx) > Math.abs(dy)) {
                        this.updateFacing(dx > 0 ? 'right' : 'left');
                    } else if (dy !== 0) {
                        this.updateFacing(dy > 0 ? 'down' : 'up');
                    }
                    
                    // Smooth movement animation
                    const newPixelPos = GridUtils.createGridPos(newGridX, newGridY, false);
                    const moveSpeed = this.speed * 0.5; // Adjust speed multiplier
                    
                    k.tween(
                        this.pos,
                        k.vec2(newPixelPos.x, newPixelPos.y),
                        moveSpeed,
                        (p) => this.pos = p,
                        k.easings.easeOutQuad
                    ).then(() => {
                        this.isMoving = false;
                        this.lastMoveTime = k.time();
                        
                        // Return to idle animation if not in combat
                        if (this.currentAnimation === 'walk' && this.aiState !== 'chase' && this.aiState !== 'flee') {
                            this.playAnimation('idle');
                        }
                    });
                }
            }
        ]);
        
        console.log(`👹 ${enemyType.name} created at grid (${gridX}, ${gridY})`);
        return enemy;
    },
    
    // Update enemy animations
    updateAnimation(k, enemy, deltaTime) {
        if (!enemy || !enemy.currentAnimation || enemy.isDead) return;
        
        enemy.animationTime += deltaTime;
        
        // Handle different animation types
        switch (enemy.currentAnimation) {
            case 'idle':
                enemy.color = k.rgb(...enemy.idleColor);
                break;
                
            case 'walk':
                // Pulsing effect while walking
                const walkPulse = Math.sin(enemy.animationTime * 10) * 0.2 + 1;
                enemy.color = k.rgb(
                    enemy.walkColor[0] * walkPulse,
                    enemy.walkColor[1] * walkPulse,
                    enemy.walkColor[2] * walkPulse
                );
                break;
                
            case 'attack':
                // Flash attack color
                const attackFlash = Math.sin(enemy.animationTime * 25) * 0.5 + 0.5;
                enemy.color = k.rgb(
                    enemy.attackColor[0] * attackFlash + enemy.baseColor[0] * (1 - attackFlash),
                    enemy.attackColor[1] * attackFlash + enemy.baseColor[1] * (1 - attackFlash),
                    enemy.attackColor[2] * attackFlash + enemy.baseColor[2] * (1 - attackFlash)
                );
                
                if (enemy.animationTime > enemy.enemyType.animations.attack.duration) {
                    enemy.currentAnimation = 'idle';
                    enemy.animationTime = 0;
                }
                break;
                
            case 'hurt':
                // Flash red for damage
                const hurtFlash = Math.sin(enemy.animationTime * 20) * 0.7 + 0.3;
                enemy.color = k.rgb(
                    enemy.hurtColor[0] * hurtFlash,
                    enemy.hurtColor[1] * hurtFlash,
                    enemy.hurtColor[2] * hurtFlash
                );
                
                if (enemy.animationTime > enemy.enemyType.animations.hurt.duration) {
                    enemy.currentAnimation = 'idle';
                    enemy.animationTime = 0;
                }
                break;
                
            case 'death':
                // Fade to death color
                const deathProgress = Math.min(1, enemy.animationTime / enemy.enemyType.animations.death.duration);
                enemy.color = k.rgb(
                    enemy.baseColor[0] * (1 - deathProgress) + enemy.deathColor[0] * deathProgress,
                    enemy.baseColor[1] * (1 - deathProgress) + enemy.deathColor[1] * deathProgress,
                    enemy.baseColor[2] * (1 - deathProgress) + enemy.deathColor[2] * deathProgress
                );
                enemy.opacity = 1 - deathProgress * 0.7; // Fade out
                break;
                
            default:
                enemy.currentAnimation = 'idle';
                break;
        }
    }
};

// Make EnemyEntity globally available
window.EnemyEntity = EnemyEntity;

console.log('👹 EnemyEntity system loaded successfully');
