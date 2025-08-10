/**
 * Item Data Definitions for Castles of the Wind Clone
 * Contains all item definitions, categories, and properties
 */

// Item Categories
const ITEM_CATEGORIES = {
    WEAPON: "weapon",
    ARMOR: "armor", 
    POTION: "potion",
    SCROLL: "scroll",
    KEY: "key",
    TREASURE: "treasure",
    FOOD: "food",
    MISC: "misc"
};

// Equipment Slots (expanded like original Castles of the Wind)
const EQUIPMENT_SLOTS = {
    WEAPON: "weapon",
    SHIELD: "shield",
    ARMOR: "armor",
    HELMET: "helmet",
    BOOTS: "boots",
    GLOVES: "gloves",
    CLOAK: "cloak",
    BRACERS: "bracers",
    RING1: "ring1",
    RING2: "ring2",
    AMULET: "amulet",
    BELT: "belt",
    QUIVER: "quiver",
    TORCH: "torch",
    LANTERN: "lantern",
    SPELLBOOK: "spellbook"
};

// Item Database
const ITEM_DATA = {
    // WEAPONS
    "dagger": {
        id: "dagger",
        name: "Dagger",
        description: "A simple iron dagger. Sharp and lightweight.",
        category: ITEM_CATEGORIES.WEAPON,
        weight: 2,
        bulk: 1,
        value: 10,
        experience: 5, // Experience gained when picked up
        rarity: "common",
        equipable: true,
        equipSlot: EQUIPMENT_SLOTS.WEAPON,
        stats: { attack: 3, speed: 2 },
        sprite: "dagger",
        color: [180, 180, 180]
    },
    
    "sword": {
        id: "sword",
        name: "Iron Sword",
        description: "A well-balanced iron sword. Reliable in combat.",
        category: ITEM_CATEGORIES.WEAPON,
        weight: 5,
        bulk: 2,
        value: 50,
        experience: 10, // Experience gained when picked up
        rarity: "common",
        equipable: true,
        equipSlot: EQUIPMENT_SLOTS.WEAPON,
        stats: { attack: 8, defense: 1 },
        requirements: { level: 3 },
        sprite: "sword",
        color: [200, 200, 200]
    },
    
    "magic_sword": {
        id: "magic_sword",
        name: "Enchanted Sword",
        description: "A sword imbued with magical energy. Glows with inner light.",
        category: ITEM_CATEGORIES.WEAPON,
        weight: 4,
        bulk: 2,
        value: 200,
        rarity: "rare",
        equipable: true,
        equipSlot: EQUIPMENT_SLOTS.WEAPON,
        stats: { attack: 12, magic: 3 },
        requirements: { level: 8 },
        sprite: "magic_sword",
        color: [100, 150, 255]
    },
    
    // ARMOR
    "leather_armor": {
        id: "leather_armor",
        name: "Leather Armor",
        description: "Basic leather armor. Provides minimal protection.",
        category: ITEM_CATEGORIES.ARMOR,
        weight: 8,
        bulk: 3,
        value: 25,
        experience: 6, // Experience gained when picked up
        rarity: "common",
        equipable: true,
        equipSlot: EQUIPMENT_SLOTS.ARMOR,
        stats: { defense: 3, speed: -1 },
        sprite: "leather_armor",
        color: [139, 69, 19]
    },
    
    "chain_mail": {
        id: "chain_mail",
        name: "Chain Mail",
        description: "Interlocked metal rings provide good protection.",
        category: ITEM_CATEGORIES.ARMOR,
        weight: 15,
        bulk: 4,
        value: 100,
        rarity: "uncommon",
        equipable: true,
        equipSlot: EQUIPMENT_SLOTS.ARMOR,
        stats: { defense: 6, speed: -2 },
        requirements: { level: 5 },
        sprite: "chain_mail",
        color: [160, 160, 160]
    },
    
    "plate_armor": {
        id: "plate_armor",
        name: "Plate Armor",
        description: "Heavy steel plates offer excellent protection.",
        category: ITEM_CATEGORIES.ARMOR,
        weight: 25,
        bulk: 6,
        value: 300,
        rarity: "rare",
        equipable: true,
        equipSlot: EQUIPMENT_SLOTS.ARMOR,
        stats: { defense: 12, speed: -4 },
        requirements: { level: 10, strength: 15 },
        sprite: "plate_armor",
        color: [220, 220, 220]
    },
    
    // POTIONS
    "health_potion": {
        id: "health_potion",
        name: "Health Potion",
        description: "A red liquid that restores health when consumed.",
        category: ITEM_CATEGORIES.POTION,
        weight: 1,
        bulk: 1,
        value: 25,
        experience: 4, // Experience gained when picked up
        rarity: "common",
        stackable: true,
        maxStack: 10,
        consumable: true,
        usable: true,
        effects: [{ type: "heal", amount: 25 }],
        sprite: "health_potion",
        color: [255, 50, 50]
    },
    
    "mana_potion": {
        id: "mana_potion",
        name: "Mana Potion",
        description: "A blue liquid that restores magical energy.",
        category: ITEM_CATEGORIES.POTION,
        weight: 1,
        bulk: 1,
        value: 30,
        rarity: "common",
        stackable: true,
        maxStack: 10,
        consumable: true,
        usable: true,
        effects: [{ type: "mana", amount: 30 }],
        sprite: "mana_potion",
        color: [50, 50, 255]
    },
    
    "strength_potion": {
        id: "strength_potion",
        name: "Potion of Strength",
        description: "Temporarily increases physical power.",
        category: ITEM_CATEGORIES.POTION,
        weight: 1,
        bulk: 1,
        value: 75,
        rarity: "uncommon",
        stackable: true,
        maxStack: 5,
        consumable: true,
        usable: true,
        effects: [{ type: "stat_boost", stat: "attack", amount: 5 }],
        sprite: "strength_potion",
        color: [255, 150, 0]
    },
    
    // SCROLLS
    "scroll_fireball": {
        id: "scroll_fireball",
        name: "Scroll of Fireball",
        description: "A magical scroll that casts a fireball spell.",
        category: ITEM_CATEGORIES.SCROLL,
        weight: 0.5,
        bulk: 1,
        value: 40,
        experience: 8, // Experience gained when picked up
        rarity: "uncommon",
        stackable: true,
        maxStack: 5,
        consumable: true,
        usable: true,
        effects: [{ type: "damage", amount: 20 }],
        sprite: "scroll_fireball",
        color: [255, 100, 0]
    },
    
    "scroll_heal": {
        id: "scroll_heal",
        name: "Scroll of Healing",
        description: "A divine scroll that heals wounds.",
        category: ITEM_CATEGORIES.SCROLL,
        weight: 0.5,
        bulk: 1,
        value: 60,
        rarity: "uncommon",
        stackable: true,
        maxStack: 5,
        consumable: true,
        usable: true,
        effects: [{ type: "heal", amount: 40 }],
        sprite: "scroll_heal",
        color: [255, 255, 100]
    },
    
    // KEYS
    "iron_key": {
        id: "iron_key",
        name: "Iron Key",
        description: "A sturdy iron key. Opens basic locks.",
        category: ITEM_CATEGORIES.KEY,
        weight: 0.5,
        bulk: 1,
        value: 5,
        experience: 3, // Experience gained when picked up
        rarity: "common",
        stackable: true,
        maxStack: 20,
        sprite: "iron_key",
        color: [150, 150, 150]
    },
    
    "gold_key": {
        id: "gold_key",
        name: "Golden Key",
        description: "An ornate golden key. Opens special locks.",
        category: ITEM_CATEGORIES.KEY,
        weight: 0.5,
        bulk: 1,
        value: 50,
        rarity: "rare",
        stackable: true,
        maxStack: 10,
        sprite: "gold_key",
        color: [255, 215, 0]
    },
    
    // TREASURE
    "gold_coin": {
        id: "gold_coin",
        name: "Gold Coin",
        description: "A shiny gold coin. The universal currency.",
        category: ITEM_CATEGORIES.TREASURE,
        weight: 0,
        bulk: 0,
        value: 1,
        experience: 1, // Experience gained when picked up
        rarity: "common",
        isCurrency: true, // Special flag to add to gold counter instead of inventory
        goldValue: 1, // How much gold this adds
        sprite: "gold_coin",
        color: [255, 215, 0]
    },
    
    "gem": {
        id: "gem",
        name: "Precious Gem",
        description: "A beautiful gemstone that sparkles in the light.",
        category: ITEM_CATEGORIES.TREASURE,
        weight: 0.5,
        bulk: 0.5,
        value: 100,
        experience: 15, // Experience gained when picked up (rare item)
        rarity: "rare",
        stackable: true,
        maxStack: 50,
        sprite: "gem",
        color: [255, 100, 255]
    },
    
    // FOOD
    "bread": {
        id: "bread",
        name: "Bread",
        description: "A loaf of fresh bread. Restores a small amount of health.",
        category: ITEM_CATEGORIES.FOOD,
        weight: 1,
        bulk: 1,
        value: 2,
        experience: 2, // Experience gained when picked up
        rarity: "common",
        stackable: true,
        maxStack: 20,
        consumable: true,
        usable: true,
        effects: [{ type: "heal", amount: 5 }],
        sprite: "bread",
        color: [210, 180, 140]
    },
    
    "cheese": {
        id: "cheese",
        name: "Cheese",
        description: "A wedge of aged cheese. Nutritious and filling.",
        category: ITEM_CATEGORIES.FOOD,
        weight: 0.5,
        bulk: 1,
        value: 5,
        rarity: "common",
        stackable: true,
        maxStack: 15,
        consumable: true,
        usable: true,
        effects: [{ type: "heal", amount: 8 }],
        sprite: "cheese",
        color: [255, 255, 0]
    },
    
    // MISC ITEMS
    "torch": {
        id: "torch",
        name: "Torch",
        description: "A wooden torch that provides light in dark places.",
        category: ITEM_CATEGORIES.MISC,
        weight: 2,
        bulk: 2,
        value: 3,
        rarity: "common",
        stackable: true,
        maxStack: 10,
        usable: true,
        sprite: "torch",
        color: [255, 150, 0]
    },
    
    "rope": {
        id: "rope",
        name: "Rope",
        description: "A sturdy rope. Useful for climbing and binding.",
        category: ITEM_CATEGORIES.MISC,
        weight: 3,
        bulk: 2,
        value: 8,
        rarity: "common",
        stackable: true,
        maxStack: 5,
        sprite: "rope",
        color: [139, 69, 19]
    },
    
    // ADDITIONAL EQUIPMENT ITEMS
    
    // CLOAKS
    "leather_cloak": {
        id: "leather_cloak",
        name: "Leather Cloak",
        description: "A simple leather cloak that provides warmth and minor protection.",
        category: ITEM_CATEGORIES.ARMOR,
        weight: 3,
        bulk: 2,
        value: 15,
        experience: 4,
        rarity: "common",
        equipable: true,
        equipSlot: EQUIPMENT_SLOTS.CLOAK,
        stats: { defense: 1, cold_resist: 2 },
        sprite: "leather_cloak",
        color: [139, 69, 19]
    },
    
    "magic_cloak": {
        id: "magic_cloak",
        name: "Cloak of Protection",
        description: "A magical cloak that shimmers with protective enchantments.",
        category: ITEM_CATEGORIES.ARMOR,
        weight: 2,
        bulk: 2,
        value: 150,
        rarity: "rare",
        equipable: true,
        equipSlot: EQUIPMENT_SLOTS.CLOAK,
        stats: { defense: 3, magic_resist: 5 },
        requirements: { level: 6 },
        sprite: "magic_cloak",
        color: [100, 100, 255]
    },
    
    // BRACERS
    "leather_bracers": {
        id: "leather_bracers",
        name: "Leather Bracers",
        description: "Simple leather arm guards.",
        category: ITEM_CATEGORIES.ARMOR,
        weight: 2,
        bulk: 1,
        value: 12,
        experience: 3,
        rarity: "common",
        equipable: true,
        equipSlot: EQUIPMENT_SLOTS.BRACERS,
        stats: { defense: 1, dexterity: 1 },
        sprite: "leather_bracers",
        color: [139, 69, 19]
    },
    
    // RINGS
    "silver_ring": {
        id: "silver_ring",
        name: "Silver Ring",
        description: "A simple silver ring.",
        category: ITEM_CATEGORIES.MISC,
        weight: 0.1,
        bulk: 0,
        value: 25,
        experience: 5,
        rarity: "common",
        equipable: true,
        equipSlot: EQUIPMENT_SLOTS.RING1, // Can be equipped in either ring slot
        stats: { charisma: 1 },
        sprite: "silver_ring",
        color: [192, 192, 192]
    },
    
    "ring_of_strength": {
        id: "ring_of_strength",
        name: "Ring of Strength",
        description: "A magical ring that enhances physical power.",
        category: ITEM_CATEGORIES.MISC,
        weight: 0.1,
        bulk: 0,
        value: 200,
        rarity: "rare",
        equipable: true,
        equipSlot: EQUIPMENT_SLOTS.RING1,
        stats: { strength: 3, attack: 2 },
        requirements: { level: 5 },
        sprite: "ring_of_strength",
        color: [255, 100, 100]
    },
    
    // BELTS
    "leather_belt": {
        id: "leather_belt",
        name: "Leather Belt",
        description: "A sturdy leather belt with pouches.",
        category: ITEM_CATEGORIES.ARMOR,
        weight: 1,
        bulk: 1,
        value: 8,
        experience: 2,
        rarity: "common",
        equipable: true,
        equipSlot: EQUIPMENT_SLOTS.BELT,
        stats: { carry_capacity: 5 },
        sprite: "leather_belt",
        color: [139, 69, 19]
    },
    
    // QUIVERS
    "leather_quiver": {
        id: "leather_quiver",
        name: "Leather Quiver",
        description: "A quiver for holding arrows.",
        category: ITEM_CATEGORIES.MISC,
        weight: 1,
        bulk: 2,
        value: 15,
        experience: 3,
        rarity: "common",
        equipable: true,
        equipSlot: EQUIPMENT_SLOTS.QUIVER,
        stats: { arrow_capacity: 30 },
        sprite: "leather_quiver",
        color: [139, 69, 19]
    },
    
    // LANTERNS
    "oil_lantern": {
        id: "oil_lantern",
        name: "Oil Lantern",
        description: "A metal lantern that burns oil for steady light.",
        category: ITEM_CATEGORIES.MISC,
        weight: 3,
        bulk: 2,
        value: 20,
        experience: 4,
        rarity: "common",
        equipable: true,
        equipSlot: EQUIPMENT_SLOTS.LANTERN,
        stats: { light_radius: 8 },
        sprite: "oil_lantern",
        color: [255, 215, 0]
    },
    
    // SPELLBOOKS
    "apprentice_spellbook": {
        id: "apprentice_spellbook",
        name: "Apprentice Spellbook",
        description: "A basic spellbook containing simple cantrips.",
        category: ITEM_CATEGORIES.MISC,
        weight: 2,
        bulk: 1,
        value: 50,
        experience: 8,
        rarity: "uncommon",
        equipable: true,
        equipSlot: EQUIPMENT_SLOTS.SPELLBOOK,
        stats: { mana: 10, spell_power: 2 },
        requirements: { level: 3 },
        sprite: "apprentice_spellbook",
        color: [100, 50, 200]
    }
};

