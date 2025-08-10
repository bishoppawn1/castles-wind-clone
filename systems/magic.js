/**
 * Magic System for Castles of the Wind Clone
 * Handles spell casting, targeting, and magical effects
 */

console.log('🔮 Magic System file loaded');

class MagicSystem {
    constructor(k) {
        console.log('🔮 Magic System constructor called');
        this.k = k;
        this.activeSpells = []; // Currently active spell effects
        this.selectedSchool = null; // Currently selected magic school
        this.schoolSelectionTime = 0; // Time when school was selected
        this.selectionTimeout = 3000; // 3 seconds to select spell level
        
        // Spell casting state
        this.isCasting = false;
        this.castingSpell = null;
        this.targetingMode = false;
        this.targetPosition = null;
        this.lastCastTime = 0; // Initialize to prevent undefined arithmetic
        this.castingInProgress = false; // Flag to prevent overlapping casts
        
        console.log('🔮 About to setup key bindings...');
        // Setup key bindings for spell casting
        this.setupKeyBindings();
        
        console.log('🔮 Magic System initialized successfully');
        
        this.spellEffects = [];
    }
    
    setupKeyBindings() {
        // Check if spell data is available
        if (!window.SpellData) {
            console.error('❌ SpellData not available during magic system initialization!');
            return;
        }
        
        console.log('🔍 SpellData available:', Object.keys(window.SpellData));
        console.log('🔍 Available spells:', Object.keys(window.SpellData.DATA));
        
        // School selection keys (Z, X, C, V, B, N)
        const schoolKeys = Object.values(window.SpellData.SCHOOL_KEYS);
        console.log('🔍 School keys:', schoolKeys);
        
        schoolKeys.forEach(key => {
            this.k.onKeyPress(key, () => {
                const school = window.SpellData.getSchoolByKey(key);
                if (school) {
                    this.selectSchool(school);
                }
            });
        });
        
        // Spell level keys (1-5)
        for (let i = 1; i <= 5; i++) {
            this.k.onKeyPress(i.toString(), () => {
                if (this.selectedSchool) {
                    const spellKey = `${this.selectedSchool}_${i}`;
                    const spell = window.SpellData?.DATA[spellKey];
                    const player = this.getPlayer();
                    
                    if (spell && window.SpellData.canCastSpell(spell, player)) {
                        this.castingSpell = spell;
                        console.log(`🎯 Selected ${spell.name} for casting`);
                        // Cast immediately without targeting
                        this.castSpell();
                    } else {
                        console.log(`❌ Spell ${spellKey} not found or cannot be cast`);
                        if (spell) {
                            console.log(`🔍 Spell found but cannot cast - mana: ${player.mana}/${spell.manaCost}, level: ${player.level}/${spell.requirements.level}`);
                        }
                    }
                }
            });
        }
        
        // Cancel targeting
        this.k.onKeyPress("escape", () => {
            this.cancelCasting();
        });
        
        // Note: Spells now cast immediately when selected, no targeting needed
    }
    
    selectSchool(school) {
        console.log(`🎯 selectSchool called with: ${school}`);
        this.selectedSchool = school;
        console.log(`🎯 Selected magic school: ${school}`);
        
        // Show available spells for this school
        this.showSchoolSelection(school);
        
        // Auto-deselect after 5 seconds if no spell is cast
        setTimeout(() => {
            if (this.selectedSchool === school) {
                console.log(`🎯 Auto-cancelling school selection for ${school}`);
                this.cancelSchoolSelection();
            }
        }, 5000);
    }
    
    selectSpell(school, level) {
        if (this.selectedSchool !== school) return;
        
        const spell = window.SpellData.getSpellBySchoolAndLevel(school, level);
        if (!spell) {
            console.log(`❌ Spell ${school}_${level} not found`);
            return;
        }
        
        const player = this.getPlayer();
        if (!window.SpellData.canCastSpell(spell, player)) {
            const reason = player.mana < spell.manaCost ? 
                `Not enough mana (need ${spell.manaCost}, have ${player.mana})` :
                `Level too low (need ${spell.requirements.level}, have ${player.level})`;
            
            if (window.MessageSystem) {
                window.MessageSystem.addMessage(`Cannot cast ${spell.name}: ${reason}`, 'error');
            }
            this.cancelSchoolSelection();
            return;
        }
        
        console.log(`🔮 Selected spell: ${spell.name} (range: ${spell.range})`);
        this.castingSpell = spell;
        this.selectedSchool = null;
        
        // Start targeting if spell has range > 1
        if (spell.range > 1) {
            console.log(`🎯 Starting targeting for ${spell.name} (range ${spell.range})`);
            this.startTargeting(spell);
        } else {
            // Self-cast or melee range spell
            console.log(`⚡ Self-casting ${spell.name} (range ${spell.range})`);
            this.targetPosition = this.getPlayerPosition();
            this.castSpell();
        }
    }
    
