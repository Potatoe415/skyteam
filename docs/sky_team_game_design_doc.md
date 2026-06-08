# Sky Team: Digital Implementation Design & Logic Document
This document is structured specifically for an AI coding assistant (like Claude) to build a web/mobile version of the cooperative board game "Sky Team". It contains full state management logic, UI layout guidelines, phase structures, and victory/defeat conditions.

## 1. Game Overview
**Sky Team** is a 2-player cooperative game where players play as a Pilot (Blue) and Co-Pilot (Orange). They must coordinate without speaking during the action phase to safely land a commercial airliner. 
The game spans exactly 7 rounds (representing altitude descending from 6000 ft to 0 ft). 

## 2. Global Game State (Data Model)
To properly code the game, implement the following state variables:

### 2.1 Players & Dice
* **Pilot (Blue)**: Holds 4 Blue Dice (D6).
* **Co-Pilot (Orange)**: Holds 4 Orange Dice (D6).
* **Dice State**: Hidden (in hand), Placed (on board), or Spent (end of round).

### 2.2 Board Tracks & Markers
* **Altitude Track**: Integer descending from `6000` to `0` (step 1000). Dictates the round number. Round 1 = 6000, Round 7 = 0.
* **Approach Track**: Array of spaces representing distance to the Airport. Each space can contain multiple `Airplane Tokens`. 
    * `current_position`: Pointer to the active space on the approach track.
* **Axis (Artificial Horizon)**: Integer from `-X` (spin out left) to `+X` (spin out right). `0` is perfectly horizontal.
    * *Defeat condition*: Reaching the red 'X' on either extremity.
* **Aerodynamics & Speed Gauge**:
    * `blue_marker_pos` (Lift/Gear threshold): Starts at `4.5` (between 4 and 5). Increases as Landing Gear is deployed.
    * `orange_marker_pos` (Drag/Flaps threshold): Starts at `8.5` (between 8 and 9). Increases as Flaps are deployed.
* **Brake Gauge**:
    * `red_brake_marker`: Starts below `2`. Increases as Brakes are deployed.

### 2.3 Switches & Systems (Booleans)
* **Landing Gear (Pilot Only)**: 3 switches (Values required to unlock: `1/2`, `3/4`, `5/6`). Starts `false`. When activated, moves `blue_marker_pos` +1.
* **Flaps (Co-Pilot Only)**: 4 switches (Values required: `1/2`, `2/3`, `4/5`, `5/6`). Starts `false`. When activated, moves `orange_marker_pos` +1. **Must be activated in top-to-bottom order.**
* **Brakes (Pilot Only)**: 3 switches (Values required: `2`, `4`, `6`). Starts `false`. When activated, moves `red_brake_marker` up. **Must be activated in order.**

### 2.4 Resources
* **Coffee Tokens**: Integer (Max 3). Used to alter a die value by +1 or -1.
* **Reroll Tokens**: Integer. Used to reroll any number of unplaced dice.

---

## 3. UI & Board Layout (Based on Screenshot Reference)
For the web/mobile layout:
* **Left Column (Pilot)**: Pilot avatar, Pilot's 4 blue dice, Landing Gear panel (3 slots), Brakes panel (3 slots).
* **Right Column (Co-Pilot)**: Co-Pilot avatar, Co-Pilot's 4 orange dice, Flaps panel (4 slots).
* **Top Center**: 
    * Left track: **Approach Track** showing airplane icons in boxes.
    * Right track: **Altitude Track** showing remaining altitude (6000 -> 0).
* **Middle Center**: 
    * **Artificial Horizon (Axis)**: Visual circle with an airplane that tilts left/right. 2 action slots underneath (1 Blue, 1 Orange).
    * **Engines**: 2 action slots (1 Blue, 1 Orange).
* **Side Panels / Utilities**:
    * **Radio Slots**: 1 Blue slot (left), 2 Orange slots (right).
    * **Concentration Slots**: 3 mixed-color slots at the bottom for generating coffee.
    * **Coffee Supply**: Visual indicator of available cups (max 3).
    * **Speed Gauge**: Vertical or horizontal bar showing the Blue/Orange aerodynamic thresholds and current Engine sum.

---

## 4. Round Structure & Flow

A game consists of up to 7 rounds. Each round has 3 phases:

### Phase 1: Strategy Discussion & Roll
* **Chat/Strategy**: Players can communicate freely. They can discuss goals (e.g., "Clear space 3", "Deploy flaps") but **cannot** discuss specific die values they plan to use.
* **Roll**: Both players roll their 4 dice.
* **Silence**: Once dice are rolled, ALL communication is disabled (disable chat feature in digital version).

### Phase 2: Dice Placement (Turn-Based)
* **Starting Player**: Dictated by the Altitude track (e.g., Pilot starts round 1). Players take alternating turns.
* **Action**: On their turn, a player MUST place exactly ONE die on an available, legal action space.
* **Modifiers (Free Actions)**:
    * *Use Coffee*: Before placing a die, a player can spend Coffee tokens to change a die's value (+1 or -1 per token, bounded to 1-6).
    * *Use Reroll*: At any time on their turn, a player can spend a Reroll token. BOTH players can choose to reroll any number of their *unplaced* dice once.

