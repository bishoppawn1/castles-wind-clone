// Enemy data definitions for Castles of the Wind Clone
console.log('📜 Loading enemies.js...');

// Enemy types with stats, AI behavior, and animations
const ENEMY_TYPES = {
    goblin: {
        id: 'goblin',
        name: 'Goblin',
        symbol: 'g',
        
        // Visual properties
        sprite: {
            size: 20,
            color: [100, 180, 100], // Green
            shape: 'rect'
        },
        
        // Stats
        stats: {
            health: 25,
            maxHealth: 25,
            attack: 8,
            defense: 2,
            speed: 1.2,
            experience: 15,
            gold: 5
        },
        
        // AI behavior
        ai: {
            type: 'aggressive',
            detectionRange: 5,
            attackRange: 1,
            moveSpeed: 0.8,
            patrolRadius: 3,
            chaseSpeed: 1.2
        },
        
        // Animation properties
        animations: {
            idle: { duration: 1.0, color: [100, 180, 100] },
            walk: { duration: 0.5, color: [120, 200, 120] },
            attack: { duration: 0.3, color: [180, 100, 100] },
            hurt: { duration: 0.4, color: [255, 100, 100] },
            death: { duration: 0.8, color: [80, 80, 80] }
        },
        
        // Loot table
        loot: [
            { item: 'gold', chance: 0.8, amount: [3, 8] },
            { item: 'potion', chance: 0.3, amount: 1 },
            { item: 'weapon', chance: 0.1, amount: 1 }
        ]
    },
    
    orc: {
        id: 'orc',
        name: 'Orc',
        symbol: 'o',
        
        // Visual properties
        sprite: {
            size: 24,
            color: [150, 100, 100], // Dark red
            shape: 'rect'
        },
        
        // Stats
        stats: {
            health: 45,
            maxHealth: 45,
            attack: 12,
            defense: 4,
            speed: 0.9,
            experience: 25,
            gold: 10
        },
        
        // AI behavior
        ai: {
            type: 'aggressive',
            detectionRange: 6,
            attackRange: 1,
            moveSpeed: 0.8,
            patrolRadius: 4,
            chaseSpeed: 1.0
        },
        
        // Animation properties
        animations: {
            idle: { duration: 1.2, color: [150, 100, 100] },
            walk: { duration: 0.6, color: [170, 120, 120] },
            attack: { duration: 0.4, color: [200, 80, 80] },
            hurt: { duration: 0.5, color: [255, 120, 120] },
            death: { duration: 1.0, color: [100, 60, 60] }
        },
        
        // Loot table
        loot: [
            { item: 'gold', chance: 0.9, amount: [8, 15] },
            { item: 'armor', chance: 0.2, amount: 1 },
            { item: 'weapon', chance: 0.15, amount: 1 }
        ]
    },
    
    rat: {
        id: 'rat',
        name: 'Giant Rat',
        symbol: 'r',
        
        // Visual properties
        sprite: {
            size: 16,
            color: [120, 100, 80], // Brown
            shape: 'rect'
        },
        
        // Stats
        stats: {
            health: 15,
            maxHealth: 15,
            attack: 5,
            defense: 1,
            speed: 1.5,
            experience: 8,
            gold: 2
        },
        
        // AI behavior
        ai: {
            type: 'skittish',
            detectionRange: 4,
            attackRange: 1,
            moveSpeed: 1.0,
            patrolRadius: 2,
            chaseSpeed: 1.5,
            fleeThreshold: 0.3 // Flee when health < 30%
        },
        
        // Animation properties
        animations: {
            idle: { duration: 0.8, color: [120, 100, 80] },
            walk: { duration: 0.3, color: [140, 120, 100] },
            attack: { duration: 0.2, color: [160, 80, 60] },
            hurt: { duration: 0.3, color: [200, 100, 100] },
            death: { duration: 0.6, color: [80, 60, 40] }
        },
        
        // Loot table
        loot: [
            { item: 'gold', chance: 0.6, amount: [1, 3] },
            { item: 'potion', chance: 0.1, amount: 1 }
        ]
    },
    
    skeleton: {
        id: 'skeleton',
        name: 'Skeleton Warrior',
        symbol: 's',
        
        // Visual properties
        sprite: {
            size: 22,
            color: [200, 200, 180], // Bone white
            shape: 'rect'
        },
        
        // Stats
        stats: {
            health: 35,
            maxHealth: 35,
            attack: 10,
            defense: 3,
            speed: 1.0,
            experience: 20,
            gold: 8
        },
        
        // AI behavior
        ai: {
            type: 'guardian',
            detectionRange: 7,
            attackRange: 1,
            moveSpeed: 0.7,
            patrolRadius: 5,
            chaseSpeed: 0.9,
            returnToStart: true // Returns to spawn point when player leaves
        },
        
        // Animation properties
        animations: {
            idle: { duration: 1.5, color: [200, 200, 180] },
            walk: { duration: 0.7, color: [220, 220, 200] },
            attack: { duration: 0.35, color: [255, 180, 180] },
            hurt: { duration: 0.4, color: [255, 150, 150] },
            death: { duration: 1.2, color: [150, 150, 130] }
        },
        
        // Loot table
        loot: [
            { item: 'gold', chance: 0.85, amount: [5, 12] },
            { item: 'weapon', chance: 0.2, amount: 1 },
            { item: 'armor', chance: 0.15, amount: 1 },
            { item: 'key', chance: 0.05, amount: 1 }
        ]
    }
};