    startTargeting(spell) {
        this.targetingMode = true;
        this.targetPosition = this.getPlayerPosition();
        
        console.log(`🎯 Targeting mode for ${spell.name}`);
        
        if (window.MessageSystem) {
            window.MessageSystem.addMessage(`Targeting ${spell.name} - Use arrow keys to aim, Enter to cast, Esc to cancel`, 'info');
        }
        
        // Set up targeting controls
        this.setupTargetingControls(spell);
    }
    
    setupTargetingControls(spell) {
        const playerPos = this.getPlayerPosition();
        
        // Arrow key targeting
        const targetingHandlers = {
            'up': () => this.moveTarget(0, -1, spell),
            'down': () => this.moveTarget(0, 1, spell),
            'left': () => this.moveTarget(-1, 0, spell),
            'right': () => this.moveTarget(1, 0, spell)
        };
        
        Object.entries(targetingHandlers).forEach(([key, handler]) => {
            const keyHandler = this.k.onKeyPress(key, handler);
            // Store handlers for cleanup
            if (!this.targetingKeyHandlers) this.targetingKeyHandlers = [];
            this.targetingKeyHandlers.push(keyHandler);
        });
    }
    
    moveTarget(dx, dy, spell) {
        if (!this.targetingMode) return;
        
        const newPos = {
            x: this.targetPosition.x + dx,
            y: this.targetPosition.y + dy
        };
        
        const playerPos = this.getPlayerPosition();
        const distance = Math.abs(newPos.x - playerPos.x) + Math.abs(newPos.y - playerPos.y);
        
        if (distance <= spell.range) {
            this.targetPosition = newPos;
            this.updateTargetingVisual();
        }
    }
    
    castSpell() {
        console.log(`🔍 castSpell() called - spell: ${this.castingSpell?.name}`);
        
        // Check if casting is already in progress
        if (this.castingInProgress) {
            console.log(`⏸️ castSpell() blocked - casting already in progress`);
            return;
        }
        
        if (!this.castingSpell) {
            console.log(`❌ castSpell() aborted - missing spell`);
            return;
        }
        
        // Prevent duplicate casting within the same frame
        const currentTime = Date.now();
        if (this.lastCastTime && currentTime - this.lastCastTime < 200) {
            console.log(`⏸️ castSpell() blocked - too recent (${currentTime - this.lastCastTime}ms ago)`);
            return; // Skip if cast recently (within 200ms)
        }
        
        // Set casting in progress flag
        this.castingInProgress = true;
        this.lastCastTime = currentTime;
        console.log(`✅ castSpell() proceeding - time check passed`);
        
        const player = this.getPlayer();
        const spell = this.castingSpell;
        
        console.log(`✨ Casting ${spell.name} in direction ${player.facing}`);
        
        // Consume mana
        player.mana -= spell.manaCost;
        
        // Handle different spell types
        if (spell.school === 'heal' || spell.school === 'protect') {
            // Instant effect spells (heal/protect)
            this.applyInstantSpell(spell, player);
        } else {
            // Projectile spells (fire, ice, lightning, poison)
            this.createProjectile(spell, player);
        }
        
        // Play sound
        this.playSpellSound(spell);
        
        // Show cast message
        if (window.MessageSystem) {
            window.MessageSystem.addMessage(`Cast ${spell.name}!`, 'magic');
        }
        
        // Clean up
        this.cleanupCasting();
        
        // Clear casting in progress flag after a short delay
        setTimeout(() => {
            this.castingInProgress = false;
        }, 100);
    }
    
    applySpellEffects(spell, targetPos, caster) {
        const timestamp = Date.now();
        console.log(`🌟 applySpellEffects called at ${timestamp} for ${spell.name}`);
        
        const targets = this.getTargetsInRange(targetPos, spell);
        console.log(`🎯 Found ${targets.length} targets for ${spell.name}`);
        
        targets.forEach((target, index) => {
            console.log(`🎯 Processing target ${index + 1}/${targets.length}: ${target.name || 'Unknown'}`);
            
            // Apply damage/healing
            if (spell.damage !== 0) {
                if (spell.damage < 0) {
                    // Healing
                    this.healTarget(target, Math.abs(spell.damage));
                } else {
                    // Damage
                    this.damageTarget(target, spell.damage, spell.school);
                }
            }
            
            // Apply spell effects
            if (spell.effects && spell.effects.length > 0) {
                console.log(`🔮 Applying ${spell.effects.length} effects to ${target.name || 'target'}: ${spell.effects.join(', ')}`);
                this.applyEffectsToTarget(target, spell.effects, spell.duration);
            }
        });
        
        // Handle area effects
        if (spell.areaEffect) {
            console.log(`🌪️ Area effect for ${spell.name} (not implemented yet)`);
            // this.createAreaEffect(spell, targetPos); // TODO: Implement area effects
        }
        
        console.log(`✅ applySpellEffects completed at ${Date.now()} for ${spell.name}`);
    }
    