// Item generation functions
function getRandomItem(level = 1, category = null) {
    let availableItems = Object.values(ITEM_DATA);
    
    // Filter by category if specified
    if (category) {
        availableItems = availableItems.filter(item => item.category === category);
    }
    
    // Filter by level requirements
    availableItems = availableItems.filter(item => {
        const levelReq = item.requirements?.level || 1;
        return levelReq <= level + 2; // Allow items slightly above player level
    });
    
    if (availableItems.length === 0) {
        return ITEM_DATA.bread; // Fallback item
    }
    
    // Weight by rarity (common items more likely)
    const rarityWeights = {
        common: 60,
        uncommon: 25,
        rare: 12,
        epic: 2,
        legendary: 1
    };
    
    const weightedItems = [];
    availableItems.forEach(item => {
        const weight = rarityWeights[item.rarity] || 30;
        for (let i = 0; i < weight; i++) {
            weightedItems.push(item);
        }
    });
    
    return weightedItems[Math.floor(Math.random() * weightedItems.length)];
}

function getItemById(itemId) {
    return ITEM_DATA[itemId] || null;
}

function getItemsByCategory(category) {
    return Object.values(ITEM_DATA).filter(item => item.category === category);
}

function createRandomLoot(level = 1, count = 1) {
    const loot = [];
    for (let i = 0; i < count; i++) {
        const item = getRandomItem(level);
        if (item) {
            loot.push(item);
        }
    }
    return loot;
}

// Export for global access
if (typeof window !== 'undefined') {
    window.ItemData = {
        CATEGORIES: ITEM_CATEGORIES,
        EQUIPMENT_SLOTS: EQUIPMENT_SLOTS,
        DATA: ITEM_DATA,
        getRandomItem: getRandomItem,
        getItemById: getItemById,
        getItemsByCategory: getItemsByCategory,
        createRandomLoot: createRandomLoot
    };
}
