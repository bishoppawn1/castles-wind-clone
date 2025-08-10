/**
 * Spell UI System for Castles of the Wind Clone
 * Displays magic schools, spell selection, mana bar, and targeting interface
 */

class SpellUI {
    constructor(k) {
        this.k = k;
        this.isVisible = false;
        this.overlay = null;
        this.selectedSchool = null;
        this.targetingCursor = null;
        
        // UI Configuration
        this.config = {
            panelWidth: 400,
            panelHeight: 300,
            schoolButtonSize: 50,
            spellButtonSize: 40,
            backgroundColor: [20, 20, 30, 0.9],
            borderColor: [100, 100, 150],
            textColor: [200, 200, 255],
            selectedColor: [255, 255, 100],
            disabledColor: [100, 100, 100]
        };
        
        this.setupKeyBindings();
    }
    
    setupKeyBindings() {
        // M key disabled - spells work directly without UI toggle
        // this.k.onKeyPress("m", () => {
        //     this.toggle();
        // });
        console.log('📋 Spell UI M key handler disabled - spells work directly');
    }
    
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    show() {
        if (this.isVisible) return;
        
        this.isVisible = true;
        this.createUI();
        
        console.log('🔮 Spell UI opened');
    }
    
    hide() {
        if (!this.isVisible) return;
        
        this.isVisible = false;
        this.destroyUI();
        
        console.log('🔮 Spell UI closed');
    }
    
    createUI() {
        // Create overlay
        this.overlay = this.k.add([
            this.k.rect(this.k.width(), this.k.height()),
            this.k.color(0, 0, 0, 0.3),
            this.k.pos(0, 0),
            this.k.z(1500),
            "spell_ui_overlay"
        ]);
        
        // Main panel
        const panelX = (this.k.width() - this.config.panelWidth) / 2;
        const panelY = (this.k.height() - this.config.panelHeight) / 2;
        
        this.panel = this.overlay.add([
            this.k.rect(this.config.panelWidth, this.config.panelHeight),
            this.k.color(...this.config.backgroundColor),
            this.k.pos(panelX, panelY),
            this.k.outline(2, this.k.rgb(...this.config.borderColor)),
            this.k.z(1501),
            "spell_panel"
        ]);
        
        // Title
        this.overlay.add([
            this.k.text("Magic Spellbook"),
            this.k.pos(panelX + this.config.panelWidth / 2, panelY + 20),
            this.k.anchor("center"),
            this.k.scale(0.6),
            this.k.color(...this.config.textColor),
            this.k.z(1502)
        ]);
        
        // Create school buttons
        this.createSchoolButtons(panelX, panelY);
        
        // Create mana display
        this.createManaDisplay(panelX, panelY);
        
        // Create instructions
        this.createInstructions(panelX, panelY);
    }
    
    createSchoolButtons(panelX, panelY) {
        const schools = [
            { school: 'fire', key: 'Z', name: 'Fire', color: [255, 100, 50] },
            { school: 'ice', key: 'X', name: 'Ice', color: [150, 200, 255] },
            { school: 'lightning', key: 'C', name: 'Lightning', color: [255, 255, 100] },
            { school: 'poison', key: 'V', name: 'Poison', color: [100, 255, 100] },
            { school: 'heal', key: 'B', name: 'Heal', color: [255, 200, 200] },
            { school: 'protect', key: 'N', name: 'Protect', color: [200, 200, 255] }
        ];
        
        const startX = panelX + 30;
        const startY = panelY + 60;
        const buttonsPerRow = 3;
        const buttonSpacing = 120;
        const rowSpacing = 80;
        
        schools.forEach((schoolInfo, index) => {
            const row = Math.floor(index / buttonsPerRow);
            const col = index % buttonsPerRow;
            
            const buttonX = startX + col * buttonSpacing;
            const buttonY = startY + row * rowSpacing;
            
            // School button background
            const button = this.overlay.add([
                this.k.rect(this.config.schoolButtonSize, this.config.schoolButtonSize),
                this.k.color(...schoolInfo.color),
                this.k.pos(buttonX, buttonY),
                this.k.outline(2, this.k.rgb(255, 255, 255)),
                this.k.z(1502),
                "school_button",
                { school: schoolInfo.school }
            ]);
            
            // School key label
            this.overlay.add([
                this.k.text(schoolInfo.key),
                this.k.pos(buttonX + this.config.schoolButtonSize / 2, buttonY + this.config.schoolButtonSize / 2),
                this.k.anchor("center"),
                this.k.scale(0.8),
                this.k.color(0, 0, 0),
                this.k.z(1503)
            ]);
            
            // School name
            this.overlay.add([
                this.k.text(schoolInfo.name),
                this.k.pos(buttonX + this.config.schoolButtonSize / 2, buttonY + this.config.schoolButtonSize + 10),
                this.k.anchor("center"),
                this.k.scale(0.3),
                this.k.color(...this.config.textColor),
                this.k.z(1503)
            ]);
            
            // Add click handler
            button.onClick(() => {
                this.selectSchool(schoolInfo.school);
            });
        });
    }
    