    getTargetsInRange(centerPos, spell) {
        const targets = [];
        const entities = this.k.get("*");
        
        if (spell.areaEffect) {
            // Area effect spell - find all targets within area
            const range = spell.areaSize;
            console.log(`🌪️ Area effect spell ${spell.name} with range ${range}`);
            
            entities.forEach(entity => {
                if (!entity.pos) return;
                
                const entityGridPos = {
                    x: Math.floor(entity.pos.x / 32), // Assuming 32px tiles
                    y: Math.floor(entity.pos.y / 32)
                };
                
                const distance = Math.abs(entityGridPos.x - centerPos.x) + Math.abs(entityGridPos.y - centerPos.y);
                
                if (distance <= range) {
                    // Check if it's a valid target
                    if (entity.is("enemy") || entity.is("player")) {
                        targets.push(entity);
                        console.log(`🎯 Area target found: ${entity.name || 'Unknown'} at distance ${distance}`);
                    }
                }
            });
        } else {
            // Single target spell - only target the center position
            console.log(`🎯 Single target spell ${spell.name} targeting (${centerPos.x}, ${centerPos.y})`);
            
            const centerTargets = entities.filter(entity => {
                if (!entity.pos) return false;
                const entityGridPos = {
                    x: Math.floor(entity.pos.x / 32),
                    y: Math.floor(entity.pos.y / 32)
                };
                const isAtCenter = entityGridPos.x === centerPos.x && entityGridPos.y === centerPos.y;
                if (isAtCenter && (entity.is("enemy") || entity.is("player"))) {
                    console.log(`🎯 Center target found: ${entity.name || 'Unknown'}`);
                }
                return isAtCenter && (entity.is("enemy") || entity.is("player"));
            });
            targets.push(...centerTargets);
        }
        
        console.log(`🎯 Total targets found for ${spell.name}: ${targets.length}`);
        return targets;
    }
    
    healTarget(target, healing) {
        if (!target.health) return;
        
        const actualHealing = target.heal(healing);
        
        // Create healing number visual
        this.createHealingNumber(target.pos, actualHealing);
        
        console.log(`💚 ${target.name || 'Target'} healed for ${actualHealing}`);
    }
    
    applyEffectsToTarget(target, effects, duration) {
        const timestamp = Date.now();
        const effectNames = (effects || []).map(e => (typeof e === 'string') ? e : (e && e.type) || 'unknown');
        console.log(`🎭 applyEffectsToTarget called at ${timestamp} for ${target.name || 'target'} with effects: ${effectNames.join(', ')}`);
        
        (effects || []).forEach((effect, index) => {
            const logEffect = (typeof effect === 'string') ? effect : JSON.stringify(effect);
            console.log(`🔮 Processing effect ${index + 1}/${effects.length}: ${logEffect}`);
            
            // Initialize status effects if needed
            if (!target.statusEffects) target.statusEffects = [];
            
            // Normalize
            const isString = typeof effect === 'string';
            const type = isString ? effect : (effect?.type || 'unknown');
            const isPoison = type && type.includes('poison');
            const effectiveDuration = (typeof duration === 'number' && duration > 0)
                ? duration
                : (typeof effect?.duration === 'number' && effect.duration > 0 ? effect.duration : 5);
            
            if (isPoison) {
                // Poison stacks
                const poisonEffect = {
                    type,
                    duration: 10, // Always 10 actions for poison
                    damagePerTick: 1,
                    startTime: timestamp
                };
                target.statusEffects.push(poisonEffect);
                const stacks = target.statusEffects.filter(e => e.type && e.type.includes('poison')).length;
                console.log(`🐍 Applied ${type} poison stack #${stacks} to ${target.name || 'Target'} (10 actions, 1 dmg/action)`);
                console.log(`📊 Target now has ${target.statusEffects.length} total status effects`);
                return;
            }
            
            // Object-based timed effects (e.g., stat_boost) should stack by instance
            if (!isString) {
                if (type === 'stat_boost' && effect?.stat && typeof effect.amount === 'number') {
                    // Apply the temporary boost immediately
                    if (!target.tempStats) target.tempStats = {};
                    target.tempStats[effect.stat] = (target.tempStats[effect.stat] || 0) + effect.amount;
                    
                    // Track for later reversion
                    const statusEffect = {
                        type: 'stat_boost',
                        stat: effect.stat,
                        amount: effect.amount,
                        duration: effectiveDuration,
                        startTime: timestamp,
                        source: effect.source || 'item'
                    };
                    target.statusEffects.push(statusEffect);
                    
                    // Recalculate stats for player
                    try {
                        const inv = window.inventory;
                        const player = inv && typeof inv.getPlayer === 'function' ? inv.getPlayer() : null;
                        if (player && (target === player || (typeof target.is === 'function' && target.is('player')))) {
                            if (typeof inv.updatePlayerStats === 'function') inv.updatePlayerStats(target);
                        }
                    } catch (e) {
                        console.warn('⚠️ Failed to recalc stats after stat_boost apply:', e);
                    }
                    
                    // UI feedback
                    try {
                        if (window.MessageSystem && typeof window.MessageSystem.addMessage === 'function') {
                            const statName = effect.stat.charAt(0).toUpperCase() + effect.stat.slice(1);
                            window.MessageSystem.addMessage(`${target.name || 'Target'} gains +${effect.amount} ${statName} for ${effectiveDuration} turns.`, 'buff');
                        }
                    } catch {}
                    
                    console.log(`🌟 Applied stat_boost (${effect.stat} +${effect.amount}) to ${target.name || 'Target'} for ${effectiveDuration} turns`);
                } else {
                    // Unknown object-based effect: add as generic timed effect (refresh not attempted)
                    const statusEffect = {
                        type,
                        duration: effectiveDuration,
                        startTime: timestamp
                    };
                    target.statusEffects.push(statusEffect);
                    console.log(`✨ Applied ${type} to ${target.name || 'Target'} for ${effectiveDuration} turns`);
                }
                return;
            }
            
            // String-based non-poison effects: refresh if already present
            const existingEffect = target.statusEffects.find(e => e.type === type);
            if (existingEffect) {
                existingEffect.duration = effectiveDuration;
                console.log(`🔄 Refreshed ${type} on ${target.name || 'Target'} for ${effectiveDuration} turns`);
            } else {
                const statusEffect = {
                    type,
                    duration: effectiveDuration,
                    startTime: timestamp
                };
                target.statusEffects.push(statusEffect);
                console.log(`🌟 Applied ${type} to ${target.name || 'Target'} for ${effectiveDuration} turns`);
            }
        });
        
        console.log(`✅ applyEffectsToTarget completed for ${target.name || 'target'}`);
    }
    