### Phase 3: End of Round
* **Check Mandatory Placements**: If the Axis or Engines spaces do not have 1 Blue and 1 Orange die, the plane crashes -> **Game Over (Loss)**.
* **Descent**: The Altitude Track moves down by 1000 ft.
* **Cleanup**: All placed dice are returned to the players.
* **Check Endgame**: If Altitude is 0 AND the Airport is in the Current Position, proceed to Final Scoring. If Altitude is 0 but Airport is not reached (or vice versa), see End Game conditions.

---

## 5. Action Spaces Details & Logic

### 5.1 Axis (Mandatory)
* **Spaces**: 1 Blue, 1 Orange.
* **Logic**: When the second die is placed, calculate the difference: `Orange Value - Blue Value`. 
* **Effect**: Rotate the Axis tilt by that difference towards the highest die.
    * *Example*: Blue plays 5, Orange plays 3. Difference is 2. Axis tilts 2 steps towards the Pilot (Blue).
* **Crash Condition**: If the Axis indicator reaches the red limit 'X' on either side -> **Game Over (Loss)**.
* *Note*: The Axis does NOT reset at the end of the round. It remains tilted for the next round.

### 5.2 Engines (Mandatory)
* **Spaces**: 1 Blue, 1 Orange.
* **Logic**: When the second die is placed, sum both dice (`Blue + Orange`). This is the `Current_Speed`.
* **Effect**: Compare `Current_Speed` to the Aerodynamics Markers:
    * If `Current_Speed < blue_marker_pos`: Move Approach Track **0 spaces**.
    * If `blue_marker_pos <= Current_Speed <= orange_marker_pos`: Move Approach Track **1 space**.
    * If `Current_Speed > orange_marker_pos`: Move Approach Track **2 spaces**.
* **Crash Conditions**: 
    * *Collision*: If the Approach track moves forward and the `current_position` contains an Airplane token -> **Game Over (Loss)**.
    * *Overshoot*: If the Airport is already in the `current_position` and the Approach track is forced to move -> **Game Over (Loss)**.
* **Final Round Exception**: See "Endgame & Final Round" below.

### 5.3 Radio (Optional)
* **Spaces**: 1 Blue, 2 Orange.
* **Logic**: Removes airplanes from the Approach path to prevent collisions.
* **Effect**: Look at the value of the die placed. Count that many spaces ahead on the Approach track (Starting from `current_position` as 1). 
    * *Example*: Die value `1` = Remove 1 airplane from the `current_position`. Die value `3` = Remove 1 airplane from the space 2 steps ahead.
* *Note*: Has no effect if there are no airplanes on that specific space.

### 5.4 Landing Gear (Pilot Only, Optional)
* **Spaces**: 3 Blue spaces (Required values: `1 or 2`, `3 or 4`, `5 or 6`).
* **Logic**: Can be played in any order. 
* **Effect**: Flips the switch to Green. IMMEDIATELY increases `blue_marker_pos` by 1.

### 5.5 Flaps (Co-Pilot Only, Optional)
* **Spaces**: 4 Orange spaces (Required values: `1 or 2`, `2 or 3`, `4 or 5`, `5 or 6`).
* **Logic**: MUST be played in strict top-to-bottom sequence. 
* **Effect**: Flips the switch to Green. IMMEDIATELY increases `orange_marker_pos` by 1.

### 5.6 Brakes (Pilot Only, Optional)
* **Spaces**: 3 Blue spaces (Required values: `2`, `4`, `6`).
* **Logic**: MUST be played in strict top-to-bottom sequence.
* **Effect**: Moves the `red_brake_marker` up by 1 step. (Used ONLY in the final round to stop the plane).

### 5.7 Concentration / Coffee (Optional)
* **Spaces**: 3 mixed spaces (Any player can place Any die).
* **Effect**: Immediately adds 1 Coffee Token to the global supply. (Maximum 3. If at 3, playing here yields no extra coffee).

---

## 6. End Game & Final Round Conditions

### Premature Crash Conditions (Immediate Game Over)
1.  **Spin Out**: Axis reaches the red 'X' limit.
2.  **Mid-Air Collision**: Approach track moves into a space containing an Airplane token.
3.  **Overshoot**: Approach track moves past the Airport.
4.  **Stall/Missed Approach**: Altitude reaches `0` (Airplane icon) BUT the Approach track is NOT at the Airport.
5.  **Holding Pattern Crash**: The Approach track reaches the Airport, but Altitude is NOT `0` (You must circle by playing a speed of 0 until altitude hits 0. If you are forced to advance speed, you overshoot and crash).
6.  **Missing Mandatory Placements**: A round ends without dice on both Axis spaces and both Engine spaces.

### The Final Round (Landing)
The final round triggers when Altitude reaches `0` AND the Approach track reaches the Airport space at the exact same time.
* **Braking Logic (Rule Change)**: When placing the Engine dice in the final round, do NOT compare `Current_Speed` to Aerodynamics. Instead, compare it to the `red_brake_marker` value.
* **Landing Check**: `Current_Speed` MUST be strictly LESS THAN the brake strength. (If brakes are at step 4, total engine speed must be 3 or less).

### Victory Conditions
At the end of the final round, players WIN only if ALL of the following are true:
1.  **Clear Path**: There are NO Airplane tokens left anywhere on the Approach Track.
2.  **Configuration**: ALL Landing Gear switches (3) AND ALL Flaps switches (4) show Green lights.
3.  **Level Flight**: The Axis indicator is perfectly horizontal (Value = 0).
4.  **Stopped**: The Engine speed sum was LESS than the Brake strength during this final round.

If all conditions are met: **VICTORY! The passengers applaud!**
