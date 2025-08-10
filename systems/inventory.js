/**
 * Inventory System for Castles of the Wind Clone
 * Manages player inventory, item storage, and weight/bulk tracking
 */

class InventorySystem {
    constructor(k, maxSlots = 60, maxWeight = 150, maxBulk = 80) {
        this.k = k;
        this.maxSlots = maxSlots;
        this.maxWeight = maxWeight;
        this.maxBulk = maxBulk;
        
        // Inventory storage
        this.items = []; // Array of item objects
        this.equipment = {}; // Equipped items by slot
        this.gold = 0;
        
        // Equipment slots (expanded like original Castles of the Wind)
        this.equipmentSlots = [
            "weapon", "shield", "armor", "helmet", 
            "boots", "gloves", "cloak", "bracers",
            "ring1", "ring2", "amulet", "belt",
            "quiver", "torch", "lantern", "spellbook"
        ];
        
        // Initialize equipment slots
        this.equipmentSlots.forEach(slot => {
            this.equipment[slot] = null;
        });
        
        console.log("📦 Inventory System initialized");
    }
    
    // Add item to inventory
    addItem(itemData, quantity = 1) {
        if (!itemData) {
            return { success: false, message: "Invalid item data" };
        }
        
        // Debug: Log the item data being added
        console.log(`📦 Adding item to inventory:`, {
            itemId: itemData.id,
            name: itemData.name,
            equipable: itemData.equipable,
            equipSlot: itemData.equipSlot,
            category: itemData.category
        });
        
        // Create or reuse item component
        // If itemData already looks like an ItemComponent instance, reuse it; otherwise create from data
        let item = null;
        if (itemData && typeof itemData === 'object' && 'itemId' in itemData && itemData.getDisplayName) {
            item = itemData;
        } else {
            item = window.ItemComponent.create(itemData);
        }
        
        // Debug: Log the created item component
        console.log(`📦 Created item component:`, {
            itemId: item.itemId,
            name: item.name,
            equipable: item.equipable,
            equipSlot: item.equipSlot,
            category: item.category
        });
        
        // Only set stack quantity if item is actually stackable
        if (item.stackable) {
            item.currentStack = quantity;
        } else {
            // Non-stackable items should always have currentStack of 1
            item.currentStack = 1;
            // If quantity > 1 for non-stackable items, we need to add them individually
            if (quantity > 1) {
                let results = [];
                for (let i = 0; i < quantity; i++) {
                    const singleItem = window.ItemComponent.create(itemData);
                    singleItem.currentStack = 1;
                    const result = this.addNewItem(singleItem);
                    results.push(result);
                    if (!result.success) break; // Stop if inventory is full
                }
                return {
                    success: results.every(r => r.success),
                    message: `Added ${results.filter(r => r.success).length}/${quantity} ${item.name}(s)`,
                    multiple: true,
                    results: results
                };
            }
        }
        
        // Check if item can stack with existing items
        if (item.stackable) {
            // Find existing item with same itemId that can stack
            const existingItem = this.items.find(invItem => {
                // Ensure the inventory slot has an item
                if (!invItem) return false;
                // Must be stackable and have same itemId
                if (!invItem.stackable || invItem.itemId !== item.itemId) {
                    return false;
                }
                
                // Use canStackWith method if available, otherwise do basic check
                if (typeof invItem.canStackWith === "function") {
                    return invItem.canStackWith(item);
                } else {
                    // Fallback: basic itemId comparison
                    return invItem.itemId === item.itemId;
                }
            });
            
            if (existingItem) {
                console.log(`📦 Stacking ${item.name} (${item.itemId}) with existing ${existingItem.name} (${existingItem.itemId})`);
                const spaceAvailable = existingItem.maxStack - existingItem.currentStack;
                const amountToAdd = Math.min(quantity, spaceAvailable);
                
                if (amountToAdd > 0) {
                    existingItem.currentStack += amountToAdd;
                    const remaining = quantity - amountToAdd;
                    
                    if (remaining > 0) {
                        // Create new stack for remaining items
                        item.currentStack = remaining;
                        return this.addNewItem(item);
                    }
                    
                    return { 
                        success: true, 
                        message: `Added ${amountToAdd} ${item.name} to existing stack`,
                        stacked: true
                    };
                }
            }
        }
        
        return this.addNewItem(item);
    }
    
