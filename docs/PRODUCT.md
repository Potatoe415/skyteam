# PRODUCT

Status: Living document. Never edit autonomously — confirm with user first.

---

Project_Name: Sky Team (digital)
Objective: A faithful web implementation of the 2-player cooperative board game "Sky Team", playable either hotseat (pass-and-play) on a single device, or online across two devices.
Problem: Sky Team is a physical 2-player co-op game. Players want to play it digitally — together on one shared device, or remotely on two devices — without the physical components.

Target_Users:
- Two people sitting together, sharing one phone or one computer (local mode).
- Two people in different places who want to play remotely (online mode).
- Board-game players familiar with or learning Sky Team.

Core_Features:
- Home screen: choose "Play local" (pass-and-play) or "Play online".
- Online lobby: enter a nickname, then create a game or join one with a 3-character
  room code (uppercase letters/digits). A waiting room shows the room code, the crew,
  and lets the host pick a role and start once both players are present.
- Online play: server-authoritative; each player sees only their own dice (the
  partner's un-placed dice are hidden), enforcing the silent-communication rule.
- Role selection: Pilot (blue) and Co-Pilot (orange).
- Full 7-round game loop: Strategy & roll, dice placement (turn-based), end of round.
- All action spaces: Axis, Engines, Radio, Landing Gear, Flaps, Brakes, Concentration.
- Resources: Coffee tokens (modify die value) and Reroll tokens.
- Tracks: Altitude (6000 -> 0), Approach (traffic + airport), Speed Gauge (aerodynamics markers), Brake track, Axis (artificial horizon).
- Crash/defeat detection and final-round landing logic.
- Victory check at landing.
- Pass-and-play silence enforcement: free chat allowed before roll, chat disabled after roll (digital silence = hidden info handoff between turns).

Out_Of_Scope (v1):
- Named accounts/login (online uses anonymous sessions only), leaderboards, matchmaking.
- Spectators, more than 2 players, or bots.
- Player presence/disconnect recovery and resuming an in-progress online game.
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
- Mobile-first. Local mode = single shared device; online mode = two devices.
- Online is server-authoritative (hidden info never leaves the server); randomness
  (rolls/rerolls) happens server-side.
- EN/FR UI copy (localized); code/comments English.

Open_Questions:
- Exact YUL approach-track traffic distribution (v1 uses a documented, tunable approximation).
- Whether to add per-turn screen handoff confirmation to enforce hidden dice between players.