// AI behavior types
const AI_BEHAVIORS = {
    aggressive: {
        description: 'Actively seeks and attacks the player',
        chasePlayer: true,
        fleeWhenLowHealth: false,
        patrolWhenIdle: true,
        returnToStart: false
    },
    
    skittish: {
        description: 'Attacks but flees when health is low',
        chasePlayer: true,
        fleeWhenLowHealth: true,
        patrolWhenIdle: true,
        returnToStart: false
    },
    
    guardian: {
        description: 'Guards an area, returns to start when player leaves',
        chasePlayer: true,
        fleeWhenLowHealth: false,
        patrolWhenIdle: true,
        returnToStart: true
    },
    
    passive: {
        description: 'Does not attack unless attacked first',
        chasePlayer: false,
        fleeWhenLowHealth: true,
        patrolWhenIdle: true,
        returnToStart: false
    }
};

// Enemy spawn configurations for different areas
const SPAWN_CONFIGS = {
    tutorial: {
        maxEnemies: 3,
        spawnDelay: 5000, // 5 seconds
        enemyTypes: ['rat', 'goblin'],
        spawnChance: 0.3
    },
    
    castle_entrance: {
        maxEnemies: 5,
        spawnDelay: 8000, // 8 seconds
        enemyTypes: ['goblin', 'rat', 'skeleton'],
        spawnChance: 0.4
    },
    
    dungeon: {
        maxEnemies: 8,
        spawnDelay: 6000, // 6 seconds
        enemyTypes: ['orc', 'skeleton', 'goblin'],
        spawnChance: 0.6
    }
};

// Utility functions
const EnemyUtils = {
    // Get enemy type by symbol
    getEnemyBySymbol(symbol) {
        return Object.values(ENEMY_TYPES).find(enemy => enemy.symbol === symbol);
    },
    
    // Get random enemy from spawn config
    getRandomEnemyType(spawnConfigName) {
        const config = SPAWN_CONFIGS[spawnConfigName];
        if (!config || !config.enemyTypes.length) return null;
        
        const randomIndex = Math.floor(Math.random() * config.enemyTypes.length);
        const enemyId = config.enemyTypes[randomIndex];
        return ENEMY_TYPES[enemyId];
    },
    
    // Calculate loot drops
    calculateLoot(enemyType) {
        const loot = [];
        
        enemyType.loot.forEach(lootItem => {
            if (Math.random() < lootItem.chance) {
                let amount = lootItem.amount;
                if (Array.isArray(amount)) {
                    amount = Math.floor(Math.random() * (amount[1] - amount[0] + 1)) + amount[0];
                }
                
                loot.push({
                    item: lootItem.item,
                    amount: amount
                });
            }
        });
        
        return loot;
    },
    
    // Get AI behavior
    getAIBehavior(behaviorType) {
        return AI_BEHAVIORS[behaviorType] || AI_BEHAVIORS.aggressive;
    }
};

// Make variables globally available
if (typeof window !== 'undefined') {
    window.ENEMY_TYPES = ENEMY_TYPES;
    window.AI_BEHAVIORS = AI_BEHAVIORS;
    window.SPAWN_CONFIGS = SPAWN_CONFIGS;
    window.EnemyUtils = EnemyUtils;
    
    console.log('✅ Enemy data loaded successfully');
    console.log('🐉 Available enemy types:', Object.keys(ENEMY_TYPES));
    console.log('🧠 Available AI behaviors:', Object.keys(AI_BEHAVIORS));
} else {
    console.log('⚠️ Running in non-browser environment');
}