    createManaDisplay(panelX, panelY) {
        const player = this.getPlayer();
        const currentMana = player ? player.mana : 0;
        const maxMana = player ? player.maxMana : 100;
        
        const manaBarX = panelX + 30;
        const manaBarY = panelY + this.config.panelHeight - 60;
        const manaBarWidth = this.config.panelWidth - 60;
        const manaBarHeight = 20;
        
        // Mana bar background
        this.overlay.add([
            this.k.rect(manaBarWidth, manaBarHeight),
            this.k.color(50, 50, 50),
            this.k.pos(manaBarX, manaBarY),
            this.k.outline(1, this.k.rgb(100, 100, 100)),
            this.k.z(1502)
        ]);
        
        // Mana bar fill
        const manaPercent = maxMana > 0 ? currentMana / maxMana : 0;
        this.overlay.add([
            this.k.rect(manaBarWidth * manaPercent, manaBarHeight),
            this.k.color(100, 150, 255),
            this.k.pos(manaBarX, manaBarY),
            this.k.z(1503)
        ]);
        
        // Mana text
        this.overlay.add([
            this.k.text(`Mana: ${currentMana}/${maxMana}`),
            this.k.pos(manaBarX + manaBarWidth / 2, manaBarY + manaBarHeight / 2),
            this.k.anchor("center"),
            this.k.scale(0.4),
            this.k.color(255, 255, 255),
            this.k.z(1504)
        ]);
    }
    
    createInstructions(panelX, panelY) {
        const instructions = [
            "Press school key (Z,X,C,V,B,N) then spell level (1-5)",
            "M - Toggle Spellbook",
            "ESC - Cancel casting"
        ];
        
        const startY = panelY + this.config.panelHeight - 40;
        
        instructions.forEach((instruction, index) => {
            this.overlay.add([
                this.k.text(instruction),
                this.k.pos(panelX + this.config.panelWidth / 2, startY + index * 12),
                this.k.anchor("center"),
                this.k.scale(0.25),
                this.k.color(...this.config.textColor),
                this.k.z(1502)
            ]);
        });
    }
    
    selectSchool(school) {
        this.selectedSchool = school;
        console.log(`🔮 Selected ${school} school from UI`);
        
        // Show spell selection for this school
        this.showSpellSelection(school);
        
        // Hide main UI and show spell selection
        this.hide();
    }
    
