# Castles of the Wind Clone - Phase 1 (MVP) Development Tasks (Kaplay)

## Overview
This document breaks down the Phase 1 (MVP) development tasks from section 9.1 of the PRD into detailed, actionable subtasks using Kaplay (formerly Kaboom.js) game engine with completion tracking.

---

## 1. Basic Tile-based Movement and Rendering

### 1.1 Kaplay Setup and Core Rendering
**Files: `index.html`, `main.js`, `config.js`**
- [x] Install and initialize Kaplay in the project (`index.html`, `main.js`)
- [x] Set up Kaplay canvas with proper resolution and scaling (`main.js`)
- [x] Configure Kaplay scenes (menu, game, inventory) (`main.js`, `scenes/`)
- [x] Load and define sprite assets using `loadSprite()` (`assets.js`)
- [x] Set up tile-based grid system using Kaplay's `pos()` component (`utils/grid.js`)
- [x] Implement camera system using Kaplay's built-in camera controls (`systems/camera.js`)

### 1.2 Player Character System
**Files: `entities/player.js`, `systems/movement.js`**
- [x] Create player game object using `add()` with sprite, pos, and area components (`entities/player.js`)
- [x] Implement player animations using Kaplay's `animate()` component (`entities/player.js`)
- [x] Add player movement using `onKeyPress()` and `onMouseDown()` events (`main.js`)
- [x] Use Kaplay's grid-based movement with custom movement functions (`main.js`)
- [x] Implement smooth tweening between tiles using `tween()` (`main.js`)
- [x] Add collision detection using Kaplay's `area()` and wall detection (`main.js`)
- [x] **ENHANCED**: Advanced mouse targeting with coordinate conversion and target locking
- [x] **ENHANCED**: Diagonal movement with alternating pattern to prevent overshooting
- [x] **ENHANCED**: Click debouncing and movement interruption handling

### 1.3 Game World Structure
**Files: `data/levels.js`, `systems/level.js`, `data/tiles.js`**
- [x] Design level data structure compatible with Kaplay's level system (`data/levels.js`)
- [x] Create tilemap using symbol mapping and level layouts (`data/levels.js`)
- [x] Implement wall/floor tiles using Kaplay's tile components (`data/tiles.js`)
- [x] Add lighting effects using Kaplay's color and opacity systems (`systems/level.js`)
- [x] Create entrance/exit tiles with custom components (`data/tiles.js`)
- [x] Implement fog of war using Kaplay's visibility and opacity features (`systems/level.js`)
- [x] **ENHANCED**: Complete level management system with loading/unloading
- [x] **ENHANCED**: Interactive tile system with door, stairs, and special tiles
- [x] **ENHANCED**: Item and enemy spawning from level data
- [x] **ENHANCED**: Dynamic lighting with torch effects and ambient lighting

---

## 2. Simple Combat System

### 2.1 Enemy System
**Files: `entities/enemy.js`, `systems/ai.js`, `data/enemies.js`**
- [ ] Create enemy game objects using Kaplay's `add()` with health component (`entities/enemy.js`)
- [ ] Implement AI using Kaplay's `onUpdate()` for pathfinding logic (`systems/ai.js`)
- [ ] Add enemy sprites and animations using Kaplay's animation system (`entities/enemy.js`)
- [ ] Create enemy spawning using `spawn()` and level data integration (`systems/spawning.js`)
- [ ] Implement health system using custom health component (`components/health.js`)
- [ ] Define enemy types using Kaplay tags and custom components (`data/enemies.js`)

### 2.2 Combat Mechanics
**Files: `systems/combat.js`, `systems/spells.js`, `components/health.js`**
- [ ] Implement turn-based system using Kaplay's state management (`systems/combat.js`)
- [ ] Create damage system using custom components and events (`systems/combat.js`)
- [ ] Add combat animations using Kaplay's `play()` and animation chains (`systems/combat.js`)
- [ ] Implement player health using Kaplay's health component (`components/health.js`)
- [ ] Create spell system using Kaplay's action system and particle effects (`systems/spells.js`)
- [ ] Add visual feedback using Kaplay's text objects and tweens (`systems/feedback.js`)