    addNewItem(item) {
        // Check inventory space using used slots (since we keep null holes to preserve slot indices)
        if (this.getUsedSlots() >= this.maxSlots) {
            return { success: false, message: "Inventory is full" };
        }
        
        // Check weight and bulk limits
        const newWeight = this.getTotalWeight() + item.getTotalWeight();
        const newBulk = this.getTotalBulk() + item.getTotalBulk();
        
        if (newWeight > this.maxWeight) {
            return { success: false, message: "Too heavy to carry" };
        }
        
        if (newBulk > this.maxBulk) {
            return { success: false, message: "Too bulky to carry" };
        }
        
        // Add item to the first available empty slot
        let placed = false;
        for (let i = 0; i < this.maxSlots; i++) {
            if (!this.items[i]) {
                this.items[i] = item;
                placed = true;
                break;
            }
        }
        
        if (!placed) {
            // Fallback (should not occur if getUsedSlots check is correct)
            return { success: false, message: "Inventory is full" };
        }
        
        return { 
            success: true, 
            message: `Added ${item.getDisplayName()} to inventory`,
            item: item
        };
    }
    
    // Remove item from inventory
    removeItem(itemIndex, quantity = 1) {
        if (itemIndex < 0 || itemIndex >= this.maxSlots) {
            return { success: false, message: "Invalid item index" };
        }
        
        const item = this.items[itemIndex];
        if (!item) {
            return { success: false, message: "No item in that slot" };
        }
        
        if (quantity >= item.currentStack) {
            // Remove entire stack
            const removedItem = this.items[itemIndex];
            this.items[itemIndex] = null;
            return { 
                success: true, 
                message: `Removed ${removedItem.getDisplayName()}`,
                item: removedItem,
                removed: removedItem.currentStack
            };
        } else {
            // Remove partial stack
            item.currentStack -= quantity;
            const removedItem = item.clone();
            removedItem.currentStack = quantity;
            
            return { 
                success: true, 
                message: `Removed ${quantity} ${item.name}`,
                item: removedItem,
                removed: quantity
            };
        }
    }
    
    // Use item from inventory
    useItem(itemIndex, target = null) {
        if (itemIndex < 0 || itemIndex >= this.maxSlots) {
            return { success: false, message: "Invalid item index" };
        }
        
        const item = this.items[itemIndex];
        if (!item) {
            return { success: false, message: "No item in that slot" };
        }
        
        if (!item.usable && !item.consumable) {
            return { success: false, message: `${item.name} cannot be used` };
        }
        
        // Use the item
        const result = item.use(target || this.getPlayer());
        
        if (result.success && result.consumed) {
            // Remove consumed item
            if (item.currentStack <= 0) {
                this.items[itemIndex] = null;
            }
        }
        
        return result;
    }
    
