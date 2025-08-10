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
- [x] Create enemy game objects using Kaplay's `add()` with health component (`entities/enemy.js`)
- [x] Implement AI using Kaplay's `onUpdate()` for pathfinding logic (`systems/ai.js`)
- [x] Add enemy sprites and animations using Kaplay's animation system (`entities/enemy.js`)
- [x] Create enemy spawning using `spawn()` and level data integration (`systems/spawning.js`)
- [x] Implement health system using custom health component (`components/health.js`)
- [x] Define enemy types using Kaplay tags and custom components (`data/enemies.js`)
- [x] **ENHANCED**: Fixed enemy positioning to be properly centered within grid cells
- [x] **ENHANCED**: Implemented enemy AI behaviors (aggressive, skittish, guardian, passive)
- [x] **ENHANCED**: Added enemy animation system with state-based color changes
- [x] **ENHANCED**: Created comprehensive enemy spawning system with dynamic spawning

### 2.2 Combat Mechanics
**Files: `systems/combat.js`, `systems/spells.js`, `components/health.js`**
- [x] Implement turn-based system using Kaplay's state management (`systems/combat.js`)
- [x] Create damage system using custom components and events (`systems/combat.js`)
- [x] Add combat animations using Kaplay's `play()` and animation chains (`systems/combat.js`)
- [x] Implement player health using Kaplay's health component (`components/health.js`)
- [x] Create spell system using Kaplay's action system and particle effects (`systems/spells.js`)
- [x] Add visual feedback using Kaplay's text objects and tweens (`systems/feedback.js`)
- [x] **ENHANCED**: Implemented comprehensive combat system with turn-based mechanics
- [x] **ENHANCED**: Added visual combat effects (damage numbers, hit particles, camera shake)
- [x] **ENHANCED**: Created damage calculation with attack/defense stats
- [x] **ENHANCED**: Integrated combat state management and turn processing

### 2.3 Combat UI
**Files: `ui/combat.js`, `ui/healthbars.js`, `scenes/gameover.js`**
- [x] Create health bars using Kaplay's rect and progress components (`ui/healthbars.js`)
- [x] Add floating health indicators using Kaplay's text and follow components (`ui/healthbars.js`)
- [x] Implement message system using Kaplay's text objects and queues (`ui/messages.js`)
- [x] Create spell UI using Kaplay's button components and mouse events (`ui/spells.js`)
- [x] Add turn indicators using Kaplay's sprite and visibility toggles (`ui/combat.js`)
- [x] Implement game over screen using Kaplay's scene transitions (`scenes/gameover.js`)
- [x] **ENHANCED**: Fixed all method call errors and null reference issues
- [x] **ENHANCED**: Implemented dynamic visual health bar feedback with proper scaling
- [x] **ENHANCED**: Added comprehensive combat message system with color coding
- [x] **ENHANCED**: Created turn-based combat system preventing spam attacks
- [x] **ENHANCED**: Fixed enemy double attack issue and combat flow

---

## 3. Basic Inventory Management

### 3.1 Inventory Data Structure
**Files: `systems/inventory.js`, `data/items.js`, `components/item.js`**
- [x] Create item objects using Kaplay's custom components with properties (`components/item.js`)
- [x] Implement inventory using Kaplay's data structures and arrays (`systems/inventory.js`)
- [x] Add item categories using Kaplay's tag system (`data/items.js`)
- [x] Create item definitions using Kaplay's asset loading system (`data/items.js`)
- [x] Implement weight/bulk tracking using custom component properties (`components/item.js`)
- [x] Add pickup mechanics using Kaplay's collision detection and events (`systems/pickup.js`)
- [x] **ENHANCED**: Items grant experience points when picked up
- [x] **ENHANCED**: Complete item data system with rarity and experience values
- [x] **ENHANCED**: Fixed all Kaplay component errors (lifespan/opacity requirements)
- [x] **ENHANCED**: Proper item positioning centered within grid squares
- [x] **ENHANCED**: Full weight/bulk tracking system with UI display and limits enforcement
- [x] **ENHANCED**: MASSIVE EXPANSION: 60 slots (10x6 grid), 16 equipment slots, authentic Castles of Wind experience

### 3.2 Inventory UI
**Files: `ui/inventory.js`, `ui/tooltip.js`, `scenes/inventory.js`**
- [x] Create inventory UI using Kaplay's rect and sprite components (`ui/inventory.js`)
- [x] Implement drag-and-drop using Kaplay's mouse events and object following (`ui/inventory.js`)
- [x] Add tooltips using Kaplay's text objects and mouse hover events (`ui/tooltip.js`)
- [x] Create equipment slots using Kaplay's UI positioning system (`ui/equipment.js`)
- [x] Implement context menus using Kaplay's button components and event handling (implemented inline in `ui/inventory.js`)
- [x] Add sorting features using Kaplay's array manipulation and UI updates (`ui/inventory.js`)
- [x] **ENHANCED**: Fixed inventory UI blank screen issue with proper text rendering
- [x] **ENHANCED**: Implemented game pause functionality when inventory is open
- [x] **ENHANCED**: Created overlay system instead of scene switching for better state management
- [x] **ENHANCED**: Added comprehensive player stats display and equipment slots
- [x] **ENHANCED**: Fixed all Kaplay v3001.0.0 compatibility issues with text rendering
- [x] **ENHANCED**: Implemented proper inventory opening/closing with keyboard controls
- [x] **ENHANCED**: EXPANDED: 700x500px UI, 16 equipment types (rings, cloaks, bracers, belts, etc.)