### 2.3 Combat UI
**Files: `ui/combat.js`, `ui/healthbars.js`, `scenes/gameover.js`**
- [ ] Create health bars using Kaplay's rect and progress components (`ui/healthbars.js`)
- [ ] Add floating health indicators using Kaplay's text and follow components (`ui/healthbars.js`)
- [ ] Implement message system using Kaplay's text objects and queues (`ui/messages.js`)
- [ ] Create spell UI using Kaplay's button components and mouse events (`ui/spells.js`)
- [ ] Add turn indicators using Kaplay's sprite and visibility toggles (`ui/combat.js`)
- [ ] Implement game over screen using Kaplay's scene transitions (`scenes/gameover.js`)

---

## 3. Basic Inventory Management

### 3.1 Inventory Data Structure
**Files: `systems/inventory.js`, `data/items.js`, `components/item.js`**
- [ ] Create item objects using Kaplay's custom components with properties (`components/item.js`)
- [ ] Implement inventory using Kaplay's data structures and arrays (`systems/inventory.js`)
- [ ] Add item categories using Kaplay's tag system (`data/items.js`)
- [ ] Create item definitions using Kaplay's asset loading system (`data/items.js`)
- [ ] Implement weight/bulk tracking using custom component properties (`components/item.js`)
- [ ] Add pickup mechanics using Kaplay's collision detection and events (`systems/pickup.js`)

### 3.2 Inventory UI
**Files: `ui/inventory.js`, `ui/tooltip.js`, `scenes/inventory.js`**
- [ ] Create inventory UI using Kaplay's rect and sprite components (`ui/inventory.js`)
- [ ] Implement drag-and-drop using Kaplay's mouse events and object following (`ui/inventory.js`)
- [ ] Add tooltips using Kaplay's text objects and mouse hover events (`ui/tooltip.js`)
- [ ] Create equipment slots using Kaplay's UI positioning system (`ui/equipment.js`)
- [ ] Implement context menus using Kaplay's button components and event handling (`ui/contextmenu.js`)
- [ ] Add sorting features using Kaplay's array manipulation and UI updates (`ui/inventory.js`)

### 3.3 Item Interaction
**Files: `systems/items.js`, `systems/equipment.js`, `entities/grounditem.js`**
- [ ] Implement item usage using Kaplay's action system and custom events (`systems/items.js`)
- [ ] Add item examination using Kaplay's text display and modal systems (`ui/examination.js`)
- [ ] Create ground items using Kaplay's sprite objects with pickup areas (`entities/grounditem.js`)
- [ ] Implement item effects using Kaplay's component modification system (`systems/items.js`)
- [ ] Add stat bonuses using Kaplay's custom component updates (`systems/equipment.js`)
- [ ] Create stacking using Kaplay's object grouping and count properties (`systems/inventory.js`)

---

## 4. Single Dungeon Level

### 4.1 Level Generation
**Files: `levels/level1.js`, `data/leveldata.js`, `systems/levelgen.js`**
- [ ] Create dungeon layout using Kaplay's `addLevel()` with ASCII art mapping (`levels/level1.js`)
- [ ] Implement rooms and corridors using Kaplay's tile symbol system (`data/leveldata.js`)
- [ ] Add treasure placement using Kaplay's level symbols and spawn points (`systems/levelgen.js`)
- [ ] Create enemy spawn points using Kaplay's level generation callbacks (`systems/spawning.js`)
- [ ] Implement entrance/exit using Kaplay's special tile components (`data/tiles.js`)
- [ ] Add environmental features using Kaplay's custom tile behaviors (`systems/environment.js`)

### 4.2 Level Progression
**Files: `systems/progression.js`, `systems/objectives.js`, `utils/saveload.js`**
- [ ] Create level transitions using Kaplay's `go()` scene switching (`systems/progression.js`)
- [ ] Implement completion conditions using Kaplay's event system (`systems/objectives.js`)
- [ ] Add objective tracking using Kaplay's global state management (`systems/objectives.js`)
- [ ] Create level state persistence using Kaplay's data storage (`utils/saveload.js`)
- [ ] Implement respawn using Kaplay's scene restart functionality (`systems/progression.js`)
- [ ] Add exploration tracking using Kaplay's custom components (`systems/exploration.js`)

