/**
 * Spell Data System for Castles of the Wind Clone
 * Six schools of magic with 5 spells each
 * Keybinds: Z(Fire), X(Ice), C(Lightning), V(Poison), B(Heal), N(Protect)
 * Spell levels: 1-5 (weak to very powerful)
 */

// Magic Schools
const MAGIC_SCHOOLS = {
    FIRE: "fire",
    ICE: "ice", 
    LIGHTNING: "lightning",
    POISON: "poison",
    HEAL: "heal",
    PROTECT: "protect"
};

// School keybindings
const SCHOOL_KEYS = {
    [MAGIC_SCHOOLS.FIRE]: "z",
    [MAGIC_SCHOOLS.ICE]: "x", 
    [MAGIC_SCHOOLS.LIGHTNING]: "c",
    [MAGIC_SCHOOLS.POISON]: "v",
    [MAGIC_SCHOOLS.HEAL]: "b",
    [MAGIC_SCHOOLS.PROTECT]: "n"
};

// Spell definitions
const SPELL_DATA = {
    // FIRE MAGIC (Z + 1-5)
    fire_1: {
        id: "fire_1",
        name: "Spark",
        description: "A small flame that deals minor fire damage.",
        school: MAGIC_SCHOOLS.FIRE,
        level: 1,
        manaCost: 3,
        damage: 8,
        range: 3,
        areaEffect: false,
        duration: 0,
        requirements: { level: 1 },
        effects: ["burn_weak"],
        color: [255, 100, 50],
        sound: "fire_small"
    },
    
    fire_2: {
        id: "fire_2", 
        name: "Flame Bolt",
        description: "A bolt of fire that burns enemies.",
        school: MAGIC_SCHOOLS.FIRE,
        level: 2,
        manaCost: 6,
        damage: 15,
        range: 5,
        areaEffect: false,
        duration: 0,
        requirements: { level: 3 },
        effects: ["burn_medium"],
        color: [255, 120, 60],
        sound: "fire_medium"
    },
    
    fire_3: {
        id: "fire_3",
        name: "Fireball",
        description: "A large fireball that explodes on impact.",
        school: MAGIC_SCHOOLS.FIRE,
        level: 3,
        manaCost: 12,
        damage: 25,
        range: 6,
        areaEffect: true,
        areaSize: 2,
        duration: 0,
        requirements: { level: 6 },
        effects: ["burn_strong", "explosion"],
        color: [255, 140, 70],
        sound: "fire_large"
    },
    
    fire_4: {
        id: "fire_4",
        name: "Inferno",
        description: "A massive blast of fire that burns everything nearby.",
        school: MAGIC_SCHOOLS.FIRE,
        level: 4,
        manaCost: 20,
        damage: 40,
        range: 4,
        areaEffect: true,
        areaSize: 3,
        duration: 3,
        requirements: { level: 10 },
        effects: ["burn_intense", "area_damage"],
        color: [255, 160, 80],
        sound: "fire_huge"
    },
    
    fire_5: {
        id: "fire_5",
        name: "Meteor",
        description: "Calls down a devastating meteor from the sky.",
        school: MAGIC_SCHOOLS.FIRE,
        level: 5,
        manaCost: 35,
        damage: 70,
        range: 8,
        areaEffect: true,
        areaSize: 4,
        duration: 0,
        requirements: { level: 15 },
        effects: ["burn_legendary", "massive_explosion", "stun"],
        color: [255, 180, 90],
        sound: "meteor"
    },

    // ICE MAGIC (X + 1-5)
    ice_1: {
        id: "ice_1",
        name: "Frost Touch",
        description: "A cold touch that slows enemies.",
        school: MAGIC_SCHOOLS.ICE,
        level: 1,
        manaCost: 3,
        damage: 6,
        range: 2,
        areaEffect: false,
        duration: 3,
        requirements: { level: 1 },
        effects: ["slow_weak", "frost"],
        color: [150, 200, 255],
        sound: "ice_small"
    },
    
    ice_2: {
        id: "ice_2",
        name: "Ice Shard",
        description: "Sharp ice projectile that pierces armor.",
        school: MAGIC_SCHOOLS.ICE,
        level: 2,
        manaCost: 6,
        damage: 12,
        range: 5,
        areaEffect: false,
        duration: 0,
        requirements: { level: 3 },
        effects: ["armor_pierce", "freeze_chance"],
        color: [120, 180, 255],
        sound: "ice_medium"
    },
    
    ice_3: {
        id: "ice_3",
        name: "Blizzard",
        description: "A swirling storm of ice and snow.",
        school: MAGIC_SCHOOLS.ICE,
        level: 3,
        manaCost: 12,
        damage: 20,
        range: 4,
        areaEffect: true,
        areaSize: 3,
        duration: 4,
        requirements: { level: 6 },
        effects: ["slow_strong", "vision_reduce", "continuous_damage"],
        color: [100, 160, 255],
        sound: "blizzard"
    },
    
    ice_4: {
        id: "ice_4",
        name: "Absolute Zero",
        description: "Freezes everything in a large area solid.",
        school: MAGIC_SCHOOLS.ICE,
        level: 4,
        manaCost: 20,
        damage: 35,
        range: 6,
        areaEffect: true,
        areaSize: 4,
        duration: 5,
        requirements: { level: 10 },
        effects: ["freeze_solid", "movement_stop", "high_damage"],
        color: [80, 140, 255],
        sound: "absolute_zero"
    },
    
    ice_5: {
        id: "ice_5",
        name: "Glacial Prison",
        description: "Traps enemies in unbreakable ice while dealing massive damage.",
        school: MAGIC_SCHOOLS.ICE,
        level: 5,
        manaCost: 35,
        damage: 60,
        range: 7,
        areaEffect: true,
        areaSize: 5,
        duration: 8,
        requirements: { level: 15 },
        effects: ["immobilize", "damage_over_time", "spell_immunity"],
        color: [60, 120, 255],
        sound: "glacial_prison"
    },

    // LIGHTNING MAGIC (C + 1-5)
    lightning_1: {
        id: "lightning_1",
        name: "Static Shock",
        description: "A small electrical discharge.",
        school: MAGIC_SCHOOLS.LIGHTNING,
        level: 1,
        manaCost: 3,
        damage: 10,
        range: 4,
        areaEffect: false,
        duration: 0,
        requirements: { level: 1 },
        effects: ["stun_brief"],
        color: [255, 255, 100],
        sound: "lightning_small"
    },
    
    lightning_2: {
        id: "lightning_2",
        name: "Lightning Bolt",
        description: "A bolt of lightning that can chain between enemies.",
        school: MAGIC_SCHOOLS.LIGHTNING,
        level: 2,
        manaCost: 6,
        damage: 18,
        range: 6,
        areaEffect: false,
        duration: 0,
        requirements: { level: 3 },
        effects: ["chain_lightning", "stun_medium"],
        color: [255, 255, 150],
        sound: "lightning_medium"
    },
    
    lightning_3: {
        id: "lightning_3",
        name: "Thunder Storm",
        description: "Multiple lightning strikes hit random targets.",
        school: MAGIC_SCHOOLS.LIGHTNING,
        level: 3,
        manaCost: 12,
        damage: 22,
        range: 8,
        areaEffect: true,
        areaSize: 4,
        duration: 3,
        requirements: { level: 6 },
        effects: ["multiple_strikes", "random_targets", "thunder"],
        color: [255, 255, 200],
        sound: "thunder_storm"
    },
    
    lightning_4: {
        id: "lightning_4",
        name: "Chain Lightning",
        description: "Lightning that jumps between all nearby enemies.",
        school: MAGIC_SCHOOLS.LIGHTNING,
        level: 4,
        manaCost: 20,
        damage: 30,
        range: 10,
        areaEffect: true,
        areaSize: 6,
        duration: 0,
        requirements: { level: 10 },
        effects: ["unlimited_chain", "stun_strong", "mana_drain"],
        color: [255, 255, 255],
        sound: "chain_lightning"
    },
    
    lightning_5: {
        id: "lightning_5",
        name: "Divine Wrath",
        description: "Calls down the fury of the storm gods.",
        school: MAGIC_SCHOOLS.LIGHTNING,
        level: 5,
        manaCost: 35,
        damage: 80,
        range: 12,
        areaEffect: true,
        areaSize: 8,
        duration: 0,
        requirements: { level: 15 },
        effects: ["divine_damage", "paralysis", "equipment_damage"],
        color: [255, 255, 255],
        sound: "divine_wrath"
    },

    // POISON MAGIC (V + 1-5)
    poison_1: {
        id: "poison_1",
        name: "Toxic Dart",
        description: "A small dart coated with weak poison.",
        school: MAGIC_SCHOOLS.POISON,
        level: 1,
        manaCost: 3,
        damage: 4, // 4 initial damage
        range: 4,
        areaEffect: false,
        duration: 5,
        requirements: { level: 1 },
        effects: ["poison_weak"], // 1 poison stack
        color: [100, 255, 100],
        sound: "poison_small"
    },
    
    poison_2: {
        id: "poison_2",
        name: "Poison Cloud",
        description: "Creates a cloud of toxic gas.",
        school: MAGIC_SCHOOLS.POISON,
        level: 2,
        manaCost: 6,
        damage: 7, // 7 initial damage
        range: 3,
        areaEffect: true,
        areaSize: 2,
        duration: 6,
        requirements: { level: 3 },
        effects: ["poison_medium", "poison_medium"], // 2 poison stacks
        color: [120, 255, 120],
        sound: "poison_cloud"
    },
    
    poison_3: {
        id: "poison_3",
        name: "Acid Rain",
        description: "Corrosive rain that melts armor and flesh.",
        school: MAGIC_SCHOOLS.POISON,
        level: 3,
        manaCost: 12,
        damage: 12, // 12 initial damage
        range: 6,
        areaEffect: true,
        areaSize: 4,
        duration: 8,
        requirements: { level: 6 },
        effects: ["poison_strong", "poison_strong", "poison_strong", "poison_strong"], // 4 poison stacks
        color: [140, 255, 140],
        sound: "acid_rain"
    },
    
    poison_4: {
        id: "poison_4",
        name: "Plague",
        description: "A deadly disease that spreads between enemies.",
        school: MAGIC_SCHOOLS.POISON,
        level: 4,
        manaCost: 20,
        damage: 21, // 21 initial damage
        range: 5,
        areaEffect: true,
        areaSize: 3,
        duration: 12,
        requirements: { level: 10 },
        effects: ["poison_intense", "poison_intense", "poison_intense", "poison_intense", "poison_intense", "poison_intense", "poison_intense"], // 7 poison stacks
        color: [160, 255, 160],
        sound: "plague"
    },
    
    poison_5: {
        id: "poison_5",
        name: "Death Cloud",
        description: "A cloud of pure death that kills almost instantly.",
        school: MAGIC_SCHOOLS.POISON,
        level: 5,
        manaCost: 35,
        damage: 30, // 30 initial damage
        range: 4,
        areaEffect: true,
        areaSize: 5,
        duration: 10,
        requirements: { level: 15 },
        effects: ["poison_deadly", "poison_deadly", "poison_deadly", "poison_deadly", "poison_deadly", "poison_deadly", "poison_deadly", "poison_deadly", "poison_deadly", "poison_deadly", "poison_deadly", "poison_deadly", "poison_deadly"], // 13 poison stacks
        color: [180, 255, 180],
        sound: "death_cloud"
    },

    // HEAL MAGIC (B + 1-5)
    heal_1: {
        id: "heal_1",
        name: "Minor Heal",
        description: "Restores a small amount of health.",
        school: MAGIC_SCHOOLS.HEAL,
        level: 1,
        manaCost: 4,
        damage: -15, // Negative damage = healing
        range: 1,
        areaEffect: false,
        duration: 0,
        requirements: { level: 1 },
        effects: ["heal_minor"],
        color: [255, 200, 200],
        sound: "heal_small"
    },
    
    heal_2: {
        id: "heal_2",
        name: "Heal",
        description: "Restores moderate health and cures poison.",
        school: MAGIC_SCHOOLS.HEAL,
        level: 2,
        manaCost: 8,
        damage: -30,
        range: 2,
        areaEffect: false,
        duration: 0,
        requirements: { level: 3 },
        effects: ["heal_medium", "cure_poison"],
        color: [255, 220, 220],
        sound: "heal_medium"
    },
    
    heal_3: {
        id: "heal_3",
        name: "Greater Heal",
        description: "Restores significant health and removes debuffs.",
        school: MAGIC_SCHOOLS.HEAL,
        level: 3,
        manaCost: 15,
        damage: -60,
        range: 3,
        areaEffect: true,
        areaSize: 2,
        duration: 0,
        requirements: { level: 6 },
        effects: ["heal_major", "remove_debuffs", "area_heal"],
        color: [255, 240, 240],
        sound: "heal_large"
    },
    
    heal_4: {
        id: "heal_4",
        name: "Regeneration",
        description: "Provides continuous healing over time.",
        school: MAGIC_SCHOOLS.HEAL,
        level: 4,
        manaCost: 20,
        damage: -20, // Per turn
        range: 4,
        areaEffect: true,
        areaSize: 3,
        duration: 10,
        requirements: { level: 10 },
        effects: ["heal_over_time", "stat_boost", "immunity_boost"],
        color: [255, 255, 240],
        sound: "regeneration"
    },
    
    heal_5: {
        id: "heal_5",
        name: "Resurrection",
        description: "Brings back fallen allies and fully heals everyone.",
        school: MAGIC_SCHOOLS.HEAL,
        level: 5,
        manaCost: 40,
        damage: -999, // Full heal
        range: 6,
        areaEffect: true,
        areaSize: 5,
        duration: 0,
        requirements: { level: 15 },
        effects: ["full_heal", "resurrect", "temporary_invulnerability"],
        color: [255, 255, 255],
        sound: "resurrection"
    },

    // PROTECT MAGIC (N + 1-5)
    protect_1: {
        id: "protect_1",
        name: "Shield",
        description: "Creates a weak magical barrier.",
        school: MAGIC_SCHOOLS.PROTECT,
        level: 1,
        manaCost: 4,
        damage: 0,
        range: 1,
        areaEffect: false,
        duration: 10,
        requirements: { level: 1 },
        effects: ["defense_boost_weak", "magic_resistance"],
        color: [200, 200, 255],
        sound: "shield_small"
    },
    
    protect_2: {
        id: "protect_2",
        name: "Magic Armor",
        description: "Provides moderate protection from all damage.",
        school: MAGIC_SCHOOLS.PROTECT,
        level: 2,
        manaCost: 8,
        damage: 0,
        range: 2,
        areaEffect: false,
        duration: 15,
        requirements: { level: 3 },
        effects: ["defense_boost_medium", "spell_resistance", "damage_reduction"],
        color: [220, 220, 255],
        sound: "armor_medium"
    },
    
    protect_3: {
        id: "protect_3",
        name: "Sanctuary",
        description: "Creates a protected area that blocks attacks.",
        school: MAGIC_SCHOOLS.PROTECT,
        level: 3,
        manaCost: 15,
        damage: 0,
        range: 3,
        areaEffect: true,
        areaSize: 3,
        duration: 20,
        requirements: { level: 6 },
        effects: ["area_protection", "attack_blocking", "healing_boost"],
        color: [240, 240, 255],
        sound: "sanctuary"
    },
    
    protect_4: {
        id: "protect_4",
        name: "Divine Protection",
        description: "Grants powerful protection and reflects damage.",
        school: MAGIC_SCHOOLS.PROTECT,
        level: 4,
        manaCost: 25,
        damage: 0,
        range: 4,
        areaEffect: true,
        areaSize: 4,
        duration: 25,
        requirements: { level: 10 },
        effects: ["damage_reflection", "status_immunity", "critical_protection"],
        color: [250, 250, 255],
        sound: "divine_protection"
    },
    
    protect_5: {
        id: "protect_5",
        name: "Invulnerability",
        description: "Grants temporary complete immunity to all damage.",
        school: MAGIC_SCHOOLS.PROTECT,
        level: 5,
        manaCost: 50,
        damage: 0,
        range: 5,
        areaEffect: true,
        areaSize: 5,
        duration: 5,
        requirements: { level: 15 },
        effects: ["complete_immunity", "spell_immunity", "time_stop"],
        color: [255, 255, 255],
        sound: "invulnerability"
    }
};