    // Equip item
    equipItem(itemIndex) {
        if (itemIndex < 0 || itemIndex >= this.maxSlots) {
            return { success: false, message: "Invalid item index" };
        }
        
        const item = this.items[itemIndex];
        if (!item) {
            return { success: false, message: "No item in that slot" };
        }
        
        if (!item.equipable || !item.equipSlot) {
            return { success: false, message: `${item.name} cannot be equipped` };
        }
        
        // Check requirements
        const player = this.getPlayer();
        console.log(`🎯 Checking requirements for ${item.name}:`, {
            itemRequirements: item.requirements,
            playerLevel: player ? player.level : 'unknown',
            playerStats: player ? { level: player.level, strength: player.strength } : 'unknown'
        });
        
        if (item.requirements) {
            for (let [req, value] of Object.entries(item.requirements)) {
                if (req === "level" && player.level < value) {
                    console.log(`❌ Level requirement not met: need ${value}, have ${player.level}`);
                    return { success: false, message: `Requires level ${value} (you are level ${player.level})` };
                }
                // Add other requirement checks as needed
            }
        }
        
        // Unequip current item in slot
        const currentEquipped = this.equipment[item.equipSlot];
        if (currentEquipped) {
            const unequipResult = this.addItem(currentEquipped);
            if (!unequipResult.success) {
                return { success: false, message: "Cannot unequip: inventory full" };
            }
        }
        
        // Remove item from inventory and equip it (preserve slot indices)
        this.items[itemIndex] = null;
        this.equipment[item.equipSlot] = item;
        
        // Apply stat bonuses
        this.applyEquipmentStats();
        
        return { 
            success: true, 
            message: `Equipped ${item.name}`,
            equipped: item,
            unequipped: currentEquipped
        };
    }
    
    // Unequip item
    unequipItem(slot) {
        const item = this.equipment[slot];
        if (!item) {
            return { success: false, message: "No item equipped in that slot" };
        }
        
        // Add to inventory
        const addResult = this.addItem(item);
        if (!addResult.success) {
            return { success: false, message: "Cannot unequip: inventory full" };
        }
        
        // Remove from equipment
        this.equipment[slot] = null;
        
        // Recalculate stats
        this.applyEquipmentStats();
        
        return { 
            success: true, 
            message: `Unequipped ${item.name}`,
            item: item
        };
    }
    
    // Apply equipment stat bonuses to player
    applyEquipmentStats() {
        const player = this.getPlayer();
        if (!player) return;
        
        // Reset equipment stats
        player.equipmentStats = {
            attack: 0,
            defense: 0,
            speed: 0,
            magic: 0,
            health: 0,
            mana: 0
        };
        
        // Apply stats from all equipped items
        Object.values(this.equipment).forEach(item => {
            if (item && item.stats) {
                Object.entries(item.stats).forEach(([stat, value]) => {
                    if (player.equipmentStats.hasOwnProperty(stat)) {
                        player.equipmentStats[stat] += value;
                    }
                });
            }
        });
        
        // Update player's effective stats
        this.updatePlayerStats(player);
    }
    
    updatePlayerStats(player) {
        // Allow calling without passing a player: resolve from globals/scene
        if (!player) {
            player = this.getPlayer() || window.currentPlayer || window.player;
            if (!player && this.k && typeof this.k.get === 'function') {
                const players = this.k.get('player');
                if (players && players.length > 0) player = players[0];
            }
            if (!player) {
                console.warn('InventorySystem.updatePlayerStats: no player found');
                return;
            }
        }
        
        // Store base stats if not already stored
        if (!player.baseStats) {
            player.baseStats = {
                attack: player.attack || 10,
                defense: player.defense || 5,
                speed: player.speed || 3,
                magic: player.magic || 1,
                health: player.maxHealth || 100,
                mana: player.maxMana || 50
            };
        }
        
        // Calculate total stats (base + equipment + temporary)
        const baseStats = player.baseStats;
        const equipStats = player.equipmentStats || {};
        const tempStats = player.tempStats || {};
        
        // Update actual player stats used in combat
        player.attack = baseStats.attack + (equipStats.attack || 0) + (tempStats.attack || 0);
        player.defense = baseStats.defense + (equipStats.defense || 0) + (tempStats.defense || 0);
        player.speed = baseStats.speed + (equipStats.speed || 0) + (tempStats.speed || 0);
        player.magic = baseStats.magic + (equipStats.magic || 0) + (tempStats.magic || 0);
        
        // Update max health and mana if equipment provides bonuses
        const healthBonus = (equipStats.health || 0) + (tempStats.health || 0);
        const manaBonus = (equipStats.mana || 0) + (tempStats.mana || 0);
        
        player.maxHealth = baseStats.health + healthBonus;
        player.maxMana = baseStats.mana + manaBonus;
        
        // Ensure current health/mana don't exceed new maximums
        player.health = Math.min(player.health, player.maxHealth);
        player.mana = Math.min(player.mana, player.maxMana);
        
        // Store totals for display purposes
        player.totalAttack = player.attack;
        player.totalDefense = player.defense;
        player.totalSpeed = player.speed;
        player.totalMagic = player.magic;
        
        console.log(`🛡️ Equipment stats applied - Attack: ${player.attack}, Defense: ${player.defense}, Speed: ${player.speed}, Magic: ${player.magic}`);
    }
    
