# Delta for game-state

## ADDED Requirements

### Requirement: Game Mode Rule Integration

The core game loop MUST apply rules based on the active game mode.

#### Scenario: Apply Nuzlocke Fainting Rule
- GIVEN the active mode is `Nuzlocke`
- WHEN a Pokémon faints in the core battle loop
- THEN the system SHALL call the `markAsDead()` utility instead of allowing standard revival at a center

#### Scenario: Apply Normal Mode Fainting Rule
- GIVEN the active mode is `Normal`
- WHEN a Pokémon faints in the core battle loop
- THEN the system SHALL maintain standard Pokémon behavior (can be healed)

### Requirement: Pokédex State Integration

The game state MUST integrate with the Pokédex tracking system.

#### Scenario: Update Pokédex on Encounter
- GIVEN a wild Pokémon encounter is triggered in the core loop
- WHEN the Pokémon is identified
- THEN the system SHALL update the `pokedexStore` to mark the species as "Seen"

#### Scenario: Update Pokédex on Capture
- GIVEN a Pokémon is successfully captured in the core loop
- WHEN the capture state is committed
- THEN the system SHALL update the `pokedexStore` to mark the species as "Caught"