    createSpellVisual(spell, position) {
        const worldPos = {
            x: position.x * 32 + 16, // Center of tile
            y: position.y * 32 + 16
        };
        
        // Create spell effect visual
        const visual = this.k.add([
            this.k.rect(spell.areaEffect ? spell.areaSize * 32 : 32, spell.areaEffect ? spell.areaSize * 32 : 32),
            this.k.color(...spell.color),
            this.k.pos(worldPos.x, worldPos.y),
            this.k.anchor("center"),
            this.k.opacity(0.7),
            this.k.z(1000),
            this.k.lifespan(1.0),
            {
                update() {
                    // Simple fade out over time
                    this.opacity = this.lifespan;
                }
            },
            "spell_effect"
        ]);
    }
    
    createDamageNumber(position, damage, type) {
        const colors = {
            fire: [255, 100, 50],
            ice: [150, 200, 255],
            lightning: [255, 255, 100],
            poison: [100, 255, 100],
            physical: [255, 255, 255]
        };
        
        const color = colors[type] || colors.physical;
        
        const damageText = this.k.add([
            this.k.text(`-${damage}`),
            this.k.pos(position.x, position.y),
            this.k.color(...color),
            this.k.scale(0.5),
            this.k.opacity(1),
            this.k.z(2000),
            this.k.lifespan(1.5),
            {
                startY: position.y,
                update() {
                    // Move upward over time
                    const elapsed = 1.5 - this.lifespan;
                    this.pos.y = this.startY - (elapsed * 20); // Move up 20 pixels per second
                    
                    // Fade out over time
                    this.opacity = this.lifespan / 1.5;
                }
            },
            "damage_number"
        ]);
    }
    
    createHealingNumber(position, healing) {
        const healingText = this.k.add([
            this.k.text(`+${healing}`),
            this.k.pos(position.x, position.y),
            this.k.color(100, 255, 100),
            this.k.scale(0.5),
            this.k.opacity(1),
            this.k.z(2000),
            this.k.lifespan(1.5),
            {
                startY: position.y,
                update() {
                    // Move upward over time
                    const elapsed = 1.5 - this.lifespan;
                    this.pos.y = this.startY - (elapsed * 20);
                    
                    // Fade out over time
                    this.opacity = this.lifespan / 1.5;
                }
            },
            "heal_number"
        ]);
    }
    