    // Get player reference
    getPlayer() {
        // Prefer explicit globals set by main game
        if (window.currentPlayer) return window.currentPlayer;
        if (window.player) return window.player;
        
        // Try game state container
        if (window.GameState && window.GameState.player) {
            return window.GameState.player;
        }
        
        // Try to get player from Kaplay scene
        if (this.k && typeof this.k.get === 'function') {
            const players = this.k.get('player');
            if (players && players.length > 0) return players[0];
        }
        return null;
    }
    
    // Inventory information methods
    getTotalWeight() {
        return this.items.reduce((total, item) => total + (item ? item.getTotalWeight() : 0), 0);
    }
    
    getTotalBulk() {
        return this.items.reduce((total, item) => total + (item ? item.getTotalBulk() : 0), 0);
    }
    
    getTotalValue() {
        return this.items.reduce((total, item) => total + (item ? item.getTotalValue() : 0), 0) + this.gold;
    }
    
    getUsedSlots() {
        return this.items.filter(item => item !== null && item !== undefined).length;
    }
    
    getFreeSlots() {
        return this.maxSlots - this.getUsedSlots();
    }
    
    // Find items
    findItem(itemId) {
        return this.items.find(item => item && item.itemId === itemId);
    }
    
    findItemIndex(itemId) {
        return this.items.findIndex(item => item && item.itemId === itemId);
    }
    
    hasItem(itemId, quantity = 1) {
        const item = this.findItem(itemId);
        return item && item.currentStack >= quantity;
    }
    
    // Gold management
    addGold(amount) {
        this.gold += amount;
        return { success: true, message: `Gained ${amount} gold`, gold: this.gold };
    }
    
    removeGold(amount) {
        if (this.gold < amount) {
            return { success: false, message: "Not enough gold" };
        }
        this.gold -= amount;
        return { success: true, message: `Spent ${amount} gold`, gold: this.gold };
    }
    
    // Sorting and organization
    sortInventory(sortBy = "name") {
        // Work only with actual items; keep empty slots null at the end
        const nonNullItems = this.items.filter(item => item);
        
        switch (sortBy) {
            case "compress":
                // No sorting; just pack non-null items to the front preserving order
                break;
            case "name":
                nonNullItems.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
                break;
            case "category":
                nonNullItems.sort((a, b) => {
                    const ac = a?.category || "";
                    const bc = b?.category || "";
                    if (ac === bc) {
                        return (a?.name || "").localeCompare(b?.name || "");
                    }
                    return ac.localeCompare(bc);
                });
                break;
            case "value":
                nonNullItems.sort((a, b) => {
                    const av = typeof a?.getTotalValue === "function" ? a.getTotalValue() : 0;
                    const bv = typeof b?.getTotalValue === "function" ? b.getTotalValue() : 0;
                    return bv - av; // Descending value
                });
                break;
            case "weight":
                nonNullItems.sort((a, b) => {
                    const aw = typeof a?.getTotalWeight === "function" ? a.getTotalWeight() : 0;
                    const bw = typeof b?.getTotalWeight === "function" ? b.getTotalWeight() : 0;
                    return aw - bw; // Ascending weight
                });
                break;
            case "rarity": {
                const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
                nonNullItems.sort((a, b) => {
                    const ar = rarityOrder[a?.rarity] ?? 0;
                    const br = rarityOrder[b?.rarity] ?? 0;
                    if (br !== ar) return br - ar; // Descending rarity
                    return (a?.name || "").localeCompare(b?.name || "");
                });
                break;
            }
            default:
                nonNullItems.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
                break;
        }
        
        // Rebuild items array: sorted items first, then nulls to fill up to maxSlots
        const newItems = new Array(this.maxSlots).fill(null);
        const limit = Math.min(nonNullItems.length, this.maxSlots);
        for (let i = 0; i < limit; i++) {
            newItems[i] = nonNullItems[i];
        }
        this.items = newItems;
    }
    
