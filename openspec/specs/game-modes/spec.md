# game-modes Specification

## Purpose

Implement specialized gameplay rule sets to increase difficulty and variety, specifically focusing on Nuzlocke and Battle Tower modes.

## Requirements

### Requirement: Nuzlocke Permadeath

In Nuzlocke mode, the system MUST treat Pokémon that faint as permanently lost.

#### Scenario: Pokémon Faints in Nuzlocke
- GIVEN Nuzlocke mode is active
- WHEN a Pokémon's HP reaches 0 in battle
- THEN the system SHALL mark the Pokémon as "Dead"
- AND it SHALL prevent the Pokémon from being used or healed further

### Requirement: Nuzlocke First Encounter

In Nuzlocke mode, the system MUST restrict captures to the first encounter per area.

#### Scenario: First Encounter Capture
- GIVEN Nuzlocke mode is active and the user is in a new area
- WHEN the first wild Pokémon is encountered
- THEN the system SHALL allow the user to attempt capture

#### Scenario: Subsequent Encounter Restriction
- GIVEN Nuzlocke mode is active and the user has already encountered a Pokémon in the current area
- WHEN a second wild Pokémon is encountered
- THEN the system SHALL disable the "Capture" option

### Requirement: Battle Tower Loop

The system MUST provide an endless battle challenge with escalating difficulty.

#### Scenario: Sequential Battles
- GIVEN the user is in the Battle Tower
- WHEN a battle is won
- THEN the system SHALL immediately trigger the next encounter
- AND the next opponent SHALL have stats or levels equal to or higher than the previous one

#### Scenario: Tower Defeat
- GIVEN the user is in the Battle Tower
- WHEN all Pokémon in the party faint
- THEN the system SHALL end the run and display the total number of wins
