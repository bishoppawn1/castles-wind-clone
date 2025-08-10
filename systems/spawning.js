// Spawning System for Castles of the Wind Clone
// Handles enemy spawning from level data and dynamic spawning

const SpawningSystem = {
    // Initialize spawning system
    init(k) {
        this.spawnedEnemies = new Map(); // Track spawned enemies by position
        this.spawnTimers = new Map(); // Track spawn timers for dynamic spawning
        console.log('🎯 Spawning System initialized');
    },
    
    // Main update method called from game loop
    update(k, deltaTime) {
        // Don't update spawning when game is paused
        if (window.GameState && window.GameState.isGamePaused()) return;
        
        // Update dynamic spawning
        this.updateDynamicSpawning(k, deltaTime);
        
        // Clean up dead enemies from tracking
        this.cleanupDeadEnemies(k);
    },
    
    // Clean up dead enemies from spawn tracking
    cleanupDeadEnemies(k) {
        const enemies = k.get("enemy");
        const deadEnemies = enemies.filter(e => e.isDead);
        
        deadEnemies.forEach(enemy => {
            const key = `${enemy.gridX},${enemy.gridY}`;
            if (this.spawnedEnemies.has(key)) {
                this.spawnedEnemies.delete(key);
            }
        });
    },
    
    // Spawn enemies from level data
    spawnEnemiesFromLevel(k, levelData) {
        if (!levelData || !levelData.layout) {
            console.warn('⚠️ No level data provided for enemy spawning');
            return;
        }
        
        console.log(`🎯 Spawning enemies from level: ${levelData.name || 'Unknown'}`);
        
        let enemiesSpawned = 0;
        
        // Parse level layout for enemy spawn points
        levelData.layout.forEach((row, y) => {
            for (let x = 0; x < row.length; x++) {
                const symbol = row[x];
                const enemyType = EnemyUtils.getEnemyBySymbol(symbol);
                
                if (enemyType) {
                    const enemy = this.spawnEnemy(k, enemyType, x, y);
                    if (enemy) {
                        enemiesSpawned++;
                        // Track this spawn position
                        this.spawnedEnemies.set(`${x},${y}`, enemy);
                    }
                }
            }
        });
        
        console.log(`👹 Spawned ${enemiesSpawned} enemies from level data`);
        return enemiesSpawned;
    },
    
    // Spawn a single enemy at a specific position
    spawnEnemy(k, enemyType, gridX, gridY, options = {}) {
        // Check if position is valid
        if (!GridUtils.isValidGridPosition(gridX, gridY)) {
            console.warn(`⚠️ Invalid spawn position: (${gridX}, ${gridY})`);
            return null;
        }
        
        // Check if position is blocked by walls
        const walls = k.get("wall");
        const blocked = walls.some(wall => wall.gridX === gridX && wall.gridY === gridY);
        if (blocked) {
            console.warn(`⚠️ Spawn position blocked by wall: (${gridX}, ${gridY})`);
            return null;
        }
        
        // Check if there's already an enemy at this position
        const existingEnemies = k.get("enemy");
        const occupied = existingEnemies.some(enemy => 
            enemy.gridX === gridX && enemy.gridY === gridY && !enemy.isDead
        );
        if (occupied) {
            console.warn(`⚠️ Spawn position occupied by another enemy: (${gridX}, ${gridY})`);
            return null;
        }
        
        // Create the enemy
        const enemy = EnemyEntity.create(k, enemyType, gridX, gridY, options);
        
        if (enemy) {
            console.log(`👹 Spawned ${enemyType.name} at (${gridX}, ${gridY})`);
            
            // Add spawn effect
            this.createSpawnEffect(k, gridX, gridY);
        }
        
        return enemy;
    },
    
    // Create visual spawn effect
    createSpawnEffect(k, gridX, gridY) {
        const pixelPos = GridUtils.createGridPos(gridX, gridY, true);
        
        // Spawn particles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 20;
            const particleX = pixelPos.x + Math.cos(angle) * distance;
            const particleY = pixelPos.y + Math.sin(angle) * distance;
            
            const particle = k.add([
                k.rect(4, 4),
                k.color(150, 100, 200), // Purple spawn effect
                k.pos(particleX, particleY),
                k.anchor("center"),
                k.z(15),
                k.opacity(0.8)
            ]);
            
            // Animate particles towards center
            k.tween(
                particle.pos,
                k.vec2(pixelPos.x, pixelPos.y),
                0.5,
                (p) => particle.pos = p,
                k.easings.easeInQuad
            ).then(() => {
                if (particle.exists()) {
                    k.destroy(particle);
                }
            });
            
            // Fade out particles
            k.tween(
                particle.opacity,
                0,
                0.5,
                (o) => particle.opacity = o
            );
        }
    },
    
    // Setup dynamic spawning for an area
    setupDynamicSpawning(k, spawnConfigName, spawnPoints) {
        const config = SPAWN_CONFIGS[spawnConfigName];
        if (!config) {
            console.warn(`⚠️ Unknown spawn config: ${spawnConfigName}`);
            return;
        }
        
        console.log(`🎯 Setting up dynamic spawning: ${spawnConfigName}`);
        
        // Initialize spawn timer
        this.spawnTimers.set(spawnConfigName, {
            config: config,
            spawnPoints: spawnPoints,
            lastSpawnTime: 0,
            currentEnemyCount: 0
        });
    },
    
    // Update dynamic spawning
    updateDynamicSpawning(k, deltaTime) {
        const currentTime = k.time();
        
        this.spawnTimers.forEach((timer, configName) => {
            const config = timer.config;
            
            // Count current living enemies for this spawn group
            const livingEnemies = k.get("enemy").filter(enemy => 
                !enemy.isDead && 
                config.enemyTypes.includes(enemy.enemyId)
            ).length;
            
            timer.currentEnemyCount = livingEnemies;
            
            // Check if we should spawn more enemies
            if (livingEnemies < config.maxEnemies && 
                currentTime - timer.lastSpawnTime > config.spawnDelay / 1000) {
                
                if (Math.random() < config.spawnChance) {
                    this.attemptDynamicSpawn(k, timer);
                    timer.lastSpawnTime = currentTime;
                }
            }
        });
    },
    
    // Attempt to spawn an enemy dynamically
    attemptDynamicSpawn(k, timer) {
        const config = timer.config;
        const spawnPoints = timer.spawnPoints;
        
        if (!spawnPoints || spawnPoints.length === 0) return;
        
        // Pick a random spawn point
        const spawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
        
        // Get random enemy type from config
        const enemyType = EnemyUtils.getRandomEnemyType(config);
        if (!enemyType) return;
        
        // Check if spawn point is clear (not too close to player)
        const player = window.currentPlayer;
        if (player) {
            const distanceToPlayer = GridUtils.manhattanDistance(
                spawnPoint.x, spawnPoint.y, player.gridX, player.gridY
            );
            
            // Don't spawn too close to player
            if (distanceToPlayer < 8) return;
        }
        
        // Attempt to spawn
        const enemy = this.spawnEnemy(k, enemyType, spawnPoint.x, spawnPoint.y);
        if (enemy) {
            console.log(`🎯 Dynamic spawn: ${enemyType.name} at (${spawnPoint.x}, ${spawnPoint.y})`);
        }
    },
    
    // Get spawn points from level data
    getSpawnPointsFromLevel(levelData, enemySymbols = ['g', 'o', 'r', 's']) {
        const spawnPoints = [];
        
        if (!levelData || !levelData.layout) return spawnPoints;
        
        levelData.layout.forEach((row, y) => {
            for (let x = 0; x < row.length; x++) {
                const symbol = row[x];
                if (enemySymbols.includes(symbol)) {
                    spawnPoints.push({ x, y, symbol });
                }
            }
        });
        
        return spawnPoints;
    },
    
    // Clear all enemies
    clearAllEnemies(k) {
        const enemies = k.get("enemy");
        enemies.forEach(enemy => {
            if (enemy.exists()) {
                k.destroy(enemy);
            }
        });
        
        this.spawnedEnemies.clear();
        console.log('💀 All enemies cleared');
    },
    
    // Get enemy count statistics
    getEnemyStats(k) {
        const enemies = k.get("enemy");
        const living = enemies.filter(e => !e.isDead);
        const dead = enemies.filter(e => e.isDead);
        
        const byType = {};
        living.forEach(enemy => {
            byType[enemy.enemyId] = (byType[enemy.enemyId] || 0) + 1;
        });
        
        return {
            total: enemies.length,
            living: living.length,
            dead: dead.length,
            byType: byType
        };
    },
    
    // Debug: Show spawn points
    showSpawnPoints(k, spawnPoints, duration = 5.0) {
        spawnPoints.forEach(point => {
            const pixelPos = GridUtils.createGridPos(point.x, point.y, true);
            
            k.add([
                k.rect(8, 8),
                k.color(255, 0, 255), // Magenta for spawn points
                k.pos(pixelPos.x, pixelPos.y),
                k.anchor("center"),
                k.z(20),
                k.opacity(0.7),
                k.lifespan(duration),
                "debug-spawn"
            ]);
            
            // Add symbol text
            k.add([
                k.text(point.symbol || '?'),
                k.pos(pixelPos.x, pixelPos.y - 15),
                k.anchor("center"),
                k.scale(0.25),
                k.color(255, 255, 255),
                k.z(21),
                k.lifespan(duration),
                "debug-spawn"
            ]);
        });
        
        console.log(`🎯 Showing ${spawnPoints.length} spawn points for ${duration} seconds`);
    },
    
    // Remove debug spawn points
    hideSpawnPoints(k) {
        k.destroyAll("debug-spawn");
    }
};

// Make SpawningSystem globally available
window.SpawningSystem = SpawningSystem;

console.log('🎯 Spawning System loaded successfully');