    createProjectile(spell, caster) {
        const directions = {
            'up': { x: 0, y: -1 },
            'down': { x: 0, y: 1 },
            'left': { x: -1, y: 0 },
            'right': { x: 1, y: 0 }
        };
        
        const direction = directions[caster.facing] || directions.down;
        
        // Calculate starting position (one tile away from caster in facing direction)
        const casterGridPos = {
            x: Math.floor(caster.pos.x / 32),
            y: Math.floor(caster.pos.y / 32)
        };
        
        const startGridPos = {
            x: casterGridPos.x + direction.x,
            y: casterGridPos.y + direction.y
        };
        
        const startPixelPos = {
            x: startGridPos.x * 32 + 16, // Center of tile
            y: startGridPos.y * 32 + 16
        };
        
        console.log(`🎥 Creating projectile for ${spell.name} from (${startGridPos.x}, ${startGridPos.y}) moving ${caster.facing}`);
        
        // Calculate projectile size and effects based on spell level
        const levelEffects = this.getProjectileLevelEffects(spell);
        
        // Create the projectile entity
        const projectile = this.k.add([
            levelEffects.shape === 'circle' ? this.k.circle(levelEffects.size) : this.k.rect(levelEffects.size, levelEffects.size),
            this.k.pos(startPixelPos.x, startPixelPos.y),
            this.k.anchor('center'),
            this.k.color(...levelEffects.color),
            this.k.opacity(levelEffects.opacity),
            this.k.z(1500),
            {
                spell: spell,
                caster: caster,
                direction: direction,
                gridPos: { ...startGridPos },
                travelDistance: 0,
                maxRange: spell.range,
                moveSpeed: 200, // pixels per second
                lastMoveTime: Date.now(),
                
                update() {
                    const currentTime = Date.now();
                    const deltaTime = (currentTime - this.lastMoveTime) / 1000; // Convert to seconds
                    
                    if (deltaTime >= 0.2) { // Move every 200ms (5 tiles per second)
                        this.moveProjectile();
                        this.lastMoveTime = currentTime;
                    }
                },
                
                moveProjectile() {
                    // Check if we've reached max range
                    if (this.travelDistance >= this.maxRange) {
                        console.log(`🎥 Projectile ${this.spell.name} reached max range (${this.maxRange})`);
                        this.explode();
                        return;
                    }
                    
                    // Calculate next grid position
                    const nextGridPos = {
                        x: this.gridPos.x + this.direction.x,
                        y: this.gridPos.y + this.direction.y
                    };
                    
                    // Check for wall collision
                    if (this.checkWallCollision(nextGridPos)) {
                        console.log(`🎥 Projectile ${this.spell.name} hit wall at (${nextGridPos.x}, ${nextGridPos.y})`);
                        this.explode();
                        return;
                    }
                    
                    // Check for target collision
                    const target = this.checkTargetCollision(nextGridPos);
                    if (target) {
                        console.log(`🎥 Projectile ${this.spell.name} hit ${target.name || 'target'}`);
                        this.hitTarget(target);
                        this.explode();
                        return;
                    }
                    
                    // Move to next position
                    this.gridPos = nextGridPos;
                    this.pos.x = nextGridPos.x * 32 + 16;
                    this.pos.y = nextGridPos.y * 32 + 16;
                    this.travelDistance++;
                },
                
                checkWallCollision(gridPos) {
                    // Check if position is out of bounds or has a wall
                    const levelData = window.currentLevel;
                    
                    // If no level data, assume no walls (don't explode immediately)
                    if (!levelData || !levelData.layout) {
                        console.log(`📊 No level data available, assuming no walls`);
                        return false;
                    }
                    
                    // Check bounds
                    if (gridPos.x < 0 || gridPos.x >= levelData.layout[0].length ||
                        gridPos.y < 0 || gridPos.y >= levelData.layout.length) {
                        console.log(`📊 Projectile hit boundary at (${gridPos.x}, ${gridPos.y})`);
                        return true; // Out of bounds
                    }
                    
                    const tile = levelData.layout[gridPos.y][gridPos.x];
                    const isWall = tile === 1;
                    if (isWall) {
                        console.log(`📊 Projectile hit wall (tile=${tile}) at (${gridPos.x}, ${gridPos.y})`);
                    }
                    return isWall;
                },
                
                checkTargetCollision(gridPos) {
                    // Find entities at this grid position
                    const entities = window.k.get('*');
                    for (const entity of entities) {
                        if (!entity.pos || entity === this.caster) continue;
                        
                        const entityGridPos = {
                            x: Math.floor(entity.pos.x / 32),
                            y: Math.floor(entity.pos.y / 32)
                        };
                        
                        if (entityGridPos.x === gridPos.x && entityGridPos.y === gridPos.y) {
                            if (entity.is('enemy') || (entity.is('player') && entity !== this.caster)) {
                                return entity;
                            }
                        }
                    }
                    return null;
                },
                
                hitTarget(target) {
                    // Apply spell effects to the target
                    const magicSystem = window.magicSystem; // Use instance, not class
                    if (magicSystem) {
                        // Apply damage
                        if (this.spell.damage > 0) {
                            magicSystem.damageTarget(target, this.spell.damage, this.spell.school);
                        }
                        
                        // Apply spell effects
                        if (this.spell.effects && this.spell.effects.length > 0) {
                            magicSystem.applyEffectsToTarget(target, this.spell.effects, this.spell.duration);
                        }
                    } else {
                        console.error('❌ Magic system instance not found');
                    }
                },
                
                explode() {
                    // Get level-based explosion effects
                    const level = this.spell.level;
                    const explosionSize = 12 + level * 4; // Bigger explosions for higher levels
                    const explosionDuration = 0.2 + level * 0.1; // Longer for higher levels
                    const maxScale = 1 + level * 0.3; // More dramatic scaling
                    
                    // Create explosion visual effect
                    const explosion = window.k.add([
                        window.k.circle(explosionSize),
                        window.k.pos(this.pos.x, this.pos.y),
                        window.k.anchor('center'),
                        window.k.color(...this.spell.color),
                        window.k.opacity(0.8),
                        window.k.z(1400),
                        window.k.lifespan(explosionDuration),
                        {
                            maxScale: maxScale,
                            duration: explosionDuration,
                            update() {
                                const progress = 1 - (this.lifespan / this.duration);
                                this.opacity = this.lifespan / this.duration;
                                this.scale = 1 + progress * (this.maxScale - 1);
                            }
                        }
                    ]);
                    
                    // Add particle effects for higher level spells
                    if (level >= 3) {
                        this.createParticleEffect();
                    }
                    
                    // Remove the projectile
                    this.destroy();
                },
                
                createParticleEffect() {
                    // Create small particles that fly outward
                    const particleCount = this.spell.level * 2;
                    for (let i = 0; i < particleCount; i++) {
                        const angle = (i / particleCount) * Math.PI * 2;
                        const speed = 50 + Math.random() * 30;
                        const size = 2 + Math.random() * 3;
                        
                        const particle = window.k.add([
                            window.k.circle(size),
                            window.k.pos(this.pos.x, this.pos.y),
                            window.k.anchor('center'),
                            window.k.color(...this.spell.color),
                            window.k.opacity(0.6),
                            window.k.z(1300),
                            window.k.lifespan(0.5),
                            {
                                velocity: {
                                    x: Math.cos(angle) * speed,
                                    y: Math.sin(angle) * speed
                                },
                                update() {
                                    this.pos.x += this.velocity.x * window.k.dt();
                                    this.pos.y += this.velocity.y * window.k.dt();
                                    this.opacity = this.lifespan / 0.5;
                                    this.scale = this.lifespan / 0.5;
                                }
                            }
                        ]);
                    }
                }
            },
            'projectile'
        ]);
        
        return projectile;
    }
    
