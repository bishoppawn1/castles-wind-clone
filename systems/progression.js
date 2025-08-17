// Level Progression System for Castles of the Wind Clone
// Handles level transitions and completion conditions

const ProgressionSystem = {
    k: null,
    currentLevel: 1,
    playerSpawnPoint: null,
    levelTransitionInProgress: false,

    // Initialize progression system
    init(k) {
        this.k = k;
        this.currentLevel = 1;
        this.levelTransitionInProgress = false; // Ensure transition flag is reset on init
        this.setupLevelTransitions();
        this.setupInputHandlers();
        console.log('🎮 ProgressionSystem initialized');
    },

    // Set up level transition interactions
    setupLevelTransitions() {
        // Note: Stairs interactions are now handled by InteractionSystem
        // This prevents conflicts between collision and E-key interaction
        
        // Handle exit interactions (keep this for exits that aren't stairs)
        this.k.onCollide("player", "exit", (player, exit) => {
            if (!this.levelTransitionInProgress) {
                this.showTransitionPrompt(exit, "exit");
            }
        });
    },

    // Set up input handlers for level transitions
    setupInputHandlers() {
        // Note: E key stair interactions now handled by InteractionSystem
        // This prevents duplicate key handlers
        
        // Handle exit interactions
        this.k.onKeyPress("enter", () => {
            this.handleExitInteraction();
        });

        // Set up level completion event listener using Kaplay's event system
        this.k.on('level_complete', (data) => {
            this.handleLevelCompletion(data);
        });

        // Set up objective completion tracking
        this.k.on('objective_completed', (objective) => {
            this.handleObjectiveCompletion(objective);
        });
    },

    // Handle stair interactions
    handleStairInteraction() {
        const player = this.k.get("player")[0];
        if (!player) return;

        // Check if player is near stairs
        const stairs = this.k.get("stairs_down", "stairs_up");
        for (let stair of stairs) {
            const distance = player.pos.dist(stair.pos);
            if (distance < 40) { // Within interaction range
                if (stair.accessible) {
                    this.initiateTransition(stair);
                } else {
                    this.showLockedMessage();
                }
                break;
            }
        }
    },

    // Handle exit interactions
    handleExitInteraction() {
        const player = this.k.get("player")[0];
        if (!player) return;

        // Check if player is near exits
        const exits = this.k.get("exit");
        for (let exit of exits) {
            const distance = player.pos.dist(exit.pos);
            if (distance < 40) { // Within interaction range
                this.initiateTransition(exit);
                break;
            }
        }
    },

    // Show locked stairs message
    showLockedMessage() {
        // Remove existing messages
        this.k.destroyAll("locked_message");

        const message = this.k.add([
            this.k.text("Complete all objectives first!", { size: 14 }),
            this.k.color(255, 100, 100),
            this.k.pos(this.k.width() / 2, this.k.height() / 2),
            this.k.anchor("center"),
            this.k.z(150),
            "locked_message"
        ]);

        // Auto-hide message
        this.k.wait(2, () => {
            this.k.destroyAll("locked_message");
        });
    },

    // Show transition prompt to player
    showTransitionPrompt(transitionPoint, direction) {
        // Remove existing prompts
        this.k.destroyAll("transition_prompt");

        let promptText = "";
        switch (direction) {
            case "down":
                promptText = "Press E to go down";
                break;
            case "up":
                promptText = "Press E to go up";
                break;
            case "exit":
                promptText = "Press E to exit level";
                break;
        }

        // Create prompt text
        this.k.add([
            this.k.text(promptText, { size: 14 }),
            this.k.color(255, 255, 255),
            this.k.pos(transitionPoint.pos.x, transitionPoint.pos.y - 30),
            this.k.anchor("center"),
            this.k.z(100),
            this.k.opacity(1),
            this.k.lifespan(3),
            "transition_prompt"
        ]);
    },

    // Initiate level transition
    // Reset transition lock (for debugging stuck transitions)
    resetTransitionLock() {
        console.log('🔓 Manually resetting transition lock');
        this.levelTransitionInProgress = false;
    },

    initiateTransition(transitionPoint) {
        if (this.levelTransitionInProgress) {
            console.log("⚠️ Transition already in progress, ignoring request");
            console.log("💡 If stuck, you can reset with: ProgressionSystem.resetTransitionLock()");
            return;
        }

        this.levelTransitionInProgress = true;
        console.log(`🚪 Initiating level transition from ${transitionPoint.tileType || 'stairs'}`);
        console.log(`🚪 Transition point data:`, transitionPoint);

        // Determine target level
        let targetLevel = null;
        if (transitionPoint.targetLevel) {
            targetLevel = transitionPoint.targetLevel;
            console.log(`🎯 Using specified target level: ${targetLevel}`);
        } else {
            // Default transition logic
            if (transitionPoint.direction === "down") {
                targetLevel = this.currentLevel + 1;
            } else if (transitionPoint.direction === "up") {
                targetLevel = this.currentLevel - 1;
            }
            console.log(`🎯 Using calculated target level: ${targetLevel}`);
        }

        console.log(`🔍 Validating target level: ${targetLevel}`);
        
        // Validate target level
        if (targetLevel && this.isValidLevel(targetLevel)) {
            console.log(`✅ Target level ${targetLevel} is valid, starting transition`);
            this.transitionToLevel(targetLevel);
        } else {
            console.log(`🚫 Invalid target level: ${targetLevel}`);
            console.log(`🚫 Available levels:`, typeof LEVELS !== 'undefined' ? Object.keys(LEVELS) : 'LEVELS not defined');
            this.levelTransitionInProgress = false;
        }
    },

    // Check if level exists
    isValidLevel(levelId) {
        if (typeof LEVELS !== 'undefined') {
            return LEVELS[levelId] !== undefined;
        }
        // Fallback for basic level checking
        return levelId >= 1 && levelId <= 2;
    },

    // Transition to target level using Kaplay's scene system
    transitionToLevel(targetLevel) {
        console.log(`🔄 Transitioning to level ${targetLevel}...`);
        
        // Note: levelTransitionInProgress is already set by initiateTransition
        
        // Store current player state
        const player = this.k.get("player")[0];
        if (player) {
            this.storePlayerState(player);
        }

        // Load level immediately without transition effects
        this.loadLevel(targetLevel);
        
        // Reset transition lock after level load
        this.levelTransitionInProgress = false;
    },

    // Store player state for level transitions
    storePlayerState(player) {
        if (typeof window.GameState !== 'undefined') {
            window.GameState.playerState = {
                health: player.health || 100,
                maxHealth: player.maxHealth || 100,
                attack: player.attack || 10,
                defense: player.defense || 5,
                gold: player.gold || 0,
                level: player.level || 1,
                experience: player.experience || 0
            };
            console.log('💾 Player state saved for transition');
        }
    },

    // Restore player state after level transition
    restorePlayerState(player) {
        if (typeof window.GameState !== 'undefined' && window.GameState.playerState) {
            const state = window.GameState.playerState;
            player.health = state.health;
            player.maxHealth = state.maxHealth;
            player.attack = state.attack;
            player.defense = state.defense;
            player.gold = state.gold;
            player.level = state.level;
            player.experience = state.experience;
            console.log('🔄 Player state restored after transition');
        }
    },

    // Clean up all level-specific entities before loading new level
    cleanupLevelEntities() {
        console.log('🧹 Starting optimized entity cleanup...');
        
        // Preserve player during cleanup
        const player = this.k.get("player")[0];
        
        // Optimized cleanup - batch destroy by category to reduce overhead
        const entitiesToClean = [
            "enemy", "goblin", "orc", "skeleton", "rat",
            "ground_item", "item", "pickup",
            "door", "chest", "stairs", "stairs_down", "stairs_up", "interactive",
            "wall", "floor", "trap",
            "effect", "particle", "damage_text", "pickup_message", "transition_overlay"
        ];
        
        let totalRemoved = 0;
        
        // Batch cleanup with minimal logging to reduce overhead
        entitiesToClean.forEach(tag => {
            const entities = this.k.get(tag);
            if (entities.length > 0) {
                totalRemoved += entities.length;
                this.k.destroyAll(tag);
            }
        });
        
        // Quick cleanup of high z-index objects without extensive filtering
        const allEntities = this.k.get();
        allEntities.forEach(obj => {
            if (obj !== player && obj.z && obj.z >= 100 && obj.color) {
                obj.destroy();
                totalRemoved++;
            }
        });
        
        console.log(`✅ Cleanup complete - removed ${totalRemoved} entities`);
    },

    // Load target level
    loadLevel(levelId) {
        console.log(`📍 Loading level ${levelId}...`);
        
        // CRITICAL: Clean up previous level entities to prevent performance issues
        this.cleanupLevelEntities();
        
        // Small delay to let cleanup complete and prevent system overload
        this.k.wait(0.05, () => {
            this.loadLevelContent(levelId);
        });
    },

    // Load level content after cleanup
    loadLevelContent(levelId) {
        // Ensure GameState is preserved during transition
        if (typeof window.GameState !== 'undefined') {
            console.log('💾 Preserving GameState during level transition...');
            const preservedInventory = window.GameState.playerState.inventory ? [...window.GameState.playerState.inventory] : [];
            const preservedItemsCollected = window.GameState.worldState.itemsCollected ? [...window.GameState.worldState.itemsCollected] : [];
            
            // Update current level
            this.currentLevel = levelId;

            // Use existing LevelSystem if available
            if (typeof LevelSystem !== 'undefined' && LevelSystem.loadLevel) {
                LevelSystem.loadLevel(this.k, levelId);
                
                // Note: LevelSystem.loadLevel already calls SystemInitializer.generateLevelContent
                // so we don't need to call it again to avoid double initialization
            } else {
                console.error('❌ LevelSystem not available for level transition');
            }
            
            // Restore preserved GameState arrays after level loading
            if (!window.GameState.playerState.inventory) {
                window.GameState.playerState.inventory = [];
            }
            if (!window.GameState.worldState.itemsCollected) {
                window.GameState.worldState.itemsCollected = [];
            }
            window.GameState.playerState.inventory = preservedInventory;
            window.GameState.worldState.itemsCollected = preservedItemsCollected;
            console.log('🔄 GameState arrays restored after level transition');
        } else {
            console.error('❌ GameState not available during level transition');
            
            // Update current level
            this.currentLevel = levelId;

            // Use existing LevelSystem if available
            if (typeof LevelSystem !== 'undefined' && LevelSystem.loadLevel) {
                LevelSystem.loadLevel(this.k, levelId);
                
                // Note: LevelSystem.loadLevel already calls SystemInitializer.generateLevelContent
                // so we don't need to call it again to avoid double initialization
            } else {
                console.error('❌ LevelSystem not available for level transition');
            }
        }

        // Restore player state
        const player = this.k.get("player")[0];
        if (player) {
            this.restorePlayerState(player);
            this.positionPlayerAtSpawn(player, levelId);
        }

        console.log(`✅ Level ${levelId} transition complete`);
    },

    // Set current level
    setCurrentLevel(levelId) {
        this.currentLevel = levelId;
        console.log(`📍 Current level set to: ${levelId}`);
    },

    // Position player at appropriate spawn point
    positionPlayerAtSpawn(player, levelId) {
        let spawnPoint = null;

        // Get level data
        if (typeof LEVELS !== 'undefined' && LEVELS[levelId]) {
            spawnPoint = LEVELS[levelId].playerSpawn;
        }

        // Default spawn points if not defined
        if (!spawnPoint) {
            const defaultSpawns = {
                1: { x: 28, y: 36 },
                2: { x: 1, y: 17 }
            };
            spawnPoint = defaultSpawns[levelId] || { x: 5, y: 5 };
        }

        // Position player
        const worldX = spawnPoint.x * 32 + 16;
        const worldY = spawnPoint.y * 32 + 16;
            
        player.pos = this.k.vec2(worldX, worldY);
        player.gridX = spawnPoint.x;
        player.gridY = spawnPoint.y;

        console.log(`👤 Player positioned at spawn (${spawnPoint.x}, ${spawnPoint.y})`);
    },

    // Handle level completion using Kaplay's event system
    handleLevelCompletion(data) {
        console.log(`🎉 Level ${data.level} completed!`);
        console.log(`📊 Objectives completed: ${data.objectives.length}`);
        
        // Enable level progression (unlock stairs, etc.)
        this.enableLevelProgression();
        
        // Auto-save game state on level completion
        if (typeof SaveLoadSystem !== 'undefined') {
            SaveLoadSystem.saveGame();
        }
        
        // Show completion notification
        this.showLevelCompletionNotification(data);
    },

    // Handle individual objective completion
    handleObjectiveCompletion(objective) {
        console.log(`✅ Objective completed: ${objective.title}`);
        
        // Check if this objective enables special features
        this.checkObjectiveRewards(objective);
    },

    // Enable level progression (unlock stairs, doors, etc.)
    enableLevelProgression() {
        // Mark stairs as accessible
        const stairs = this.k.get("stairs_down", "stairs_up");
        stairs.forEach(stair => {
            stair.accessible = true;
            console.log(`🔓 Stairs at (${stair.gridX}, ${stair.gridY}) unlocked`);
        });

        // Update any locked doors that should open on completion
        const lockedDoors = this.k.get("door").filter(door => door.locked);
        lockedDoors.forEach(door => {
            if (door.unlockOnCompletion) {
                door.locked = false;
                door.color = this.k.color(139, 69, 19); // Normal door color
                console.log(`🔓 Door at (${door.gridX}, ${door.gridY}) unlocked`);
            }
        });

        // Emit progression enabled event
        if (this.k && typeof this.k.trigger === 'function') {
            this.k.trigger('progression_enabled', {
                level: this.currentLevel,
                timestamp: Date.now()
            });
        } else if (typeof kaplay !== 'undefined' && kaplay.trigger) {
            kaplay.trigger('progression_enabled', {
                level: this.currentLevel,
                timestamp: Date.now()
            });
        }
    },

    // Check for objective-specific rewards
    checkObjectiveRewards(objective) {
        switch (objective.id) {
            case 'clear_enemies':
                // Unlock combat rewards
                if (this.k && typeof this.k.trigger === 'function') {
                    this.k.trigger('combat_mastery_unlocked');
                } else if (typeof kaplay !== 'undefined' && kaplay.trigger) {
                    kaplay.trigger('combat_mastery_unlocked');
                }
                break;
            case 'collect_all_items':
                // Unlock treasure bonus
                if (this.k && typeof this.k.trigger === 'function') {
                    this.k.trigger('treasure_master_unlocked');
                } else if (typeof kaplay !== 'undefined' && kaplay.trigger) {
                    kaplay.trigger('treasure_master_unlocked');
                }
                break;
            case 'explore_all_rooms':
                // Unlock exploration bonus
                if (this.k && typeof this.k.trigger === 'function') {
                    this.k.trigger('explorer_unlocked');
                } else if (typeof kaplay !== 'undefined' && kaplay.trigger) {
                    kaplay.trigger('explorer_unlocked');
                }
                break;
        }
    },

    // Show level completion notification
    showLevelCompletionNotification(data) {
        // Remove existing notifications
        this.k.destroyAll("level_complete_notification");

        // Create background
        this.k.add([
            this.k.rect(this.k.width(), this.k.height()),
            this.k.color(0, 0, 0),
            this.k.opacity(0.7),
            this.k.pos(0, 0),
            this.k.z(200),
            "level_complete_notification"
        ]);

        // Create notification panel
        this.k.add([
            this.k.rect(400, 200),
            this.k.color(50, 50, 100),
            this.k.pos(this.k.width() / 2, this.k.height() / 2),
            this.k.anchor("center"),
            this.k.z(201),
            "level_complete_notification"
        ]);

        // Add title
        this.k.add([
            this.k.text(`LEVEL ${data.level} COMPLETE!`, { size: 24 }),
            this.k.color(255, 255, 100),
            this.k.pos(this.k.width() / 2, this.k.height() / 2 - 50),
            this.k.anchor("center"),
            this.k.z(202),
            "level_complete_notification"
        ]);

        // Add objectives summary
        this.k.add([
            this.k.text(`All ${data.objectives.length} objectives completed!`, { size: 16 }),
            this.k.color(255, 255, 255),
            this.k.pos(this.k.width() / 2, this.k.height() / 2 - 10),
            this.k.anchor("center"),
            this.k.z(202),
            "level_complete_notification"
        ]);

        // Add progression instruction
        this.k.add([
            this.k.text("Find stairs to continue to the next level", { size: 14 }),
            this.k.color(200, 200, 200),
            this.k.pos(this.k.width() / 2, this.k.height() / 2 + 30),
            this.k.anchor("center"),
            this.k.z(202),
            "level_complete_notification"
        ]);

        // Add dismiss instruction
        this.k.add([
            this.k.text("Press SPACE to continue", { size: 12 }),
            this.k.color(150, 150, 150),
            this.k.pos(this.k.width() / 2, this.k.height() / 2 + 60),
            this.k.anchor("center"),
            this.k.z(202),
            "level_complete_notification"
        ]);

        // Handle dismiss
        const dismissHandler = this.k.onKeyPress("space", () => {
            this.k.destroyAll("level_complete_notification");
            dismissHandler.cancel();
        });

        // Auto-dismiss after 10 seconds
        this.k.wait(10, () => {
            this.k.destroyAll("level_complete_notification");
            dismissHandler.cancel();
        });
    },

    // Check if player can transition (completion conditions)
    canTransition(direction) {
        // Allow free travel between levels - no objective completion required
        return true;
    },

    // Show incomplete objectives message
    showIncompleteMessage(completionPercentage) {
        // Remove existing messages
        this.k.destroyAll("incomplete_message");

        const message = this.k.add([
            this.k.text(`Complete all objectives first! (${Math.round(completionPercentage)}% done)`, { size: 14 }),
            this.k.color(255, 100, 100),
            this.k.pos(this.k.width() / 2, this.k.height() / 2),
            this.k.anchor("center"),
            this.k.z(150),
            "incomplete_message"
        ]);

        // Auto-hide message
        this.k.wait(3, () => {
            this.k.destroyAll("incomplete_message");
        });
    }
};
