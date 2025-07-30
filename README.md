# Castles of the Wind Clone

A modern web-based recreation of the classic 1989 roguelike RPG "Castle of the Winds" by Rick Saada, built using the Kaplay (formerly Kaboom.js) game engine.

## Overview

This project aims to faithfully recreate the tactical depth and charm of the original Castle of the Winds while making it accessible to contemporary players through modern web technologies. The game features tile-based movement, magic-focused combat, and a rich inventory system set in a Norse mythology-inspired world.

### Key Features

- **Tile-based Roguelike Gameplay**: Strategic movement and positioning on a grid-based map
- **Magic-Focused Combat System**: 30 spells across 6 categories with elemental oppositions
- **Advanced Inventory Management**: Weight/bulk-based system with multiple container types
- **Norse Mythology Setting**: Rich storyline following the player's quest for vengeance
- **Turn-based Strategic Combat**: Tactical battles emphasizing spell usage over melee
- **Progressive Character Development**: Experience-based spell learning and stat growth

### Technology Stack

- **Game Engine**: Kaplay (Kaboom.js) - Modern JavaScript game framework
- **Platform**: Web-based (HTML5/JavaScript) with potential Electron wrapper
- **Graphics**: Modern pixel art inspired by the original 16-bit aesthetic
- **Audio**: Web Audio API through Kaplay's sound system

## Development Phases

### Phase 1: MVP (Current)
- Basic tile-based movement and rendering
- Simple combat system
- Basic inventory management  
- Single dungeon level

### Phase 2: Full Gameplay
- Complete spell system (30 spells)
- Town services implementation
- Multi-level dungeons
- Save/load functionality

### Phase 3: Polish and Balance
- Complete Part 1 story implementation
- UI/UX refinement
- Performance optimization
- Bug fixes and balancing

### Phase 4: Enhancement
- Enhanced graphics and animations
- Sound and music integration
- Quality-of-life features
- Part 2 preparation

## Project Structure

```
castle-wind-clone/
├── README.md                  # Project documentation
├── package.json               # Node.js dependencies and scripts
├── .gitignore                 # Git ignore rules
├── index.html                 # Main HTML entry point
├── main.js                    # Kaplay initialization & game loop
├── config.js                  # Game configuration settings
├── assets.js                  # Asset loading and management
│
├── components/                # Reusable game components
│   ├── health.js             # Health system component
│   └── item.js               # Item properties component
│
├── entities/                  # Game objects and entities
│   ├── player.js             # Player character implementation
│   ├── enemy.js              # Enemy entities and behaviors
│   ├── door.js               # Interactive door objects
│   ├── chest.js              # Treasure chest containers
│   ├── trap.js               # Trap mechanisms
│   └── grounditem.js         # Items on the ground
│
├── systems/                   # Core game systems
│   ├── movement.js           # Player and entity movement
│   ├── combat.js             # Combat mechanics and resolution
│   ├── inventory.js          # Inventory management system
│   ├── ai.js                 # Enemy AI and pathfinding
│   ├── spells.js             # Spell casting and effects
│   ├── collision.js          # Collision detection
│   ├── camera.js             # Camera controls and following
│   ├── lighting.js           # Lighting and visibility effects
│   ├── fog.js                # Fog of war implementation
│   ├── spawning.js           # Entity spawning system
│   ├── feedback.js           # Visual feedback and effects
│   ├── levelgen.js           # Level generation utilities
│   ├── progression.js        # Level progression and transitions
│   ├── objectives.js         # Quest and objective tracking
│   ├── exploration.js        # Map exploration tracking
│   ├── environment.js        # Environmental interactions
│   ├── interaction.js        # General interaction system
│   ├── storytelling.js       # Narrative and dialogue
│   ├── pickup.js             # Item pickup mechanics
│   ├── items.js              # Item usage and effects
│   └── equipment.js          # Equipment and stat bonuses
│
├── ui/                        # User interface components
│   ├── inventory.js          # Inventory panel and interactions
│   ├── healthbars.js         # Health display components
│   ├── tooltip.js            # Tooltip system
│   ├── equipment.js          # Equipment slots interface
│   ├── contextmenu.js        # Right-click context menus
│   ├── messages.js           # Message log and notifications
│   ├── spells.js             # Spell selection interface
│   ├── combat.js             # Combat UI elements
│   └── examination.js        # Item examination modals
│
├── scenes/                    # Game scenes and states
│   ├── menu.js               # Main menu scene
│   ├── game.js               # Primary gameplay scene
│   ├── inventory.js          # Inventory management scene
│   └── gameover.js           # Game over and death screen
│
├── levels/                    # Level definitions and data
│   ├── level1.js             # First dungeon level
│   └── ...                   # Additional levels
│
├── data/                      # Game data and definitions
│   ├── items.js              # Item definitions and properties
│   ├── enemies.js            # Enemy types and stats
│   ├── tiles.js              # Tile types and behaviors
│   ├── levels.js             # Level data structures
│   └── leveldata.js          # Raw level layout data
│
├── utils/                     # Utility functions and helpers
│   ├── grid.js               # Grid-based coordinate utilities
│   ├── audio.js              # Audio management utilities
│   ├── math.js               # Mathematical helper functions
│   ├── input.js              # Input handling utilities
│   ├── debug.js              # Debug and logging utilities
│   └── saveload.js           # Save/load game state
│
├── debug/                     # Development and debugging tools
│   ├── console.js            # Debug console commands
│   ├── testscenes.js         # Test scenarios and scenes
│   └── leveleditor.js        # Level editing tools
│
└── assets/                    # Game assets (created during development)
    ├── sprites/              # Character and object sprites
    ├── tiles/                # Tile graphics
    ├── sounds/               # Sound effects
    └── music/                # Background music
```

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- Modern web browser with ES6 support
- Git for version control

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open browser to `http://localhost:3000`

### Development Workflow
1. Check the task breakdown in `castles-wind-clone-dev1.md`
2. Follow the file organization specified for each feature
3. Use Kaplay's component system for game objects
4. Test frequently using the debug tools
5. Update documentation as features are completed

## Documentation

- **PRD**: `castles-wind-clone-PRD.md` - Complete product requirements
- **Development Tasks**: `castles-wind-clone-dev1.md` - Detailed Phase 1 task breakdown
- **Original Game Research**: Documented in project memories

## Contributing

This project follows a modular architecture with clear separation of concerns:
- Each file has a specific responsibility
- Components are reusable across entities
- Systems handle cross-cutting concerns
- UI components are isolated from game logic

## License

This project is a fan recreation for educational purposes. The original Castle of the Winds is owned by Rick Saada and was released as freeware.

---

*A faithful recreation of a classic roguelike, bringing the tactical depth of Castle of the Winds to modern web browsers.*
