/**
 * Pickup System for Castles of the Wind Clone
 * Handles item pickup mechanics, ground items, and item spawning
 */

class PickupSystem {
    constructor(k) {
        this.k = k;
        this.groundItems = new Map(); // Track ground items by ID
        this.nextItemId = 1;
        
        console.log("🎒 Pickup System initialized");
    }
    
    // Create a ground item at specified position
    createGroundItem(itemData, x, y, quantity = 1) {
        if (!itemData) {
            console.error("Cannot create ground item: invalid item data");
            return null;
        }
        
        const itemId = `ground_item_${this.nextItemId++}`;
        
        // Create item component
        const item = window.ItemComponent.create(itemData);
        
        // Only set stack quantity if item is stackable, otherwise always 1
        if (item.stackable) {
            item.currentStack = quantity;
        } else {
            item.currentStack = 1;
            // For non-stackable items with quantity > 1, we should create multiple ground items
            // But for now, we'll just create one item and warn
            if (quantity > 1) {
                console.warn(`⚠️ Attempted to create non-stackable ground item ${item.name} with quantity ${quantity}. Creating single item instead.`);
            }
        }
        
        // Determine sprite and color
        const sprite = item.sprite || "item_generic";
        const color = item.color || [255, 255, 255];
        
        // Create Kaplay game object for ground item
        const groundItem = this.k.add([
            this.k.sprite(sprite),
            this.k.pos(x, y),
            this.k.area({ width: 16, height: 16 }),
            this.k.anchor("center"),
            this.k.color(...color),
            this.k.z(10), // Above floor tiles
            "ground_item",
            {
                itemId: itemId,
                itemData: item,
                pickupRadius: 24,
                bobOffset: 0,
                bobSpeed: 2,
                glowIntensity: 0,
                glowDirection: 1,
                
                // Pickup interaction
                canPickup: true,
                pickupCooldown: 0,
                
                // Visual effects
                showTooltip: false,
                tooltipText: item.getTooltipText(),
                
                // Animation state
                update() {
                    // Bob animation
                    this.bobOffset += this.bobSpeed * this.k.dt();
                    const bobAmount = Math.sin(this.bobOffset) * 2;
                    this.pos.y = y + bobAmount;
                    
                    // Glow effect for rare items
                    if (item.rarity !== "common") {
                        this.glowIntensity += this.glowDirection * 2 * this.k.dt();
                        if (this.glowIntensity >= 1) {
                            this.glowIntensity = 1;
                            this.glowDirection = -1;
                        } else if (this.glowIntensity <= 0) {
                            this.glowIntensity = 0;
                            this.glowDirection = 1;
                        }
                        
                        // Apply glow effect
                        const glowAmount = 0.3 + (this.glowIntensity * 0.7);
                        this.color = this.k.rgb(
                            color[0] * glowAmount,
                            color[1] * glowAmount,
                            color[2] * glowAmount
                        );
                    }
                    
                    // Handle pickup cooldown
                    if (this.pickupCooldown > 0) {
                        this.pickupCooldown -= this.k.dt();
                    }
                }
            }
        ]);
        
        // Store reference
        this.groundItems.set(itemId, {
            gameObject: groundItem,
            item: item,
            position: { x, y }
        });
        
        // Set up pickup collision
        groundItem.onCollide("player", (player) => {
            this.attemptPickup(itemId, player);
        });
        
        // Mouse hover for tooltip
        groundItem.onHover(() => {
            groundItem.showTooltip = true;
        });
        
        groundItem.onHoverEnd(() => {
            groundItem.showTooltip = false;
        });
        
        // Click to pickup
        groundItem.onClick(() => {
            const players = this.k.get("player");
            if (players.length > 0) {
                this.attemptPickup(itemId, players[0]);
            }
        });
        
        return groundItem;
    }
    