    showSpellSelection(school) {
        // Create spell selection overlay
        this.spellOverlay = this.k.add([
            this.k.rect(this.k.width(), this.k.height()),
            this.k.color(0, 0, 0, 0.5),
            this.k.pos(0, 0),
            this.k.z(1600),
            "spell_selection_overlay"
        ]);
        
        const spells = window.SpellData.getSpellsBySchool(school);
        const player = this.getPlayer();
        
        // Create spell buttons
        const startX = this.k.width() / 2 - 250;
        const startY = this.k.height() / 2 - 100;
        
        spells.forEach((spell, index) => {
            const buttonX = startX + index * 100;
            const buttonY = startY;
            
            const canCast = window.SpellData.canCastSpell(spell, player);
            const buttonColor = canCast ? [100, 150, 255] : this.config.disabledColor;
            
            // Spell button
            const button = this.spellOverlay.add([
                this.k.rect(80, 80),
                this.k.color(...buttonColor),
                this.k.pos(buttonX, buttonY),
                this.k.outline(2, this.k.rgb(255, 255, 255)),
                this.k.z(1601),
                "spell_button",
                { spell: spell }
            ]);
            
            // Spell level
            this.spellOverlay.add([
                this.k.text(spell.level.toString()),
                this.k.pos(buttonX + 40, buttonY + 20),
                this.k.anchor("center"),
                this.k.scale(1.2),
                this.k.color(255, 255, 255),
                this.k.z(1602)
            ]);
            
            // Spell name
            this.spellOverlay.add([
                this.k.text(spell.name),
                this.k.pos(buttonX + 40, buttonY + 50),
                this.k.anchor("center"),
                this.k.scale(0.3),
                this.k.color(255, 255, 255),
                this.k.z(1602)
            ]);
            
            // Mana cost
            this.spellOverlay.add([
                this.k.text(`${spell.manaCost} MP`),
                this.k.pos(buttonX + 40, buttonY + 65),
                this.k.anchor("center"),
                this.k.scale(0.25),
                this.k.color(150, 150, 255),
                this.k.z(1602)
            ]);
            
            if (canCast) {
                button.onClick(() => {
                    this.castSpell(spell);
                });
            }
        });
        
        // Instructions
        this.spellOverlay.add([
            this.k.text(`${school.toUpperCase()} MAGIC - Click spell or press 1-5`),
            this.k.pos(this.k.width() / 2, startY - 50),
            this.k.anchor("center"),
            this.k.scale(0.5),
            this.k.color(255, 255, 255),
            this.k.z(1601)
        ]);
        
        // Auto-hide after timeout
        setTimeout(() => {
            this.hideSpellSelection();
        }, 5000);
    }
    
    hideSpellSelection() {
        if (this.spellOverlay) {
            this.spellOverlay.destroy();
            this.spellOverlay = null;
        }
        this.selectedSchool = null;
    }
    
    castSpell(spell) {
        console.log(`✨ Casting ${spell.name} from UI`);
        
        // Hide spell selection
        this.hideSpellSelection();
        
        // Trigger the magic system
        if (window.magicSystem) {
            window.magicSystem.castingSpell = spell;
            
            if (spell.range > 1) {
                window.magicSystem.startTargeting(spell);
            } else {
                window.magicSystem.targetPosition = window.magicSystem.getPlayerPosition();
                window.magicSystem.castSpell();
            }
        }
    }
    
    showTargetingCursor(position, spell) {
        this.hideTargetingCursor();
        
        const worldPos = {
            x: position.x * 32 + 16,
            y: position.y * 32 + 16
        };
        
        // Create targeting cursor
        this.targetingCursor = this.k.add([
            this.k.rect(32, 32),
            this.k.color(255, 255, 0, 0.5),
            this.k.pos(worldPos.x, worldPos.y),
            this.k.anchor("center"),
            this.k.outline(2, this.k.rgb(255, 255, 255)),
            this.k.z(2000),
            "targeting_cursor"
        ]);
        
        // Show range indicator if area effect
        if (spell.areaEffect) {
            const areaSize = spell.areaSize * 32;
            this.areaIndicator = this.k.add([
                this.k.rect(areaSize, areaSize),
                this.k.color(255, 0, 0, 0.2),
                this.k.pos(worldPos.x, worldPos.y),
                this.k.anchor("center"),
                this.k.outline(1, this.k.rgb(255, 0, 0)),
                this.k.z(1999),
                "area_indicator"
            ]);
        }
    }
    
    hideTargetingCursor() {
        if (this.targetingCursor) {
            this.targetingCursor.destroy();
            this.targetingCursor = null;
        }
        
        if (this.areaIndicator) {
            this.areaIndicator.destroy();
            this.areaIndicator = null;
        }
    }
    
    destroyUI() {
        if (this.overlay) {
            this.overlay.destroy();
            this.overlay = null;
        }
        
        this.hideSpellSelection();
        this.hideTargetingCursor();
    }
    
    getPlayer() {
        if (window.GameState && window.GameState.player) {
            return window.GameState.player;
        }
        
        const players = this.k.get("player");
        return players.length > 0 ? players[0] : null;
    }
    
    // Update method for dynamic elements
    update() {
        // Update mana display if UI is visible
        if (this.isVisible) {
            // TODO: Refresh mana display
        }
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.SpellUI = SpellUI;
}

console.log('🔮 Spell UI system loaded successfully');
