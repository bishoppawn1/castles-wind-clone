// Combat System for Castles of the Wind Clone
// Handles turn-based combat, damage calculation, and combat interactions

const CombatSystem = {
    // Initialize combat system
    init(k) {
        this.k = k;
        this.combatQueue = [];
        this.currentTurn = null;
        this.combatActive = false;
        this.turnTimer = 0;
        this.turnDuration = 1.0; // 1 second per turn
        this.waitingForEnemyTurn = false; // Block player attacks until enemy responds
        
        console.log('⚔️ Combat System initialized');
    },
    
    // Start combat between player and enemy
    startCombat(player, enemy) {
        if (this.combatActive) return;
        
        console.log('⚔️ Starting combat!', { player: player.name, enemy: enemy.name });
        
        this.combatActive = true;
        this.combatQueue = [player, enemy];
        this.currentTurn = 0;
        
        // Show combat UI
        if (window.CombatUI) {
            CombatUI.showCombatUI();
        }
        
        // Create health bars for combat entities
        if (window.HealthBarUI) {
            HealthBarUI.createFloatingHealthBar(enemy);
            HealthBarUI.showHealthBar(enemy);
            // Create player health bar if it doesn't exist
            if (!HealthBarUI.playerHealthBar) {
                HealthBarUI.createPlayerHealthBar(player);
            }
        }
        
        // Start first turn
        this.processTurn();
    },
    
    // Process current turn
    processTurn() {
        if (!this.combatActive || this.combatQueue.length === 0) return;
        
        const currentEntity = this.combatQueue[this.currentTurn];
        
        if (!currentEntity || currentEntity.isDead) {
            this.endCombat();
            return;
        }
        
        console.log(`⚔️ ${currentEntity.name || 'Player'}'s turn`);
        
        // Auto-attack for enemies, player attacks are triggered by input
        if (currentEntity.enemyId) {
            this.performEnemyAttack(currentEntity);
            
            // Process poison damage after enemy action
            if (window.magicSystem) {
                window.magicSystem.processEntityAction(currentEntity);
            }
            
            // Advance to next turn after enemy attacks
            this.nextTurn();
        }
        // For player turns, we wait for input (spacebar) and advance turn manually
    },
    
    // Advance to next turn
    nextTurn() {
        // Safety: guard against empty queue
        if (!this.combatActive || !this.combatQueue || this.combatQueue.length === 0) {
            console.warn('⛔ nextTurn() called with empty or inactive combat, ending combat');
            this.endCombat();
            return;
        }

        this.currentTurn = (this.currentTurn + 1) % this.combatQueue.length;
        this.turnTimer = 0;
        
        // Check for combat end conditions
        const player = this.combatQueue.find(e => !e.enemyId);
        const enemy = this.combatQueue.find(e => e.enemyId);
        
        if (!player || player.isDead || !enemy || enemy.isDead) {
            this.endCombat();
            return;
        }
        
        // Only auto-schedule enemy turns, player turns wait for input
        const currentEntity = this.combatQueue[this.currentTurn];
        if (currentEntity && currentEntity.enemyId) {
            // Schedule enemy turn
            setTimeout(() => {
                if (this.combatActive) {
                    this.processTurn();
                }
            }, this.turnDuration * 1000);
        }
        // Player turns are handled by input (spacebar)
    },
    
    // Perform enemy attack
    performEnemyAttack(enemy) {
        const player = window.currentPlayer || window.player || (window.GameState && window.GameState.player);
        if (!player || player.isDead) return;
        
        // Check if enemy is in attack range
        const distance = this.getChebyshevDistance ? this.getChebyshevDistance(enemy, player) : this.getDistance(enemy, player);
        const attackRange = enemy.enemyType?.ai?.attackRange || 1;
        
        if (distance <= attackRange) {
            this.performAttack(enemy, player);
        } else {
            console.log(`⚔️ ${enemy.name} is too far to attack (distance: ${distance})`);
        }
        
        // Clear waiting state - player can attack again after enemy's turn
        this.waitingForEnemyTurn = false;
    },
    
    // Perform attack between attacker and target
    performAttack(attacker, target) {
        if (!attacker || !target || attacker.isDead || target.isDead) return;
        
        const attackerName = attacker.name || 'Player';
        const targetName = target.name || 'Player';
        
        // Calculate damage
        const baseDamage = attacker.attack || 10;
        const defense = target.defense || 0;
        const damage = Math.max(1, baseDamage - defense);
        
        console.log(`⚔️ ${attackerName} attacks ${targetName} for ${damage} damage!`);
        
        // Apply damage
        const actualDamage = target.takeDamage ? target.takeDamage(damage) : damage;
        
        // Update health bars
        if (window.HealthBarUI) {
            HealthBarUI.updateHealthBar(target);
        }
        
        // Notify combat UI of attack
        if (window.CombatUI) {
            CombatUI.onCombatEvent('attack', {
                attacker: attacker,
                target: target,
                damage: actualDamage
            });
        }
        
        // Check if target died
        if (target.isDead) {
            console.log(`🎯 Target ${target.name || 'enemy'} died!`);
            
            // If an enemy died, ensure player reference is available
            if (target.enemyId && !window.player && window.currentPlayer) {
                window.player = window.currentPlayer;
                console.log('Assigned currentPlayer to window.player for XP handling');
            }
            
            // Trigger enemy defeated event for objectives system
            if (target.enemyId) {
                const eventData = {
                    enemyType: target.enemyType?.id || target.enemyId || target.name || 'unknown',
                    enemyId: target.enemyId,
                    killedBy: attacker.name || 'player'
                };
                
                // Try multiple ways to trigger the event
                if (this.k && typeof this.k.trigger === 'function') {
                    this.k.trigger('enemy_defeated', eventData);
                    console.log(`📢 Triggered enemy_defeated via this.k:`, eventData);
                }
                
                if (typeof window !== 'undefined' && window.k && typeof window.k.trigger === 'function') {
                    window.k.trigger('enemy_defeated', eventData);
                    console.log(`📢 Triggered enemy_defeated via window.k:`, eventData);
                }
                
                // Direct call to objectives system as fallback
                if (typeof window !== 'undefined' && window.ObjectivesSystem) {
                    window.ObjectivesSystem.trackObjectiveProgress('enemy_defeated', eventData);
                    console.log(`📢 Direct call to ObjectivesSystem:`, eventData);
                }
            }
            
            // Let the enemy handle its own death (which includes XP and loot)
            if (typeof target.die === 'function') {
                target.die();
            }
            
            // Notify combat UI
            if (window.CombatUI) {
                CombatUI.onCombatEvent('death', { target: target });
            }
            
            // If an enemy died, end combat
            if (target.enemyId) {
                this.endCombat();
            }
        }
        
        // Visual effects
        this.createCombatEffect(attacker, target, actualDamage);
        
        // Play attack animation
        if (attacker.playAnimation) {
            attacker.playAnimation('attack');
        }
        
        // Camera shake
        if (window.CameraSystem) {
            CameraSystem.shake(10, 200);
        }
        
        return actualDamage;
    },
    
    // Player attack (triggered by spacebar or click)
    playerAttack() {
        // Resolve player from multiple globals for robustness
        const player = window.currentPlayer || window.player || (window.GameState && window.GameState.player);
        console.log('⚔️ playerAttack() invoked', {
            combatActive: this.combatActive,
            waitingForEnemyTurn: this.waitingForEnemyTurn,
            hasPlayer: !!player,
            playerDead: player ? !!player.isDead : 'no-player'
        });
        if (!player) {
            console.warn('⚔️ playerAttack: no player found');
            return;
        }
        if (player.isDead) {
            console.warn('⚰️ Cannot attack: player is dead');
            return;
        }
        
        // Block attacks only if combat is active AND we're waiting for enemy
        if (this.combatActive && this.waitingForEnemyTurn) {
            console.log('⚔️ Waiting for enemy to attack back...');
            return;
        }
        
        // If not currently in combat, try to find adjacent enemies and start combat
        if (!this.combatActive) {
            console.log('⚔️ Not in combat, checking for nearby enemies...');
            this.checkForNearbyEnemies();
            return;
        }
        
        // We're in combat: ensure it's the player's turn
        const currentEntity = (this.combatQueue && this.combatQueue.length)
            ? this.combatQueue[this.currentTurn]
            : null;
        // Treat any non-enemy entity as the player for robustness, or direct equality
        const isPlayersTurn = !!currentEntity && (
            currentEntity === player ||
            (!currentEntity.enemyId && !(currentEntity.tags && currentEntity.tags.includes('enemy')))
        );
        if (!isPlayersTurn) {
            console.log('⏳ Not your turn! Wait for enemy turn.');
            return;
        }
        
        // Find nearest living enemy to attack
        const enemies = this.k.get("enemy").filter(e => !e.isDead);
        if (enemies.length === 0) {
            console.log('🛑 No living enemies available to attack');
            return;
        }
        
        const nearestEnemy = this.findNearestEnemy(player, enemies);
        if (nearestEnemy) {
            const distanceTiles = this.getChebyshevDistance ? this.getChebyshevDistance(player, nearestEnemy) : this.getDistance(player, nearestEnemy);
            if (distanceTiles <= 1) { // Player attack range (including diagonals)
                this.performAttack(player, nearestEnemy);
                
                // If combat ended due to killing the enemy, don't advance turns
                if (!this.combatActive || nearestEnemy.isDead) {
                    console.log('🧹 Combat ended after attack (target dead)');
                    return;
                }
                
                // Process poison damage after player action
                if (window.magicSystem) {
                    window.magicSystem.processEntityAction(player);
                }
                
                // Set waiting state and advance to next turn
                this.waitingForEnemyTurn = true;
                this.nextTurn();
            } else {
                console.log('📏 No enemy in range to attack (tiles away:', distanceTiles, ')');
            }
        } else {
            console.log('🔍 No enemies found to target');
        }
    },
    
    // Check for nearby enemies to start combat
    checkForNearbyEnemies() {
        const player = window.currentPlayer || window.player || (window.GameState && window.GameState.player);
        if (!player) {
            console.warn('⚔️ checkForNearbyEnemies: no player found');
            return;
        }
        
        const enemies = this.k.get("enemy").filter(e => !e.isDead);
        console.log(`👀 Found ${enemies.length} living enemies in scene`);
        const nearbyEnemies = enemies.filter(enemy => {
            const distanceTiles = this.getChebyshevDistance ? this.getChebyshevDistance(player, enemy) : this.getDistance(player, enemy);
            return distanceTiles <= 1; // Adjacent tiles (including diagonals)
        });
        
        if (nearbyEnemies.length > 0) {
            console.log(`🎯 ${nearbyEnemies.length} enemy(ies) adjacent - initiating attack`);
            // Attack nearest enemy
            const target = nearbyEnemies[0];
            this.performAttack(player, target);
            
            // Process poison damage after player action
            if (window.magicSystem) {
                window.magicSystem.processEntityAction(player);
            }
            
            // Start combat if enemy is still alive
            if (!target.isDead) {
                this.startCombat(player, target);
                // Player has used their turn, set waiting state and advance to enemy turn
                this.waitingForEnemyTurn = true;
                this.nextTurn();
            }
        } else {
            console.log('🔍 No adjacent enemies to attack');
        }
    },
    
    // End combat
    endCombat() {
        if (!this.combatActive) return;
        
        console.log('⚔️ Combat ended, cleaning up...');
        
        // Get the player reference before clearing state
        const player = window.player || window.currentPlayer;
        
        // Clear combat state
        this.combatActive = false;
        this.combatQueue = [];
        this.currentTurn = null;
        this.waitingForEnemyTurn = false;
        
        // Hide health bars when combat ends
        if (window.HealthBarUI) {
            HealthBarUI.hideCombatHealthBars();
            
            // Ensure player health bar is still visible after combat
            if (player) {
                HealthBarUI.updatePlayerHealthBar(player);
            }
        }
        
        // Notify combat UI that combat ended
        if (window.CombatUI) {
            CombatUI.hideCombatUI();
        }
        
        // Resume enemy AI for living enemies
        const enemies = this.k.get("enemy").filter(e => !e.isDead);
        enemies.forEach(enemy => {
            if (enemy.aiState === 'combat') {
                enemy.aiState = 'idle';
                console.log(`🔄 Enemy ${enemy.name || enemy.enemyId} returning to idle state`);
            }
        });
        
        // Update player stats in case they changed during combat
        if (player && window.inventory && typeof window.inventory.updatePlayerStats === 'function') {
            const before = {
                attack: player.attack,
                baseAttack: player.baseStats && player.baseStats.attack,
                equipAttack: player.equipmentStats && player.equipmentStats.attack,
                tempAttack: player.tempStats && player.tempStats.attack
            };
            window.inventory.updatePlayerStats(player);
            const after = {
                attack: player.attack,
                baseAttack: player.baseStats && player.baseStats.attack,
                equipAttack: player.equipmentStats && player.equipmentStats.attack,
                tempAttack: player.tempStats && player.tempStats.attack
            };
            console.log('📊 Updated player stats after combat', { before, after });
        }
    },
    
    // Create visual combat effect
    createCombatEffect(attacker, target, damage) {
        const targetPos = target.pos;
        const displayDamage = damage || 0;
        
        // Damage number effect
        const damageText = this.k.add([
            this.k.text(displayDamage.toString()),
            this.k.pos(targetPos.x, targetPos.y - 20),
            this.k.anchor("center"),
            this.k.scale(0.35),
            this.k.color(255, 100, 100), // Red damage text
            this.k.opacity(1), // Required for lifespan
            this.k.z(20),
            this.k.lifespan(1.5)
        ]);
        
        // Animate damage text
        this.k.tween(
            damageText.pos,
            this.k.vec2(targetPos.x, targetPos.y - 40),
            1.0,
            (p) => damageText.pos = p,
            this.k.easings.easeOutQuad
        );
        
        this.k.tween(
            damageText.opacity,
            0,
            1.0,
            (o) => damageText.opacity = o,
            this.k.easings.easeOutQuad
        );
        
        // Hit effect particles
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const distance = 15;
            const particleX = targetPos.x + Math.cos(angle) * distance;
            const particleY = targetPos.y + Math.sin(angle) * distance;
            
            const particle = this.k.add([
                this.k.rect(3, 3),
                this.k.color(255, 200, 100), // Orange hit particles
                this.k.pos(particleX, particleY),
                this.k.anchor("center"),
                this.k.opacity(1), // Required for lifespan
                this.k.z(15),
                this.k.lifespan(0.5)
            ]);
            
            // Animate particles outward
            this.k.tween(
                particle.pos,
                this.k.vec2(particleX + Math.cos(angle) * 10, particleY + Math.sin(angle) * 10),
                0.5,
                (p) => particle.pos = p,
                this.k.easings.easeOutQuad
            );
        }
    },
    
    // Get distance between two entities
    getDistance(entity1, entity2) {
        return Math.abs(entity1.gridX - entity2.gridX) + Math.abs(entity1.gridY - entity2.gridY);
    },
    
    // Get Chebyshev distance (diagonal counts as 1)
    getChebyshevDistance(entity1, entity2) {
        const dx = Math.abs(entity1.gridX - entity2.gridX);
        const dy = Math.abs(entity1.gridY - entity2.gridY);
        return Math.max(dx, dy);
    },
    
    // Find nearest enemy to player
    findNearestEnemy(player, enemies) {
        let nearest = null;
        let minDistance = Infinity;
        
        enemies.forEach(enemy => {
            const distance = this.getDistance(player, enemy);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = enemy;
            }
        });
        
        return nearest;
    },
    
    // Update combat system
    update(k, deltaTime) {
        // Don't update combat when game is paused
        if (window.GameState && window.GameState.isGamePaused()) return;
        
        if (!this.combatActive) return;
        
        this.turnTimer += deltaTime;
        
        // Handle turn timeouts if needed
        if (this.turnTimer > this.turnDuration * 2) {
            console.log('⚔️ Turn timeout, advancing to next turn');
            this.nextTurn();
        }
    }
};

// Make CombatSystem globally available
window.CombatSystem = CombatSystem;

console.log('⚔️ Combat System loaded successfully');
