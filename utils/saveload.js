// Save/Load System for Castles of the Wind Clone
// Handles level state persistence using Kaplay's data storage

const SaveLoadSystem = {
    k: null,
    saveKey: 'castles_wind_save',

    init(kaboomContext) {
        this.k = kaboomContext;
        console.log('SaveLoadSystem initialized');
    },

    // Save current game state
    saveGame() {
        try {
            const gameState = this.collectGameState();
            
            // Use Kaplay's data storage if available, otherwise localStorage
            if (this.k && this.k.setData) {
                this.k.setData(this.saveKey, gameState);
            } else {
                localStorage.setItem(this.saveKey, JSON.stringify(gameState));
            }
            
            console.log('💾 Game saved successfully');
            this.showSaveNotification();
            return true;
        } catch (error) {
            console.error('❌ Failed to save game:', error);
            return false;
        }
    },

    // Load saved game state
    loadGame() {
        try {
            let gameState = null;
            
            // Use Kaplay's data storage if available, otherwise localStorage
            if (this.k && this.k.getData) {
                gameState = this.k.getData(this.saveKey);
            } else {
                const saved = localStorage.getItem(this.saveKey);
                gameState = saved ? JSON.parse(saved) : null;
            }
            
            if (gameState) {
                this.restoreGameState(gameState);
                console.log('📂 Game loaded successfully');
                return true;
            } else {
                console.log('ℹ️ No saved game found');
                return false;
            }
        } catch (error) {
            console.error('❌ Failed to load game:', error);
            return false;
        }
    },

    // Collect current game state
    collectGameState() {
        const player = this.k.get("player")[0];
        const currentLevel = typeof ProgressionSystem !== 'undefined' ? 
            ProgressionSystem.getCurrentLevel() : 1;

        const gameState = {
            version: '1.0',
            timestamp: Date.now(),
            currentLevel: currentLevel,
            player: {
                health: player?.health || 100,
                maxHealth: player?.maxHealth || 100,
                attack: player?.attack || 10,
                defense: player?.defense || 5,
                gold: player?.gold || 0,
                level: player?.level || 1,
                experience: player?.experience || 0,
                position: {
                    x: player?.gridX || 0,
                    y: player?.gridY || 0
                }
            },
            levelStates: this.collectLevelStates(),
            objectives: this.collectObjectiveStates(),
            settings: {
                soundEnabled: true,
                musicEnabled: true
            }
        };

        return gameState;
    },

    // Collect level-specific states
    collectLevelStates() {
        const levelStates = {};
        
        // Collect current level state
        const currentLevel = typeof ProgressionSystem !== 'undefined' ? 
            ProgressionSystem.getCurrentLevel() : 1;
            
        levelStates[currentLevel] = {
            visitedRooms: this.getVisitedRooms(),
            collectedItems: this.getCollectedItems(),
            defeatedEnemies: this.getDefeatedEnemies(),
            openedDoors: this.getOpenedDoors(),
            triggeredTraps: this.getTriggeredTraps()
        };

        return levelStates;
    },

    // Collect objective states
    collectObjectiveStates() {
        if (typeof ObjectivesSystem !== 'undefined') {
            return {
                current: ObjectivesSystem.getCurrentObjectives(),
                completed: ObjectivesSystem.completedObjectives
            };
        }
        return {};
    },

    // Get visited rooms
    getVisitedRooms() {
        // Track which rooms/areas the player has visited
        // This would be enhanced with actual room tracking
        return [];
    },

    // Get collected items
    getCollectedItems() {
        const collectedItems = [];
        
        // Check for collected treasures, potions, etc.
        const treasures = this.k.get("treasure");
        const potions = this.k.get("potion");
        const gold = this.k.get("gold");
        
        // Items that are collected would be marked or removed
        // For now, return empty array as items are destroyed on collection
        return collectedItems;
    },

    // Get defeated enemies
    getDefeatedEnemies() {
        const defeatedEnemies = [];
        
        // Track defeated enemies by their original positions
        // This would need to be enhanced with actual enemy tracking
        return defeatedEnemies;
    },

    // Get opened doors
    getOpenedDoors() {
        const openedDoors = [];
        const doors = this.k.get("door");
        
        doors.forEach(door => {
            if (door.isOpen) {
                openedDoors.push({
                    x: door.gridX,
                    y: door.gridY,
                    isOpen: door.isOpen
                });
            }
        });
        
        return openedDoors;
    },

    // Get triggered traps
    getTriggeredTraps() {
        const triggeredTraps = [];
        const traps = this.k.get("spike_trap");
        
        traps.forEach(trap => {
            if (trap.cooldown > 0) {
                triggeredTraps.push({
                    x: trap.gridX,
                    y: trap.gridY,
                    cooldown: trap.cooldown
                });
            }
        });
        
        return triggeredTraps;
    },

    // Restore game state from save data
    restoreGameState(gameState) {
        console.log('🔄 Restoring game state...');
        
        // Restore level
        if (gameState.currentLevel && typeof ProgressionSystem !== 'undefined') {
            ProgressionSystem.transitionToLevel(gameState.currentLevel);
        }
        
        // Restore player state
        this.restorePlayerState(gameState.player);
        
        // Restore level states
        this.restoreLevelStates(gameState.levelStates);
        
        // Restore objectives
        this.restoreObjectiveStates(gameState.objectives);
        
        console.log('✅ Game state restored');
    },

    // Restore player state
    restorePlayerState(playerState) {
        const player = this.k.get("player")[0];
        if (!player || !playerState) return;
        
        player.health = playerState.health;
        player.maxHealth = playerState.maxHealth;
        player.attack = playerState.attack;
        player.defense = playerState.defense;
        player.gold = playerState.gold;
        player.level = playerState.level;
        player.experience = playerState.experience;
        
        // Restore position
        if (playerState.position) {
            const worldX = playerState.position.x * 32 + 16;
            const worldY = playerState.position.y * 32 + 16;
            player.pos = this.k.vec2(worldX, worldY);
            player.gridX = playerState.position.x;
            player.gridY = playerState.position.y;
        }
    },

    // Restore level states
    restoreLevelStates(levelStates) {
        if (!levelStates) return;
        
        // Restore door states
        Object.values(levelStates).forEach(levelState => {
            if (levelState.openedDoors) {
                levelState.openedDoors.forEach(doorState => {
                    const doors = this.k.get("door");
                    const door = doors.find(d => d.gridX === doorState.x && d.gridY === doorState.y);
                    if (door) {
                        door.isOpen = doorState.isOpen;
                        // Update door visual state
                        if (door.isOpen) {
                            door.color = this.k.color(160, 82, 45); // Lighter brown for open
                        }
                    }
                });
            }
            
            // Restore trap states
            if (levelState.triggeredTraps) {
                levelState.triggeredTraps.forEach(trapState => {
                    const traps = this.k.get("spike_trap");
                    const trap = traps.find(t => t.gridX === trapState.x && t.gridY === trapState.y);
                    if (trap) {
                        trap.cooldown = trapState.cooldown;
                    }
                });
            }
        });
    },

    // Restore objective states
    restoreObjectiveStates(objectiveStates) {
        if (!objectiveStates || typeof ObjectivesSystem === 'undefined') return;
        
        if (objectiveStates.current) {
            ObjectivesSystem.currentObjectives = objectiveStates.current;
        }
        
        if (objectiveStates.completed) {
            ObjectivesSystem.completedObjectives = objectiveStates.completed;
        }
        
        ObjectivesSystem.updateObjectiveDisplay();
    },

    // Show save notification
    showSaveNotification() {
        // Remove existing notifications
        this.k.destroyAll("save_notification");

        // Create save notification
        const notification = this.k.add([
            this.k.rect(200, 40),
            this.k.color(0, 100, 0),
            this.k.pos(this.k.width() - 220, 20),
            this.k.anchor("topleft"),
            this.k.opacity(0.9),
            this.k.z(150),
            "save_notification"
        ]);

        this.k.add([
            this.k.text("Game Saved!", { size: 14 }),
            this.k.color(255, 255, 255),
            this.k.pos(this.k.width() - 120, 40),
            this.k.anchor("center"),
            this.k.z(151),
            "save_notification"
        ]);

        // Auto-hide notification
        this.k.wait(2, () => {
            this.k.destroyAll("save_notification");
        });
    },

    // Check if save exists
    hasSavedGame() {
        try {
            if (this.k && this.k.getData) {
                return this.k.getData(this.saveKey) !== null;
            } else {
                return localStorage.getItem(this.saveKey) !== null;
            }
        } catch (error) {
            return false;
        }
    },

    // Delete saved game
    deleteSave() {
        try {
            if (this.k && this.k.setData) {
                this.k.setData(this.saveKey, null);
            } else {
                localStorage.removeItem(this.saveKey);
            }
            console.log('🗑️ Save deleted');
            return true;
        } catch (error) {
            console.error('❌ Failed to delete save:', error);
            return false;
        }
    },

    // Auto-save functionality (disabled for performance)
    enableAutoSave(intervalMinutes = 5) {
        // Auto-save disabled to prevent periodic lag spikes
        console.log(`⚠️ Auto-save disabled for performance optimization`);
        
        // Manual save is still available via SaveLoadSystem.saveGame()
    }
};