    applyInstantSpell(spell, caster) {
        console.log(`✨ Applying instant spell ${spell.name} to ${caster.name || 'caster'}`);
        
        if (spell.school === 'heal') {
            this.applyHealSpell(spell, caster);
        } else if (spell.school === 'protect') {
            this.applyProtectSpell(spell, caster);
        }
        
        // Create visual effect at caster position
        this.createSpellVisual(spell, {
            x: Math.floor(caster.pos.x / 32),
            y: Math.floor(caster.pos.y / 32)
        });
    }
    
    applyHealSpell(spell, caster) {
        console.log(`🌿 Applying heal spell ${spell.name}`);
        
        if (spell.areaEffect) {
            // Area heal - affect caster and nearby allies
            const targets = this.getHealTargetsInArea(caster, spell.areaSize);
            console.log(`🌿 Area heal affecting ${targets.length} targets`);
            
            targets.forEach(target => {
                this.healTarget(target, Math.abs(spell.damage));
                if (spell.effects && spell.effects.length > 0) {
                    this.applyEffectsToTarget(target, spell.effects, spell.duration);
                }
            });
        } else {
            // Single target heal - affect only caster
            console.log(`🌿 Single heal on caster`);
            this.healTarget(caster, Math.abs(spell.damage));
            if (spell.effects && spell.effects.length > 0) {
                this.applyEffectsToTarget(caster, spell.effects, spell.duration);
            }
        }
    }
    
    applyProtectSpell(spell, caster) {
        console.log(`🛡️ Applying protect spell ${spell.name}`);
        
        if (spell.areaEffect) {
            // Area protection - affect caster and nearby allies
            const targets = this.getHealTargetsInArea(caster, spell.areaSize);
            console.log(`🛡️ Area protection affecting ${targets.length} targets`);
            
            targets.forEach(target => {
                if (spell.effects && spell.effects.length > 0) {
                    this.applyEffectsToTarget(target, spell.effects, spell.duration);
                }
            });
        } else {
            // Single target protection - affect only caster
            console.log(`🛡️ Single protection on caster`);
            if (spell.effects && spell.effects.length > 0) {
                this.applyEffectsToTarget(caster, spell.effects, spell.duration);
            }
        }
    }
    
