// Objectives System for Castles of the Wind Clone
// Handles dynamic objective tracking, completion conditions, and random objectives

const ObjectivesSystem = {
    k: null,
    currentObjective: null,
    completedObjectives: [],
    objectivePool: [],
    objectiveDisplay: null,
    completionDisplay: null,
    nextObjectiveTimer: null,

    init(kaboomContext) {
        this.k = kaboomContext;
        console.log('ObjectivesSystem initialized');
        this.setupObjectivePool();
        this.setupEventListeners();
        this.startObjectiveSystem();
    },

    // Define pool of possible objectives
    setupObjectivePool() {
        this.objectivePool = [
            // Combat objectives
            {
                id: 'kill_goblins',
                title: 'Goblin Slayer',
                description: 'Defeat goblins',
                type: 'combat',
                target: 2,
                trackEvent: 'enemy_defeated',
                trackCondition: (data) => data && data.enemyType === 'goblin'
            },
            {
                id: 'kill_orcs',
                title: 'Orc Hunter',
                description: 'Defeat orcs',
                type: 'combat',
                target: 3,
                trackEvent: 'enemy_defeated',
                trackCondition: (data) => data && data.enemyType === 'orc'
            },
            {
                id: 'kill_skeletons',
                title: 'Bone Crusher',
                description: 'Defeat skeletons',
                type: 'combat',
                target: 2,
                trackEvent: 'enemy_defeated',
                trackCondition: (data) => data && data.enemyType === 'skeleton'
            },
            {
                id: 'kill_any_enemies',
                title: 'Monster Hunter',
                description: 'Defeat any enemies',
                type: 'combat',
                target: 5,
                trackEvent: 'enemy_defeated',
                trackCondition: () => true
            },
            // Collection objectives
            {
                id: 'collect_gold',
                title: 'Gold Collector',
                description: 'gold',
                type: 'gold_tracker',
                target: 50,
                trackEvent: 'gold_collected',
                trackCondition: () => true
            },
            {
                id: 'collect_potions',
                title: 'Potion Gatherer',
                description: 'Collect health potions',
                type: 'collection',
                target: 3,
                trackEvent: 'item_collected',
                trackCondition: (data) => data && data.itemType && data.itemType.includes('potion')
            },
            {
                id: 'survive_traps',
                title: 'Trap Survivor',
                description: 'Survive trap encounters',
                type: 'survival',
                target: 1,
                trackEvent: 'trap_survived',
                trackCondition: () => true
            },
            {
                id: 'collect_weapons',
                title: 'Weapon Collector',
                description: 'Collect weapons',
                type: 'collection',
                target: 2,
                trackEvent: 'item_collected',
                trackCondition: (data) => data && data.category === 'weapon'
            },
            // Exploration objectives
            {
                id: 'open_doors',
                title: 'Door Opener',
                description: 'Open doors',
                type: 'interaction',
                target: 3,
                trackEvent: 'door_opened',
                trackCondition: () => true
            },
            {
                id: 'open_chests',
                title: 'Treasure Hunter',
                description: 'Open treasure chests',
                type: 'interaction',
                target: 2,
                trackEvent: 'chest_opened',
                trackCondition: () => true
            },
            {
                id: 'walk_distance',
                title: 'Explorer',
                description: 'Walk around the dungeon',
                type: 'exploration',
                target: 100,
                trackEvent: 'player_moved',
                trackCondition: () => true
            }
        ];
    },

    // Set up event listeners for objective tracking
    setupEventListeners() {
        // Listen for all possible objective events
        this.k.on('enemy_defeated', (data) => {
            console.log('🎯 enemy_defeated event received:', data);
            this.trackObjectiveProgress('enemy_defeated', data);
        });

        this.k.on('item_collected', (data) => {
            console.log('📦 item_collected event received:', data);
            this.trackObjectiveProgress('item_collected', data);
        });

        this.k.on('gold_collected', (data) => {
            console.log('💰 Gold collected event received:', data);
            this.trackObjectiveProgress('gold_collected', data);
        });

        this.k.on('door_opened', (data) => {
            this.trackObjectiveProgress('door_opened', data);
        });

        this.k.on('chest_opened', (data) => {
            console.log('🎯 DEBUG: ObjectivesSystem received chest_opened event:', data);
            this.trackObjectiveProgress('chest_opened', data);
        });

        this.k.on('player_moved', (data) => {
            this.trackObjectiveProgress('player_moved', data);
        });
    },

    // Assign a random objective from the pool
    assignRandomObjective() {
        if (this.currentObjective) {
            console.log('Objective already active, skipping assignment');
            return;
        }

        // Filter out recently completed objectives to avoid repetition
        const recentlyCompleted = this.completedObjectives.slice(-3).map(obj => obj.id);
        const availableObjectives = this.objectivePool.filter(obj => 
            !recentlyCompleted.includes(obj.id)
        );

        if (availableObjectives.length === 0) {
            console.log('No available objectives, using full pool');
            availableObjectives.push(...this.objectivePool);
        }

        // Pick random objective
        const randomIndex = Math.floor(Math.random() * availableObjectives.length);
        const selectedObjective = availableObjectives[randomIndex];

        // Create active objective instance
        this.currentObjective = {
            ...selectedObjective,
            current: selectedObjective.type === 'gold_tracker' ? this.getCurrentGoldAmount() : 0,
            completed: false,
            startTime: Date.now()
        };

        console.log(`🎯 New objective assigned: ${this.currentObjective.title}`);
        this.displayObjective();
    },

    // Track progress for current objective
    trackObjectiveProgress(eventType, data) {
        console.log(`🎯 trackObjectiveProgress called: eventType=${eventType}`, data);
        
        if (!this.currentObjective) {
            console.log('❌ No current objective set');
            return;
        }
        
        if (this.currentObjective.completed) {
            console.log('✅ Current objective already completed');
            return;
        }
        
        console.log(`🎯 Current objective:`, this.currentObjective);

        // Special handling for gold tracker objectives
        if (this.currentObjective.type === 'gold_tracker') {
            const player = this.k.get("player")[0];
            if (player && player.gold !== undefined) {
                this.currentObjective.current = player.gold;
                console.log(`💰 Gold tracker updated: ${this.currentObjective.current}/${this.currentObjective.target}`);
                
                // Update display
                this.updateObjectiveDisplay();
                
                // Check if completed
                if (this.currentObjective.current >= this.currentObjective.target) {
                    this.completeObjective();
                }
            }
            return;
        }

        // Check if this event matches current objective
        console.log(`🔍 Checking if event '${eventType}' matches objective trackEvent '${this.currentObjective.trackEvent}'`);
        
        if (this.currentObjective.trackEvent === eventType) {
            console.log('✅ Event matches! Checking condition...');
            
            // Check if condition is met
            const conditionMet = this.currentObjective.trackCondition(data);
            console.log(`🔍 Condition result: ${conditionMet}`, data);
            
            if (conditionMet) {
                this.currentObjective.current += 1;
                console.log(`📈 Objective progress: ${this.currentObjective.current}/${this.currentObjective.target}`);
                
                // Update display
                this.updateObjectiveDisplay();
                
                // Check if completed
                if (this.currentObjective.current >= this.currentObjective.target) {
                    this.completeObjective();
                }
            } else {
                console.log('❌ Condition not met for this event');
            }
        } else {
            console.log(`❌ Event '${eventType}' does not match objective trackEvent '${this.currentObjective.trackEvent}'`);
        }
    },

    // Complete current objective
    completeObjective() {
        if (!this.currentObjective) return;
        
        console.log(`✅ Objective completed: ${this.currentObjective.title}`);
        
        // Mark as completed
        this.currentObjective.completed = true;
        
        // Give rewards to player
        this.giveObjectiveRewards();
        
        // Add to completed objectives history
        this.completedObjectives.push({...this.currentObjective});
        
        // Show completion notification
        this.showObjectiveComplete();
        
        // Clear current objective
        this.currentObjective = null;
        
        // Remove objective display from screen
        this.k.destroyAll("objective_display");
        
        // Schedule next objective
        this.scheduleNextObjective();
    },

    // Give random rewards for completing objectives
    giveObjectiveRewards() {
        const player = this.k.get("player")[0];
        if (!player) return;

        const rewards = [];
        
        // Calculate reward multiplier based on objective type and difficulty
        const rewardMultiplier = this.getRewardMultiplier();
        
        // Base experience (scales with objective difficulty)
        const baseExp = Math.floor(15 * rewardMultiplier + Math.random() * 20 * rewardMultiplier);
        if (player.gainExperience) {
            player.gainExperience(baseExp);
            rewards.push(`${baseExp} XP`);
        }
        
        // Base gold (scales with objective difficulty)
        const baseGold = Math.floor(8 * rewardMultiplier + Math.random() * 15 * rewardMultiplier);
        if (window.inventory) {
            window.inventory.addGold(baseGold);
            rewards.push(`${baseGold} gold`);
        }
        
        // Type-specific rewards
        this.giveTypeSpecificRewards(rewards, rewardMultiplier);
        
        // Bonus rewards based on difficulty
        this.giveBonusRewards(rewards, rewardMultiplier);
        
        // Show reward message
        if (rewards.length > 0 && window.MessageSystem) {
            window.MessageSystem.addMessage(`🎁 Objective Rewards: ${rewards.join(', ')}`, 'success');
        }
        
        console.log(`🎁 Objective rewards given: ${rewards.join(', ')} (multiplier: ${rewardMultiplier})`);
    },

    // Calculate reward multiplier based on objective type and target
    getRewardMultiplier() {
        if (!this.currentObjective) return 1.0;
        
        const obj = this.currentObjective;
        let multiplier = 1.0;
        
        // Base multiplier by objective type
        switch (obj.type) {
            case 'combat':
                multiplier = 1.5; // Combat is dangerous, better rewards
                break;
            case 'collection':
                multiplier = 1.2; // Collection takes effort
                break;
            case 'interaction':
                multiplier = 1.0; // Standard rewards
                break;
            case 'exploration':
                multiplier = 0.8; // Exploration is easier
                break;
            case 'gold_tracker':
                multiplier = 0.7; // Gold tracking is passive
                break;
            case 'survival':
                multiplier = 2.0; // Survival is very challenging
                break;
            default:
                multiplier = 1.0;
        }
        
        // Scale by target difficulty
        if (obj.target >= 5) {
            multiplier *= 1.3; // High target objectives
        } else if (obj.target >= 3) {
            multiplier *= 1.1; // Medium target objectives
        }
        
        return Math.round(multiplier * 10) / 10; // Round to 1 decimal
    },

    // Give rewards specific to objective type
    giveTypeSpecificRewards(rewards, multiplier) {
        if (!this.currentObjective) return;
        
        const obj = this.currentObjective;
        
        switch (obj.type) {
            case 'combat':
                // Combat objectives give weapons/armor
                if (Math.random() < 0.4 * multiplier) {
                    const combatItems = ['iron_sword', 'leather_armor', 'iron_key'];
                    const randomItem = combatItems[Math.floor(Math.random() * combatItems.length)];
                    this.giveItemReward(randomItem, rewards);
                }
                // Always give health potions for combat
                if (Math.random() < 0.7) {
                    this.giveItemReward('health_potion', rewards);
                }
                break;
                
            case 'collection':
                // Collection objectives give more items
                if (Math.random() < 0.6 * multiplier) {
                    const collectItems = ['health_potion', 'mana_potion', 'bread'];
                    const randomItem = collectItems[Math.floor(Math.random() * collectItems.length)];
                    this.giveItemReward(randomItem, rewards);
                }
                break;
                
            case 'interaction':
                // Interaction objectives give keys and tools
                if (Math.random() < 0.5 * multiplier) {
                    const interactItems = ['iron_key', 'scroll_heal', 'mana_potion'];
                    const randomItem = interactItems[Math.floor(Math.random() * interactItems.length)];
                    this.giveItemReward(randomItem, rewards);
                }
                break;
                
            case 'exploration':
                // Exploration gives maps and utility items
                if (Math.random() < 0.3 * multiplier) {
                    const exploreItems = ['bread', 'health_potion'];
                    const randomItem = exploreItems[Math.floor(Math.random() * exploreItems.length)];
                    this.giveItemReward(randomItem, rewards);
                }
                break;
                
            case 'gold_tracker':
                // Gold objectives give more gold
                const bonusGold = Math.floor(15 * multiplier + Math.random() * 25 * multiplier);
                if (window.inventory) {
                    window.inventory.addGold(bonusGold);
                    rewards.push(`${bonusGold} bonus gold`);
                }
                break;
                
            case 'survival':
                // Survival gives rare items
                if (Math.random() < 0.8 * multiplier) {
                    const survivalItems = ['scroll_fireball', 'gem', 'health_potion'];
                    const randomItem = survivalItems[Math.floor(Math.random() * survivalItems.length)];
                    this.giveItemReward(randomItem, rewards);
                }
                break;
        }
    },

    // Give bonus rewards for difficult objectives
    giveBonusRewards(rewards, multiplier) {
        // Higher chance of rare items for difficult objectives
        const rareChance = Math.min(0.15 * multiplier, 0.4);
        if (Math.random() < rareChance) {
            const rareItems = ['scroll_fireball', 'scroll_heal', 'gem'];
            const randomRare = rareItems[Math.floor(Math.random() * rareItems.length)];
            this.giveItemReward(randomRare, rewards, true);
        }
        
        // Extra gold for high multiplier objectives
        if (multiplier >= 1.5 && Math.random() < 0.4) {
            const extraGold = Math.floor(20 * multiplier + Math.random() * 30 * multiplier);
            if (window.inventory) {
                window.inventory.addGold(extraGold);
                rewards.push(`${extraGold} extra gold`);
            }
        }
    },

    // Helper to give item rewards
    giveItemReward(itemId, rewards, isRare = false) {
        if (window.ItemData && window.inventory) {
            const itemData = window.ItemData.getItemById(itemId);
            if (itemData) {
                const result = window.inventory.addItem(itemData);
                if (result.success) {
                    const displayName = isRare ? `${itemData.name} (rare!)` : itemData.name;
                    rewards.push(displayName);
                }
            }
        }
    },

    // Schedule next objective after a delay
    scheduleNextObjective() {
        // Wait 5-15 seconds before assigning next objective
        const delay = 5 + Math.random() * 10;
        console.log(`⏰ Next objective in ${delay.toFixed(1)} seconds`);
        
        this.nextObjectiveTimer = this.k.wait(delay, () => {
            this.assignRandomObjective();
        });
    },

    // Show objective completion notification
    showObjectiveComplete() {
        if (!this.currentObjective) return;
        
        // Remove existing completion display
        this.k.destroyAll("objective_complete");
        
        // Create completion notification background
        this.completionDisplay = this.k.add([
            this.k.rect(400, 80),
            this.k.color(0, 120, 0),
            this.k.pos(this.k.width() / 2, 120),
            this.k.anchor("center"),
            this.k.z(200),
            this.k.outline(2, this.k.rgb(0, 200, 0)),
            "objective_complete"
        ]);

        // Add completion text
        this.k.add([
            this.k.text(`OBJECTIVE COMPLETE!`),
            this.k.color(255, 255, 255),
            this.k.pos(this.k.width() / 2, 105),
            this.k.anchor("center"),
            this.k.scale(0.8),
            this.k.z(201),
            "objective_complete"
        ]);

        this.k.add([
            this.k.text(this.currentObjective.title),
            this.k.color(200, 255, 200),
            this.k.pos(this.k.width() / 2, 125),
            this.k.anchor("center"),
            this.k.scale(0.6),
            this.k.z(201),
            "objective_complete"
        ]);

        this.k.add([
            this.k.text(`${this.currentObjective.current}/${this.currentObjective.target} ${this.currentObjective.description}`),
            this.k.color(180, 255, 180),
            this.k.pos(this.k.width() / 2, 140),
            this.k.anchor("center"),
            this.k.scale(0.5),
            this.k.z(201),
            "objective_complete"
        ]);

        // Auto-hide after 4 seconds
        this.k.wait(4, () => {
            this.k.destroyAll("objective_complete");
        });
    },

    // Check if level is complete using Kaplay's event system
    checkLevelCompletion() {
        const totalObjectives = this.currentObjectives.length;
        const completedCount = this.completedObjectives.length;
        
        if (completedCount >= totalObjectives) {
            // Emit level completion event using Kaplay's event system
            if (this.k && typeof this.k.trigger === 'function') {
                this.k.trigger('level_complete', {
                    level: typeof ProgressionSystem !== 'undefined' ? ProgressionSystem.getCurrentLevel() : 1,
                    objectives: this.completedObjectives,
                    completionTime: Date.now()
                });
            } else if (typeof kaplay !== 'undefined' && kaplay.trigger) {
                kaplay.trigger('level_complete', {
                    level: typeof ProgressionSystem !== 'undefined' ? ProgressionSystem.getCurrentLevel() : 1,
                    objectives: this.completedObjectives,
                    completionTime: Date.now()
                });
            }
            
            this.onLevelComplete();
        }
    },

    // Handle level completion
    onLevelComplete() {
        console.log(' Level completed! All objectives achieved.');
        
        // Show level complete notification
        this.showLevelComplete();
        
        // Enable level progression
        this.enableLevelProgression();
    },

    // Show level completion notification
    showLevelComplete() {
        // Create level complete overlay
        const overlay = this.k.add([
            this.k.rect(400, 200),
            this.k.color(0, 100, 200),
            this.k.pos(this.k.width() / 2, this.k.height() / 2),
            this.k.anchor("center"),
            this.k.opacity(0.95),
            this.k.z(200),
            "level_complete"
        ]);

        // Add title
        this.k.add([
            this.k.text("LEVEL COMPLETE!", { size: 24 }),
            this.k.color(255, 255, 255),
            this.k.pos(this.k.width() / 2, this.k.height() / 2 - 50),
            this.k.anchor("center"),
            this.k.z(201),
            "level_complete"
        ]);

        // Add objectives summary
        this.k.add([
            this.k.text(`Objectives: ${this.completedObjectives.length}/${this.currentObjectives.length}`, { size: 16 }),
            this.k.color(255, 255, 255),
            this.k.pos(this.k.width() / 2, this.k.height() / 2 - 10),
            this.k.anchor("center"),
            this.k.z(201),
            "level_complete"
        ]);

        // Add continue instruction
        this.k.add([
            this.k.text("Find stairs to continue to next level", { size: 14 }),
            this.k.color(200, 200, 200),
            this.k.pos(this.k.width() / 2, this.k.height() / 2 + 30),
            this.k.anchor("center"),
            this.k.z(201),
            "level_complete"
        ]);

        // Auto-hide after 5 seconds
        this.k.wait(5, () => {
            this.k.destroyAll("level_complete");
        });
    },

    // Enable level progression (unlock stairs, etc.)
    enableLevelProgression() {
        // Mark stairs as accessible
        const stairs = this.k.get("stairs_down", "stairs_up");
        stairs.forEach(stair => {
            stair.accessible = true;
            // Add visual indicator that stairs are now accessible
            this.k.add([
                this.k.circle(20),
                this.k.color(0, 255, 0),
                this.k.pos(stair.pos),
                this.k.anchor("center"),
                this.k.opacity(0.3),
                this.k.z(5),
                "stair_indicator"
            ]);
        });

        // Update stair prompts to show they're accessible
        this.k.destroyAll("stair_prompt");
        stairs.forEach(stair => {
            this.k.add([
                this.k.text("Press E to " + (stair.direction === 'down' ? 'go down' : 'go up'), { size: 10 }),
                this.k.color(0, 255, 0),
                this.k.pos(stair.pos.x, stair.pos.y + 20),
                this.k.anchor("center"),
                this.k.z(15),
                "stair_prompt"
            ]);
        });

        console.log(' Stairs unlocked for level progression');
    },

    // Start the objective system with first random objective
    startObjectiveSystem() {
        console.log('🎯 Starting objective system...');
        // Start first objective after a short delay
        this.k.wait(2, () => {
            console.log('🎯 Assigning first objective...');
            this.assignRandomObjective();
        });
    },

    // Display current objective at top of screen
    displayObjective() {
        if (!this.currentObjective) {
            console.log('❌ No current objective to display');
            return;
        }
        
        console.log('🎯 Displaying objective:', this.currentObjective);
        
        // Remove existing objective display
        this.k.destroyAll("objective_display");

        // Create objective background bar
        this.objectiveDisplay = this.k.add([
            this.k.rect(this.k.width(), 60),
            this.k.color(40, 40, 80),
            this.k.pos(0, 0),
            this.k.z(90),
            this.k.outline(2, this.k.rgb(80, 80, 160)),
            this.k.fixed(),
            "objective_display"
        ]);

        // Add objective title (centered)
        this.k.add([
            this.k.text(this.currentObjective.title),
            this.k.color(255, 255, 255),
            this.k.pos(this.k.width() / 2, 15),
            this.k.anchor("center"),
            this.k.scale(0.7),
            this.k.z(91),
            this.k.fixed(),
            "objective_display"
        ]);

        // Add progress (centered)
        const progressText = `${this.currentObjective.current}/${this.currentObjective.target} ${this.currentObjective.description}`;
        this.k.add([
            this.k.text(progressText),
            this.k.color(200, 200, 255),
            this.k.pos(this.k.width() / 2, 35),
            this.k.anchor("center"),
            this.k.scale(0.6),
            this.k.z(91),
            this.k.fixed(),
            "objective_display"
        ]);

        // Progress bar - REMOVED
        // const progressPercent = this.currentObjective.current / this.currentObjective.target;
        // const barWidth = Math.min(200, progressPercent * 200);
        // 
        // // Progress bar background (centered)
        // const progressBarX = boxX + (boxWidth - 200) / 2;
        // this.k.add([
        //     this.k.rect(200, 8),
        //     this.k.color(60, 60, 60),
        //     this.k.pos(progressBarX, 26),
        //     this.k.z(91),
        //     this.k.fixed(),
        //     "objective_display"
        // ]);
        // 
        // // Progress bar fill (centered)
        // if (barWidth > 0) {
        //     this.k.add([
        //         this.k.rect(barWidth, 8),
        //         this.k.color(100, 200, 100),
        //         this.k.pos(progressBarX, 26),
        //         this.k.z(92),
        //         this.k.fixed(),
        //         "objective_display"
        //     ]);
        // }
    },

    // Update objective display
    updateObjectiveDisplay() {
        // For gold tracker objectives, update current amount from player
        if (this.currentObjective && this.currentObjective.type === 'gold_tracker') {
            const player = this.k.get("player")[0];
            if (player && player.gold !== undefined) {
                this.currentObjective.current = player.gold;
            }
        }
        
        // Refresh the display
        this.displayObjective();
    },

    // Get current objective
    getCurrentObjective() {
        return this.currentObjective;
    },

    // Get completed objectives count
    getCompletedCount() {
        return this.completedObjectives.length;
    },

    // Helper method to get current player gold amount
    getCurrentGoldAmount() {
        const player = this.k.get("player")[0];
        return (player && player.gold !== undefined) ? player.gold : 0;
    },

    // Force complete current objective (for testing)
    forceCompleteObjective() {
        if (this.currentObjective && !this.currentObjective.completed) {
            this.currentObjective.current = this.currentObjective.target;
            this.completeObjective();
        }
    },

    // Cancel current objective timer
    cancelObjectiveTimer() {
        if (this.nextObjectiveTimer) {
            this.nextObjectiveTimer.cancel();
            this.nextObjectiveTimer = null;
        }
    },

    // Debug function to test objectives
    debugTriggerEvent(eventType, data = {}) {
        console.log(`🧪 Debug: Triggering ${eventType} event with data:`, data);
        if (this.k && typeof this.k.trigger === 'function') {
            this.k.trigger(eventType, data);
        } else if (typeof kaplay !== 'undefined' && kaplay.trigger) {
            kaplay.trigger(eventType, data);
        }
    },

    // Debug function to show current objective info
    debugShowObjectiveInfo() {
        console.log('🎯 Current Objective Info:', {
            objective: this.currentObjective,
            playerGold: this.getCurrentGoldAmount(),
            objectiveType: this.currentObjective?.type
        });
    },

    // Comprehensive test function
    runObjectiveTests() {
        console.log('🧪 === OBJECTIVES SYSTEM TEST ===');
        
        // Test 1: Check if system is initialized
        console.log('🧪 Test 1: System initialization');
        console.log('  - Objective pool size:', this.objectivePool.length);
        console.log('  - Current objective:', this.currentObjective ? this.currentObjective.title : 'None');
        
        // Test 2: Manual event triggering
        console.log('🧪 Test 2: Manual event triggering');
        
        if (this.currentObjective) {
            console.log(`  - Current objective: ${this.currentObjective.title} (${this.currentObjective.current}/${this.currentObjective.target})`);
            console.log(`  - Tracking event: ${this.currentObjective.trackEvent}`);
            
            // Test appropriate event for current objective
            if (this.currentObjective.trackEvent === 'enemy_defeated') {
                console.log('  - Testing enemy_defeated event...');
                this.k.trigger('enemy_defeated', {
                    enemyType: 'goblin',
                    enemyId: 'test_goblin',
                    killedBy: 'player'
                });
            } else if (this.currentObjective.trackEvent === 'gold_collected') {
                console.log('  - Testing gold_collected event...');
                this.k.trigger('gold_collected', {
                    amount: 10,
                    itemType: 'gold_coin'
                });
            }
        } else {
            console.log('  - No current objective to test');
        }
        
        console.log('🧪 === TEST COMPLETE ===');
    }
};

// Expose to global for non-module access
if (typeof window !== 'undefined') {
    window.ObjectivesSystem = ObjectivesSystem;
}
