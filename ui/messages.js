// Combat Message System for Castles of the Wind Clone
// Displays combat messages, notifications, and status updates

const MessageUI = {
    // Initialize message system
    init(k) {
        this.k = k;
        this.messages = [];
        this.maxMessages = 5;
        this.messageLifetime = 3000; // 3 seconds
        this.messageContainer = null;
        
        this.createMessageContainer();
        console.log('💬 Message UI initialized');
    },
    
    // Create message container
    createMessageContainer() {
        // Create a container for messages in the bottom-left corner
        this.messageContainer = this.k.add([
            this.k.pos(10, this.k.height() - 150),
            this.k.fixed(),
            this.k.z(200)
        ]);
    },
    
    // Add a new message
    addMessage(text, type = 'info', duration = null) {
        const messageLifetime = duration || this.messageLifetime;
        const timestamp = Date.now();
        
        // Message colors based on type
        const colors = {
            'info': [200, 200, 200],
            'combat': [255, 150, 150],
            'damage': [255, 100, 100],
            'heal': [100, 255, 100],
            'warning': [255, 255, 100],
            'success': [100, 255, 150],
            'error': [255, 100, 100],
            'system': [150, 150, 255]
        };
        
        const color = colors[type] || colors['info'];
        
        // Create message text object
        const messageText = this.messageContainer.add([
            this.k.text(text),
            this.k.pos(0, 0),
            this.k.scale(0.3),
            this.k.color(...color),
            this.k.opacity(1.0)
        ]);
        
        // Create message data
        const messageData = {
            text: messageText,
            content: text,
            type: type,
            timestamp: timestamp,
            lifetime: messageLifetime,
            fadeStartTime: timestamp + messageLifetime - 1000 // Start fading 1 second before removal
        };
        
        this.messages.push(messageData);
        
        // Remove old messages if we have too many
        while (this.messages.length > this.maxMessages) {
            this.removeMessage(0);
        }
        
        // Update message positions
        this.updateMessagePositions();
        
        console.log(`💬 Added ${type} message: ${text}`);
    },
    
    // Remove message by index
    removeMessage(index) {
        if (index < 0 || index >= this.messages.length) return;
        
        const message = this.messages[index];
        this.k.destroy(message.text);
        this.messages.splice(index, 1);
        
        this.updateMessagePositions();
    },
    
    // Update positions of all messages
    updateMessagePositions() {
        this.messages.forEach((message, index) => {
            const y = -(index * 18); // Stack messages upward
            message.text.pos = this.k.vec2(0, y);
        });
    },
    
    // Add combat-specific messages
    addCombatMessage(attacker, target, damage, type = 'attack') {
        const attackerName = (attacker && attacker.name) || 'Player';
        const targetName = (target && target.name) || 'Player';
        
        let message = '';
        let messageType = 'combat';
        
        switch (type) {
            case 'attack':
                message = `${attackerName} attacks ${targetName} for ${damage} damage!`;
                messageType = 'damage';
                break;
            case 'miss':
                message = `${attackerName} misses ${targetName}!`;
                messageType = 'info';
                break;
            case 'critical':
                message = `${attackerName} critically hits ${targetName} for ${damage} damage!`;
                messageType = 'damage';
                break;
            case 'death':
                message = `${targetName} has been defeated!`;
                messageType = 'success';
                break;
            case 'heal':
                message = `${targetName} recovers ${damage} health!`;
                messageType = 'heal';
                break;
        }
        
        this.addMessage(message, messageType);
    },
    
    // Add turn indicator message
    addTurnMessage(entityName, isPlayer = false) {
        const message = `${entityName}'s turn`;
        const messageType = isPlayer ? 'success' : 'warning';
        this.addMessage(message, messageType, 2000); // Shorter duration for turn messages
    },
    
    // Add combat start/end messages
    addCombatStateMessage(state, enemy = null) {
        let message = '';
        let messageType = 'system';
        
        switch (state) {
            case 'start':
                message = (enemy && enemy.name) ? `Combat started with ${enemy.name}!` : 'Combat started!';
                messageType = 'warning';
                break;
            case 'end':
                message = 'Combat ended.';
                messageType = 'info';
                break;
            case 'victory':
                message = (enemy && enemy.name) ? `Defeated ${enemy.name}!` : 'Victory!';
                messageType = 'success';
                break;
            case 'defeat':
                message = 'You have been defeated!';
                messageType = 'error';
                break;
        }
        
        this.addMessage(message, messageType);
    },
    
    // Add level up message
    addLevelUpMessage(newLevel) {
        this.addMessage(`Level up! You are now level ${newLevel}!`, 'success', 4000);
    },
    
    // Add item pickup message
    addItemMessage(itemName, action = 'picked up') {
        this.addMessage(`${action} ${itemName}`, 'success', 2500);
    },
    
    // Add status effect messages
    addStatusMessage(effect, target, isApplied = true) {
        const targetName = (target && target.name) || 'Player';
        const action = isApplied ? 'is affected by' : 'recovers from';
        this.addMessage(`${targetName} ${action} ${effect}`, 'warning');
    },
    
    // Clear all messages
    clearMessages() {
        this.messages.forEach(message => {
            this.k.destroy(message.text);
        });
        this.messages = [];
    },
    
    // Update message system
    update() {
        // Check if system is initialized
        if (!this.messages) {
            return; // System not initialized yet
        }
        
        const currentTime = Date.now();
        
        // Update message opacity and remove expired messages
        for (let i = this.messages.length - 1; i >= 0; i--) {
            const message = this.messages[i];
            const age = currentTime - message.timestamp;
            
            // Remove expired messages
            if (age > message.lifetime) {
                this.removeMessage(i);
                continue;
            }
            
            // Fade out messages near end of lifetime
            if (age > message.fadeStartTime) {
                const fadeProgress = (age - message.fadeStartTime) / 1000; // 1 second fade
                const opacity = Math.max(0, 1.0 - fadeProgress);
                message.text.opacity = opacity;
            }
        }
    },
    
    // Show/hide message container
    setVisible(visible) {
        if (this.messageContainer) {
            this.messageContainer.opacity = visible ? 1.0 : 0.0;
        }
    },
    
    // Clean up message system
    cleanup() {
        this.clearMessages();
        if (this.messageContainer) {
            this.k.destroy(this.messageContainer);
            this.messageContainer = null;
        }
        console.log('💬 Message UI cleaned up');
    }
};

// Make MessageUI globally available
window.MessageUI = MessageUI;

console.log('💬 Message UI system loaded successfully');
