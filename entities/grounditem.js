/**
 * Ground Item Entity for Castles of the Wind Clone
 * Handles items that appear on the ground and can be picked up
 */

class GroundItemEntity {
    static create(k, itemData, x, y, quantity = 1) {
        if (!itemData) {
            console.error("Cannot create ground item: invalid item data");
            return null;
        }
        
        // Create item component
        const item = window.ItemComponent.create(itemData);
        
        // Only set stack quantity if item is stackable, otherwise always 1
        if (item.stackable) {
            item.currentStack = quantity;
        } else {
            item.currentStack = 1;
            if (quantity > 1) {
                console.warn(`⚠️ Attempted to create non-stackable ground item ${item.name} with quantity ${quantity}. Creating single item instead.`);
            }
        }
        
        // Determine visual properties
        const sprite = item.sprite || "item_generic";
        const color = item.color || [255, 255, 255];
        const size = item.iconSize || 16;
        
        // Create the ground item game object
        const groundItem = k.add([
            k.rect(size, size),
            k.pos(x, y),
            k.area({ width: size, height: size }),
            k.anchor("center"),
            k.color(...color),
            k.z(10), // Above floor tiles
            "ground_item",
            "item", // For collision detection
            {
                // Item data - store both original and component
                originalItemData: itemData, // Original raw item data for pickup
                itemComponent: item,        // ItemComponent for display
                itemData: item,            // Keep for compatibility
                itemId: item.itemId,
                
                // Visual properties
                originalY: y,
                bobOffset: Math.random() * Math.PI * 2, // Random start phase
                bobSpeed: 1.5 + Math.random() * 0.5, // Slight variation in bob speed
                bobAmount: 2,
                
                // Glow effect for rare items
                glowIntensity: 0,
                glowDirection: 1,
                glowSpeed: 2,
                
                // Pickup properties
                pickupRadius: 24,
                canPickup: true,
                pickupCooldown: 0,
                
                // Tooltip
                showTooltip: false,
                tooltipText: item.getTooltipText(),
                
                // Lifetime (optional - items can despawn after time)
                lifetime: -1, // -1 means never despawn
                maxLifetime: 300, // 5 minutes default
                
                // Animation and update
                update() {
                    const dt = k.dt();
                    
                    // Bob animation
                    this.bobOffset += this.bobSpeed * dt;
                    const bobY = Math.sin(this.bobOffset) * this.bobAmount;
                    this.pos.y = this.originalY + bobY;
                    
                    // Glow effect for rare items
                    if (item.rarity !== "common") {
                        this.glowIntensity += this.glowDirection * this.glowSpeed * dt;
                        
                        if (this.glowIntensity >= 1) {
                            this.glowIntensity = 1;
                            this.glowDirection = -1;
                        } else if (this.glowIntensity <= 0) {
                            this.glowIntensity = 0;
                            this.glowDirection = 1;
                        }
                        
                        // Apply glow effect to color
                        const glowMultiplier = 0.7 + (this.glowIntensity * 0.3);
                        this.color = k.rgb(
                            color[0] * glowMultiplier,
                            color[1] * glowMultiplier,
                            color[2] * glowMultiplier
                        );
                    }
                    
                    // Handle pickup cooldown
                    if (this.pickupCooldown > 0) {
                        this.pickupCooldown -= dt;
                    }
                    
                    // Handle lifetime (if set)
                    if (this.lifetime > 0) {
                        this.lifetime -= dt;
                        
                        // Start flashing when near expiration
                        if (this.lifetime < 30) { // Last 30 seconds
                            const flashSpeed = 5 + (30 - this.lifetime) * 0.2; // Flash faster as time runs out
                            const flash = Math.sin(this.lifetime * flashSpeed) > 0;
                            this.opacity = flash ? 1 : 0.3;
                        }
                        
                        // Despawn when lifetime expires
                        if (this.lifetime <= 0) {
                            this.despawn();
                        }
                    }
                },
                
                // Attempt pickup by player
                attemptPickup(player) {
                    if (!this.canPickup || this.pickupCooldown > 0) {
                        return false;
                    }
                    
                    // Check distance
                    const distance = player.pos.dist(this.pos);
                    if (distance > this.pickupRadius) {
                        return false;
                    }
                    
                    // Get inventory system
                    const inventory = window.inventory || (window.GameState && window.GameState.inventory);
                    if (!inventory) {
                        console.error("No inventory system found");
                        return false;
                    }
                    
                    // Check if this is a currency item (gold coins)
                    if (this.originalItemData.isCurrency) {
                        // Add gold to player's gold counter
                        const goldAmount = (this.originalItemData.goldValue || 1) * this.itemComponent.currentStack;
                        inventory.addGold(goldAmount);
                        
                        const result = {
                            success: true,
                            message: `Picked up ${goldAmount} gold`,
                            isCurrency: true
                        };
                        
                        // Handle success case for currency
                        this.createPickupEffects();
                        this.playPickupSound();
                        this.showPickupMessage();
                        
                        // Award experience if item has experience value
                        if (this.itemComponent.experience && player.gainExperience) {
                            player.gainExperience(this.itemComponent.experience * this.itemComponent.currentStack);
                        }
                        
                        // Show pickup message
                        if (window.MessageUI) {
                            let message = `Picked up ${goldAmount} gold`;
                            if (this.itemComponent.experience) {
                                message += ` (+${this.itemComponent.experience * this.itemComponent.currentStack} XP)`;
                            }
                            window.MessageUI.addMessage(message, "success");
                        }
                        
                        // Remove the ground item
                        this.destroy();
                        return true;
                    }
                    
                    // Regular item - attempt to add to inventory using original item data
                    const result = inventory.addItem(this.originalItemData, this.itemComponent.currentStack);
                    
                    if (result.success) {
                        // Success - create pickup effects and remove item
                        this.createPickupEffects();
                        this.playPickupSound();
                        this.showPickupMessage();
                        
                        // Award experience if item has experience value
                        if (this.itemData.experience && player.gainExperience) {
                            player.gainExperience(this.itemData.experience);
                        }
                        
                        // Notify systems
                        if (window.MessageUI) {
                            let message = `Picked up ${this.itemData.getDisplayName()}`;
                            if (this.itemData.experience) {
                                message += ` (+${this.itemData.experience} XP)`;
                            }
                            window.MessageUI.addMessage(message, "success");
                        }
                        
                        // Remove from world
                        this.destroy();
                        return true;
                    } else {
                        // Failed - show message and set cooldown
                        if (window.MessageUI) {
                            window.MessageUI.addMessage(result.message, "warning");
                        }
                        
                        this.pickupCooldown = 1.0; // 1 second cooldown
                        return false;
                    }
                },
                
                // Create visual effects when picked up
                createPickupEffects() {
                    // Sparkle particles
                    for (let i = 0; i < 8; i++) {
                        const angle = (i / 8) * Math.PI * 2;
                        const speed = 50 + Math.random() * 30;
                        
                        k.add([
                            k.rect(2, 2),
                            k.pos(this.pos.x, this.pos.y),
                            k.anchor("center"),
                            k.color(...color),
                            k.opacity(1),
                            k.z(50),
                            k.lifespan(0.8),
                            {
                                velocity: k.vec2(
                                    Math.cos(angle) * speed,
                                    Math.sin(angle) * speed
                                ),
                                
                                update() {
                                    this.pos = this.pos.add(this.velocity.scale(k.dt()));
                                    this.velocity = this.velocity.scale(0.95); // Friction
                                    this.opacity = Math.max(0, this.opacity - k.dt() * 1.5);
                                }
                            }
                        ]);
                    }
                    
                    // Ring effect for rare items
                    if (item.rarity !== "common") {
                        const rarityColor = window.ItemComponent.RARITY_COLORS[item.rarity] || color;
                        
                        k.add([
                            k.circle(5),
                            k.pos(this.pos.x, this.pos.y),
                            k.anchor("center"),
                            k.color(...rarityColor),
                            k.opacity(1),
                            k.outline(2),
                            k.z(45),
                            k.lifespan(1),
                            {
                                update() {
                                    this.radius += 40 * k.dt();
                                    this.opacity = Math.max(0, this.opacity - k.dt());
                                }
                            }
                        ]);
                    }
                },
                
                // Play pickup sound
                playPickupSound() {
                    let soundName = "pickup_generic";
                    
                    switch (item.category) {
                        case "weapon":
                        case "armor":
                            soundName = "pickup_equipment";
                            break;
                        case "potion":
                            soundName = "pickup_potion";
                            break;
                        case "treasure":
                            soundName = "pickup_treasure";
                            break;
                        case "key":
                            soundName = "pickup_key";
                            break;
                    }
                    
                    try {
                        k.play(soundName, { volume: 0.3 });
                    } catch (e) {
                        // Sound not found, continue silently
                    }
                },
                
                // Show pickup message
                showPickupMessage() {
                    const message = k.add([
                        k.text(`+${this.itemData.getDisplayName()}`),
                        k.pos(this.pos.x, this.pos.y - 20),
                        k.anchor("center"),
                        k.scale(0.3),
                        k.color(100, 255, 100),
                        k.opacity(1),
                        k.z(100),
                        k.lifespan(2),
                        {
                            update() {
                                this.pos.y -= 30 * k.dt();
                                this.opacity = Math.max(0, this.opacity - k.dt());
                            }
                        }
                    ]);
                    
                    // Initialize scale property
                    message.scale = k.vec2(1);
                    
                    // Animate message scale
                    k.tween(
                        message.scale,
                        k.vec2(1.2),
                        0.2,
                        (val) => message.scale = val,
                        k.easings.easeOutBack
                    ).then(() => {
                        k.tween(
                            message.scale,
                            k.vec2(1),
                            0.3,
                            (val) => message.scale = val,
                            k.easings.easeInBack
                        );
                    });
                },
                
                // Despawn the item (with effects)
                despawn() {
                    // Create despawn effect
                    k.add([
                        k.rect(size + 4, size + 4),
                        k.pos(this.pos.x, this.pos.y),
                        k.anchor("center"),
                        k.color(100, 100, 100),
                        k.opacity(0.5),
                        k.z(this.z + 1),
                        k.lifespan(0.5),
                        {
                            update() {
                                this.scale = this.scale.scale(1 + k.dt() * 2);
                                this.opacity = Math.max(0, this.opacity - k.dt() * 2);
                            }
                        }
                    ]);
                    
                    this.destroy();
                },
                
                // Set lifetime for despawning
                setLifetime(seconds) {
                    this.lifetime = seconds;
                },
                
                // Get item info
                getItemInfo() {
                    return {
                        item: this.itemData,
                        position: { x: this.pos.x, y: this.pos.y },
                        canPickup: this.canPickup
                    };
                }
            }
        ]);
        
        // Set up collision detection with player
        groundItem.onCollide("player", (player) => {
            groundItem.attemptPickup(player);
        });
        
        // Set up mouse interactions
        groundItem.onHover(() => {
            groundItem.showTooltip = true;
            if (window.TooltipUI) {
                window.TooltipUI.showItemTooltip(groundItem.itemData, groundItem.pos);
            }
        });
        
        groundItem.onHoverEnd(() => {
            groundItem.showTooltip = false;
            if (window.TooltipUI) {
                window.TooltipUI.hide();
            }
        });
        
        groundItem.onClick(() => {
            // Try to pickup on click
            const players = k.get("player");
            if (players.length > 0) {
                groundItem.attemptPickup(players[0]);
            }
        });
        
        return groundItem;
    }
    
