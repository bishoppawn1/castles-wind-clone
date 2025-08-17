// Chest Entity for Castles of the Wind Clone
// Implements chests using Kaplay's sprite objects with interaction areas

const ChestEntity = {
    k: null,

    init(kaboomContext) {
        this.k = kaboomContext;
        console.log('ChestEntity initialized');
    },

    // Create a chest at specified grid position
    createChest(gridX, gridY, chestData = {}) {
        const worldX = gridX * 32 + 16;
        const worldY = gridY * 32 + 16;

        const chest = this.k.add([
            this.k.rect(28, 20),
            this.k.color(139, 69, 19), // Brown chest color
            this.k.pos(worldX, worldY),
            this.k.anchor("center"),
            this.k.area(),
            this.k.z(10),
            "chest",
            "interactive",
            {
                gridX: gridX,
                gridY: gridY,
                isOpen: chestData.isOpen || false,
                contents: chestData.contents || this.generateRandomContents(),
                chestType: chestData.type || 'wooden',
                locked: chestData.locked || false,
                keyRequired: chestData.keyRequired || null,
                openedBy: null, // Track who opened it
                interactionRange: 40,
                name: chestData.name || 'Wooden Chest'
            }
        ]);

        // Add chest lid (visual indicator of open/closed state)
        const lid = this.k.add([
            this.k.rect(28, 8),
            this.k.color(chest.isOpen ? [160, 82, 45] : [101, 67, 33]), // Lighter when open
            this.k.pos(worldX, worldY - 6),
            this.k.anchor("center"),
            this.k.z(11),
            "chest_lid",
            {
                parentChest: chest,
                gridX: gridX,
                gridY: gridY
            }
        ]);

        // Add lock indicator if locked
        if (chest.locked) {
            this.k.add([
                this.k.rect(8, 8),
                this.k.color(255, 215, 0), // Gold lock
                this.k.pos(worldX + 10, worldY - 2),
                this.k.anchor("center"),
                this.k.z(12),
                "chest_lock",
                {
                    parentChest: chest,
                    gridX: gridX,
                    gridY: gridY
                }
            ]);
        }

        // Add interaction hint when player is nearby
        chest.onUpdate(() => {
            const player = this.k.get("player")[0];
            if (player) {
                const distance = chest.pos.dist(player.pos);
                const existingHint = this.k.get("chest_hint").find(h => 
                    h.parentChest === chest
                );

                if (distance <= chest.interactionRange && !existingHint) {
                    this.showInteractionHint(chest);
                } else if (distance > chest.interactionRange && existingHint) {
                    existingHint.destroy();
                }
            }
        });

        console.log(`📦 Created ${chest.chestType} chest at (${gridX}, ${gridY})`);
        return chest;
    },

    // Show interaction hint
    showInteractionHint(chest) {
        const hintText = chest.locked ? 
            (chest.keyRequired ? `🔒 Locked (${chest.keyRequired} required)` : "🔒 Locked") :
            (chest.isOpen ? "📦 Empty chest" : "📦 Press E to open");

        this.k.add([
            this.k.text(hintText, { size: 10 }),
            this.k.color(255, 255, 255),
            this.k.pos(chest.pos.x, chest.pos.y - 25),
            this.k.anchor("center"),
            this.k.z(100),
            this.k.opacity(0.9),
            "chest_hint",
            "ui_element",
            {
                parentChest: chest
            }
        ]);
    },

    // Handle chest interaction
    interactWithChest(chest, player) {
        console.log('🎁 DEBUG: ChestEntity.interactWithChest called!');
        
        if (!chest || !player) {
            console.log('❌ Chest interaction failed: missing chest or player');
            return false;
        }

        console.log(`📦 Attempting to open chest:`, {
            type: chest.chestType,
            isOpen: chest.isOpen,
            locked: chest.locked,
            position: `(${chest.gridX}, ${chest.gridY})`,
            contents: chest.contents
        });

        // Check if chest is already open
        if (chest.isOpen) {
            this.showMessage("This chest is already empty.");
            return false;
        }

        // Check if chest is locked
        if (chest.locked) {
            return this.handleLockedChest(chest, player);
        }

        // Open the chest
        return this.openChest(chest, player);
    },

    // Handle locked chest interaction
    handleLockedChest(chest, player) {
        if (!chest.keyRequired) {
            this.showMessage("This chest is locked and cannot be opened.");
            return false;
        }

        // Check if player has the required key
        const hasKey = this.checkPlayerHasKey(player, chest.keyRequired);
        
        if (hasKey) {
            this.showMessage(`Using ${chest.keyRequired} to unlock chest...`);
            chest.locked = false;
            
            // Remove lock visual
            const lock = this.k.get("chest_lock").find(l => l.parentChest === chest);
            if (lock) lock.destroy();
            
            // Use the key (remove from inventory)
            this.useKey(player, chest.keyRequired);
            
            // Open the chest
            return this.openChest(chest, player);
        } else {
            this.showMessage(`This chest requires a ${chest.keyRequired} to open.`);
            return false;
        }
    },

    // Open chest and give contents to player
    openChest(chest, player) {
        chest.isOpen = true;
        chest.openedBy = player;

        // Update visual state
        this.updateChestVisuals(chest);

        // Give contents to player
        this.giveContentsToPlayer(chest, player);

        // Play opening effect
        this.playOpeningEffect(chest);

        // Emit chest opened event
        console.log('🎯 DEBUG: About to trigger chest_opened event for treasure hunter achievement');
        console.log('🎯 DEBUG: this.k available:', !!this.k);
        console.log('🎯 DEBUG: this.k.trigger available:', !!(this.k && this.k.trigger));
        console.log('🎯 DEBUG: kaplay available:', typeof kaplay !== 'undefined');
        console.log('🎯 DEBUG: window.k available:', !!window.k);
        
        // Try multiple ways to trigger the event
        let eventTriggered = false;
        
        // Try using the ObjectivesSystem directly if event system fails
        if (window.ObjectivesSystem && typeof window.ObjectivesSystem.trackObjectiveProgress === 'function') {
            console.log('🎯 DEBUG: Directly calling ObjectivesSystem.trackObjectiveProgress');
            window.ObjectivesSystem.trackObjectiveProgress('chest_opened', {
                chest: chest,
                player: player,
                contents: chest.contents
            });
            eventTriggered = true;
        }
        
        // Also try the event system as backup
        if (this.k && typeof this.k.trigger === 'function') {
            console.log('🎯 DEBUG: Triggering chest_opened event via this.k.trigger');
            this.k.trigger('chest_opened', {
                chest: chest,
                player: player,
                contents: chest.contents
            });
            eventTriggered = true;
        } else if (window.k && typeof window.k.trigger === 'function') {
            console.log('🎯 DEBUG: Triggering chest_opened event via window.k.trigger');
            window.k.trigger('chest_opened', {
                chest: chest,
                player: player,
                contents: chest.contents
            });
            eventTriggered = true;
        } else if (typeof kaplay !== 'undefined' && kaplay.trigger) {
            console.log('🎯 DEBUG: Triggering chest_opened event via kaplay.trigger');
            kaplay.trigger('chest_opened', {
                chest: chest,
                player: player,
                contents: chest.contents
            });
            eventTriggered = true;
        }
        
        if (!eventTriggered) {
            console.log('❌ DEBUG: No trigger method available for chest_opened event!');
        } else {
            console.log('✅ DEBUG: chest_opened event triggered successfully');
        }

        // Update interaction hint
        this.k.destroyAll("chest_hint");

        console.log(`✅ Chest opened successfully at (${chest.gridX}, ${chest.gridY})`);
        return true;
    },

    // Update chest visuals when opened
    updateChestVisuals(chest) {
        // Update lid color to show it's open
        const lid = this.k.get("chest_lid").find(l => l.parentChest === chest);
        if (lid) {
            lid.color = this.k.color(160, 82, 45); // Lighter brown for open
        }

        // Change chest color slightly
        chest.color = this.k.color(160, 82, 45);
    },

    // Give chest contents to player
    giveContentsToPlayer(chest, player) {
        console.log(`🎁 DEBUG: giveContentsToPlayer called`, {
            chestContents: chest.contents,
            contentsLength: chest.contents?.length,
            inventorySystemExists: !!window.InventorySystem
        });
        
        if (!chest.contents || chest.contents.length === 0) {
            console.log(`📦 DEBUG: Chest has no contents`);
            this.showMessage("The chest is empty.");
            return;
        }

        let itemsReceived = [];
        
        chest.contents.forEach((item, index) => {
            console.log(`🎁 DEBUG: Processing item ${index}:`, item);
            switch (item.type) {
                case 'gold':
                    if (window.inventory) {
                        window.inventory.addGold(item.amount);
                        itemsReceived.push(`${item.amount} gold`);
                    }
                    break;
                    
                case 'item':
                    if (window.inventory) {
                        // Get proper item data from ItemData if we have an ID
                        let itemToAdd = item;
                        if (item.id && window.ItemData) {
                            const itemData = window.ItemData.getItemById(item.id);
                            console.log(`🔍 DEBUG: Looking up item ID "${item.id}":`, itemData);
                            if (itemData) {
                                itemToAdd = itemData;
                                console.log(`✅ Found item data:`, {
                                    id: itemData.id,
                                    name: itemData.name,
                                    usable: itemData.usable,
                                    consumable: itemData.consumable,
                                    category: itemData.category
                                });
                            } else {
                                console.warn(`❌ No item data found for ID: "${item.id}"`);
                            }
                        }
                        
                        const added = window.inventory.addItem(itemToAdd);
                        if (added.success) {
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
        }

        // Trigger treasure collection event for objectives
        if (this.k && typeof this.k.trigger === 'function') {
            this.k.trigger('treasure_collected', 'chest');
        } else if (typeof kaplay !== 'undefined' && kaplay.trigger) {
            kaplay.trigger('treasure_collected', 'chest');
        }
    },

    // Play chest opening effect
    playOpeningEffect(chest) {
        // Create sparkle effect
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const distance = 20;
            
            this.k.add([
                this.k.rect(4, 4),
                this.k.color(255, 255, 100),
                this.k.pos(chest.pos.add(
                    Math.cos(angle) * distance,
                    Math.sin(angle) * distance
                )),
                this.k.anchor("center"),
                this.k.z(50),
                this.k.opacity(1),
                this.k.lifespan(1),
                "chest_effect"
            ]);
        }

        // Create opening animation
        this.k.tween(chest.pos.y, chest.pos.y - 5, 0.2, (y) => {
            const lid = this.k.get("chest_lid").find(l => l.parentChest === chest);
            if (lid) lid.pos.y = y - 6;
        }, this.k.easings.easeOutQuad).onEnd(() => {
            this.k.tween(chest.pos.y - 5, chest.pos.y, 0.2, (y) => {
                const lid = this.k.get("chest_lid").find(l => l.parentChest === chest);
                if (lid) lid.pos.y = y - 6;
            }, this.k.easings.easeInQuad);
        });
    },

    // Generate random chest contents
    generateRandomContents() {
        const possibleContents = [
            { type: 'gold', amount: Math.floor(Math.random() * 50) + 10 },
            { type: 'item', id: 'health_potion', name: 'Health Potion', category: 'potion' },
            { type: 'item', id: 'mana_potion', name: 'Mana Potion', category: 'potion' },
            { type: 'item', id: 'iron_key', name: 'Iron Key', category: 'key' },
            { type: 'experience', amount: Math.floor(Math.random() * 25) + 5 }
        ];

        const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
        const contents = [];
        
        for (let i = 0; i < numItems; i++) {
            const randomItem = possibleContents[Math.floor(Math.random() * possibleContents.length)];
            contents.push({...randomItem}); // Copy to avoid reference issues
        }

        return contents;
    },

    // Check if player has required key
    checkPlayerHasKey(player, keyName) {
        if (!window.inventory) return false;
        
        const items = window.inventory.items;
        return items.some(item => item && item.name === keyName && item.category === 'key');
    },

    // Use/consume a key from player inventory
    useKey(player, keyName) {
        if (window.inventory) {
            const items = window.inventory.items;
            const keyIndex = items.findIndex(item => item && item.name === keyName && item.category === 'key');
            
            if (keyIndex !== -1) {
                window.inventory.removeItem(keyIndex, 1);
                console.log(`🔑 Used ${keyName}`);
                return true;
            }
        }
        return false;
    },

    // Show message to player
    showMessage(text) {
        if (window.MessageUI) {
            window.MessageUI.addMessage(text, 'system');
        } else {
            console.log(`💬 ${text}`);
        }
    },

    // Create multiple chests from level data
    createChestsFromLevelData(levelData) {
        if (!levelData.chests) {
            console.log('ℹ️ No chest data found in level');
            return;
        }

        console.log(`📦 Creating ${levelData.chests.length} chests for level`);
        
        levelData.chests.forEach((chestData, index) => {
            this.createChest(chestData.x, chestData.y, chestData);
        });

        console.log(`✅ Created ${levelData.chests.length} chests`);
    },

    // Get all chests in current level
    getAllChests() {
        return this.k.get("chest");
    },

    // Get chest at specific position
    getChestAt(gridX, gridY) {
        return this.k.get("chest").find(chest => 
            chest.gridX === gridX && chest.gridY === gridY
        );
    }
};

// Export for use in other systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChestEntity;
}

// Make ChestEntity globally available
if (typeof window !== 'undefined') {
    window.ChestEntity = ChestEntity;
    console.log('🎁 DEBUG: ChestEntity exposed globally');
}
