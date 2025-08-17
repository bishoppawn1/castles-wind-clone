// Environment System for Castles of the Wind Clone
// Handles environmental features, special tile behaviors, and atmospheric effects

const EnvironmentSystem = {
    k: null,
    environmentalFeatures: [],

    init(kaboomContext) {
        this.k = kaboomContext;
        console.log('EnvironmentSystem initialized');
    },

    // Create environmental features for a level
    createEnvironmentalFeatures(levelData) {
        console.log(`Creating environmental features for ${levelData.name}`);
        
        // Create stairs with special behaviors
        this.createStairs(levelData);
        
        // Create atmospheric lighting effects
        this.createAtmosphericEffects(levelData);
        
        // Create environmental hazards and traps
        this.createEnvironmentalHazards(levelData);
        
        // Create ambient sounds and effects
        this.createAmbientEffects(levelData);
    },

    // Create stairs with transition capabilities
    createStairs(levelData) {
        console.log(`🏗️ Creating stairs for level: ${levelData.name || levelData.id}`);
        console.log(`🔍 Level data stairs:`, levelData.stairs);
        
        if (!levelData.stairs) {
            console.log(`⚠️ No stairs data found in level`);
            return;
        }

        console.log(`📍 Found ${levelData.stairs.length} stairs to create`);
        levelData.stairs.forEach((stairData, index) => {
            console.log(`🏗️ Creating stair ${index + 1}:`, stairData);
            const worldX = stairData.x * 32 + 16;
            const worldY = stairData.y * 32 + 16;

            const isDown = stairData.type === 'down';
            const stairColor = isDown ? [100, 50, 0] : [120, 70, 20]; // Dark brown for down, lighter for up
            const stairSymbol = isDown ? "↓" : "↑";
            const stairTag = isDown ? "stairs_down" : "stairs_up";

            const stairs = this.k.add([
                this.k.rect(32, 32),
                this.k.color(...stairColor),
                this.k.pos(worldX, worldY),
                this.k.anchor("center"),
                this.k.area(),
                this.k.z(1),
                stairTag,
                "interactive",
                "stairs", // Add generic stairs tag for easier detection
                {
                    gridX: stairData.x,
                    gridY: stairData.y,
                    tileType: stairTag,
                    direction: stairData.type,
                    targetLevel: stairData.targetLevel,
                    description: stairData.description,
                    accessible: true // Make accessible for testing
                }
            ]);
            
            console.log(`✅ Created stairs entity:`, {
                position: `(${stairData.x}, ${stairData.y})`,
                worldPos: `(${worldX}, ${worldY})`,
                direction: stairData.type,
                targetLevel: stairData.targetLevel,
                tags: [stairTag, "interactive"],
                accessible: true
            });

            // Add visual indicator
            this.k.add([
                this.k.text(stairSymbol, { size: 20 }),
                this.k.color(255, 255, 255),
                this.k.pos(worldX, worldY),
                this.k.anchor("center"),
                this.k.z(15)
            ]);

            // Add interaction prompt
            this.k.add([
                this.k.text("Press E", { size: 10 }),
                this.k.color(200, 200, 200),
                this.k.pos(worldX, worldY + 20),
                this.k.anchor("center"),
                this.k.z(15),
                "stair_prompt"
            ]);
        });

        console.log(`Created ${levelData.stairs.length} stairs`);
    },

    // Create atmospheric lighting and particle effects
    createAtmosphericEffects(levelData) {
        if (!levelData.lighting) return;

        // Create torch effects
        if (levelData.lighting.torches) {
            levelData.lighting.torches.forEach(torch => {
                this.createTorchEffect(torch);
            });
        }

        // Create ambient lighting overlay
        this.createAmbientLighting(levelData.lighting.ambient || 0.3);
    },

    // Create individual torch with flickering light effect
    createTorchEffect(torchData) {
        const worldX = torchData.x * 32 + 16;
        const worldY = torchData.y * 32 + 16;

        // Create torch base
        const torch = this.k.add([
            this.k.rect(8, 16),
            this.k.color(139, 69, 19), // Brown torch handle
            this.k.pos(worldX, worldY - 8),
            this.k.anchor("center"),
            this.k.z(12),
            "torch",
            {
                gridX: torchData.x,
                gridY: torchData.y,
                lightRadius: torchData.radius || 4,
                intensity: torchData.intensity || 0.7,
                flickerTimer: 0
            }
        ]);

        // Create flame effect
        const flame = this.k.add([
            this.k.circle(6),
            this.k.color(255, 100, 0), // Orange flame
            this.k.pos(worldX, worldY - 16),
            this.k.anchor("center"),
            this.k.z(13),
            {
                baseColor: [255, 100, 0],
                flickerIntensity: 0.3
            }
        ]);

        // Add flickering animation
        torch.onUpdate(() => {
            torch.flickerTimer += this.k.dt();
            
            // Flicker the flame
            const flicker = Math.sin(torch.flickerTimer * 8) * 0.2 + 0.8;
            const red = Math.floor(255 * flicker);
            const green = Math.floor(100 * flicker);
            
            flame.color = this.k.color(red, green, 0);
            
            // Slight size variation
            const scale = 0.8 + Math.sin(torch.flickerTimer * 6) * 0.2;
            flame.scale = this.k.vec2(scale, scale);
        });

        // Create light radius effect (visual only)
        const lightRadius = this.k.add([
            this.k.circle(torch.lightRadius * 32),
            this.k.color(255, 200, 100),
            this.k.opacity(0.1),
            this.k.pos(worldX, worldY),
            this.k.anchor("center"),
            this.k.z(5)
        ]);

        this.environmentalFeatures.push(torch);
    },

    // Create ambient lighting overlay
    createAmbientLighting(ambientLevel) {
        // Create a dark overlay that will be modified by lighting
        const overlay = this.k.add([
            this.k.rect(this.k.width(), this.k.height()),
            this.k.color(0, 0, 0),
            this.k.opacity(1 - ambientLevel),
            this.k.pos(0, 0),
            this.k.z(100),
            "lighting_overlay",
            {
                ambientLevel: ambientLevel
            }
        ]);

        // Make overlay follow camera
        overlay.onUpdate(() => {
            const cam = this.k.camPos();
            overlay.pos = this.k.vec2(
                cam.x - this.k.width() / 2,
                cam.y - this.k.height() / 2
            );
        });
    },

    // Create environmental hazards
    createEnvironmentalHazards(levelData) {
        // Create traps from level data
        if (levelData.traps) {
            levelData.traps.forEach(trap => {
                this.createTrap(trap);
            });
        }
        
        // Legacy: Add some spike traps in level 2 if no traps defined
        if (levelData.id === 'level_2' && !levelData.traps) {
            this.createSpikeTrap(25, 8);
            this.createSpikeTrap(35, 15);
        }
    },

    // Create a trap from trap data
    createTrap(trapData) {
        switch (trapData.type) {
            case 'spike_trap':
                this.createSpikeTrap(trapData.x, trapData.y, trapData.damage);
                break;
            // Add more trap types here as needed
            default:
                console.warn(`Unknown trap type: ${trapData.type}`);
        }
    },

    // Create a spike trap
    createSpikeTrap(x, y, damage = 10) {
        const worldX = x * 32 + 16;
        const worldY = y * 32 + 16;

        const trap = this.k.add([
            this.k.rect(32, 32),
            this.k.color(80, 80, 80), // Dark gray
            this.k.pos(worldX, worldY),
            this.k.anchor("center"),
            this.k.area(),
            this.k.z(1),
            "spike_trap",
            {
                gridX: x,
                gridY: y,
                armed: true,
                damage: damage,
                cooldown: 0
            }
        ]);

        // Add spikes visual
        this.k.add([
            this.k.text("▲▲▲", { size: 12 }),
            this.k.color(100, 100, 100),
            this.k.pos(worldX, worldY),
            this.k.anchor("center"),
            this.k.z(2)
        ]);

        // Trap activation
        trap.onCollide("player", (player) => {
            if (trap.armed && trap.cooldown <= 0) {
                this.activateSpikeTrap(trap, player);
            }
        });

        trap.onUpdate(() => {
            if (trap.cooldown > 0) {
                trap.cooldown -= this.k.dt();
            }
        });

        this.environmentalFeatures.push(trap);
    },

    // Activate spike trap
    activateSpikeTrap(trap, player) {
        trap.cooldown = 3; // 3 second cooldown
        
        // Visual feedback
        trap.color = this.k.color(255, 0, 0);
        this.k.wait(0.5, () => {
            trap.color = this.k.color(80, 80, 80);
        });

        // Damage player
        if (player.health !== undefined) {
            player.health = Math.max(0, player.health - trap.damage);
            console.log(`Spike trap activated! Player took ${trap.damage} damage. Health: ${player.health}`);
            
            // Create damage effect
            const k = this.k; // Capture kaplay context
            this.k.add([
                this.k.text(`-${trap.damage}`, { size: 16 }),
                this.k.color(255, 0, 0),
                this.k.pos(player.pos.x, player.pos.y - 20),
                this.k.anchor("center"),
                this.k.lifespan(2),
                this.k.opacity(),
                this.k.z(100),
                {
                    update() {
                        this.pos.y -= 30 * k.dt();
                    }
                }
            ]);

            // Check for player death from trap
            if (player.health <= 0) {
                console.log('💀 Player died from trap!');
                player.isDead = true;
                
                // Trigger respawn screen after a short delay
                setTimeout(() => {
                    if (window.ProgressionSystem) {
                        ProgressionSystem.triggerDeathScreen(
                            'You were killed by a deadly trap!',
                            'trap'
                        );
                    }
                }, 1500);
            } else {
                // Trigger trap survived event for objectives system (if player survives)
                const trapEventData = {
                    trapType: 'spike_trap',
                    damage: trap.damage,
                    position: { x: trap.gridX, y: trap.gridY },
                    playerHealth: player.health
                };
                
                // Try multiple ways to trigger the event
                if (this.k && typeof this.k.trigger === 'function') {
                    this.k.trigger('trap_survived', trapEventData);
                    console.log('🪤 Triggered trap_survived via this.k:', trapEventData);
                }
                
                if (typeof window !== 'undefined' && window.k && typeof window.k.trigger === 'function') {
                    window.k.trigger('trap_survived', trapEventData);
                    console.log('🪤 Triggered trap_survived via window.k:', trapEventData);
                }
                
                // Direct call to objectives system as fallback
                if (typeof window !== 'undefined' && window.ObjectivesSystem) {
                    window.ObjectivesSystem.trackObjectiveProgress('trap_survived', trapEventData);
                    console.log('🪤 Direct call to ObjectivesSystem for trap:', trapEventData);
                }
            }
        }
    },

    // Create ambient sound and particle effects
    createAmbientEffects(levelData) {
        // Create subtle particle effects for atmosphere
        this.createDustParticles();
        
        // Add environmental sounds (placeholder for future audio system)
        console.log(`Added ambient effects for ${levelData.name}`);
    },

    // Create floating dust particles for atmosphere
    createDustParticles() {
        // Spawn dust particles periodically
        this.k.loop(2, () => {
            const cam = this.k.camPos();
            const x = cam.x + (Math.random() - 0.5) * this.k.width();
            const y = cam.y + (Math.random() - 0.5) * this.k.height();

            this.k.add([
                this.k.circle(1),
                this.k.color(200, 200, 200),
                this.k.opacity(0.3),
                this.k.pos(x, y),
                this.k.z(8),
                this.k.lifespan(5),
                {
                    velocity: this.k.vec2((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10)
                }
            ]);
        });
    },

    // Find positions of specific tile types in level
    findTilePositions(levelData, tileType) {
        const positions = [];
        const TILE_SYMBOLS = {
            'stairs_down': 'S',
            'stairs_up': 'U',
            'entrance': 'E',
            'exit': 'X'
        };
        
        const symbol = TILE_SYMBOLS[tileType];
        if (!symbol) return positions;

        for (let y = 0; y < levelData.layout.length; y++) {
            for (let x = 0; x < levelData.layout[y].length; x++) {
                if (levelData.layout[y][x] === symbol) {
                    positions.push({ x, y });
                }
            }
        }

        return positions;
    },

    // Clean up environmental features
    cleanup() {
        this.environmentalFeatures.forEach(feature => {
            if (feature && feature.destroy) {
                feature.destroy();
            }
        });
        this.environmentalFeatures = [];
        console.log('Environmental features cleaned up');
    }
};
