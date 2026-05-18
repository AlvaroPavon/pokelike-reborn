# pokemon-details Specification

## Purpose

Provide a detailed view of a Pokémon's characteristics, including base stats, current stats, available moves, and evolution chain to help players make informed strategic decisions.

## Requirements

### Requirement: Pokémon Stat Display

The system MUST display the Pokémon's base stats and current stats (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed).

#### Scenario: View Basic Stats
- GIVEN a Pokémon is selected for detailed view
- WHEN the detail screen is opened
- THEN the system SHALL display the current HP and max HP
- AND it SHALL display the 6 core stats with their respective values

#### Scenario: Stat Comparison
- GIVEN a Pokémon has had its stats modified (e.g., via items or levels)
- WHEN viewing the detail screen
- THEN the system SHOULD indicate the difference between base stats and current stats

### Requirement: Move Set Inspection

The system MUST list the moves currently known by the Pokémon and its potential move pool.

#### Scenario: View Current Moves
- GIVEN a Pokémon has 4 moves
- WHEN viewing the detail screen
- THEN the system SHALL display all 4 moves with their types and power/effect summaries

### Requirement: Evolution Information

The system MUST display the evolution path of the Pokémon.

#### Scenario: View Evolution Chain
- GIVEN a Pokémon that can evolve
- WHEN viewing the detail screen
- THEN the system SHALL show the next evolution stage and the required condition (e.g., level, item)

#### Scenario: Fully Evolved Pokémon
- GIVEN a Pokémon that is the final stage of its evolution line
- WHEN viewing the detail screen
- THEN the system SHALL indicate that it cannot evolve further