    // Attempt to pickup an item
    attemptPickup(itemId, player) {
        const groundItemData = this.groundItems.get(itemId);
        if (!groundItemData || !groundItemData.gameObject.canPickup) {
            return false;
        }
        
        const groundItem = groundItemData.gameObject;
        const item = groundItemData.item;
        
        // Check pickup cooldown
        if (groundItem.pickupCooldown > 0) {
            return false;
        }
        
        // Check distance
        const distance = player.pos.dist(groundItem.pos);
        if (distance > groundItem.pickupRadius) {
            return false;
        }
        
        // Get inventory system
        const inventory = this.getInventorySystem();
        if (!inventory) {
            console.error("No inventory system found");
            return false;
        }
        
        // Attempt to add item to inventory
        const result = inventory.addItem(item, item.currentStack);
        
        if (result.success) {
            // Show pickup message
            this.showPickupMessage(item, player.pos);
            
            // Play pickup sound
            this.playPickupSound(item);
            
            // Create pickup effect
            this.createPickupEffect(groundItem.pos, item);
            
            // Remove ground item
            this.removeGroundItem(itemId);
            
            // Notify message system
            if (window.MessageUI) {
                window.MessageUI.addMessage(
                    `Picked up ${item.getDisplayName()}`,
                    "success"
                );
            }
            
            return true;
        } else {
            // Show failure message
            if (window.MessageUI) {
                window.MessageUI.addMessage(result.message, "warning");
            }
            
            // Set pickup cooldown to prevent spam
            groundItem.pickupCooldown = 1.0;
            return false;
        }
    }
    
    // Remove ground item
    removeGroundItem(itemId) {
        const groundItemData = this.groundItems.get(itemId);
        if (groundItemData) {
            groundItemData.gameObject.destroy();
            this.groundItems.delete(itemId);
        }
    }
    
    // Show pickup message
    showPickupMessage(item, position) {
        const message = this.k.add([
            this.k.text(`+${item.getDisplayName()}`),
            this.k.pos(position.x, position.y - 20),
            this.k.anchor("center"),
            this.k.scale(0.3),
            this.k.color(100, 255, 100),
            this.k.opacity(1),
            this.k.z(100),
            this.k.lifespan(2),
            {
                update() {
                    this.pos.y -= 30 * this.k.dt();
                    this.opacity = Math.max(0, this.opacity - this.k.dt());
                }
            }
        ]);
        
        // Initialize scale property
        message.scale = this.k.vec2(1);
        
        // Animate message
        this.k.tween(
            message.scale,
            this.k.vec2(1.2),
            0.2,
            (val) => message.scale = val,
            this.k.easings.easeOutBack
        ).then(() => {
            this.k.tween(
                message.scale,
                this.k.vec2(1),
                0.3,
                (val) => message.scale = val,
                this.k.easings.easeInBack
            );
        });
    }
    
    // Play pickup sound
    playPickupSound(item) {
        // Different sounds for different item types
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
        
        // Play sound if available
        try {
            this.k.play(soundName, { volume: 0.3 });
        } catch (e) {
            // Fallback to generic sound or no sound
            console.log(`Sound ${soundName} not found`);
        }
    }
    
    // Create pickup visual effect
    createPickupEffect(position, item) {
        // Sparkle effect
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 50 + Math.random() * 30;
            
            const sparkle = this.k.add([
                this.k.rect(2, 2),
                this.k.pos(position.x, position.y),
                this.k.anchor("center"),
                this.k.color(...(item.color || [255, 255, 255])),
                this.k.opacity(1),
                this.k.z(50),
                this.k.lifespan(0.8),
                {
                    velocity: this.k.vec2(
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed
                    ),
                    
                    update() {
                        this.pos = this.pos.add(this.velocity.scale(this.k.dt()));
                        this.velocity = this.velocity.scale(0.95); // Friction
                        this.opacity = Math.max(0, this.opacity - this.k.dt() * 1.5);
                    }
                }
            ]);
        }
        