    getHealTargetsInArea(center, areaSize) {
        const targets = [center]; // Always include the caster
        const entities = this.k.get('*');
        
        const centerGridPos = {
            x: Math.floor(center.pos.x / 32),
            y: Math.floor(center.pos.y / 32)
        };
        
        entities.forEach(entity => {
            if (!entity.pos || entity === center) return;
            
            const entityGridPos = {
                x: Math.floor(entity.pos.x / 32),
                y: Math.floor(entity.pos.y / 32)
            };
            
            const distance = Math.abs(entityGridPos.x - centerGridPos.x) + Math.abs(entityGridPos.y - centerGridPos.y);
            
            // Include players and friendly entities within range
            if (distance <= areaSize && entity.is('player')) {
                targets.push(entity);
                console.log(`🌿 Added ${entity.name || 'ally'} to heal targets at distance ${distance}`);
            }
        });
        
        return targets;
    }
    
    getProjectileLevelEffects(spell) {
        const baseColor = spell.color;
        const level = spell.level;
        
        // Base effects that scale with level
        const effects = {
            size: Math.max(6, 4 + level * 2), // Size increases with level (6, 8, 10, 12, 14)
            opacity: Math.min(1.0, 0.6 + level * 0.1), // Opacity increases with level
            color: [...baseColor], // Start with base color
            shape: level >= 4 ? 'circle' : 'rect' // High level spells are circular
        };
        
        // School-specific enhancements
        switch (spell.school) {
            case 'fire':
                // Fire gets brighter and more orange/red at higher levels
                if (level >= 3) {
                    effects.color[0] = Math.min(255, baseColor[0] + 30); // More red
                    effects.color[1] = Math.max(50, baseColor[1] - 20);  // Less green
                }
                if (level >= 5) {
                    effects.color[1] = Math.max(20, baseColor[1] - 50); // Even less green
                    effects.size += 2; // Bigger for max level
                }
                break;
                
            case 'ice':
                // Ice gets more blue and white at higher levels
                if (level >= 3) {
                    effects.color[2] = Math.min(255, baseColor[2] + 30); // More blue
                    effects.color[0] = Math.min(255, baseColor[0] + 20); // More white
                    effects.color[1] = Math.min(255, baseColor[1] + 20);
                }
                if (level >= 5) {
                    effects.color = [200, 220, 255]; // Pure ice blue-white
                    effects.opacity = 0.9;
                }
                break;
                
            case 'lightning':
                // Lightning gets more yellow and bright at higher levels
                if (level >= 3) {
                    effects.color[0] = Math.min(255, baseColor[0] + 20);
                    effects.color[1] = Math.min(255, baseColor[1] + 20);
                    effects.opacity = Math.min(1.0, effects.opacity + 0.2);
                }
                if (level >= 5) {
                    effects.color = [255, 255, 150]; // Bright electric yellow
                    effects.size += 3; // Much bigger
                }
                break;
                
            case 'poison':
                // Poison gets darker green and more opaque
                if (level >= 3) {
                    effects.color[1] = Math.min(255, baseColor[1] + 30); // More green
                    effects.color[0] = Math.max(50, baseColor[0] - 20);  // Less red
                    effects.color[2] = Math.max(50, baseColor[2] - 20);  // Less blue
                }
                if (level >= 5) {
                    effects.color = [80, 255, 80]; // Bright toxic green
                    effects.opacity = 0.8;
                }
                break;
        }
        
        return effects;
    }
    
    damageTarget(target, damage, spellSchool) {
        if (!target || target.isDead) return 0;
        
        console.log(`💥 Applying ${damage} ${spellSchool} damage to ${target.name || 'target'}`);
        
        // Apply damage using the target's takeDamage method if available
        let actualDamage = damage;
        if (target.takeDamage) {
            actualDamage = target.takeDamage(damage);
        } else {
            // Fallback damage application
            target.health = Math.max(0, (target.health || 0) - damage);
            if (target.health <= 0) {
                target.isDead = true;
            }
        }
        
        // Update health bars if available
        if (window.HealthBarUI) {
            window.HealthBarUI.updateHealthBar(target);
        }
        
        return actualDamage;
    }
    
    createAreaEffect(spell, position) {
        console.log(`🌪️ Creating area effect for ${spell.name} at (${position.x}, ${position.y})`);
        // TODO: Implement proper area effects
    }
    
    playSpellSound(spell) {
        // TODO: Implement sound system
        console.log(`🔊 Playing sound: ${spell.sound}`);
    }
    
    showSchoolSelection(school) {
        // TODO: Show UI indicating selected school and available spells
        console.log(`📋 Showing spells for ${school} school`);
    }
    
