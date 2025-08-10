/**
 * Inventory UI System for Castles of the Wind Clone
 * Handles inventory display, drag-and-drop, and item management UI
 */

class InventoryUI {
    constructor(k) {
        this.k = k;
        this.isOpen = false;
        this.overlay = null;
        this.selectedSlot = -1;
        this.draggedItem = null;
        this.dragOffset = { x: 0, y: 0 };
        this.slots = []; // Array to store slot references
        
        // Tooltip properties
        this.currentTooltip = null;
        this.tooltipText = null;
        
        // Drag state properties
        this.dragStartPos = null;
        this.dragStartSlot = -1;
        this.dragStartTime = 0;
        this.dragVisual = null;
        
        // Equipment click state properties
        this.equipmentClickSlot = null;
        this.equipmentClickTime = 0;
        
        // Context menu state
        this.contextMenu = null;
        this._nativeContextHandler = null;
        
        // UI Configuration (expanded for larger inventory)
        this.config = {
            slotSize: 28,
            slotPadding: 3,
            slotsPerRow: 10, // 10 slots per row instead of 5
            panelWidth: 700, // Much wider to accommodate more slots
            panelHeight: 550, // Even taller for properly spaced equipment section
            backgroundColor: [30, 30, 40],
            borderColor: [100, 100, 100],
            slotColor: [50, 50, 60],
            selectedColor: [100, 150, 200],
            textColor: [200, 200, 200]
        };
        
        console.log("🎒 InventoryUI initialized");
    }
    
    // Open inventory UI
    open() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        
        // Pause the game when inventory opens
        if (window.GameState && window.GameState.pauseGame) {
            window.GameState.pauseGame();
        }
        
        // Prevent the browser's native context menu while inventory is open
        if (!this._nativeContextHandler) {
            this._nativeContextHandler = (e) => e.preventDefault();
            window.addEventListener("contextmenu", this._nativeContextHandler);
        }
        
        this.createInventoryOverlay();
        
