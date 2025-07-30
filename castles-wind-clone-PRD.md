# Castles of the Wind Clone - Product Requirements Document

## 1. Overview

### 1.1 Project Description
A modern clone of the classic 1989 roguelike RPG "Castle of the Winds" by Rick Saada. This tile-based dungeon crawler will recreate the core gameplay mechanics while updating the interface and graphics for contemporary platforms.

### 1.2 Target Audience
- Fans of classic roguelike games
- Players interested in tactical RPG gameplay
- Retro gaming enthusiasts
- New players discovering the roguelike genre

### 1.3 Platform
- Primary: Web-based (HTML5/JavaScript)
- Secondary: Desktop (Electron wrapper)

## 2. Core Gameplay Features

### 2.1 Game Structure
- **Two-Part Campaign**: Implement Part 1 ("A Question of Vengeance") initially
- **Tile-based Movement**: Grid-based character and enemy movement
- **Turn-based Combat**: Strategic combat system with spell emphasis
- **Procedural Dungeons**: Randomly generated dungeon layouts with fixed story elements

### 2.2 Character System
- **Attribute Distribution**: Allocate points between core characteristics at character creation
- **Gender Selection**: Choose character gender
- **Experience Levels**: Automatic spell learning with each level up
- **Spell System**: 30 total spells across 6 categories:
  - Attack spells
  - Defense spells
  - Healing spells
  - Movement spells
  - Divination spells
  - Miscellaneous spells

### 2.3 Magic System
- **Elemental Oppositions**: 
  - Cold vs Fire
  - Lightning vs Acid/Poison
- **Ranged Combat**: Spells as primary ranged weapons
- **Spell Learning**: Permanent spell acquisition through books
- **Mana Management**: Resource system for spell casting

### 2.4 Inventory System
- **Weight/Bulk Limits**: Realistic carrying capacity based on item properties
- **Container System**: Multiple container types:
  - Backpacks
  - Belts
  - Chests
  - Bags
- **Item States**: Normal, cursed, or enchanted items
- **Item Condition**: Broken/rusted items possible
- **Item Renaming**: Player can rename carried items

### 2.5 Item Categories
- Weapons (melee and ranged)
- Armor and protective clothing
- Containers and storage
- Purses for currency
- Ornamental jewelry
- Consumables and books

## 3. Town and Services

### 3.1 Core Services (Available in all towns)
- **Temple**: Healing and curse removal
- **Junk Store**: Sell any item for copper coins
- **Sage**: Item identification services
- **Bank**: Coin storage (from second town onwards)

### 3.2 Variable Services
- **Outfitters**: Clothing and basic gear
- **Weaponsmiths**: Weapons and weapon repairs
- **Armorsmiths**: Armor and armor repairs
- **Magic Shops**: Spell books and magical items
- **General Stores**: Miscellaneous supplies

### 3.3 Merchant Mechanics
- **Stock Rotation**: Inventory changes based on time spent playing
- **Dynamic Pricing**: Basic economic system

## 4. User Interface Requirements

### 4.1 Input Methods
- **Primary**: Mouse-driven interface
- **Secondary**: Keyboard shortcuts for common actions
- **Accessibility**: Support for keyboard-only navigation

### 4.2 Interface Elements
- **Main Game View**: Isometric or top-down tile display
- **Inventory Panel**: Drag-and-drop item management
- **Character Stats**: Health, mana, experience display
- **Spell Book**: Quick access to learned spells
- **Mini-map**: Dungeon navigation aid

### 4.3 Visual Design
- **Art Style**: Modern pixel art inspired by the original
- **Color Palette**: Enhanced version of original color scheme
- **Animations**: Smooth character and spell animations
- **UI Theme**: Medieval fantasy aesthetic

## 5. Progression and Scoring

### 5.1 Time Tracking
- **Play Time**: Accurate tracking of time spent playing
- **Leaderboard**: "Valhalla's Champions" ranking system
- **Completion Categories**: 
  - Successful completion (fastest to slowest)
  - Deaths (with final experience points)

### 5.2 Difficulty Scaling
- **Boss Difficulty**: Final boss strength based on completion time
- **Dynamic Challenge**: Adaptive difficulty based on player performance

## 6. Story and Setting

### 6.1 Narrative Framework
- **Norse Mythology**: Authentic mythological references and themes
- **Revenge Plot**: Player seeks vengeance for murdered godparents
- **Chosen One**: Player discovers their royal heritage
- **Linear Progression**: Story-driven dungeon progression

### 6.2 Key Story Beats (Part 1)
1. **Opening**: Destroyed farm, murdered godparents
2. **Mine Exploration**: First dungeon, discovery of conspiracy
3. **Hamlet Destruction**: Return to find village pillaged
4. **Journey to Bjarnarhaven**: First major town
5. **Fortress Dungeons**: Multi-level dungeon exploration
6. **Boss Fight**: Defeat Hrungnir, the Hill Giant Lord
7. **Revelation**: Enchanted Amulet reveals player's past
8. **Transition**: Transport to Crossroads (setup for Part 2)

## 7. Technical Requirements

### 7.1 Core Systems
- **Save/Load**: Persistent game state with multiple save slots
- **Random Generation**: Seeded random number generation for dungeons
- **Pathfinding**: AI movement and player navigation assistance
- **Collision Detection**: Accurate tile-based collision system

### 7.2 Performance Targets
- **Frame Rate**: Consistent 60 FPS gameplay
- **Load Times**: Under 3 seconds for area transitions
- **Memory Usage**: Efficient resource management
- **Cross-Platform**: Consistent experience across target platforms

### 7.3 Data Management
- **Save Format**: JSON-based save files
- **Configuration**: User preferences and settings
- **Localization**: Support for multiple languages (future)

## 8. Success Metrics

### 8.1 Gameplay Metrics
- **Completion Rate**: Percentage of players finishing Part 1
- **Average Play Time**: Time to complete first playthrough
- **Replay Rate**: Players starting new characters
- **Death Analysis**: Common causes of character death

### 8.2 User Experience Metrics
- **Tutorial Completion**: New player onboarding success
- **Control Satisfaction**: Interface usability scores
- **Performance Stability**: Crash rates and bug reports

## 9. Development Phases

### 9.1 Phase 1: Core Systems (MVP)
- Basic tile-based movement and rendering
- Simple combat system
- Basic inventory management
- Single dungeon level

### 9.2 Phase 2: Full Gameplay
- Complete spell system
- Town services implementation
- Multi-level dungeons
- Save/load functionality

### 9.3 Phase 3: Polish and Balance
- Complete Part 1 story implementation
- UI/UX refinement
- Performance optimization
- Bug fixes and balancing

### 9.4 Phase 4: Enhancement
- Enhanced graphics and animations
- Sound and music integration
- Additional quality-of-life features
- Preparation for Part 2 development

## 10. Future Considerations

### 10.1 Part 2 Development
- Continuation of story in "Lifthransir's Bane"
- Additional spells and mechanics
- New enemies and environments
- Character import from Part 1

### 10.2 Modern Enhancements
- Online leaderboards
- Achievement system
- Mod support
- Mobile platform adaptation

---

*This PRD serves as the foundation for developing a faithful yet modernized clone of Castle of the Winds Part 1, preserving the tactical depth and charm of the original while making it accessible to contemporary players.*
