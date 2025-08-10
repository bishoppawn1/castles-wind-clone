// Combat UI System for Castles of the Wind Clone
// Manages turn indicators, combat status, and UI coordination

const CombatUI = {
    // Initialize combat UI system
    init(k) {
        this.k = k;
        this.turnIndicator = null;
        this.combatStatus = null;
        this.isVisible = false;
        
        console.log('⚔️ Combat UI initialized');
    },
    
    // Create turn indicator
    createTurnIndicator() {
        if (this.turnIndicator) {
            this.removeTurnIndicator();
        }
        
        // Turn indicator background
        const indicatorBg = this.k.add([
            this.k.rect(200, 30),
            this.k.color(20, 20, 30, 0.9),
            this.k.pos(this.k.width() / 2 - 100, 50),
            this.k.fixed(),
            this.k.z(150)
        ]);
        
        // Turn indicator border
        const indicatorBorder = this.k.add([
            this.k.rect(200, 30),
            this.k.outline(2, this.k.rgb(100, 100, 100)),
            this.k.pos(this.k.width() / 2 - 100, 50),
            this.k.fixed(),
            this.k.z(151)
        ]);
        
        // Turn indicator text
        const indicatorText = this.k.add([
            this.k.text("Your Turn"),
            this.k.pos(this.k.width() / 2, 65),
            this.k.anchor("center"),
            this.k.scale(0.35),
            this.k.color(255, 255, 255),
            this.k.fixed(),
            this.k.z(152)
        ]);
        
        this.turnIndicator = {
            background: indicatorBg,
            border: indicatorBorder,
            text: indicatorText
        };
        
        // Hide initially
        this.hideTurnIndicator();
        
        return this.turnIndicator;
    },
    
    // Update turn indicator (DISABLED)
    updateTurnIndicator(entityName, isPlayer = false) {
        // Turn indicator disabled by user request
        return;
    },
    
    // Show turn indicator
    showTurnIndicator() {
        if (!this.turnIndicator) return;
        
        this.turnIndicator.background.opacity = 0.9;
        this.turnIndicator.border.opacity = 1.0;
        this.turnIndicator.text.opacity = 1.0;
    },
    
    // Hide turn indicator
    hideTurnIndicator() {
        if (!this.turnIndicator) return;
        
        this.turnIndicator.background.opacity = 0;
        this.turnIndicator.border.opacity = 0;
        this.turnIndicator.text.opacity = 0;
    },
    
    // Remove turn indicator
    removeTurnIndicator() {
        if (!this.turnIndicator) return;
        
        this.k.destroy(this.turnIndicator.background);
        this.k.destroy(this.turnIndicator.border);
        this.k.destroy(this.turnIndicator.text);
        
        this.turnIndicator = null;
    },
    
    // Create combat status panel
    createCombatStatus() {
        if (this.combatStatus) {
            this.removeCombatStatus();
        }
        
        // Combat status background
        const statusBg = this.k.add([
            this.k.rect(150, 80),
            this.k.color(20, 20, 30, 0.8),
            this.k.pos(this.k.width() - 160, 90),
            this.k.fixed(),
            this.k.z(150)
        ]);
        
        // Combat status border
        const statusBorder = this.k.add([
            this.k.rect(150, 80),
            this.k.outline(1, this.k.rgb(100, 100, 100)),
            this.k.pos(this.k.width() - 160, 90),
            this.k.fixed(),
            this.k.z(151)
        ]);
        
        // Combat status title
        const statusTitle = this.k.add([
            this.k.text("COMBAT"),
            this.k.pos(this.k.width() - 85, 105),
            this.k.anchor("center"),
            this.k.scale(0.35),
            this.k.color(255, 200, 100),
            this.k.fixed(),
            this.k.z(152)
        ]);
        
        // Combat instructions
        const statusInstructions = this.k.add([
            this.k.text("SPACE: Attack\nWAIT: Enemy Turn"),
            this.k.pos(this.k.width() - 85, 135),
            this.k.anchor("center"),
            this.k.scale(0.3),
            this.k.color(200, 200, 200),
            this.k.fixed(),
            this.k.z(152)
        ]);
        
        this.combatStatus = {
            background: statusBg,
            border: statusBorder,
            title: statusTitle,
            instructions: statusInstructions
        };
        
        // Hide initially
        this.hideCombatStatus();
        
        return this.combatStatus;
    },
    
    // Show combat status (DISABLED)
    showCombatStatus() {
        // Combat status box disabled by user request
        return;
    },
    
    // Hide combat status
    hideCombatStatus() {
        if (!this.combatStatus) return;
        
        this.combatStatus.background.opacity = 0;
        this.combatStatus.border.opacity = 0;
        this.combatStatus.title.opacity = 0;
        this.combatStatus.instructions.opacity = 0;
    },
    
    // Remove combat status
    removeCombatStatus() {
        if (!this.combatStatus) return;
        
        this.k.destroy(this.combatStatus.background);
        this.k.destroy(this.combatStatus.border);
        this.k.destroy(this.combatStatus.title);
        this.k.destroy(this.combatStatus.instructions);
        
        this.combatStatus = null;
    },
    
    // Show all combat UI elements
    showCombatUI() {
        this.isVisible = true;
        this.showCombatStatus();
        
        // Show health bars for combat
        if (window.HealthBarUI) {
            HealthBarUI.showCombatHealthBars();
        }
        
        // Add combat start message
        if (window.MessageUI) {
            MessageUI.addCombatStateMessage('start');
        }
    },
    
    // Hide all combat UI elements
    hideCombatUI() {
        this.isVisible = false;
        this.hideTurnIndicator();
        this.hideCombatStatus();
        
        // Hide health bars when combat ends
        if (window.HealthBarUI) {
            HealthBarUI.hideCombatHealthBars();
        }
        
        // Add combat end message
        if (window.MessageUI) {
            MessageUI.addCombatStateMessage('end');
        }
    },
    
    // Update combat UI based on combat state
    updateCombatState(combatActive, currentTurn = null, combatQueue = []) {
        if (combatActive && !this.isVisible) {
            this.showCombatUI();
        } else if (!combatActive && this.isVisible) {
            this.hideCombatUI();
        }
        
        // Update turn indicator if in combat
        if (combatActive && currentTurn !== null && combatQueue.length > 0) {
            const currentEntity = combatQueue[currentTurn];
            if (currentEntity && !currentEntity.isDead) {
                const isPlayer = !currentEntity.enemyId;
                const entityName = (currentEntity && currentEntity.name) || 'Player';
                this.updateTurnIndicator(entityName, isPlayer);
                
                // Turn messages disabled by user request
                // if (window.MessageUI) {
                //     MessageUI.addTurnMessage(entityName, isPlayer);
                // }
            }
        }
    },
    
    // Handle combat events
    onCombatEvent(eventType, data = {}) {
        switch (eventType) {
            case 'attack':
                if (window.MessageUI) {
                    MessageUI.addCombatMessage(data.attacker, data.target, data.damage, 'attack');
                }
                break;
                
            case 'death':
                if (window.MessageUI) {
                    MessageUI.addCombatMessage(null, data.target, 0, 'death');
                }
                break;
                
            case 'victory':
                if (window.MessageUI) {
                    MessageUI.addCombatStateMessage('victory', data.enemy);
                }
                break;
                
            case 'defeat':
                if (window.MessageUI) {
                    MessageUI.addCombatStateMessage('defeat');
                }
                break;
        }
    },
    
    // Clean up combat UI
    cleanup() {
        this.removeTurnIndicator();
        this.removeCombatStatus();
        this.isVisible = false;
        console.log('⚔️ Combat UI cleaned up');
    }
};

// Make CombatUI globally available
window.CombatUI = CombatUI;

console.log('⚔️ Combat UI system loaded successfully');