        console.log("📦 Inventory UI opened");
    }
    
    // Close inventory UI
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        
        // Resume the game when inventory closes
        if (window.GameState && window.GameState.resumeGame) {
            window.GameState.resumeGame();
        }
        
        // Clean up input handlers
        if (this.escHandler) {
            this.escHandler.cancel();
            this.escHandler = null;
        }
        if (this.mousePressHandler) {
            this.mousePressHandler.cancel();
            this.mousePressHandler = null;
        }
        if (this.mouseReleaseHandler) {
            this.mouseReleaseHandler.cancel();
            this.mouseReleaseHandler = null;
        }
        if (this.mouseMoveHandler) {
            this.mouseMoveHandler.cancel();
            this.mouseMoveHandler = null;
        }
        
        // Close any open context menu and remove native context menu handler
        if (this.contextMenu) {
            this.closeContextMenu();
        }
        if (this._nativeContextHandler) {
            window.removeEventListener("contextmenu", this._nativeContextHandler);
            this._nativeContextHandler = null;
        }
        
        // Clean up overlay
        if (this.overlay) {
            this.overlay.destroy();
            this.overlay = null;
        }
        
        // Clear tooltips
        this.hideItemTooltip();
        
        // Clear slots array
        this.slots = [];
        this.selectedSlot = -1;
        this.draggedItem = null;
        
        console.log("📦 Inventory UI closed");
    }
    
    // Toggle inventory UI
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    // Handle right-click to open context menu
    handleRightClick(mousePos) {
        // Close existing menu if any
        if (this.contextMenu) {
            this.closeContextMenu();
        }
        
        // Determine if an item was right-clicked
        const slotIndex = this.getSlotAtPosition(mousePos);
        const inventory = this.getInventorySystem();
        if (slotIndex !== -1 && inventory && inventory.items[slotIndex]) {
            const item = inventory.items[slotIndex];
            // Hide tooltip while context menu is open
            this.hideItemTooltip();
            this.openContextMenu(item, slotIndex, mousePos);
        } else {
            // If right-click inside the inventory panel background, open sort menu
            const k = this.k;
            const panelX = (k.width() - this.config.panelWidth) / 2;
            const panelY = (k.height() - this.config.panelHeight) / 2;
            if (this.isPointInRect(mousePos, { x: panelX, y: panelY }, this.config.panelWidth, this.config.panelHeight)) {
                this.hideItemTooltip();
                this.openSortMenu(mousePos);
            }
        }
    }
    
    // Create the main inventory overlay
    createInventoryOverlay() {
        const k = this.k;
        
        // Create overlay background
        this.overlay = k.add([
            k.rect(k.width(), k.height()),
            k.color(0, 0, 0, 0.7), // Semi-transparent background
            k.pos(0, 0),
            k.fixed(),
            k.z(1000),
            "inventory_overlay"
        ]);
        
        // Main inventory panel
        const panelX = (k.width() - this.config.panelWidth) / 2;
        const panelY = (k.height() - this.config.panelHeight) / 2;
        
        const panel = this.overlay.add([
            k.rect(this.config.panelWidth, this.config.panelHeight),
            k.color(...this.config.backgroundColor),
            k.pos(panelX, panelY),
            k.outline(2, k.rgb(...this.config.borderColor)),
            "inventory_panel"
        ]);
        
        // Title
        console.log("📦 Creating inventory title");
        const title = this.overlay.add([
            k.text("INVENTORY"),
            k.pos(panelX + this.config.panelWidth / 2, panelY + 20),
            k.scale(0.35),
            k.color(255, 0, 0),
            k.z(1002)
        ]);
        console.log("📦 Title created:", title);
        
        // Create inventory slots (larger grid)
        this.createInventorySlots(panelX + 20, panelY + 40);
        
        // Create player stats panel (moved right to accommodate wider inventory)
        this.createStatsPanel(panelX + 380, panelY + 40);
        
        // Create equipment slots (moved down to accommodate more inventory rows)
        this.createEquipmentSlots(panelX + 380, panelY + 220);
        
        // Controls text
        console.log("📦 Creating controls text");
        const controlsText = this.overlay.add([
            k.text("ESC: Close | Click: Select | Drag: Move | Right-click: Context Menu"),
            k.pos(panelX + this.config.panelWidth / 2, panelY + this.config.panelHeight - 15),
            k.anchor("center"),
            k.scale(0.3),
            k.color(255, 0, 0),
            k.z(1002)
        ]);
        console.log("📦 Controls text created:", controlsText);
        
        // Set up input handlers
        this.setupInputHandlers();
    }
    
    // Create inventory item slots
    createInventorySlots(startX, startY) {
        const k = this.k;
        const inventory = this.getInventorySystem();
        console.log("📦 Inventory system:", inventory);
        if (!inventory) {
            console.log("❌ No inventory system found!");
            return;
        }
        
        console.log("📦 Inventory items:", inventory.items);
        console.log("📦 Inventory maxSlots:", inventory.maxSlots);
        
        const slotSize = this.config.slotSize;
        const padding = this.config.slotPadding;
        const slotsPerRow = this.config.slotsPerRow;
        
        for (let i = 0; i < inventory.maxSlots; i++) {
            const row = Math.floor(i / slotsPerRow);
            const col = i % slotsPerRow;
            const x = startX + col * (slotSize + padding);
            const y = startY + row * (slotSize + padding);
            
            // Slot background
            const slot = this.overlay.add([
                k.rect(slotSize, slotSize),
                k.color(...this.config.slotColor),
                k.pos(x, y),
                k.outline(1, k.rgb(80, 80, 80)),
                k.area(),
                "inventory_slot",
                {
                    slotIndex: i,
                    isEmpty: true,
                    item: null,
                    isInventorySlot: true
                }
            ]);
            
            // Add item if slot is occupied
            const item = inventory.items[i];
            if (item) {
                this.createItemDisplay(item, x, y, i);
            }
            
            // Store slot reference for interactions
            this.slots[i] = slot;
        }
    }
    
    // Create item display in slot
    createItemDisplay(item, x, y, slotIndex) {
        const k = this.k;
        const slotSize = this.config.slotSize;
        
        // Item icon with hover functionality
        const itemIcon = this.overlay.add([
            k.rect(slotSize - 4, slotSize - 4),
            k.color(...(item.color || [255, 255, 255])),
            k.pos(x + 2, y + 2),
            k.outline(1, k.rgb(0, 0, 0)),
            k.area({ width: slotSize - 4, height: slotSize - 4 }),
            k.z(1003),
            "item_icon",
            {
                slotIndex: slotIndex,
                item: item,
                isHovered: false,
                tooltipObj: null
            }
        ]);
        
        // Add mouse hover events
        itemIcon.onHover(() => {
            if (!itemIcon.isHovered) {
                itemIcon.isHovered = true;
                this.showItemTooltip(item, k.mousePos());
            }
        });
        
        itemIcon.onHoverEnd(() => {
            itemIcon.isHovered = false;
            this.hideItemTooltip();
        });
        
        // Note: Click handling is now done through global mouse handlers
        // This allows for proper drag-and-drop detection
        
        // Stack count if stackable
        if (item.stackable && item.currentStack > 1) {
            const stackText = this.overlay.add([
                k.text(item.currentStack.toString()),
                k.pos(x + slotSize - 15, y + slotSize - 15),
                k.scale(0.25),
                k.color(255, 0, 0),
                k.z(1004)
            ]);
        }
        
        // Rarity indicator
        if (item.rarity !== "common") {
            const rarityColor = window.ItemComponent.RARITY_COLORS[item.rarity] || [255, 255, 255];
            this.overlay.add([
                k.rect(slotSize, 2),
                k.color(...rarityColor),
                k.pos(x, y + slotSize - 2),
                "rarity_indicator"
            ]);
        }
    }
    
    // Create player stats panel
    createStatsPanel(x, y) {
        const k = this.k;
        const player = this.getPlayer();
        if (!player) return;
        
        // Stats panel background (expanded for wider equipment section)
        this.overlay.add([
            k.rect(280, 240), // Increased height to accommodate taller equipment section
            k.color(...this.config.backgroundColor),
            k.pos(x, y),
            k.outline(1, k.rgb(...this.config.borderColor))
        ]);
        
        // Stats title
        console.log("📦 Creating stats title");
        const statsTitle = this.overlay.add([
            k.text("PLAYER STATS"),
            k.pos(x + 80, y + 15),
            k.anchor("center"),
            k.scale(0.35),
            k.color(255, 0, 0),
            k.z(1002)
        ]);
        console.log("📦 Stats title created:", statsTitle);
        
        // Get player stats
        const stats = player.getStats ? player.getStats() : {
            level: player.level || 1,
            health: player.health || 100,
            maxHealth: player.maxHealth || 100,
            mana: player.mana || 50,
            maxMana: player.maxMana || 50,
            attack: player.totalAttack || player.attack || 5,
            defense: player.totalDefense || player.defense || 2,
            gold: player.gold || 0
        };
        
        const inventory = this.getInventorySystem();
        const weight = inventory ? inventory.getTotalWeight() : 0;
        const maxWeight = inventory ? inventory.maxWeight : 100;
        const bulk = inventory ? inventory.getTotalBulk() : 0;
        const maxBulk = inventory ? inventory.maxBulk : 50;
        
        // Get equipment bonuses for display
        const baseStats = player.baseStats || {};
        const equipStats = player.equipmentStats || {};
        
        // Stats text with equipment bonuses shown
        const statsText = [
            `Level: ${stats.level}`,
            `HP: ${stats.health}/${stats.maxHealth}`,
            `MP: ${stats.mana}/${stats.maxMana}`,
            equipStats.attack ? `Attack: ${baseStats.attack || 10} + ${equipStats.attack} = ${stats.attack}` : `Attack: ${stats.attack}`,
            equipStats.defense ? `Defense: ${baseStats.defense || 5} + ${equipStats.defense} = ${stats.defense}` : `Defense: ${stats.defense}`,
            equipStats.speed ? `Speed: ${baseStats.speed || 3} + ${equipStats.speed} = ${player.speed || 3}` : `Speed: ${player.speed || 3}`,
            equipStats.magic ? `Magic: ${baseStats.magic || 1} + ${equipStats.magic} = ${player.magic || 1}` : `Magic: ${player.magic || 1}`,
            `Gold: ${stats.gold}`,
            `Weight: ${weight.toFixed(1)}/${maxWeight}`,
            `Bulk: ${bulk}/${maxBulk}`
        ];
        
        statsText.forEach((text, index) => {
            console.log(`📦 Creating stats text ${index}: ${text}`);
            const statText = this.overlay.add([
                k.text(text),
                k.pos(x + 10, y + 35 + index * 14),
                k.scale(0.3),
                k.color(255, 0, 0),
                k.z(1002)
            ]);
            console.log(`📦 Stats text ${index} created:`, statText);
        });
    }
    
    // Create equipment slots
    createEquipmentSlots(x, y) {
        const k = this.k;
        const inventory = this.getInventorySystem();
        if (!inventory) return;
        
        const equipmentSlots = [
            // Top row - Main combat gear (increased spacing from 35px to 60px)
            { slot: "weapon", label: "Weapon", x: 0, y: 0 },
            { slot: "shield", label: "Shield", x: 60, y: 0 },
            { slot: "armor", label: "Armor", x: 120, y: 0 },
            { slot: "helmet", label: "Helmet", x: 180, y: 0 },
            
            // Second row - Accessories (increased vertical spacing from 40px to 55px)
            { slot: "boots", label: "Boots", x: 0, y: 55 },
            { slot: "gloves", label: "Gloves", x: 60, y: 55 },
            { slot: "cloak", label: "Cloak", x: 120, y: 55 },
            { slot: "bracers", label: "Bracers", x: 180, y: 55 },
            
            // Third row - Jewelry and belt
            { slot: "ring1", label: "Ring 1", x: 0, y: 110 },
            { slot: "ring2", label: "Ring 2", x: 60, y: 110 },
            { slot: "amulet", label: "Amulet", x: 120, y: 110 },
            { slot: "belt", label: "Belt", x: 180, y: 110 },
            
            // Fourth row - Utility items
            { slot: "quiver", label: "Quiver", x: 0, y: 165 },
            { slot: "torch", label: "Torch", x: 60, y: 165 },
            { slot: "lantern", label: "Lantern", x: 120, y: 165 },
            { slot: "spellbook", label: "Spellbook", x: 180, y: 165 }
        ];
        
        equipmentSlots.forEach(slotInfo => {
            const slotX = x + slotInfo.x;
            const slotY = y + slotInfo.y;
            
            // Equipment slot background
            const slot = this.overlay.add([
                k.rect(this.config.slotSize, this.config.slotSize),
                k.color(60, 40, 40), // Different color for equipment slots
                k.pos(slotX, slotY),
                k.outline(1, k.rgb(100, 80, 80)),
                "equipment_slot",
                {
                    equipSlot: slotInfo.slot,
                    isEmpty: true
                }
            ]);
            
            // Equipment slot label (positioned with more spacing)
            this.overlay.add([
                k.text(slotInfo.label),
                k.pos(slotX + this.config.slotSize / 2, slotY + this.config.slotSize + 8), // Increased gap from 5 to 8
                k.anchor("center"),
                k.scale(0.35), // Slightly larger text for better readability
                k.color(200, 200, 200), // Changed to light gray for better visibility
                k.z(1002)
            ]);
            
            // Add equipped item if present
            const equippedItem = inventory.equipment[slotInfo.slot];
            if (equippedItem) {
                this.createEquippedItemDisplay(equippedItem, slotX, slotY, slotInfo.slot);
            }
            
            // Equipment slot interactions will be handled by main mouse handler
            // Store equipment slot reference for click detection
            slot.equipmentSlot = slotInfo.slot;
        });
    }
    
    // Create equipped item display
    createEquippedItemDisplay(item, x, y, slot) {
        const k = this.k;
        const slotSize = this.config.slotSize;
        
        this.overlay.add([
            k.rect(slotSize - 4, slotSize - 4),
            k.color(...(item.color || [255, 255, 255])),
            k.pos(x + 2, y + 2),
            k.outline(1, k.rgb(0, 0, 0)),
            "equipped_item",
            {
                equipSlot: slot,
                item: item
            }
        ]);
    }
    
    // Handle slot click
    onSlotClick(slotIndex) {
        const inventory = this.getInventorySystem();
        if (!inventory) return;
        
        const item = inventory.items[slotIndex];
        
        if (this.selectedSlot === slotIndex) {
            // Double-click to use item
            if (item && (item.usable || item.consumable)) {
                const result = inventory.useItem(slotIndex);
                if (result.success) {
                    this.showMessage(`Used ${item.name}`, "success");
                    this.refreshDisplay();
                } else {
                    this.showMessage(result.message, "warning");
                }
            } else if (item && item.equipable) {
                // Equip item
                const result = inventory.equipItem(slotIndex);
                if (result.success) {
                    this.showMessage(`Equipped ${item.name}`, "success");
                    this.refreshDisplay();
                } else {
                    this.showMessage(result.message, "warning");
                }
            }
            this.selectedSlot = -1;
        } else {
            // Select slot
            this.selectedSlot = slotIndex;
            this.highlightSlot(slotIndex);
        }
    }
    
    // Handle equipment slot click
    onEquipmentSlotClick(slot) {
        const inventory = this.getInventorySystem();
        if (!inventory) return;
        
        const result = inventory.unequipItem(slot);
        if (result.success) {
            this.showMessage(`Unequipped ${result.item.name}`, "success");
            this.refreshDisplay();
        } else {
            this.showMessage(result.message, "warning");
        }
    }
    
    // Handle slot hover
    onSlotHover(slotIndex) {
        const inventory = this.getInventorySystem();
        if (!inventory) return;
        
        const item = inventory.items[slotIndex];
        if (item && window.TooltipUI) {
            const mousePos = this.k.mousePos();
            window.TooltipUI.show(item.getTooltipText(), mousePos);
        }
    }
    
    // Handle slot hover end
    onSlotHoverEnd(slotIndex) {
        if (window.TooltipUI) {
            window.TooltipUI.hide();
        }
    }
    
    // Highlight selected slot
    highlightSlot(slotIndex) {
        const k = this.k;
        // Remove previous highlights
        this.k.get("slot_highlight").forEach(highlight => highlight.destroy());
        
        if (slotIndex >= 0) {
            const slotsPerRow = this.config.slotsPerRow;
            const row = Math.floor(slotIndex / slotsPerRow);
            const col = slotIndex % slotsPerRow;
            
            const panelX = (this.k.width() - this.config.panelWidth) / 2;
            const panelY = (this.k.height() - this.config.panelHeight) / 2;
            const startX = panelX + 20;
            const startY = panelY + 40;
            
            const x = startX + col * (this.config.slotSize + this.config.slotPadding);
            const y = startY + row * (this.config.slotSize + this.config.slotPadding);
            
            this.overlay.add([
                k.rect(this.config.slotSize, this.config.slotSize),
                k.color(...this.config.selectedColor, 0.5),
                k.pos(x, y),
                k.outline(2, k.rgb(...this.config.selectedColor)),
                "slot_highlight"
            ]);
        }
    }
    
    // Refresh the entire display
    refreshDisplay() {
        if (this.isOpen) {
            this.close();
            this.open();
        }
    }
    
    // Show message
    showMessage(text, type = "info") {
        if (window.MessageUI) {
            window.MessageUI.addMessage(text, type);
        } else {
            console.log(`📦 ${text}`);
        }
    }
    
    // Set up input handlers
    setupInputHandlers() {
        const k = this.k;
        // ESC to close
        this.escHandler = k.onKeyPress("escape", () => {
            // Close context menu first, then inventory
            if (this.contextMenu) {
                this.closeContextMenu();
                return;
            }
            this.close();
        });
        
        // Mouse press handling for drag start
        this.mousePressHandler = k.onMousePress((button) => {
            try {
                if (!this.isOpen) return;
                
                if (button === "left") {
                    const mousePos = k.mousePos();
                    this.handleMouseDown(mousePos);
                } else if (button === "right") {
                    const mousePos = k.mousePos();
                    this.handleRightClick(mousePos);
                }
            } catch (error) {
                console.error('Error in mouse press handler:', error);
            }
        });
        
        // Mouse release handling for drag end
        this.mouseReleaseHandler = k.onMouseRelease((button) => {
            try {
                if (!this.isOpen) return;
                
                if (button === "left") {
                    const mousePos = k.mousePos();
                    this.handleMouseUp(mousePos);
                }
            } catch (error) {
                console.error('Error in mouse release handler:', error);
            }
        });
        
        // Mouse move for drag updates
        this.mouseMoveHandler = k.onMouseMove(() => {
            try {
                if (!this.isOpen) return;
                
                const mousePos = k.mousePos();
                
                // Check if we should start dragging
                if (this.dragStartPos && !this.draggedItem) {
                    const distance = Math.sqrt(
                        Math.pow(mousePos.x - this.dragStartPos.x, 2) + 
                        Math.pow(mousePos.y - this.dragStartPos.y, 2)
                    );
                    
                    if (distance > 10) { // Start drag after 10 pixels of movement
                        const inventory = this.getInventorySystem();
                        if (inventory && inventory.items[this.dragStartSlot]) {
                            this.startItemDrag(inventory.items[this.dragStartSlot], this.dragStartSlot, this.dragStartPos);
                        }
                    }
                }
                
                // Update drag visual if dragging
                if (this.draggedItem) {
                    this.updateItemDrag(mousePos);
                }
            } catch (error) {
                console.error('Error in mouse move handler:', error);
            }
        });
    }
    
    // Handle mouse down events
    handleMouseDown(mousePos) {
        console.log(`🔄 Mouse down at: ${mousePos.x}, ${mousePos.y}`);
        
        // If a context menu is open, close it when clicking outside of it, or ignore clicks inside it
        if (this.contextMenu) {
            const inside = this.isPointInRect(
                mousePos,
                { x: this.contextMenu.x, y: this.contextMenu.y },
                this.contextMenu.width,
                this.contextMenu.height,
                0
            );
            if (!inside) {
                this.closeContextMenu();
            } else {
                // Let the menu itself handle clicks
                return;
            }
        }
        
        // Find which slot was clicked
        const slotIndex = this.getSlotAtPosition(mousePos);
        console.log(`🔄 Inventory slot detected: ${slotIndex}`);
        
        if (slotIndex !== -1) {
            const inventory = this.getInventorySystem();
            if (inventory && inventory.items[slotIndex]) {
                console.log(`🔄 Starting potential drag for: ${inventory.items[slotIndex].name}`);
                // Start potential drag
                this.dragStartPos = mousePos;
                this.dragStartSlot = slotIndex;
                this.dragStartTime = Date.now();
                this.hideItemTooltip();
            }
        } else {
            // Check if clicking on equipment slot - don't set drag state for equipment clicks
            const equipmentSlot = this.getEquipmentSlotAtPosition(mousePos);
            console.log(`🔄 Equipment slot detected: ${equipmentSlot}`);
            if (equipmentSlot) {
                // Set a flag to indicate this is an equipment slot click
                this.equipmentClickSlot = equipmentSlot;
                this.equipmentClickTime = Date.now();
            }
        }
    }
    
    // Handle mouse up events
    handleMouseUp(mousePos) {
        console.log(`🔼 Mouse up at: ${mousePos.x}, ${mousePos.y}`);
        
        if (this.draggedItem) {
            // Handle drop
            const targetSlot = this.getSlotAtPosition(mousePos);
            const equipmentSlot = this.getEquipmentSlotAtPosition(mousePos);
            this.handleItemDrop(this.draggedItem.item, this.draggedItem.sourceSlot, mousePos);
        } else if (this.dragStartPos) {
            // Handle click (if not dragging)
            const timeDiff = Date.now() - this.dragStartTime;
            const distance = Math.sqrt(
                Math.pow(mousePos.x - this.dragStartPos.x, 2) + 
                Math.pow(mousePos.y - this.dragStartPos.y, 2)
            );
            
            if (timeDiff < 300 && distance < 10) {
                // Check if clicking on equipment slot (for unequipping)
                const equipmentSlot = this.getEquipmentSlotAtPosition(mousePos);
                console.log(`🔼 Mouse up - Equipment slot detected: ${equipmentSlot}`);
                if (equipmentSlot) {
                    this.handleEquipmentSlotClick(equipmentSlot);
                } else {
                    // It was a click on inventory item
                    const inventory = this.getInventorySystem();
                    if (inventory && inventory.items[this.dragStartSlot]) {
                        this.handleItemClick(inventory.items[this.dragStartSlot], this.dragStartSlot);
                    }
                }
            }
        } else if (this.equipmentClickSlot && this.equipmentClickTime) {
            // Handle equipment slot clicks using the flag set in mouse down
            const timeDiff = Date.now() - this.equipmentClickTime;
            if (timeDiff < 300) { // Quick click
                console.log(`🔍 Equipment click detected: ${this.equipmentClickSlot}`);
                this.handleEquipmentSlotClick(this.equipmentClickSlot);
            }
            // Clear equipment click state
            this.equipmentClickSlot = null;
            this.equipmentClickTime = 0;
        }
        
        // Reset drag state
        this.dragStartPos = null;
        this.dragStartSlot = -1;
        this.dragStartTime = 0;
        
        // Reset equipment click state (if not already cleared above)
        if (this.equipmentClickSlot) {
            this.equipmentClickSlot = null;
            this.equipmentClickTime = 0;
        }
    }
    
    // Handle mouse clicks on inventory elements (legacy)
    handleMouseClick(mousePos) {
        // Check if click is on a slot
        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.slots[i];
            if (slot && this.isPointInRect(mousePos, slot.pos, this.config.slotSize, this.config.slotSize)) {
                this.onSlotClick(i);
                return;
            }
        }
        
        // If click is outside the main panel, close inventory
        const panelX = (this.k.width() - this.config.panelWidth) / 2;
        const panelY = (this.k.height() - this.config.panelHeight) / 2;
        
        if (!this.isPointInRect(mousePos, { x: panelX, y: panelY }, this.config.panelWidth, this.config.panelHeight)) {
            this.close();
        }
    }
    
    // Helper function to check if point is in rectangle
    isPointInRect(point, rectPos, width, height, buffer = 0) {
        return point.x >= rectPos.x - buffer && 
               point.x <= rectPos.x + width + buffer && 
               point.y >= rectPos.y - buffer && 
               point.y <= rectPos.y + height + buffer;
    }
    
    // Get slot index at mouse position
    getSlotAtPosition(mousePos) {
        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.slots[i];
            if (slot && this.isPointInRect(mousePos, slot.pos, this.config.slotSize, this.config.slotSize)) {
                return i;
            }
        }
        return -1;
    }
    
    // Get equipment slot at mouse position
    getEquipmentSlotAtPosition(mousePos) {
        const panelX = (this.k.width() - this.config.panelWidth) / 2;
        const panelY = (this.k.height() - this.config.panelHeight) / 2;
        
        // Equipment slots start position (matches createEquipmentSlots coordinates)
        const equipStartX = panelX + 380; // Same as in createEquipmentSlots
        const equipStartY = panelY + 220; // Same as in createEquipmentSlots
        
        // Equipment slot layout (matches the actual rendered positions)
        const equipmentSlots = [
            // Top row - Main combat gear
            { slot: "weapon", x: 0, y: 0 },
            { slot: "shield", x: 60, y: 0 },
            { slot: "armor", x: 120, y: 0 },
            { slot: "helmet", x: 180, y: 0 },
            
            // Second row - Accessories
            { slot: "boots", x: 0, y: 55 },
            { slot: "gloves", x: 60, y: 55 },
            { slot: "cloak", x: 120, y: 55 },
            { slot: "bracers", x: 180, y: 55 },
            
            // Third row - Jewelry and belt
            { slot: "ring1", x: 0, y: 110 },
            { slot: "ring2", x: 60, y: 110 },
            { slot: "amulet", x: 120, y: 110 },
            { slot: "belt", x: 180, y: 110 },
            
            // Fourth row - Utility items
            { slot: "quiver", x: 0, y: 165 },
            { slot: "torch", x: 60, y: 165 },
            { slot: "lantern", x: 120, y: 165 },
            { slot: "spellbook", x: 180, y: 165 }
        ];
        
        for (const slotInfo of equipmentSlots) {
            const slotX = equipStartX + slotInfo.x;
            const slotY = equipStartY + slotInfo.y;
            
            // Debug: Check each slot with small buffer for tolerance
            const isInSlot = this.isPointInRect(mousePos, { x: slotX, y: slotY }, this.config.slotSize, this.config.slotSize, 3);
            if (isInSlot) {
                console.log(`✅ Found equipment slot: ${slotInfo.slot} at (${slotX}, ${slotY}) for mouse (${mousePos.x}, ${mousePos.y})`);
                return slotInfo.slot;
            }
        }
        
        return null;
    }
    
    // Convert equipment slot to readable name
    getEquipmentSlotName(equipSlot) {
        const slotNames = {
            'weapon': 'Weapon',
            'shield': 'Shield', 
            'armor': 'Armor',
            'helmet': 'Helmet',
            'boots': 'Boots',
            'gloves': 'Gloves',
            'cloak': 'Cloak',
            'bracers': 'Bracers',
            'ring1': 'Ring',
            'ring2': 'Ring',
            'amulet': 'Amulet',
            'belt': 'Belt',
            'quiver': 'Quiver',
            'torch': 'Torch',
            'lantern': 'Lantern',
            'spellbook': 'Spellbook'
        };
        
        return slotNames[equipSlot] || equipSlot.charAt(0).toUpperCase() + equipSlot.slice(1);
    }
    
    // Get inventory system reference
    getInventorySystem() {
        return window.inventory || (window.GameState && window.GameState.inventory);
    }
    
    // Get player reference
    getPlayer() {
        if (window.GameState && window.GameState.player) {
            return window.GameState.player;
        }
        
        const players = this.k.get("player");
        return players.length > 0 ? players[0] : null;
    }
    
    // Start dragging an item
    startItemDrag(item, slotIndex, startPos) {
        this.draggedItem = {
            item: item,
            sourceSlot: slotIndex,
            startPos: startPos
        };
        
        // Create drag visual
        this.dragVisual = this.overlay.add([
            k.rect(this.config.slotSize - 4, this.config.slotSize - 4),
            k.color(...(item.color || [255, 255, 255])),
            k.pos(startPos.x, startPos.y),
            k.outline(1, k.rgb(255, 255, 255)),
            k.z(3000), // Above everything
            k.opacity(0.8),
            "drag_visual"
        ]);
        
        console.log(`🔄 Started dragging ${item.name} from slot ${slotIndex}`);
    }
    
    // Update drag visual position
    updateItemDrag(mousePos) {
        const k = this.k;
        if (this.dragVisual && this.draggedItem) {
            this.dragVisual.pos = k.vec2(
                mousePos.x - (this.config.slotSize - 4) / 2,
                mousePos.y - (this.config.slotSize - 4) / 2
            );
        }
    }
    
    // Handle item drop
    handleItemDrop(item, sourceSlot, dropPos) {
        if (!this.draggedItem) return;
        
        // Clean up drag visual
        if (this.dragVisual) {
            this.dragVisual.destroy();
            this.dragVisual = null;
        }
        
        // Check if dropping on equipment slot
        const equipmentSlot = this.getEquipmentSlotAtPosition(dropPos);
        console.log(`🎯 Drop position: ${dropPos.x}, ${dropPos.y}`);
        console.log(`🎯 Equipment slot detected: ${equipmentSlot}`);
        console.log(`🎯 Item equipable: ${item.equipable}, Item slot: ${item.equipSlot}`);
        
        if (equipmentSlot && item.equipable && item.equipSlot === equipmentSlot) {
            console.log(`✅ Valid equipment drop: ${item.name} to ${equipmentSlot}`);
            // Try to equip the item
            const inventory = this.getInventorySystem();
            if (inventory) {
                const result = inventory.equipItem(sourceSlot);
                if (result.success) {
                    console.log(`✅ Successfully equipped ${item.name}`);
                    if (window.MessageSystem) {
                        window.MessageSystem.addMessage(`Equipped ${item.name}`, 'success');
                    }
                    this.refreshDisplay();
                } else {
                    console.log(`❌ Failed to equip: ${result.message}`);
                    if (window.MessageSystem) {
                        window.MessageSystem.addMessage(result.message, 'error');
                    }
                }
            }
        } else if (equipmentSlot) {
            console.log(`❌ Invalid equipment drop: ${item.name} (${item.equipSlot}) to ${equipmentSlot}`);
        } else {
            // Find target inventory slot based on drop position
            const targetSlot = this.getSlotAtPosition(dropPos);
            
            if (targetSlot !== -1 && targetSlot !== sourceSlot) {
                // Move/swap items
                this.moveItem(sourceSlot, targetSlot);
            } else {
                console.log(`📦 Dropped ${item.name} back to original position`);
            }
        }
        
        this.draggedItem = null;
    }
    
    // Handle item click (when not dragging)
    handleItemClick(item, slotIndex) {
        console.log(`🖱️ Clicked ${item.name} in slot ${slotIndex}`);
        
        const inventory = this.getInventorySystem();
        if (!inventory) return;
        
        // Debug: Log item properties
        console.log(`🔍 Item properties:`, {
            name: item.name,
            equipable: item.equipable,
            equipSlot: item.equipSlot,
            category: item.category,
            allProperties: Object.keys(item)
        });
        
        // TEMP: Add test equipment if this is the first click (for debugging)
        if (!window.testEquipmentAdded) {
            window.testEquipmentAdded = true;
            console.log('🛠️ Adding test equipment for debugging...');
            
            // TEMP: Boost player level for testing equipment
            const player = this.getPlayer();
            if (player && player.level < 15) {
                console.log(`🎆 Boosting player level from ${player.level} to 15 for testing`);
                player.level = 15;
                player.strength = 20; // Also boost strength for plate armor
            }
            
            // Add some test equipment with proper data
            const testItems = ['sword', 'dagger', 'chain_mail', 'plate_armor'];
            testItems.forEach(itemId => {
                const itemData = window.ItemData.DATA[itemId];
                if (itemData) {
                    console.log(`Adding ${itemId}:`, itemData);
                    inventory.addItem(itemData);
                }
            });
            
            this.refreshDisplay();
            return; // Skip the current click to avoid confusion
        }
        
        // If item is equipable, try to equip it
        if (item.equipable && item.equipSlot) {
            console.log(`✅ Item ${item.name} is equipable to ${item.equipSlot}`);
            const result = inventory.equipItem(slotIndex);
            if (result.success) {
                if (window.MessageSystem) {
                    window.MessageSystem.addMessage(`Equipped ${item.name}`, 'success');
                }
                this.refreshDisplay();
            } else {
                if (window.MessageSystem) {
                    window.MessageSystem.addMessage(result.message, 'error');
                }
            }
        } else {
            console.log(`❌ Item ${item.name} is NOT equipable (equipable: ${item.equipable}, equipSlot: ${item.equipSlot})`);
        }
        
        if (item.consumable) {
            // Handle consumable items (potions, food, scrolls)
            console.log(`🍽️ Using consumable: ${item.name}`);
            // TODO: Implement item usage system
            if (window.MessageSystem) {
                window.MessageSystem.addMessage(`Used ${item.name}`, 'info');
            }
        }
    }
    
    // Handle equipment slot click (for unequipping)
    handleEquipmentSlotClick(equipmentSlot) {
        console.log(`🛡️ Clicked equipment slot: ${equipmentSlot}`);
        
        const inventory = this.getInventorySystem();
        if (!inventory) return;
        
        // Check if there's an item equipped in this slot
        const equippedItem = inventory.equipment[equipmentSlot];
        if (equippedItem) {
            // Try to unequip the item
            const result = inventory.unequipItem(equipmentSlot);
            if (result.success) {
                if (window.MessageSystem) {
                    window.MessageSystem.addMessage(`Unequipped ${equippedItem.name}`, 'success');
                }
                this.refreshDisplay();
            } else {
                if (window.MessageSystem) {
                    window.MessageSystem.addMessage(result.message, 'error');
                }
            }
        } else {
            console.log(`No item equipped in ${equipmentSlot} slot`);
        }
    }
    
    // Get slot index at screen position
    getSlotAtPosition(pos) {
        const slotsPerRow = this.config.slotsPerRow;
        const panelX = (this.k.width() - this.config.panelWidth) / 2;
        const panelY = (this.k.height() - this.config.panelHeight) / 2;
        const startX = panelX + 20;
        const startY = panelY + 40;
        
        for (let i = 0; i < 60; i++) { // Check all 60 slots
            const row = Math.floor(i / slotsPerRow);
            const col = i % slotsPerRow;
            
            const slotX = startX + col * (this.config.slotSize + this.config.slotPadding);
            const slotY = startY + row * (this.config.slotSize + this.config.slotPadding);
            
            if (this.isPointInRect(pos, { x: slotX, y: slotY }, this.config.slotSize, this.config.slotSize)) {
                return i;
            }
        }
        
        return -1; // No slot found
    }
    
    // Move item from one slot to another
    moveItem(fromSlot, toSlot) {
        const inventory = this.getInventorySystem();
        if (!inventory) return;
        
        console.log(`🔄 Moving item from slot ${fromSlot} to slot ${toSlot}`);
        
        // Get items
        const fromItem = inventory.items[fromSlot];
        const toItem = inventory.items[toSlot];
        
        if (!fromItem) return;
        
        if (!toItem) {
            // Simple move to empty slot
            inventory.items[toSlot] = fromItem;
            inventory.items[fromSlot] = null;
            this.showMessage(`Moved ${fromItem.name}`, "info");
        } else {
            // Swap items
            inventory.items[fromSlot] = toItem;
            inventory.items[toSlot] = fromItem;
            this.showMessage(`Swapped ${fromItem.name} with ${toItem.name}`, "info");
        }
        
        // Refresh display
        this.refreshDisplay();
    }
    
    // Show item tooltip on hover
    showItemTooltip(item, mousePos) {
        const k = this.k;
        // Hide any existing tooltip
        this.hideItemTooltip();
        
        // Create tooltip text content
        let tooltipText = `${item.name}`;
        
        // Add item details
        if (item.description) {
            tooltipText += `\n${item.description}`;
        }
        
        // Add stats if available
        if (item.stats) {
            const stats = [];
            if (item.stats.attack) stats.push(`Attack: +${item.stats.attack}`);
            if (item.stats.defense) stats.push(`Defense: +${item.stats.defense}`);
            if (item.stats.speed) stats.push(`Speed: +${item.stats.speed}`);
            if (item.stats.dexterity) stats.push(`Dexterity: +${item.stats.dexterity}`);
            if (item.stats.strength) stats.push(`Strength: +${item.stats.strength}`);
            if (item.stats.mana) stats.push(`Mana: +${item.stats.mana}`);
            
            if (stats.length > 0) {
                tooltipText += `\n\n` + stats.join('\n');
            }
        }
        
        // Add weight and bulk info
        tooltipText += `\n\nWeight: ${item.weight}kg`;
        tooltipText += `\nBulk: ${item.bulk}`;
        
        // Add value
        if (item.value) {
            tooltipText += `\nValue: ${item.value} gold`;
        }
        
        // Add rarity
        if (item.rarity && item.rarity !== "common") {
            tooltipText += `\nRarity: ${item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}`;
        }
        
        // Add equipment slot or usage information
        if (item.equipable && item.equipSlot) {
            // Convert equipment slot to readable format
            const slotName = this.getEquipmentSlotName(item.equipSlot);
            tooltipText += `\n\nEquips to: ${slotName}`;
        } else if (item.category === "scroll") {
            // Scrolls go in spellbook slot
            tooltipText += `\n\nEquips to: Spellbook`;
        } else if (item.consumable) {
            // Consumable items
            tooltipText += `\n\nEAT ME!`;
        }
        
        // Calculate tooltip position (offset from mouse to avoid covering item)
        const tooltipX = mousePos.x + 15;
        const tooltipY = mousePos.y - 10;
        
        // Measure text to create appropriate background
        const lines = tooltipText.split('\n');
        const maxLineLength = Math.max(...lines.map(line => line.length));
        const tooltipWidth = Math.max(200, maxLineLength * 8);
        const tooltipHeight = lines.length * 16 + 10;
        
        // Create tooltip background
        this.currentTooltip = this.overlay.add([
            k.rect(tooltipWidth, tooltipHeight),
            k.color(0, 0, 0, 0.9),
            k.pos(tooltipX, tooltipY),
            k.outline(1, k.rgb(200, 200, 200)),
            k.z(2000),
            "item_tooltip"
        ]);
        
        // Create tooltip text
        this.tooltipText = this.overlay.add([
            k.text(tooltipText),
            k.pos(tooltipX + 5, tooltipY + 5),
            k.scale(0.35),
            k.color(255, 255, 255),
            k.z(2001),
            "tooltip_text"
        ]);
    }
    
    // Hide item tooltip
    hideItemTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.destroy();
            this.currentTooltip = null;
        }
        
        if (this.tooltipText) {
            this.tooltipText.destroy();
            this.tooltipText = null;
        }
    }
    
    // Open context menu near mouse position with context-sensitive options
    openContextMenu(item, slotIndex, mousePos) {
        const k = this.k;
        const inventory = this.getInventorySystem();
        if (!inventory || !item) return;
        
        // Close any existing menu first
        if (this.contextMenu) {
            this.closeContextMenu();
        }
        
        // Determine available options
        const options = [];
        if (item.usable || item.consumable) {
            options.push({
                key: "use",
                label: "Use",
                onSelect: () => {
                    const result = inventory.useItem(slotIndex);
                    if (result && result.success) {
                        if (window.MessageSystem) window.MessageSystem.addMessage(`Used ${item.name}`, "success");
                        this.refreshDisplay();
                    } else if (result && result.message) {
                        if (window.MessageSystem) window.MessageSystem.addMessage(result.message, "warning");
                    }
                }
            });
        }
        if (item.equipable && item.equipSlot) {
            const slotName = this.getEquipmentSlotName(item.equipSlot);
            options.push({
                key: "equip",
                label: `Equip (${slotName})`,
                onSelect: () => {
                    const result = inventory.equipItem(slotIndex);
                    if (result && result.success) {
                        if (window.MessageSystem) window.MessageSystem.addMessage(`Equipped ${item.name}`, "success");
                        this.refreshDisplay();
                    } else if (result && result.message) {
                        if (window.MessageSystem) window.MessageSystem.addMessage(result.message, "error");
                    }
                }
            });
        }
        // Examine is always available
        options.push({
            key: "examine",
            label: "Examine",
            onSelect: () => {
                const lines = [];
                lines.push(`${item.name}`);
                if (item.description) lines.push(item.description);
                if (item.stats) {
                    const stats = [];
                    if (item.stats.attack) stats.push(`Attack +${item.stats.attack}`);
                    if (item.stats.defense) stats.push(`Defense +${item.stats.defense}`);
                    if (item.stats.speed) stats.push(`Speed +${item.stats.speed}`);
                    if (item.stats.dexterity) stats.push(`Dexterity +${item.stats.dexterity}`);
                    if (item.stats.strength) stats.push(`Strength +${item.stats.strength}`);
                    if (item.stats.mana) stats.push(`Mana +${item.stats.mana}`);
                    if (stats.length) lines.push(stats.join(", "));
                }
                if (window.MessageSystem) {
                    window.MessageSystem.addMessage(lines.join(" — "), "info");
                } else {
                    console.log("🔎 Examine:", lines.join(" — "));
                }
            }
        });
        
        if (options.length === 0) return; // Nothing to show
        
        // Layout calculations
        const optionHeight = 20;
        const padding = 6;
        const longest = Math.max(...options.map(o => o.label.length));
        const width = Math.max(150, Math.min(260, longest * 8 + padding * 2));
        const height = options.length * optionHeight + padding * 2;
        
        // Position near cursor, constrained to screen bounds
        let x = mousePos.x + 8;
        let y = mousePos.y + 8;
        const margin = 8;
        if (x + width + margin > k.width()) x = k.width() - width - margin;
        if (y + height + margin > k.height()) y = k.height() - height - margin;
        if (x < margin) x = margin;
        if (y < margin) y = margin;
        
        // Build menu UI
        const nodes = [];
        const bg = this.overlay.add([
            k.rect(width, height),
            k.color(25, 25, 35),
            k.pos(x, y),
            k.outline(1, k.rgb(120, 120, 140)),
            k.z(2400),
            "context_menu_bg"
        ]);
        nodes.push(bg);
        
        // Option rows
        const optionBounds = [];
        options.forEach((opt, i) => {
            const oy = y + padding + i * optionHeight;
            const row = this.overlay.add([
                k.rect(width - padding * 2, optionHeight - 2),
                k.color(45, 45, 60),
                k.pos(x + padding, oy),
                k.area({ width: width - padding * 2, height: optionHeight - 2 }),
                k.z(2401),
                "context_menu_option",
                { optKey: opt.key, optIndex: i }
            ]);
            nodes.push(row);
            
            // Hover highlight
            row.onHover(() => {
                row.color = k.rgb(70, 70, 100);
            });
            row.onHoverEnd(() => {
                row.color = k.rgb(45, 45, 60);
            });
            
            const label = this.overlay.add([
                k.text(opt.label),
                k.pos(x + padding + 6, oy + 3),
                k.scale(0.35),
                k.color(220, 220, 235),
                k.z(2402),
                "context_menu_label"
            ]);
            nodes.push(label);
            optionBounds.push({ x: x + padding, y: oy, w: width - padding * 2, h: optionHeight - 2, select: opt.onSelect });
        });
        
        // Dedicated click handler for menu selection
        const pressHandler = k.onMousePress((button) => {
            if (!this.contextMenu) return;
            if (button !== "left") return;
            const pos = k.mousePos();
            // If click is within any option, trigger it
            for (const b of optionBounds) {
                if (this.isPointInRect(pos, { x: b.x, y: b.y }, b.w, b.h, 0)) {
                    try {
                        b.select();
                    } catch (err) {
                        console.error("Error executing context menu option:", err);
                    }
                    // Close after selection
                    this.closeContextMenu();
                    return;
                }
            }
            // Clicked outside any option: close the menu
            this.closeContextMenu();
            return;
        });
        
        this.contextMenu = {
            x,
            y,
            width,
            height,
            nodes,
            pressHandler
        };
    }
    
    // Open context menu for sorting and panel actions
    openSortMenu(mousePos) {
        const k = this.k;
        // Close any existing menu first
        if (this.contextMenu) {
            this.closeContextMenu();
        }
        
        const options = [
            { key: "sort_name", label: "Sort by Name (A→Z)", onSelect: () => this.sortInventoryBy("name") },
            { key: "sort_category", label: "Sort by Category", onSelect: () => this.sortInventoryBy("category") },
            { key: "sort_rarity", label: "Sort by Rarity (High→Low)", onSelect: () => this.sortInventoryBy("rarity") },
            { key: "sort_value", label: "Sort by Value (High→Low)", onSelect: () => this.sortInventoryBy("value") },
            { key: "sort_weight", label: "Sort by Weight (Low→High)", onSelect: () => this.sortInventoryBy("weight") },
            { key: "compress", label: "Compress (Remove Gaps)", onSelect: () => this.sortInventoryBy("compress") },
        ];
        
        const optionHeight = 20;
        const padding = 6;
        const longest = Math.max(...options.map(o => o.label.length));
        const width = Math.max(210, Math.min(320, longest * 8 + padding * 2));
        const height = options.length * optionHeight + padding * 2;
        
        // Position near cursor, constrained
        let x = mousePos.x + 8;
        let y = mousePos.y + 8;
        const margin = 8;
        if (x + width + margin > k.width()) x = k.width() - width - margin;
        if (y + height + margin > k.height()) y = k.height() - height - margin;
        if (x < margin) x = margin;
        if (y < margin) y = margin;
        
        const nodes = [];
        const bg = this.overlay.add([
            k.rect(width, height),
            k.color(25, 25, 35),
            k.pos(x, y),
            k.outline(1, k.rgb(120, 120, 140)),
            k.z(2400),
            "context_menu_bg"
        ]);
        nodes.push(bg);
        
        const optionBounds = [];
        options.forEach((opt, i) => {
            const oy = y + padding + i * optionHeight;
            const row = this.overlay.add([
                k.rect(width - padding * 2, optionHeight - 2),
                k.color(45, 45, 60),
                k.pos(x + padding, oy),
                k.area({ width: width - padding * 2, height: optionHeight - 2 }),
                k.z(2401),
                "context_menu_option",
                { optKey: opt.key, optIndex: i }
            ]);
            nodes.push(row);
            row.onHover(() => { row.color = k.rgb(70, 70, 100); });
            row.onHoverEnd(() => { row.color = k.rgb(45, 45, 60); });
            const label = this.overlay.add([
                k.text(opt.label),
                k.pos(x + padding + 6, oy + 3),
                k.scale(0.35),
                k.color(220, 220, 235),
                k.z(2402),
                "context_menu_label"
            ]);
            nodes.push(label);
            optionBounds.push({ x: x + padding, y: oy, w: width - padding * 2, h: optionHeight - 2, select: opt.onSelect });
        });
        
        const pressHandler = k.onMousePress((button) => {
            if (!this.contextMenu) return;
            if (button !== "left") return;
            const pos = k.mousePos();
            for (const b of optionBounds) {
                if (this.isPointInRect(pos, { x: b.x, y: b.y }, b.w, b.h, 0)) {
                    try { b.select(); } catch (err) { console.error("Sort menu error:", err); }
                    this.closeContextMenu();
                    return;
                }
            }
            // Clicked outside any option: close the menu
            this.closeContextMenu();
            return;
        });
        
        this.contextMenu = { x, y, width, height, nodes, pressHandler };
    }

    // Perform inventory sorting / compression
    sortInventoryBy(mode) {
        const inventory = this.getInventorySystem();
        if (!inventory) return;
        try {
            if (typeof inventory.sortInventory === "function") {
                inventory.sortInventory(mode || "name");
            } else {
                // Fallback: compress-only behavior (pack non-nulls to front)
                const items = (inventory.items || []).filter(Boolean);
                const newArr = new Array((inventory.items || []).length).fill(null);
                for (let i = 0; i < items.length; i++) newArr[i] = items[i];
                inventory.items = newArr;
            }
        } catch (err) {
            console.error("Inventory sort failed:", err);
        }
        
        // Feedback
        const labels = {
            name: "Sorted by Name",
            category: "Sorted by Category",
            rarity: "Sorted by Rarity",
            value: "Sorted by Value",
            weight: "Sorted by Weight",
            compress: "Compressed items (removed gaps)",
        };
        if (window.MessageSystem) window.MessageSystem.addMessage(labels[mode] || "Inventory updated", "info");
        this.refreshDisplay();
    }

    // Close and clean up context menu
    closeContextMenu() {
        if (!this.contextMenu) return;
        const { nodes, pressHandler } = this.contextMenu;
        if (pressHandler && typeof pressHandler.cancel === "function") {
            pressHandler.cancel();
        }
        if (nodes && Array.isArray(nodes)) {
            nodes.forEach(n => {
                try { n.destroy(); } catch (_) {}
            });
        }
        this.contextMenu = null;
    }
    
    // Cleanup when destroyed
    destroy() {
        this.close();
        
        // Clean up tooltips
        this.hideItemTooltip();
        
        if (this.escHandler) this.escHandler.cancel();
        if (this.mousePressHandler) this.mousePressHandler.cancel();
        if (this.mouseReleaseHandler) this.mouseReleaseHandler.cancel();
        if (this.mouseMoveHandler) this.mouseMoveHandler.cancel();
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.InventoryUI = InventoryUI;
}