    updateTargetingVisual() {
        // TODO: Update targeting cursor/highlight
        console.log(`🎯 Target at (${this.targetPosition.x}, ${this.targetPosition.y})`);
    }
    
    cancelSchoolSelection() {
        this.selectedSchool = null;
        console.log(`❌ Cancelled school selection`);
    }
    
    cancelCasting() {
        this.cleanupCasting();
        if (window.MessageSystem) {
            window.MessageSystem.addMessage('Spell cancelled', 'info');
        }
    }
    
    cleanupCasting() {
        this.isCasting = false;
        this.castingSpell = null;
        this.selectedSchool = null;
        
        console.log(`🧹 Casting state cleaned up`);
    }
    
    getPlayer() {
        if (window.GameState && window.GameState.player) {
            return window.GameState.player;
        }
        
        const players = this.k.get("player");
        return players.length > 0 ? players[0] : null;
    }
    
    getPlayerPosition() {
        const player = this.getPlayer();
        if (!player || !player.pos) return { x: 0, y: 0 };
        
        return {
            x: Math.floor(player.pos.x / 32),
            y: Math.floor(player.pos.y / 32)
        };
    }
    
    // Process status effects when an entity takes an action
    processEntityAction(entity) {
        if (!entity.statusEffects || entity.statusEffects.length === 0) return;
        
        const currentTime = Date.now();
        const entityId = entity.id || entity.name || 'unknown';
        
        // Prevent duplicate processing within the same action cycle
        if (entity.lastEffectProcessTime && currentTime - entity.lastEffectProcessTime < 500) {
            console.log(`⏸️ Skipping status effect processing for ${entityId} - too recent (${currentTime - entity.lastEffectProcessTime}ms ago)`);
            return; // Skip if processed recently (within 500ms)
        }
        
        entity.lastEffectProcessTime = currentTime;
        console.log(`🎯 Processing status effects for ${entityId} at ${currentTime}`);
        
        // Apply per-tick effects and decrement durations
        entity.statusEffects = entity.statusEffects.filter(effect => {
            const type = effect?.type || 'unknown';
            
            // Poison DOT
            if (type.includes('poison') && effect.damagePerTick) {
                if (entity.takeDamage) {
                    entity.takeDamage(effect.damagePerTick);
                    this.createDamageNumber(entity.pos, effect.damagePerTick, 'poison');
                    console.log(`🐍 ${entity.name || 'Entity'} takes ${effect.damagePerTick} poison damage (${(effect.duration || 1) - 1} actions left)`);
                }
            }
            
            // Decrement duration after applying per-tick effects
            if (typeof effect.duration === 'number') effect.duration--;
            const expired = typeof effect.duration === 'number' && effect.duration <= 0;
            if (expired) {
                console.log(`⏰ ${type} effect expired on ${entity.name || 'entity'}`);
                
                // Revert temporary stat boosts
                if (type === 'stat_boost' && effect.stat && typeof effect.amount === 'number') {
                    try {
                        if (!entity.tempStats) entity.tempStats = {};
                        const current = entity.tempStats[effect.stat] || 0;
                        entity.tempStats[effect.stat] = current - effect.amount;
                        
                        // Recalculate for player
                        const inv = window.inventory;
                        const player = inv && typeof inv.getPlayer === 'function' ? inv.getPlayer() : null;
                        if (player && (entity === player || (typeof entity.is === 'function' && entity.is('player')))) {
                            if (typeof inv.updatePlayerStats === 'function') inv.updatePlayerStats(entity);
                        }
                        
                        // UI feedback
                        if (window.MessageSystem && typeof window.MessageSystem.addMessage === 'function') {
                            const statName = effect.stat.charAt(0).toUpperCase() + effect.stat.slice(1);
                            const who = entity.name || 'Target';
                            window.MessageSystem.addMessage(`${who}'s ${statName} boost wears off.`, 'debuff');
                        }
                    } catch (e) {
                        console.warn('⚠️ Failed to revert stat_boost on expiry:', e);
                    }
                }
                
                return false; // Remove expired effect
            }
            return true; // Keep active effect
        });
        
        console.log(`✅ Status effect processing completed for ${entityId}`);
    }
    
    // Update method for compatibility - only updates active spells now
    update() {
        this.updateActiveSpells();
        // Status effects are now processed per action, not per frame
    }
    
    updateActiveSpells() {
        this.activeSpells = this.activeSpells.filter(spell => {
            spell.duration -= this.k.dt();
            return spell.duration > 0;
        });
    }
    
    // Legacy method for compatibility - now does nothing
    updateStatusEffects() {
        // Status effects are now processed per action, not per frame
        // Call processEntityAction(entity) when an entity takes an action
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.MagicSystem = MagicSystem;
}

console.log('🔮 Magic System loaded successfully');
