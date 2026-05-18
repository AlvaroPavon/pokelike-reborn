# pokedex Specification

## Purpose

Track and browse the user's discovered and captured Pokémon, providing a comprehensive record of their journey.

## Requirements

### Requirement: Encounter Tracking

The system MUST track whether a Pokémon species has been seen or caught.

#### Scenario: Mark as Seen
- GIVEN a Pokémon encounter begins
- WHEN the Pokémon is identified
- THEN the system SHALL mark that species as "Seen" in the Pokédex

#### Scenario: Mark as Caught
- GIVEN a Pokémon is successfully captured
- WHEN the capture is confirmed
- THEN the system SHALL mark that species as "Caught" in the Pokédex

### Requirement: Pokédex Browser

The system MUST provide a searchable list of all Pokémon species.

#### Scenario: Search for Pokémon
- GIVEN the user is in the Pokédex browser
- WHEN the user enters a name or ID in the search field
- THEN the system SHALL filter the list to show only matching Pokémon

#### Scenario: Browse Caught Pokémon
- GIVEN the user has caught multiple Pokémon
- WHEN the user toggles the "Caught Only" filter
- THEN the system SHALL hide all species that have not been caught

### Requirement: Completion Progress

The system SHOULD display the overall completion percentage of the Pokédex.

#### Scenario: Update Progress
- GIVEN the user catches a new species
- WHEN the Pokédex is opened
- THEN the system SHALL update the completion percentage (Caught/Total)
