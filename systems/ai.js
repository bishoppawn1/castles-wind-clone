// AI System for Castles of the Wind Clone
// Handles enemy AI behaviors, pathfinding, and decision making

const AISystem = {
    // Initialize AI system
    init(k) {
        console.log('🧠 AI System initialized');
        console.log('🔍 EnemyUtils available:', !!window.EnemyUtils);
        if (window.EnemyUtils) {
            console.log('🔍 EnemyUtils methods:', Object.keys(window.EnemyUtils));
        } else {
            // Create temporary fallback EnemyUtils
            console.log('⚠️ Creating temporary EnemyUtils fallback');
            window.EnemyUtils = {
                getAIBehavior: (type) => ({
                    chasePlayer: true,
                    fleeWhenLowHealth: false,
                    patrolWhenIdle: true,
                    returnToSpawn: true,
                    attackRange: 1
                })
            };
        }
    },
    
    // Update all enemies' AI
    update(k, deltaTime) {
        // Don't update AI when game is paused
        if (window.GameState && window.GameState.isGamePaused()) return;
        
        const enemies = k.get("enemy");
        const player = window.currentPlayer;
        
        if (!player) return;
        
        enemies.forEach(enemy => {
            if (enemy.isDead || enemy.isMoving) return;
            
            this.updateEnemyAI(k, enemy, player, deltaTime);
        });
    },
    
    // Update individual enemy AI
    updateEnemyAI(k, enemy, player, deltaTime) {
        enemy.aiStateTime += deltaTime;
        
        // Check if EnemyUtils is available
        if (!window.EnemyUtils) {
            console.error('❌ EnemyUtils not available - AI system disabled');
            return;
        }
        
        const aiConfig = enemy.enemyType.ai;
        const behavior = EnemyUtils.getAIBehavior(aiConfig.type);
        const distanceToPlayer = enemy.getDistanceToTarget(player);
        const hasLOS = enemy.hasLineOfSight(player);
        
        // Update AI state based on current conditions
        this.updateAIState(enemy, player, distanceToPlayer, hasLOS, aiConfig, behavior);
        
        // Execute AI behavior based on current state
        this.executeAIBehavior(k, enemy, player, aiConfig, behavior);
    },
    
    // Update AI state machine
    updateAIState(enemy, player, distanceToPlayer, hasLOS, aiConfig, behavior) {
        const currentState = enemy.aiState;
        
        switch (currentState) {
            case 'idle':
                // Check if player is in detection range
                if (behavior.chasePlayer && distanceToPlayer <= aiConfig.detectionRange && hasLOS) {
                    enemy.aiState = 'chase';
                    enemy.aiTarget = player;
                    enemy.aiLastSeen = { x: player.gridX, y: player.gridY };
                    enemy.aiStateTime = 0;
                    console.log(`🎯 ${enemy.name} spotted player and is now chasing!`);
                } else if (enemy.aiStateTime > 2.0) { // Idle for 2 seconds, start patrolling
                    enemy.aiState = 'patrol';
                    enemy.aiStateTime = 0;
                }
                break;
                
            case 'patrol':
                // Check if player is in detection range
                if (behavior.chasePlayer && distanceToPlayer <= aiConfig.detectionRange && hasLOS) {
                    enemy.aiState = 'chase';
                    enemy.aiTarget = player;
                    enemy.aiLastSeen = { x: player.gridX, y: player.gridY };
                    enemy.aiStateTime = 0;
                    console.log(`🎯 ${enemy.name} spotted player while patrolling!`);
                } else if (enemy.aiStateTime > 3.0) { // Patrol for 3 seconds, then idle
                    enemy.aiState = 'idle';
                    enemy.aiStateTime = 0;
                }
                break;
                
            case 'chase':
                // Check if player is still in range
                if (distanceToPlayer > aiConfig.detectionRange * 1.5) {
                    if (enemy.aiLastSeen) {
                        enemy.aiState = 'search';
                        enemy.aiStateTime = 0;
                        console.log(`🔍 ${enemy.name} lost sight of player, searching...`);
                    } else {
                        enemy.aiState = behavior.returnToStart ? 'return' : 'idle';
                        enemy.aiStateTime = 0;
                    }
                } else if (distanceToPlayer <= aiConfig.attackRange) {
                    enemy.aiState = 'attack';
                    enemy.aiStateTime = 0;
                } else if (hasLOS) {
                    // Update last seen position
                    enemy.aiLastSeen = { x: player.gridX, y: player.gridY };
                }
                break;
                
            case 'attack':
                // Attack for a short duration, then return to chase or idle
                if (enemy.aiStateTime > 1.0) {
                    if (distanceToPlayer <= aiConfig.detectionRange) {
                        enemy.aiState = 'chase';
                    } else {
                        enemy.aiState = behavior.returnToStart ? 'return' : 'idle';
                    }
                    enemy.aiStateTime = 0;
                }
                break;
                
            case 'search':
                // Search for player at last known location
                if (distanceToPlayer <= aiConfig.detectionRange && hasLOS) {
                    enemy.aiState = 'chase';
                    enemy.aiTarget = player;
                    enemy.aiLastSeen = { x: player.gridX, y: player.gridY };
                    enemy.aiStateTime = 0;
                } else if (enemy.aiStateTime > 5.0) { // Search for 5 seconds
                    enemy.aiState = behavior.returnToStart ? 'return' : 'patrol';
                    enemy.aiStateTime = 0;
                    enemy.aiLastSeen = null;
                }
                break;
                
            case 'flee':
                // Flee until far enough away or health recovers
                if (distanceToPlayer > aiConfig.detectionRange * 2 || enemy.health > enemy.maxHealth * 0.5) {
                    enemy.aiState = behavior.returnToStart ? 'return' : 'patrol';
                    enemy.aiStateTime = 0;
                }
                break;
                
            case 'return':
                // Return to spawn point
                const distanceToSpawn = GridUtils.manhattanDistance(
                    enemy.gridX, enemy.gridY, enemy.spawnX, enemy.spawnY
                );
                
                if (distanceToSpawn <= 1) {
                    enemy.aiState = 'idle';
                    enemy.aiStateTime = 0;
                } else if (behavior.chasePlayer && distanceToPlayer <= aiConfig.detectionRange && hasLOS) {
                    // Player came back in range while returning
                    enemy.aiState = 'chase';
                    enemy.aiTarget = player;
                    enemy.aiLastSeen = { x: player.gridX, y: player.gridY };
                    enemy.aiStateTime = 0;
                }
                break;
        }
    },
    
    // Execute AI behavior based on current state
    executeAIBehavior(k, enemy, player, aiConfig, behavior) {
        const currentTime = k.time();
        const moveDelay = 1.0 / aiConfig.moveSpeed; // Time between moves
        
        // Don't move too frequently
        if (currentTime - enemy.lastMoveTime < moveDelay) return;
        
        switch (enemy.aiState) {
            case 'idle':
                // Occasionally face a random direction
                if (Math.random() < 0.1) {
                    const directions = ['up', 'down', 'left', 'right'];
                    enemy.updateFacing(directions[Math.floor(Math.random() * directions.length)]);
                }
                break;
                
            case 'patrol':
                this.executePatrolBehavior(enemy, aiConfig);
                break;
                
            case 'chase':
                this.executeChaseBehavior(enemy, player, aiConfig);
                break;
                
            case 'attack':
                this.executeAttackBehavior(k, enemy, player);
                break;
                
            case 'search':
                if (enemy.aiLastSeen) {
                    this.executeMoveTowards(enemy, enemy.aiLastSeen.x, enemy.aiLastSeen.y);
                }
                break;
                
            case 'flee':
                this.executeFleeeBehavior(enemy, player);
                break;
                
            case 'return':
                this.executeMoveTowards(enemy, enemy.spawnX, enemy.spawnY);
                break;
        }
    },
    
    // Execute patrol behavior
    executePatrolBehavior(enemy, aiConfig) {
        // If no patrol target, pick a random one within patrol radius
        if (!enemy.aiPatrolTarget) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * aiConfig.patrolRadius;
            enemy.aiPatrolTarget = {
                x: Math.round(enemy.spawnX + Math.cos(angle) * distance),
                y: Math.round(enemy.spawnY + Math.sin(angle) * distance)
            };
        }
        
        // Move towards patrol target
        const reached = this.executeMoveTowards(enemy, enemy.aiPatrolTarget.x, enemy.aiPatrolTarget.y);
        if (reached || Math.random() < 0.1) { // 10% chance to pick new target each update
            enemy.aiPatrolTarget = null;
        }
    },
    
    // Execute chase behavior
    executeChaseBehavior(enemy, player, aiConfig) {
        // Use faster chase speed
        const originalSpeed = enemy.speed;
        enemy.speed = aiConfig.chaseSpeed || aiConfig.moveSpeed * 1.2;
        
        const moved = this.executeMoveTowards(enemy, player.gridX, player.gridY);
        
        // Restore original speed
        enemy.speed = originalSpeed;
        
        return moved;
    },
    
    // Execute attack behavior
    executeAttackBehavior(k, enemy, player) {
        // Skip AI attack if combat system is active (combat system handles attacks)
        if (window.CombatSystem && window.CombatSystem.combatActive) {
            // Just play animation, no damage - combat system handles damage
            return;
        }
        
        // Play attack animation and deal damage (only when not in combat)
        enemy.playAnimation('attack');
        
        // Deal damage to player (simple implementation)
        if (enemy.aiStateTime < 0.1) { // Only attack once at the start of attack state
            const damage = enemy.attack;
            if (player.takeDamage) {
                player.takeDamage(damage);
                console.log(`⚔️ ${enemy.name} attacks player for ${damage} damage!`);
                
                // Camera shake on attack
                if (window.CameraSystem) {
                    CameraSystem.shake(10, 200);
                }
            }
            
            // Process poison damage when enemy takes an attack action
            if (window.magicSystem) {
                window.magicSystem.processEntityAction(enemy);
            }
        }
    },
    
    // Execute flee behavior
    executeFleeeBehavior(enemy, player) {
        // Move away from player
        const dx = enemy.gridX - player.gridX;
        const dy = enemy.gridY - player.gridY;
        
        // Normalize and extend the flee direction
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
            const fleeX = Math.round(enemy.gridX + (dx / distance) * 2);
            const fleeY = Math.round(enemy.gridY + (dy / distance) * 2);
            this.executeMoveTowards(enemy, fleeX, fleeY);
        }
    },
    
    // Execute movement towards a target
    executeMoveTowards(enemy, targetX, targetY) {
        const distance = GridUtils.manhattanDistance(enemy.gridX, enemy.gridY, targetX, targetY);
        
        if (distance <= 1) {
            return true; // Reached target
        }
        
        const moved = enemy.moveTowards(targetX, targetY);
        
        // Process poison damage when enemy takes a movement action
        if (moved && window.magicSystem) {
            window.magicSystem.processEntityAction(enemy);
        }
        
        return moved;
    },
    
    // Get all enemies in a certain range
    getEnemiesInRange(k, centerX, centerY, range) {
        const enemies = k.get("enemy");
        return enemies.filter(enemy => {
            if (enemy.isDead) return false;
            const distance = GridUtils.manhattanDistance(centerX, centerY, enemy.gridX, enemy.gridY);
            return distance <= range;
        });
    },
    
    // Get closest enemy to a position
    getClosestEnemy(k, centerX, centerY, maxRange = Infinity) {
        const enemies = k.get("enemy");
        let closest = null;
        let closestDistance = maxRange;
        
        enemies.forEach(enemy => {
            if (enemy.isDead) return;
            const distance = GridUtils.manhattanDistance(centerX, centerY, enemy.gridX, enemy.gridY);
            if (distance < closestDistance) {
                closest = enemy;
                closestDistance = distance;
            }
        });
        
        return closest;
    },
    
    // Debug: Draw AI state information
    drawDebugInfo(k, enemy) {
        if (!enemy || enemy.isDead) return;
        
        // Draw AI state text above enemy
        const stateText = k.add([
            k.text(`${enemy.aiState}`),
            k.pos(enemy.pos.x, enemy.pos.y - 20),
            k.anchor("center"),
            k.scale(0.25),
            k.color(255, 255, 255),
            k.opacity(1),
            k.z(100),
            k.lifespan(0.1) // Remove after 0.1 seconds
        ]);
        
        // Draw detection range (if in chase or search state)
        if (enemy.aiState === 'chase' || enemy.aiState === 'search') {
            const range = enemy.enemyType.ai.detectionRange;
            const rangePixels = range * 32; // Convert to pixels
            
            k.add([
                k.circle(rangePixels),
                k.pos(enemy.pos.x, enemy.pos.y),
                k.anchor("center"),
                k.outline(1, k.rgb(255, 0, 0)),
                k.opacity(0.2),
                k.z(1),
                k.lifespan(0.1)
            ]);
        }
    }
};

// Make AISystem globally available
window.AISystem = AISystem;

console.log('🧠 AI System loaded successfully');
