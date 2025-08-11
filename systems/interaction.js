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
        const now = Date.now();
        if (now - this.lastInteractionTime < this.interactionCooldown) {
            console.log("🔧 Interaction on cooldown");
            return false;
        }
        
        const player = this.getPlayer();
        if (!player) {
            console.log("🔧 No player found");
            return false;
        }
        
        const playerPos = this.getPlayerGridPosition(player);
        console.log(`🔧 Player position: (${playerPos.x}, ${playerPos.y})`);
        
        // Find interactive objects in range
        const interactables = this.findInteractablesNearPlayer(player);
        console.log(`🔧 Found ${interactables.length} interactable objects`);
        
        if (interactables.length === 0) {
            this.showMessage("Nothing to interact with here.");
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
        return this.interactWith(closest, player);
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
        } else if (interactable.is("stairs")) {
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
            return result;
        }
        
        // Fallback door interaction
        this.showMessage(`You ${door.isOpen ? 'close' : 'open'} the door.`);
        door.isOpen = !door.isOpen;
        door.walkable = door.isOpen;
        door.solid = !door.isOpen;
        
        // Update door color
        door.color = door.isOpen ? 
            this.k.rgb(80, 60, 40) : 
            this.k.rgb(100, 60, 30);
        
        return true;
    },
    
    // Interact with a chest
    interactWithChest(chest, player) {
        if (!chest || !player) return false;
        
        if (chest.opened) {
            this.showMessage("The chest is empty.");
            return false;
        }
        
        this.showMessage("You open the chest!");
        chest.opened = true;
        chest.color = this.k.rgb(120, 80, 40); // Lighter color when opened
        
        // TODO: Add loot to player inventory
        console.log("Chest opened - TODO: Add loot system");
        
        return true;
    },
    
    // Interact with stairs
    interactWithStairs(stairs, player) {
        if (!stairs || !player) return false;
        
        const direction = stairs.direction || 'down';
        this.showMessage(`You use the stairs going ${direction}.`);
        
        // TODO: Implement level transition
        console.log(`Stairs interaction - TODO: Implement level transition ${direction}`);
        
        return true;
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
        
        return interactables.filter(obj => {
            if (!obj.pos) return false;
            
            const objGrid = this.pixelToGrid(obj.pos.x, obj.pos.y);
            const distance = this.getGridDistance(playerGrid, objGrid);
            
            return distance <= this.interactionRange;
        });
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
    showMessage(message) {
        // Use message system if available
        if (typeof window !== 'undefined' && window.MessageSystem) {
            window.MessageSystem.addMessage(message, 'system');
            return;
        }
        
        // Fallback: console log
        console.log(`Interaction: ${message}`);
    },
    
    // Update interaction system (called each frame)
    update() {
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
            this.k.text("E", { size: 12 }),
            this.k.pos(object.pos.x, object.pos.y - 20),
            this.k.anchor("center"),
            this.k.color(255, 255, 255),
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
        interactables.forEach(obj => {
            obj.hasHint = false;
            obj.hintObject = null;
        });
    }
};

// Expose to global for non-module access
if (typeof window !== 'undefined') {
    window.InteractionSystem = InteractionSystem;
}
