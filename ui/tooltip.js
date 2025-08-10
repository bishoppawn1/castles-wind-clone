/**
 * Tooltip UI System for Castles of the Wind Clone
 * Handles item tooltips and hover information display
 */

class TooltipUI {
    constructor(k) {
        this.k = k;
        this.isVisible = false;
        this.tooltip = null;
        this.currentText = "";
        this.fadeTimer = 0;
        this.showDelay = 0.3; // Delay before showing tooltip
        this.hideDelay = 0.1; // Delay before hiding tooltip
        
        console.log("💬 TooltipUI initialized");
    }
    
    // Show tooltip at specified position
    show(text, position, delay = true) {
        if (!text || text.trim() === "") return;
        
        this.currentText = text;
        
        if (delay) {
            // Clear any existing timer
            if (this.showTimer) {
                clearTimeout(this.showTimer);
            }
            
            // Set timer to show tooltip after delay
            this.showTimer = setTimeout(() => {
                this.createTooltip(text, position);
            }, this.showDelay * 1000);
        } else {
            this.createTooltip(text, position);
        }
    }
    
    // Hide tooltip
    hide(delay = true) {
        if (delay) {
            // Clear any existing show timer
            if (this.showTimer) {
                clearTimeout(this.showTimer);
                this.showTimer = null;
            }
            
            // Set timer to hide tooltip after delay
            if (this.hideTimer) {
                clearTimeout(this.hideTimer);
            }
            
            this.hideTimer = setTimeout(() => {
                this.destroyTooltip();
            }, this.hideDelay * 1000);
        } else {
            this.destroyTooltip();
        }
    }
    
    // Create the tooltip display
    createTooltip(text, position) {
        // Clear any existing tooltip
        this.destroyTooltip();
        
        if (!text || text.trim() === "") return;
        
        // Parse text into lines
        const lines = text.split('\n').filter(line => line.trim() !== "");
        if (lines.length === 0) return;
        
        // Calculate tooltip dimensions
        const fontSize = 10;
        const lineHeight = 12;
        const padding = 8;
        const maxLineLength = Math.max(...lines.map(line => line.length));
        const tooltipWidth = Math.min(maxLineLength * 6 + padding * 2, 300);
        const tooltipHeight = lines.length * lineHeight + padding * 2;
        
        // Calculate position to keep tooltip on screen
        let x = position.x + 10; // Offset from cursor
        let y = position.y - tooltipHeight - 10; // Above cursor
        
        // Adjust if tooltip would go off screen
        if (x + tooltipWidth > this.k.width()) {
            x = position.x - tooltipWidth - 10; // Left of cursor
        }
        if (y < 0) {
            y = position.y + 20; // Below cursor
        }
        if (x < 0) {
            x = 5; // Minimum left margin
        }
        if (y + tooltipHeight > this.k.height()) {
            y = this.k.height() - tooltipHeight - 5; // Minimum bottom margin
        }
        
        // Create tooltip background
        this.tooltip = this.k.add([
            this.k.rect(tooltipWidth, tooltipHeight),
            this.k.color(20, 20, 30, 0.95), // Semi-transparent dark background
            this.k.pos(x, y),
            this.k.outline(1, this.k.rgb(100, 100, 100)),
            this.k.fixed(), // Stay on screen regardless of camera
            this.k.z(2000), // Very high z-index
            "tooltip",
            {
                fadeIn: 0,
                update() {
                    // Fade in animation
                    if (this.fadeIn < 1) {
                        this.fadeIn += this.k.dt() * 4;
                        this.opacity = Math.min(1, this.fadeIn);
                    }
                }
            }
        ]);
        
        // Add text lines
        lines.forEach((line, index) => {
            let textColor = [200, 200, 200]; // Default text color
            let textSize = fontSize;
            
            // Special formatting for different line types
            if (index === 0) {
                // Title line - brighter and larger
                textColor = [255, 255, 255];
                textSize = fontSize + 1;
            } else if (line.includes(':')) {
                // Stat lines - different color
                textColor = [180, 220, 180];
            } else if (line.toLowerCase().includes('requirement')) {
                // Requirement lines - warning color
                textColor = [255, 200, 100];
            } else if (line.toLowerCase().includes('effect')) {
                // Effect lines - magic color
                textColor = [150, 150, 255];
            }
            
            // Handle rarity coloring for item names
            if (index === 0) {
                const rarityColors = {
                    'common': [200, 200, 200],
                    'uncommon': [100, 255, 100],
                    'rare': [100, 100, 255],
                    'epic': [255, 100, 255],
                    'legendary': [255, 200, 0]
                };
                
                // Check if line contains rarity indicators
                Object.entries(rarityColors).forEach(([rarity, color]) => {
                    if (line.toLowerCase().includes(rarity)) {
                        textColor = color;
                    }
                });
            }
            
            this.tooltip.add([
                this.k.text(line),
                this.k.pos(padding, padding + index * lineHeight),
                this.k.scale(0.3),
                this.k.color(...textColor),
                "tooltip_text"
            ]);
        });
        
        this.isVisible = true;
    }
    