// Helper functions
function getSpellById(spellId) {
    return SPELL_DATA[spellId] || null;
}

function getSpellsBySchool(school) {
    return Object.values(SPELL_DATA).filter(spell => spell.school === school);
}

function getSpellBySchoolAndLevel(school, level) {
    const spellId = `${school}_${level}`;
    return SPELL_DATA[spellId] || null;
}

function getSchoolByKey(key) {
    return Object.keys(SCHOOL_KEYS).find(school => SCHOOL_KEYS[school] === key.toLowerCase()) || null;
}

function canCastSpell(spell, player) {
    if (!spell || !player) return false;
    
    // Check mana
    if (player.mana < spell.manaCost) return false;
    
    // Check level requirements
    if (spell.requirements.level && player.level < spell.requirements.level) return false;
    
    return true;
}

// Export for global access
if (typeof window !== 'undefined') {
    window.SpellData = {
        SCHOOLS: MAGIC_SCHOOLS,
        SCHOOL_KEYS: SCHOOL_KEYS,
        DATA: SPELL_DATA,
        getSpellById: getSpellById,
        getSpellsBySchool: getSpellsBySchool,
        getSpellBySchoolAndLevel: getSpellBySchoolAndLevel,
        getSchoolByKey: getSchoolByKey,
        canCastSpell: canCastSpell
    };
}

console.log('🔮 Spell Data system loaded successfully');