        // Ring effect for rare items
        if (item.rarity !== "common") {
            const ring = this.k.add([
                this.k.circle(5),
                this.k.pos(position.x, position.y),
                this.k.anchor("center"),
                this.k.color(...(window.ItemComponent.RARITY_COLORS[item.rarity] || [255, 255, 255])),
                this.k.outline(2),
                this.k.opacity(1),
                this.k.z(45),
                this.k.lifespan(1),
                {
                    update() {
                        this.radius += 40 * this.k.dt();
                        this.opacity = Math.max(0, this.opacity - this.k.dt());
                    }
                }
            ]);
        }
    }
    
    // Drop item from inventory
    dropItem(itemData, position, quantity = 1) {
        // Add some randomness to drop position
        const dropX = position.x + (Math.random() - 0.5) * 32;
        const dropY = position.y + (Math.random() - 0.5) * 32;
        
        return this.createGroundItem(itemData, dropX, dropY, quantity);
    }
    
    // Spawn random loot
    spawnRandomLoot(position, level = 1, count = 1) {
        const loot = window.ItemData.createRandomLoot(level, count);
        const groundItems = [];
        
        loot.forEach((itemData, index) => {
            // Spread items around the spawn point
            const angle = (index / loot.length) * Math.PI * 2;
            const distance = 16 + Math.random() * 16;
            const x = position.x + Math.cos(angle) * distance;
            const y = position.y + Math.sin(angle) * distance;
            
            const groundItem = this.createGroundItem(itemData, x, y);
            if (groundItem) {
                groundItems.push(groundItem);
            }
        });
        
        return groundItems;
    }
    
    // Spawn specific items
    spawnItems(items, position) {
        const groundItems = [];
        
        items.forEach((itemInfo, index) => {
            const itemData = typeof itemInfo === 'string' 
                ? window.ItemData.getItemById(itemInfo)
                : itemInfo.itemData || itemInfo;
            const quantity = itemInfo.quantity || 1;
            
            if (itemData) {
                // Spread items around the spawn point
                const angle = (index / items.length) * Math.PI * 2;
                const distance = 12 + Math.random() * 12;
                const x = position.x + Math.cos(angle) * distance;
                const y = position.y + Math.sin(angle) * distance;
                
                const groundItem = this.createGroundItem(itemData, x, y, quantity);
                if (groundItem) {
                    groundItems.push(groundItem);
                }
            }
        });
        
        return groundItems;
    }
    
    // Get all ground items near position
    getGroundItemsNear(position, radius = 50) {
        const nearbyItems = [];
        
        this.groundItems.forEach((itemData, itemId) => {
            const distance = Math.sqrt(
                Math.pow(itemData.position.x - position.x, 2) +
                Math.pow(itemData.position.y - position.y, 2)
            );
            
            if (distance <= radius) {
                nearbyItems.push({
                    id: itemId,
                    item: itemData.item,
                    gameObject: itemData.gameObject,
                    distance: distance
                });
            }
        });
        
        return nearbyItems.sort((a, b) => a.distance - b.distance);
    }
    
    // Auto-pickup nearby items
    autoPickupNear(player, radius = 32) {
        const nearbyItems = this.getGroundItemsNear(player.pos, radius);
        let pickedUp = 0;
        
        nearbyItems.forEach(itemInfo => {
            if (this.attemptPickup(itemInfo.id, player)) {
                pickedUp++;
            }
        });
        
        return pickedUp;
    }
    
    // Get inventory system reference
    getInventorySystem() {
        if (window.GameState && window.GameState.inventory) {
            return window.GameState.inventory;
        }
        
        // Try to find inventory system in global scope
        if (window.inventory) {
            return window.inventory;
        }
        
        return null;
    }
    
    // Update system (called from main game loop)
    update() {
        // Update ground item tooltips
        this.groundItems.forEach((itemData) => {
            const groundItem = itemData.gameObject;
            
            if (groundItem.showTooltip) {
                // Show tooltip near mouse or item
                // This would integrate with a tooltip UI system
                if (window.TooltipUI) {
                    window.TooltipUI.show(groundItem.tooltipText, groundItem.pos);
                }
            }
        });
    }
    
    // Cleanup all ground items
    cleanup() {
        this.groundItems.forEach((itemData) => {
            itemData.gameObject.destroy();
        });
        this.groundItems.clear();
    }
    
    // Debug methods
    debugSpawnTestItems(position) {
        const testItems = [
            "health_potion",
            "sword", 
            "leather_armor",
            "gold_coin",
            "magic_sword"
        ];
        
        testItems.forEach((itemId, index) => {
            const itemData = window.ItemData.getItemById(itemId);
            if (itemData) {
                const x = position.x + (index - 2) * 32;
                const y = position.y;
                this.createGroundItem(itemData, x, y);
            }
        });
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.PickupSystem = PickupSystem;
}
