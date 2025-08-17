// Interaction system for Castles of the Wind Clone
// Handles player interactions with interactive objects like doors, chests, etc.

const InteractionSystem = {
    // Initialize the interaction system
    init(k) {
        this.k = k;
        this.interactionRange = 1; // Grid units
        this.lastInteractionTime = 0;
        this.interactionCooldown = 300; // ms
        
        // Set up interaction key handler
        this.setupInteractionControls();
        
        console.log("Interaction system initialized");
    },
    
    // Set up interaction controls
    setupInteractionControls() {
        if (!this.k) return;
        
        // E key for interaction
        this.k.onKeyPress("e", () => {
            this.tryInteract();
        });
        
        // Space key as alternative interaction (when not in combat)
        this.k.onKeyPress("space", () => {
            // Only use space for interaction if not in combat
            if (!this.isInCombat()) {
                this.tryInteract();
            }
        });
        
        // Right-click for interaction
        this.k.onMousePress("right", () => {
            this.tryInteractAtMouse();
        });
    },
    
    // Try to interact with nearby objects
    tryInteract() {
        console.log("🔧 E key pressed - trying to interact...");
        this.debugMode = true; // Enable debug logging for this interaction attempt
        
        const now = Date.now();
        if (now - this.lastInteractionTime < this.interactionCooldown) {
            console.log("🔧 Interaction on cooldown");
            this.debugMode = false;
            return false;
        }
        
        const player = this.getPlayer();
        if (!player) {
            console.log("🔧 No player found");
            this.debugMode = false;
            return false;
        }
        
        const playerPos = this.getPlayerGridPosition(player);
        console.log(`🔧 Player position: (${playerPos.x}, ${playerPos.y})`);
        
        // Find interactive objects in range
        const interactables = this.findInteractablesNearPlayer(player);
        console.log(`🔧 Found ${interactables.length} interactable objects`);
        
        if (interactables.length === 0) {
            this.showMessage("Nothing to interact with here.");
            this.debugMode = false;
            return false;
        }
        
        // Log details about found interactables
        interactables.forEach((obj, i) => {
            const objPos = obj.gridX !== undefined ? `(${obj.gridX}, ${obj.gridY})` : 'unknown position';
            console.log(`🔧 Interactable ${i}: ${obj.tags || 'unknown'} at ${objPos}`);
        });
        
        // Interact with the closest object
        const closest = this.getClosestInteractable(player, interactables);
        console.log(`🔧 Interacting with closest object: ${closest.tags || 'unknown'}`);
        const result = this.interactWith(closest, player);
        this.debugMode = false; // Reset debug mode after interaction
        return result;
    },
    
    // Try to interact at mouse position
    tryInteractAtMouse() {
        const now = Date.now();
        if (now - this.lastInteractionTime < this.interactionCooldown) {
            return false;
        }
        
        const player = this.getPlayer();
        if (!player) return false;
        
        const mousePos = this.k.mousePos();
        const gridPos = this.pixelToGrid(mousePos.x, mousePos.y);
        
        // Check if mouse position is in interaction range
        const playerGrid = this.getPlayerGridPosition(player);
        const distance = this.getGridDistance(playerGrid, gridPos);
        
        if (distance > this.interactionRange) {
            this.showMessage("Too far away to interact.");
            return false;
        }
        
        // Find interactive object at mouse position
        const interactable = this.findInteractableAt(gridPos.x, gridPos.y);
        if (!interactable) {
            this.showMessage("Nothing to interact with here.");
            return false;
        }
        
        return this.interactWith(interactable, player);
    },
    
    // Interact with a specific object
    interactWith(interactable, player) {
        if (!interactable || !player) return false;
        
        this.lastInteractionTime = Date.now();
        
        // Handle different types of interactive objects
        if (interactable.is("door")) {
            return this.interactWithDoor(interactable, player);
        } else if (interactable.is("chest")) {
            return this.interactWithChest(interactable, player);
        } else if (interactable.is("stairs_down") || interactable.is("stairs_up") || interactable.is("stairs")) {
            return this.interactWithStairs(interactable, player);
        } else if (interactable.interactive) {
            return this.interactWithGeneric(interactable, player);
        }
        
        return false;
    },
    
    // Interact with a door
    interactWithDoor(door, player) {
        console.log("🚪 Attempting to interact with door...");
        if (!door || !player) {
            console.log("🚪 Missing door or player");
            return false;
        }
        
        console.log(`🚪 Door at (${door.gridX}, ${door.gridY}) state: isOpen=${door.isOpen}, solid=${door.solid}, walkable=${door.walkable}`);
        
        // Use door entity system if available
        if (typeof window !== 'undefined' && window.DoorEntity) {
            console.log(`🚪 Calling DoorEntity.interact for door at (${door.gridX}, ${door.gridY})`);
            const result = window.DoorEntity.interact(this.k, door, player);
            console.log(`🚪 After DoorEntity.interact: isOpen=${door.isOpen}, solid=${door.solid}`);
            
            // Trigger door opened event for objectives system (only when opening, not closing)
            if (result && door.isOpen) {
                const doorEventData = {
                    doorId: door.id || `door_${door.gridX}_${door.gridY}`,
                    position: { x: door.gridX, y: door.gridY }
                };
                
                // Try multiple ways to trigger the event
                if (this.k && typeof this.k.trigger === 'function') {
                    this.k.trigger('door_opened', doorEventData);
                    console.log('🚪 Triggered door_opened via this.k:', doorEventData);
                }
                
                if (typeof window !== 'undefined' && window.k && typeof window.k.trigger === 'function') {
                    window.k.trigger('door_opened', doorEventData);
                    console.log('🚪 Triggered door_opened via window.k:', doorEventData);
                }
                
                // Direct call to objectives system as fallback
                if (typeof window !== 'undefined' && window.ObjectivesSystem) {
                    window.ObjectivesSystem.trackObjectiveProgress('door_opened', doorEventData);
                    console.log('🚪 Direct call to ObjectivesSystem for door:', doorEventData);
                }
            }
            
            return result;
        }
        
        // Fallback door interaction
        const wasOpen = door.isOpen;
        this.showMessage(`You ${door.isOpen ? 'close' : 'open'} the door.`);
        door.isOpen = !door.isOpen;
        door.walkable = door.isOpen;
        door.solid = !door.isOpen;
        
        // Update door color
        door.color = door.isOpen ? 
            this.k.rgb(80, 60, 40) : 
            this.k.rgb(100, 60, 30);
        
        // Trigger door opened event for objectives system (only when opening, not closing)
        if (!wasOpen && door.isOpen) {
            if (this.k && typeof this.k.trigger === 'function') {
                this.k.trigger('door_opened', {
                    doorId: door.id || `door_${door.gridX}_${door.gridY}`,
                    position: { x: door.gridX, y: door.gridY }
                });
            } else if (typeof kaplay !== 'undefined' && kaplay.trigger) {
                kaplay.trigger('door_opened', {
                    doorId: door.id || `door_${door.gridX}_${door.gridY}`,
                    position: { x: door.gridX, y: door.gridY }
                });
            }
        }
        
        return true;
    },
    
    // Interact with a chest
    interactWithChest(chest, player) {
        if (!chest || !player) return false;
        
        console.log('🔍 DEBUG: InteractionSystem.interactWithChest called');
        console.log('🔍 DEBUG: window.ChestEntity exists:', !!window.ChestEntity);
        console.log('🔍 DEBUG: chest object:', chest);
        
        // Use the proper ChestEntity system if available
        if (typeof window !== 'undefined' && window.ChestEntity) {
            console.log('🎁 DEBUG: Delegating to ChestEntity system');
            return window.ChestEntity.interactWithChest(chest, player);
        }
        
        // Fallback: basic chest interaction with item distribution
        if (chest.opened || chest.isOpen) {
            this.showMessage("The chest is empty.");
            return false;
        }
        
        console.log('📦 FALLBACK: Using InteractionSystem chest handler');
        console.log('📦 FALLBACK: Chest contents:', chest.contents);
        
        this.showMessage("You open the chest!");
        chest.opened = true;
        chest.isOpen = true;
        chest.color = this.k.rgb(120, 80, 40); // Lighter color when opened
        
        // Give contents to player (fallback implementation)
        if (chest.contents && chest.contents.length > 0) {
            let itemsReceived = [];
            
            chest.contents.forEach(item => {
                console.log('📦 FALLBACK: Processing item:', item);
                switch (item.type) {
                    case 'gold':
                        if (window.InventorySystem) {
                            window.InventorySystem.addGold(item.amount);
                            itemsReceived.push(`${item.amount} gold`);
                        }
                        break;
                        
                    case 'item':
                        if (window.InventorySystem) {
                            const added = window.InventorySystem.addItem(item);
                            if (added) {
                                itemsReceived.push(item.name);
                            }
                        }
                        break;
                        
                    case 'experience':
                        if (player.experience !== undefined) {
                            player.experience += item.amount;
                            itemsReceived.push(`${item.amount} XP`);
                        }
                        break;
                }
            });
            
            // Show what was received
            if (itemsReceived.length > 0) {
                this.showMessage(`Found: ${itemsReceived.join(', ')}`);
            } else {
                this.showMessage("The chest contained nothing useful.");
            }
        } else {
            // Generate random contents if none exist
            const randomGold = Math.floor(Math.random() * 50) + 10;
            if (window.InventorySystem) {
                window.InventorySystem.addGold(randomGold);
                this.showMessage(`Found: ${randomGold} gold`);
            }
        }
        
        // Trigger chest opened event for objectives system
        const chestEventData = {
            chestId: chest.id || `chest_${chest.gridX}_${chest.gridY}`,
            position: { x: chest.gridX, y: chest.gridY }
        };
        
        // Try multiple ways to trigger the event
        if (this.k && typeof this.k.trigger === 'function') {
            this.k.trigger('chest_opened', chestEventData);
            console.log('📦 Triggered chest_opened via this.k:', chestEventData);
        }
        
        if (typeof window !== 'undefined' && window.k && typeof window.k.trigger === 'function') {
            window.k.trigger('chest_opened', chestEventData);
            console.log('📦 Triggered chest_opened via window.k:', chestEventData);
        }
        
        // Direct call to objectives system as fallback
        if (typeof window !== 'undefined' && window.ObjectivesSystem) {
            window.ObjectivesSystem.trackObjectiveProgress('chest_opened', chestEventData);
            console.log('📦 Direct call to ObjectivesSystem for chest:', chestEventData);
        }
        
        return true;
    },
    
    // Interact with stairs
    interactWithStairs(stairs, player) {
        if (!stairs || !player) {
            console.log('❌ Stairs interaction failed: missing stairs or player');
            return false;
        }
        
        console.log(`🏃 Attempting to use stairs:`, {
            direction: stairs.direction,
            targetLevel: stairs.targetLevel,
            accessible: stairs.accessible,
            position: `(${stairs.gridX}, ${stairs.gridY})`,
            tags: stairs.tags
        });
        
        // Check if stairs are accessible using ProgressionSystem completion conditions
        const canTransition = typeof ProgressionSystem !== 'undefined' ? 
            ProgressionSystem.canTransition(stairs.direction) : true;
        
        const isAccessible = stairs.accessible !== false && canTransition;
        
        if (!isAccessible) {
            // ProgressionSystem.canTransition() will show the appropriate message
            if (stairs.accessible === false) {
                this.showMessage("The stairs are blocked. Complete all objectives first!");
            }
            return;
        }
        
        // Use ProgressionSystem to handle level transition
        if (typeof ProgressionSystem !== 'undefined') {
            // Force reset transition lock if it's stuck
            if (ProgressionSystem.levelTransitionInProgress) {
                console.log('🔓 Forcing reset of stuck transition lock');
                ProgressionSystem.levelTransitionInProgress = false;
            }
            
            console.log(`🔄 Calling ProgressionSystem.initiateTransition`);
            ProgressionSystem.initiateTransition(stairs);
            this.showMessage(`Using stairs to go ${stairs.direction}...`);
            return true;
        } else {
            console.error('❌ ProgressionSystem not available for level transition');
            this.showMessage(`You use the stairs going ${stairs.direction}.`);
            return false;
        }
    },
    
    // Generic interaction handler
    interactWithGeneric(object, player) {
        if (!object || !player) return false;
        
        const description = object.description || "You examine the object.";
        this.showMessage(description);
        
        return true;
    },
    
    // Find interactive objects near player
    findInteractablesNearPlayer(player) {
        if (!player) return [];
        
        const playerGrid = this.getPlayerGridPosition(player);
        const interactables = this.k.get("interactive");
        const stairs_down = this.k.get("stairs_down");
        const stairs_up = this.k.get("stairs_up");
        const stairs_generic = this.k.get("stairs");
        const stairs = stairs_down.concat(stairs_up).concat(stairs_generic);
        const allInteractables = interactables.concat(stairs);
        
        // Only log during actual interaction attempts (when this.debugMode is true)
        if (this.debugMode) {
            console.log(`🔍 Searching for interactables near player at (${playerGrid.x}, ${playerGrid.y})`);
            console.log(`🔍 Found ${interactables.length} interactive objects, ${stairs_down.length} stairs_down, ${stairs_up.length} stairs_up, ${stairs_generic.length} generic stairs`);
            console.log(`🔍 Total stairs found: ${stairs.length}`);
            
            // Debug log all stairs positions
            stairs.forEach((stair, i) => {
                console.log(`🔍 Stair ${i}: pos(${stair.pos?.x}, ${stair.pos?.y}), grid(${stair.gridX}, ${stair.gridY}), tags:`, stair.tags);
            });
        }
        
        // Only log during actual interaction attempts, not every frame
        const nearbyInteractables = allInteractables.filter(obj => {
            if (!obj.pos) return false;
            
            const objGrid = this.pixelToGrid(obj.pos.x, obj.pos.y);
            const distance = this.getGridDistance(playerGrid, objGrid);
            
            return distance <= this.interactionRange;
        });
        return nearbyInteractables;
    },
    
    // Find interactive object at specific position
    findInteractableAt(gridX, gridY) {
        const interactables = this.k.get("interactive");
        
        return interactables.find(obj => {
            if (!obj.pos) return false;
            
            const objGrid = this.pixelToGrid(obj.pos.x, obj.pos.y);
            return objGrid.x === gridX && objGrid.y === gridY;
        });
    },
    
    // Get closest interactive object to player
    getClosestInteractable(player, interactables) {
        if (!player || !interactables.length) return null;
        
        const playerGrid = this.getPlayerGridPosition(player);
        let closest = null;
        let minDistance = Infinity;
        
        for (const obj of interactables) {
            if (!obj.pos) continue;
            
            const objGrid = this.pixelToGrid(obj.pos.x, obj.pos.y);
            const distance = this.getGridDistance(playerGrid, objGrid);
            
            if (distance < minDistance) {
                minDistance = distance;
                closest = obj;
            }
        }
        
        return closest;
    },
    
    // Get player reference
    getPlayer() {
        if (!this.k) {
            return null; // System not initialized yet
        }
        const players = this.k.get("player");
        return players.length > 0 ? players[0] : null;
    },
    
    // Get player grid position
    getPlayerGridPosition(player) {
        if (!player || !player.pos) return { x: 0, y: 0 };
        return this.pixelToGrid(player.pos.x, player.pos.y);
    },
    
    // Convert pixel coordinates to grid coordinates
    pixelToGrid(pixelX, pixelY) {
        const tileSize = 32; // TODO: Get from level system
        return {
            x: Math.floor(pixelX / tileSize),
            y: Math.floor(pixelY / tileSize)
        };
    },
    
    // Calculate grid distance between two positions
    getGridDistance(pos1, pos2) {
        const dx = Math.abs(pos1.x - pos2.x);
        const dy = Math.abs(pos1.y - pos2.y);
        return Math.max(dx, dy); // Chebyshev distance (allows diagonals)
    },
    
    // Check if player is in combat
    isInCombat() {
        // Check if combat system exists and is active
        if (typeof window !== 'undefined' && window.CombatSystem) {
            return window.CombatSystem.combatActive || false;
        }
        return false;
    },

    // Show message to player
    showMessage(text) {
        if (window.MessageUI) {
            MessageUI.addMessage(text, 'system');
        } else {
            console.log(`💬 ${text}`);
        }
    },

    // Update interaction system (called each frame)
    update() {
        // ... (rest of the code remains the same)
        if (!this.k) {
            return; // System not initialized yet
        }
        
        // Update interaction hints/highlights
        this.updateInteractionHints();
    },
    
    // Update visual hints for nearby interactive objects
    updateInteractionHints() {
        const player = this.getPlayer();
        if (!player) return;
        
        const interactables = this.findInteractablesNearPlayer(player);
        
        // Clear previous hints
        this.clearInteractionHints();
        
        // Add hints for nearby interactables
        for (const obj of interactables) {
            this.addInteractionHint(obj);
        }
    },
    
    // Add interaction hint to object
    addInteractionHint(object) {
        if (!object || object.hasHint) return;
        
        // Create hint indicator
        const hint = this.k.add([
            this.k.text("E"),
            this.k.pos(object.pos.x, object.pos.y - 20),
            this.k.anchor("center"),
            this.k.color(255, 255, 255),
            this.k.scale(0.6),
            this.k.z(100),
            this.k.opacity(0.8),
            "interaction_hint"
        ]);
        
        object.hasHint = true;
        object.hintObject = hint;
    },
    
    // Clear all interaction hints
    clearInteractionHints() {
        const hints = this.k.get("interaction_hint");
        hints.forEach(hint => {
            if (hint.exists()) {
                this.k.destroy(hint);
            }
        });
        
        // Clear hint flags from objects
        const interactables = this.k.get("interactive");
        const stairs = this.k.get("stairs_down").concat(this.k.get("stairs_up")).concat(this.k.get("stairs"));
        const allInteractables = interactables.concat(stairs);
        allInteractables.forEach(obj => {
            obj.hasHint = false;
            obj.hintObject = null;
        });
    }
};

// Expose to global for non-module access
if (typeof window !== 'undefined') {
    window.InteractionSystem = InteractionSystem;
}
