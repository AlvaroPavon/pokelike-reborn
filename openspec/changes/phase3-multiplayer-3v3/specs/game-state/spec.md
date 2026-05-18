# Delta for game-state

## ADDED Requirements

### Requirement: Multiplayer Result Persistence

The system MUST synchronize the outcome of server-side multiplayer battles with the user's permanent game state.

#### Scenario: Update Rank after Win
- GIVEN a player has won a server-side 3v3 battle
- WHEN the battle session concludes
- THEN the system SHALL increase the player's Elo/Rank in the database and update the local `gameStateStore`

#### Scenario: Update Rank after Loss
- GIVEN a player has lost a server-side 3v3 battle
- WHEN the battle session concludes
- THEN the system SHALL decrease the player's Elo/Rank in the database and update the local `gameStateStore`