    // Create multiple ground items from loot table
    static createLoot(k, lootItems, centerX, centerY, spreadRadius = 32) {
        const groundItems = [];
        
        lootItems.forEach((lootItem, index) => {
            let itemData, quantity = 1;
            
            // Handle different loot item formats
            if (typeof lootItem === 'string') {
                itemData = window.ItemData.getItemById(lootItem);
            } else if (lootItem.itemData) {
                itemData = lootItem.itemData;
                quantity = lootItem.quantity || 1;
            } else if (lootItem.item) {
                itemData = window.ItemData.getItemById(lootItem.item);
                quantity = lootItem.quantity || 1;
            } else {
                itemData = lootItem;
            }
            
            if (itemData) {
                // Calculate position with spread
                const angle = (index / lootItems.length) * Math.PI * 2;
                const distance = Math.random() * spreadRadius;
                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;
                
                const groundItem = GroundItemEntity.create(k, itemData, x, y, quantity);
                if (groundItem) {
                    groundItems.push(groundItem);
                }
            }
        });
        
        return groundItems;
    }
    
    // Create random loot at position
    static createRandomLoot(k, x, y, level = 1, count = 1) {
        const lootItems = window.ItemData.createRandomLoot(level, count);
        return GroundItemEntity.createLoot(k, lootItems, x, y);
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.GroundItemEntity = GroundItemEntity;
}
