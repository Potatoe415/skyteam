# PRODUCT

Status: Living document. Never edit autonomously — confirm with user first.

---

Project_Name: Sky Team (digital)
Objective: A faithful web implementation of the 2-player cooperative board game "Sky Team", playable hotseat (pass-and-play) on a single phone, and on desktop.
Problem: Sky Team is a physical 2-player co-op game. Players want to play it digitally on one shared device without the physical components.

Target_Users:
- Two people sitting together, sharing one phone or one computer.
- Board-game players familiar with or learning Sky Team.

Core_Features:
- Role selection: Pilot (blue) and Co-Pilot (orange).
- Full 7-round game loop: Strategy & roll, dice placement (turn-based), end of round.
- All action spaces: Axis, Engines, Radio, Landing Gear, Flaps, Brakes, Concentration.
- Resources: Coffee tokens (modify die value) and Reroll tokens.
- Tracks: Altitude (6000 -> 0), Approach (traffic + airport), Speed Gauge (aerodynamics markers), Brake track, Axis (artificial horizon).
- Crash/defeat detection and final-round landing logic.
- Victory check at landing.
- Pass-and-play silence enforcement: free chat allowed before roll, chat disabled after roll (digital silence = hidden info handoff between turns).

Out_Of_Scope (v1):
- Online/networked multiplayer.
- Accounts, persistence, leaderboards.
- Advanced modules / Flight Log challenges beyond the base YUL game.
- Multiple airports (single base approach track in v1; data-driven for later).
- Sound, animations beyond basic transitions.

User_Roles:
- Pilot (blue dice; controls Landing Gear and Brakes; 1 Radio slot).
- Co-Pilot (orange dice; controls Flaps; 2 Radio slots).
- Both place on Axis, Engines, Concentration.

Success_Criteria:
- A full game can be played start to finish on a phone screen, matching the official rules.
- All documented crash and victory conditions are correctly detected.
- Engine rules covered by passing unit tests.
- UI is usable one-handed on mobile and scales to desktop.

Constraints:
- Mobile-first, single shared device (no networking).
- Client-side only; static deploy.
- French UI copy (reference screenshot is French); code/comments English.

Open_Questions:
- Exact YUL approach-track traffic distribution (v1 uses a documented, tunable approximation).
- Whether to add per-turn screen handoff confirmation to enforce hidden dice between players.
