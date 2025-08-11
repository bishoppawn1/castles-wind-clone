// Door entity system for Castles of the Wind Clone
// Handles interactive doors that only players can open/close

const DoorEntity = {
    // Create a door entity
    create(k, gridX, gridY, tileSize = 32, doorData = {}) {
        const pixelX = gridX * tileSize + tileSize / 2;
        const pixelY = gridY * tileSize + tileSize / 2;
        
        // Default door properties
        const defaultData = {
            isOpen: false,
            requiresKey: false,
            keyType: null,
            locked: false,
            description: 'Wooden door'
        };
        
        const data = { ...defaultData, ...doorData };
        
        // Create door game object
        const door = k.add([
            k.rect(tileSize, tileSize),
            k.color(data.isOpen ? 60 : 100, data.isOpen ? 40 : 60, 30), // Darker when closed, lighter when open
            k.pos(pixelX, pixelY),
            k.anchor("center"),
            k.area(),
            k.z(1), // Above floor tiles but below entities
            k.outline(2, k.rgb(40, 20, 10)),
            "door",
            "interactive",
            {
                gridX: gridX,
                gridY: gridY,
                isOpen: data.isOpen,
                requiresKey: data.requiresKey,
                keyType: data.keyType,
                locked: data.locked,
                description: data.description,
                solid: !data.isOpen, // Solid when closed, passable when open
                walkable: data.isOpen, // Walkable when open
                lastInteractionTime: 0 // Prevent spam clicking
            }
        ]);
        
        // Add visual indicator for door state
        this.updateDoorVisual(k, door);
        
        console.log(`Created door at (${gridX}, ${gridY}) - ${data.isOpen ? 'Open' : 'Closed'}`);
        return door;
    },
    
    // Update door visual appearance based on state
    updateDoorVisual(k, door) {
        if (!door.exists()) return;
        
        // Update color based on state
        if (door.isOpen) {
            door.color = k.rgb(80, 60, 40); // Lighter brown when open
        } else {
            door.color = k.rgb(100, 60, 30); // Darker brown when closed
        }
        
        // Update outline color
        if (door.locked) {
            door.outline.color = k.rgb(120, 20, 20); // Red outline when locked
        } else {
            door.outline.color = k.rgb(40, 20, 10); // Normal brown outline
        }
    },
    
    // Handle player interaction with door
    interact(k, door, player) {
        if (!door || !door.exists() || !player) return false;
        
        // Prevent spam clicking (500ms cooldown)
        const now = Date.now();
        if (now - door.lastInteractionTime < 500) {
            return false;
        }
        door.lastInteractionTime = now;
        
        // Check if door is locked
        if (door.locked) {
            if (door.requiresKey && door.keyType) {
                // Check if player has the required key
                if (this.playerHasKey(player, door.keyType)) {
                    this.unlockDoor(k, door, player);
                    return true;
                } else {
                    this.showMessage(k, `The door is locked. You need a ${door.keyType}.`);
                    return false;
                }
            } else {
                this.showMessage(k, "The door is locked.");
                return false;
            }
        }
        
        // Toggle door state
        if (door.isOpen) {
            this.closeDoor(k, door, player);
        } else {
            this.openDoor(k, door, player);
        }
        
        return true;
    },
    
    // Open a door
    openDoor(k, door, player) {
        if (!door || !door.exists()) return false;
        
        console.log(`🚪 Opening door at (${door.gridX}, ${door.gridY}) - BEFORE: isOpen=${door.isOpen}, solid=${door.solid}`);
        door.isOpen = true;
        door.solid = false;
        door.walkable = true;
        console.log(`🚪 Opening door at (${door.gridX}, ${door.gridY}) - AFTER: isOpen=${door.isOpen}, solid=${door.solid}`);
        
        // Update visual appearance
        this.updateDoorVisual(k, door);
        
        // Add opening animation effect
        this.createOpenEffect(k, door);
        
        // Show message
        this.showMessage(k, "You open the door.");
        
        // Play sound effect
        this.playDoorSound(k, 'open');
        
        console.log(`Door at (${door.gridX}, ${door.gridY}) opened`);
        return true;
    },
    
    // Close a door
    closeDoor(k, door, player) {
        if (!door || !door.exists()) return false;
        
        // Check if anything is blocking the door
        if (this.isDoorBlocked(k, door)) {
            this.showMessage(k, "Something is blocking the door.");
            return false;
        }
        
        console.log(`🚪 Closing door at (${door.gridX}, ${door.gridY}) - BEFORE: isOpen=${door.isOpen}, solid=${door.solid}`);
        door.isOpen = false;
        door.solid = true;
        door.walkable = false;
        console.log(`🚪 Closing door at (${door.gridX}, ${door.gridY}) - AFTER: isOpen=${door.isOpen}, solid=${door.solid}`);
        
        // Update visual appearance
        this.updateDoorVisual(k, door);
        
        // Add closing animation effect
        this.createCloseEffect(k, door);
        
        // Show message
        this.showMessage(k, "You close the door.");
        
        // Play sound effect
        this.playDoorSound(k, 'close');
        
        console.log(`Door at (${door.gridX}, ${door.gridY}) closed`);
        return true;
    },
    
    // Unlock a door with a key
    unlockDoor(k, door, player) {
        if (!door || !door.exists()) return false;
        
        door.locked = false;
        
        // Update visual appearance
        this.updateDoorVisual(k, door);
        
        // Add unlock effect
        this.createUnlockEffect(k, door);
        
        // Show message
        this.showMessage(k, `You unlock the door with the ${door.keyType}.`);
        
        // Play unlock sound
        this.playDoorSound(k, 'unlock');
        
        // Remove key from player inventory (if inventory system exists)
        this.removeKeyFromPlayer(player, door.keyType);
        
        console.log(`Door at (${door.gridX}, ${door.gridY}) unlocked`);
        return true;
    },
    
    // Check if door is blocked by entities
    isDoorBlocked(k, door) {
        if (!door || !door.exists()) return false;
        
        // Get all entities at door position
        const entities = k.get().filter(obj => {
            if (!obj.pos || obj === door) return false;
            
            // Check if entity is at door position
            const entityGridX = Math.floor(obj.pos.x / 32);
            const entityGridY = Math.floor(obj.pos.y / 32);
            
            return entityGridX === door.gridX && entityGridY === door.gridY;
        });
        
        // Filter out non-blocking entities (items, effects, etc.)
        const blockingEntities = entities.filter(entity => {
            return entity.is && (entity.is("player") || entity.is("enemy"));
        });
        
        return blockingEntities.length > 0;
    },
    
    // Check if player has required key
    playerHasKey(player, keyType) {
        // Check if inventory system exists
        if (typeof window !== 'undefined' && window.inventory) {
            return window.inventory.hasItem(keyType);
        }
        
        // Fallback: check player properties
        if (player.keys && Array.isArray(player.keys)) {
            return player.keys.includes(keyType);
        }
        
        return false;
    },
    
    // Remove key from player
    removeKeyFromPlayer(player, keyType) {
        // Use inventory system if available
        if (typeof window !== 'undefined' && window.inventory) {
            window.inventory.removeItem(keyType, 1);
            return;
        }
        
        // Fallback: remove from player keys array
        if (player.keys && Array.isArray(player.keys)) {
            const index = player.keys.indexOf(keyType);
            if (index > -1) {
                player.keys.splice(index, 1);
            }
        }
    },
    
    // Create opening animation effect
    createOpenEffect(k, door) {
        if (!door || !door.exists()) return;
        
        // Create sparkle effect
        const sparkle = k.add([
            k.rect(4, 4),
            k.color(255, 255, 150),
            k.pos(door.pos.x, door.pos.y),
            k.anchor("center"),
            k.opacity(1),
            k.z(10),
            k.lifespan(0.5)
        ]);
        
        // Animate sparkle
        sparkle.onUpdate(() => {
            if (sparkle.exists()) {
                sparkle.opacity = Math.max(0, sparkle.opacity - 2 * k.dt());
            }
        });
    },
    
    // Create closing animation effect
    createCloseEffect(k, door) {
        if (!door || !door.exists()) return;
        
        // Create dust effect
        const dust = k.add([
            k.rect(6, 6),
            k.color(120, 100, 80),
            k.pos(door.pos.x, door.pos.y),
            k.anchor("center"),
            k.opacity(0.7),
            k.z(10),
            k.lifespan(0.3)
        ]);
        
        // Animate dust
        dust.onUpdate(() => {
            if (dust.exists()) {
                dust.opacity = Math.max(0, dust.opacity - 3 * k.dt());
            }
        });
    },
    
    // Create unlock animation effect
    createUnlockEffect(k, door) {
        if (!door || !door.exists()) return;
        
        // Create golden glow effect
        const glow = k.add([
            k.rect(8, 8),
            k.color(255, 215, 0),
            k.pos(door.pos.x, door.pos.y),
            k.anchor("center"),
            k.opacity(1),
            k.z(10),
            k.lifespan(1.0)
        ]);
        
        // Animate glow
        glow.onUpdate(() => {
            if (glow.exists()) {
                glow.opacity = Math.max(0, glow.opacity - k.dt());
                glow.scale = k.vec2(1 + (1 - glow.opacity) * 0.5);
            }
        });
    },
    
    // Show message to player
    showMessage(k, message) {
        // Use message system if available
        if (typeof window !== 'undefined' && window.MessageSystem) {
            window.MessageSystem.addMessage(message, 'system');
            return;
        }
        
        // Fallback: console log
        console.log(`Door Message: ${message}`);
    },
    
    // Play door sound effect
    playDoorSound(k, soundType) {
        // TODO: Implement sound system integration
        console.log(`Playing door sound: ${soundType}`);
    },
    
    // Get all doors in the level
    getAllDoors(k) {
        return k.get("door");
    },
    
    // Get door at specific position
    getDoorAt(k, gridX, gridY) {
        const doors = this.getAllDoors(k);
        return doors.find(door => door.gridX === gridX && door.gridY === gridY);
    },
    
    // Check if position has a door
    hasDoorAt(k, gridX, gridY) {
        return this.getDoorAt(k, gridX, gridY) !== undefined;
    }
};

// Expose to global for non-module access
if (typeof window !== 'undefined') {
    window.DoorEntity = DoorEntity;
}