### 3.3 Item Interaction
**Files: `systems/items.js`, `systems/equipment.js`, `entities/grounditem.js`**
- [x] Implement item usage using Kaplay's action system and custom events (`systems/items.js`)
- [x] Add item examination using Kaplay's text display and modal systems (`ui/examination.js`)
- [x] Create ground items using Kaplay's sprite objects with pickup areas (`entities/grounditem.js`)
- [ ] Implement item effects using Kaplay's component modification system (`systems/items.js`)
- [x] Add stat bonuses using Kaplay's custom component updates (`systems/equipment.js`)
- [x] Create stacking using Kaplay's object grouping and count properties (`systems/inventory.js`)
- [x] **ENHANCED**: Ground items spawn correctly with proper visual effects
- [x] **ENHANCED**: Pickup system with experience gain and visual feedback
- [x] **ENHANCED**: Item pickup messages with experience point display
- [x] **ENHANCED**: Fixed all pickup system errors and component issues

#### 3.3.1 Item Effects — Design and Implementation Plan
**Goal**: Enable consumables and special items to modify entity components (instant and timed effects) safely and with clear feedback.

**Data Model (data/items.js)**
- [ ] Add `effects` array to consumable items (e.g., health/mana potions, antidotes, stat elixirs):
  - Shape: `{ type: "heal"|"mana"|"buff_stat"|"cure"|"shield"|"regen"|"damage", stat?: "attack"|"defense"|"speed"|"dexterity"|"strength", amount: number, durationMs?: number }`
- [ ] Example definitions: Health Potion (heal), Mana Potion (mana), Antidote (cure: "poison"), Strength Elixir (buff_stat+duration), Shield Tonic (shield+duration), Regen Draught (regen+duration)

**Systems (systems/items.js)**
- [ ] Implement `applyItemEffects(item, target)` to iterate `effects` and modify target components with null-safety
- [ ] Instant effects: heal/mana/damage adjust `Health`/`Mana` components; clamp to min/max; update HealthBarUI
- [ ] Timed effects: add/update `StatusEffectComponent` entries with `{ type, amount, expiresAt }`
- [ ] Cures: remove matching status entries (e.g., poison, slow)
- [ ] Emit messages via `ui/messages.js` for each applied/removed effect
- [ ] Robust logging for effect application, clamping, and expirations

**Status Effect Processing (shared/integration)**
- [ ] Create lightweight `StatusEffectComponent` for entities (player + enemies) to hold active timed effects
- [ ] Central tick: reuse/integrate with MagicSystem processing loop to avoid duplicate processing; 500ms cadence OK
- [ ] On expiry: revert stat deltas, remove effect, refresh UI; ensure clean-up if entity destroyed

**UI & Feedback**
- [ ] Update `ui/examination.js` and tooltips to show effect summaries (e.g., "+15 HP", "+2 STR for 30s")
- [ ] Ensure inventory Use → effect application path shows result messages and refreshes inventory/UI immediately
- [ ] Add subtle FX for effects (sparkle/flash) using `k.opacity()` + `lifespan` to satisfy Kaplay deps

**Validation & Safety**
- [ ] All property access guarded (item, stats, components) to prevent null/undefined errors
- [ ] Effects stack rules: define merging (e.g., refresh duration vs. additive) per type; document
- [ ] Prevent using non-usable items; respect quantities and stack consumption

**Testing & Acceptance**
- [ ] Add debug grants (cheats) to spawn each test consumable quickly
- [ ] Verify: HP/MP clamps; buffs apply and expire; cures remove statuses; UI updates; no console errors
- [ ] Verify integration: combat turn flow unaffected; pause/resume unaffected; input handler lifecycle clean

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
- [x] Initialize project with Kaplay via CDN or npm installation (`package.json`, `index.html`)
- [x] Set up version control (Git) with .gitignore for node_modules (`.gitignore`)
- [x] Create HTML page with Kaplay canvas initialization (`index.html`)
- [x] Configure Kaplay with proper game settings and plugins (`main.js`, `config.js`)
- [x] Set up Kaplay's built-in error handling and debug mode (`main.js`)
- [x] Create development server (live-server or Vite for Kaplay) (`package.json`)

### Core Systems
**Files: `main.js`, `scenes/`, `utils/input.js`, `utils/audio.js`**
- [x] Initialize Kaplay game loop with proper scene management (`main.js`)
- [x] Set up input handling using Kaplay's built-in input system (`utils/input.js`)
- [x] Implement scene management using Kaplay's scene system (`scenes/menu.js`, `scenes/game.js`)
- [ ] Add audio using Kaplay's `loadSound()` and `play()` functions (`utils/audio.js`)
- [x] Use Kaplay's built-in math utilities and random functions (`utils/math.js`)
- [x] Enable Kaplay's performance monitoring and debug info (`main.js`)

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
- [x] Player can move around a single dungeon level using mouse or keyboard
- [x] Player can engage in turn-based combat with at least 2 enemy types
- [x] Player can pick up, use, and manage items in a basic inventory
- [ ] Player can cast at least 2-3 different spells
- [ ] Player can complete the level by reaching an exit or defeating all enemies
- [x] Game has basic UI showing health, inventory, and spell options
- [x] Game runs smoothly at 60 FPS in modern web browsers

### Success Metrics:
- [ ] Complete playthrough possible from start to level completion
- [x] No game-breaking bugs or crashes during normal gameplay
- [x] Intuitive controls that new players can understand quickly
- [x] Performance remains stable during combat and movement
- [x] All core systems work together without conflicts

---

## Notes
- Focus on functionality over polish in Phase 1
- Use placeholder art and simple graphics to start
- Prioritize core gameplay loop over advanced features
- Test frequently to ensure systems work together
- Document any technical decisions for future phases
