// System Initialization Helper
// Ensures all systems are properly initialized and called

const SystemInitializer = {
    initialized: false,

    // Initialize all systems
    init(k) {
        if (this.initialized) return;
        
        console.log('🔧 Initializing game systems...');
        
        this.initializeSystems(k);
        
        this.initialized = true;
        console.log('🎮 All systems initialized successfully');
    },
    
    // Initialize all game systems
    initializeSystems(k) {
        console.log('🔧 Initializing all game systems...');
        
        // Initialize core systems first
        // Note: LevelSystem doesn't need initialization - it's a utility system
        
        if (typeof ProgressionSystem !== 'undefined') {
            ProgressionSystem.init(k);
        }
        
        if (typeof ObjectivesSystem !== 'undefined') {
            ObjectivesSystem.init(k);
        }
        
        if (typeof SaveLoadSystem !== 'undefined') {
            SaveLoadSystem.init(k);
        }
        
        // Note: Entity systems (PlayerEntity, EnemyEntity, etc.) are factory functions
        // They don't need initialization - they create entities when called
        
        // Initialize gameplay systems
        if (typeof SpawningSystem !== 'undefined') {
            SpawningSystem.init(k);
        }
        
        if (typeof CombatSystem !== 'undefined') {
            CombatSystem.init(k);
        }
        
        // Note: InventorySystem is a class with constructor, not a system with init()
        
        if (typeof InteractionSystem !== 'undefined') {
            InteractionSystem.init(k);
        }
        
        if (typeof ChestEntity !== 'undefined') {
            ChestEntity.init(k);
        }
        
        if (typeof EnvironmentSystem !== 'undefined') {
            EnvironmentSystem.init(k);
        }
        
        if (typeof StatusEffectSystem !== 'undefined') {
            StatusEffectSystem.init(k);
        }
        
        if (typeof CameraSystem !== 'undefined') {
            CameraSystem.init(k);
        }
        
        if (typeof GameState !== 'undefined') {
            GameState.init(k);
        }
        
        console.log('✅ All game systems initialized');
    },

    // Generate level content after level is loaded
    generateLevelContent(levelDataOrId) {
        if (!this.initialized) {
            console.warn('⚠️ Systems not initialized, cannot generate level content');
            return;
        }
        
        // Handle both level data object and level ID
        let levelData = levelDataOrId;
        let levelId = levelDataOrId;
        
        if (typeof levelDataOrId === 'object' && levelDataOrId.id) {
            levelData = levelDataOrId;
            levelId = levelDataOrId.id;
        } else if (typeof levelDataOrId === 'string') {
            levelId = levelDataOrId;
            levelData = (typeof LEVELS !== 'undefined') ? LEVELS[levelId] : null;
        }
        
        if (!levelData) {
            console.warn(`⚠️ Level data not found for: ${levelId}`);
            return;
        }
        
        console.log(`🏗️ Generating content for level ${levelId}...`);
        
        // Generate level content using LevelGenSystem
        if (typeof LevelGenSystem !== 'undefined') {
            LevelGenSystem.generateLevel(levelData);
            console.log('✅ Level content generated');
        }
        
        // Generate environmental effects using EnvironmentSystem
        if (typeof EnvironmentSystem !== 'undefined') {
            EnvironmentSystem.createEnvironmentalFeatures(levelData);
            console.log('✅ Environmental effects generated');
        }
        
        // Note: ObjectivesSystem uses random objectives, no level-specific loading needed
        // Note: ProgressionSystem and ExplorationSystem don't have these specific functions
        
        console.log('✅ Level systems updated');
        
        console.log('🎯 Level content generation complete');
    }
};