    // Destroy current tooltip
    destroyTooltip() {
        if (this.tooltip) {
            this.tooltip.destroy();
            this.tooltip = null;
        }
        
        this.isVisible = false;
        this.currentText = "";
        
        // Clear timers
        if (this.showTimer) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
        }
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
    }
    
    // Update tooltip position (for following mouse)
    updatePosition(position) {
        if (this.tooltip && this.isVisible) {
            // Calculate new position
            const tooltipWidth = this.tooltip.width;
            const tooltipHeight = this.tooltip.height;
            
            let x = position.x + 10;
            let y = position.y - tooltipHeight - 10;
            
            // Adjust if tooltip would go off screen
            if (x + tooltipWidth > this.k.width()) {
                x = position.x - tooltipWidth - 10;
            }
            if (y < 0) {
                y = position.y + 20;
            }
            if (x < 0) {
                x = 5;
            }
            if (y + tooltipHeight > this.k.height()) {
                y = this.k.height() - tooltipHeight - 5;
            }
            
            this.tooltip.pos = this.k.vec2(x, y);
        }
    }
    
    // Show item tooltip
    showItemTooltip(item, position) {
        if (!item) return;
        
        let tooltipText = item.getTooltipText ? item.getTooltipText() : this.createItemTooltipText(item);
        this.show(tooltipText, position);
    }
    
    // Create tooltip text for item (fallback if item doesn't have getTooltipText)
    createItemTooltipText(item) {
        let text = item.getDisplayName ? item.getDisplayName() : item.name;
        text += `\n${item.description || "A mysterious item."}`;
        
        if (item.category) {
            text += `\nCategory: ${item.category}`;
        }
        
        if (item.value > 0) {
            text += `\nValue: ${item.value} gold`;
        }
        
        if (item.weight > 0) {
            text += `\nWeight: ${item.weight}`;
        }
        
        if (item.bulk > 0) {
            text += `\nBulk: ${item.bulk}`;
        }
        
        // Show stats if available
        if (item.stats && Object.keys(item.stats).length > 0) {
            text += "\n\nStats:";
            Object.entries(item.stats).forEach(([stat, value]) => {
                text += `\n  ${stat}: ${value > 0 ? '+' : ''}${value}`;
            });
        }
        
        // Show requirements if available
        if (item.requirements && Object.keys(item.requirements).length > 0) {
            text += "\n\nRequirements:";
            Object.entries(item.requirements).forEach(([req, value]) => {
                text += `\n  ${req}: ${value}`;
            });
        }
        
        return text;
    }
    
    // Show simple text tooltip
    showText(text, position) {
        this.show(text, position, false);
    }
    
    // Show tooltip for UI element
    showUITooltip(text, element) {
        if (!element || !element.pos) return;
        
        const position = {
            x: element.pos.x + (element.width || 0) / 2,
            y: element.pos.y
        };
        
        this.show(text, position);
    }
    
    // Check if tooltip is currently visible
    isTooltipVisible() {
        return this.isVisible;
    }
    
    // Get current tooltip text
    getCurrentText() {
        return this.currentText;
    }
    
    // Update system (called from main game loop)
    update() {
        // Update tooltip position to follow mouse if needed
        if (this.isVisible && this.tooltip) {
            const mousePos = this.k.mousePos();
            if (mousePos) {
                this.updatePosition(mousePos);
            }
        }
    }
    
    // Cleanup
    destroy() {
        this.destroyTooltip();
    }
}

// Create global tooltip instance
if (typeof window !== 'undefined') {
    window.TooltipUI = null; // Will be initialized in main.js
    window.TooltipUIClass = TooltipUI;
}
