# server-battle Specification

## Purpose

Execute 3v3 Pokémon battles on the server and stream the simulation events to participating clients in real-time.

## Requirements

### Requirement: Battle Session Initiation

The system MUST create a unique battle session once players are paired.

#### Scenario: Start Battle Session
- GIVEN two paired players
- WHEN the matchmaking system triggers a battle
- THEN the system SHALL initialize a `BattleSession` with the players' current teams and a unique session ID

### Requirement: Server-Side Simulation

The system MUST execute the battle logic using the core simulation engine on the server.

#### Scenario: Execute Battle Loop
- GIVEN an active `BattleSession`
- WHEN the simulation starts
- THEN the system SHALL call `simulateBattle` from `@pokelike/core` to process turns until a winner is determined

### Requirement: Real-time Event Streaming

The system MUST stream battle logs to both clients via Socket.io.

#### Scenario: Stream Battle Log
- GIVEN the server-side simulation is running
- WHEN a battle event (e.g., "Pikachu used Thunderbolt") occurs
- THEN the system SHALL emit a `battle:log` event to both players' socket connections

### Requirement: Outcome Determination

The system MUST identify the winner based on the simulation results.

#### Scenario: Determine Winner
- GIVEN the simulation has finished
- WHEN all Pokémon on one team have fainted
- THEN the system SHALL mark the remaining team as the winner and terminate the session