    // Save/Load inventory state
    saveState() {
        return {
            items: this.items.map(item => item ? ({
                itemId: item.itemId,
                currentStack: item.currentStack,
                enchantment: item.enchantment,
                cursed: item.cursed,
                blessed: item.blessed,
                identified: item.identified
            }) : null),
            equipment: Object.fromEntries(
                Object.entries(this.equipment).map(([slot, item]) => [
                    slot, 
                    item ? {
                        itemId: item.itemId,
                        enchantment: item.enchantment,
                        cursed: item.cursed,
                        blessed: item.blessed,
                        identified: item.identified
                    } : null
                ])
            ),
            gold: this.gold
        };
    }
    
    loadState(state) {
        if (!state) return;
        
        // Load items
        this.items = new Array(this.maxSlots).fill(null);
        if (state.items && Array.isArray(state.items)) {
            const count = Math.min(state.items.length, this.maxSlots);
            for (let i = 0; i < count; i++) {
                const itemState = state.items[i];
                if (!itemState) continue; // preserve empty slot
                const itemData = window.ItemData.getItemById(itemState.itemId);
                if (itemData) {
                    const item = window.ItemComponent.create(itemData);
                    item.currentStack = itemState.currentStack || 1;
                    item.enchantment = itemState.enchantment || 0;
                    item.cursed = itemState.cursed || false;
                    item.blessed = itemState.blessed || false;
                    item.identified = itemState.identified !== false;
                    this.items[i] = item;
                }
            }
        }
        
        // Load equipment
        this.equipment = {};
        this.equipmentSlots.forEach(slot => {
            this.equipment[slot] = null;
        });
        
        if (state.equipment) {
            Object.entries(state.equipment).forEach(([slot, itemState]) => {
                if (itemState) {
                    const itemData = window.ItemData.getItemById(itemState.itemId);
                    if (itemData) {
                        const item = window.ItemComponent.create(itemData);
                        item.enchantment = itemState.enchantment || 0;
                        item.cursed = itemState.cursed || false;
                        item.blessed = itemState.blessed || false;
                        item.identified = itemState.identified !== false;
                        this.equipment[slot] = item;
                    }
                }
            });
        }
        
        // Load gold
        this.gold = state.gold || 0;
        
        // Recalculate equipment stats
        this.applyEquipmentStats();
    }
    
    // Debug methods
    debugPrint() {
        console.log("=== INVENTORY DEBUG ===");
        console.log(`Slots: ${this.getUsedSlots()}/${this.maxSlots}`);
        console.log(`Weight: ${this.getTotalWeight()}/${this.maxWeight}`);
        console.log(`Bulk: ${this.getTotalBulk()}/${this.maxBulk}`);
        console.log(`Gold: ${this.gold}`);
        console.log("Items:");
        this.items.forEach((item, index) => {
            if (item) {
                console.log(`  ${index}: ${item.getDisplayName()} (${item.getTotalWeight()}kg)`);
            } else {
                console.log(`  ${index}: empty`);
            }
        });
        console.log("Equipment:");
        Object.entries(this.equipment).forEach(([slot, item]) => {
            console.log(`  ${slot}: ${item ? item.getDisplayName() : "empty"}`);
        });
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.InventorySystem = InventorySystem;
}