### 4.3 Interactive Elements
**Files: `entities/door.js`, `entities/chest.js`, `entities/trap.js`, `systems/interaction.js`**
- [ ] Create doors using Kaplay's area components and collision events (`entities/door.js`)
- [ ] Implement chests using Kaplay's sprite objects with interaction areas (`entities/chest.js`)
- [ ] Add traps using Kaplay's trigger areas and damage events (`entities/trap.js`)
- [ ] Create interactive objects using Kaplay's clickable components (`systems/interaction.js`)
- [ ] Implement ground items using Kaplay's pickup collision system (`entities/grounditem.js`)
- [ ] Add environmental storytelling using Kaplay's text and trigger systems (`systems/storytelling.js`)

---

## Technical Foundation Tasks

### Project Setup
**Files: `package.json`, `index.html`, `main.js`, `.gitignore`**
- [ ] Initialize project with Kaplay via CDN or npm installation (`package.json`, `index.html`)
- [ ] Set up version control (Git) with .gitignore for node_modules (`.gitignore`)
- [ ] Create HTML page with Kaplay canvas initialization (`index.html`)
- [ ] Configure Kaplay with proper game settings and plugins (`main.js`, `config.js`)
- [ ] Set up Kaplay's built-in error handling and debug mode (`main.js`)
- [ ] Create development server (live-server or Vite for Kaplay) (`package.json`)

### Core Systems
**Files: `main.js`, `scenes/`, `utils/input.js`, `utils/audio.js`**
- [ ] Initialize Kaplay game loop with proper scene management (`main.js`)
- [ ] Set up input handling using Kaplay's built-in input system (`utils/input.js`)
- [ ] Implement scene management using Kaplay's scene system (`scenes/menu.js`, `scenes/game.js`)
- [ ] Add audio using Kaplay's `loadSound()` and `play()` functions (`utils/audio.js`)
- [ ] Use Kaplay's built-in math utilities and random functions (`utils/math.js`)
- [ ] Enable Kaplay's performance monitoring and debug info (`main.js`)

### Testing and Debug
**Files: `debug/`, `utils/debug.js`, `utils/saveload.js`**
- [ ] Enable Kaplay's built-in debug mode and FPS counter (`main.js`)
- [ ] Implement console commands using Kaplay's debug system (`debug/console.js`)
- [ ] Add testing using Kaplay's scene switching for test scenarios (`debug/testscenes.js`)
- [ ] Create level editor using Kaplay's level editing capabilities (`debug/leveleditor.js`)
- [ ] Implement save/load using Kaplay's data persistence system (`utils/saveload.js`)
- [ ] Use Kaplay's built-in error reporting and logging (`utils/debug.js`)

---

## Acceptance Criteria for Phase 1 MVP

### Minimum Viable Product Must Include:
- [ ] Player can move around a single dungeon level using mouse or keyboard
- [ ] Player can engage in turn-based combat with at least 2 enemy types
- [ ] Player can pick up, use, and manage items in a basic inventory
- [ ] Player can cast at least 2-3 different spells
- [ ] Player can complete the level by reaching an exit or defeating all enemies
- [ ] Game has basic UI showing health, inventory, and spell options
- [ ] Game runs smoothly at 60 FPS in modern web browsers

### Success Metrics:
- [ ] Complete playthrough possible from start to level completion
- [ ] No game-breaking bugs or crashes during normal gameplay
- [ ] Intuitive controls that new players can understand quickly
- [ ] Performance remains stable during combat and movement
- [ ] All core systems work together without conflicts

---

## Notes
- Focus on functionality over polish in Phase 1
- Use placeholder art and simple graphics to start
- Prioritize core gameplay loop over advanced features
- Test frequently to ensure systems work together
- Document any technical decisions for future phases
