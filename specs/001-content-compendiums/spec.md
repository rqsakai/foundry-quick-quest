# Feature Specification: Content Ships With the System

**Feature Branch**: `001-content-compendiums`

**Created**: 2026-10-19

**Status**: Draft

**Input**: User description: "BACKLOG.md v0.2 — Content ships with the system (items 2.1–2.4): merge the compendium packs branch (Bestiary 11, Heroes 6, Sand King adventure journal), bundle the 3 woodcut tokens pre-wired on pack actors, add docs/rulebook.md and docs/treasury.md as the source of truth, ship v0.2.0."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - GM opens a fresh world and the game is already there (Priority: P1)

A GM installs or updates QuickQuest, creates a world, and finds three compendiums waiting:
a Bestiary of ready-to-use monsters, a set of pre-made Heroes, and the Sand King adventure as
journal pages. They can run game day without authoring anything.

**Why this priority**: The system is useless at the table without monsters and heroes; this is
the whole point of v0.2 and the only item that blocks the next game day.

**Independent Test**: Install the release in an empty world, open the Compendium sidebar, drag
one monster and one hero onto a scene, open both sheets, roll an attack from each.

**Acceptance Scenarios**:

1. **Given** a new world on QuickQuest 0.2.0, **When** the GM opens the Compendium tab,
   **Then** compendiums named for the Bestiary, the Heroes and the Sand King adventure are listed
   and belong to the QuickQuest system.
2. **Given** the Bestiary compendium, **When** the GM imports any entry, **Then** a Monster actor
   is created whose sheet shows Life, Defense, attack die, bonus and Trick already filled.
3. **Given** the Heroes compendium, **When** a player imports a hero, **Then** the sheet shows
   stats, race, profession, trait, move, Ace, cantrip, weapons, armor and gear filled, and Life
   max, MP max and Defense are computed correctly from those values.
4. **Given** the adventure compendium, **When** the GM opens it, **Then** the Sand King journal
   reads top to bottom with scenes, monsters referenced by name and treasure listed.

---

### User Story 2 - Tokens look right the moment they land (Priority: P2)

Pack actors arrive with woodcut token art already assigned, so dragging a hero onto the map
shows a finished token with Life and MP bars, not a generic placeholder.

**Why this priority**: Beginners judge the game by what they see first; placeholder icons
undercut the letterpress feel. Secondary to having the content at all.

**Independent Test**: Drag each of the three token-equipped actors onto a scene and compare
to the bundled art.

**Acceptance Scenarios**:

1. **Given** a pack actor that has woodcut art, **When** it is dragged to a scene, **Then** the
   token shows that art and the hero bars show Life and MP without manual configuration.
2. **Given** a pack actor without dedicated art, **When** it is dragged to a scene, **Then** it
   shows a sensible default and no missing-image icon.

---

### User Story 3 - The rules live in the repo (Priority: P3)

The rulebook and the treasury document are committed under `docs/` so that every future spec,
spell list, item and tooltip quotes the one true text instead of a memory of it.

**Why this priority**: Not player-visible, but every v0.3+ feature cites rule text; without this
the project cannot verify that the sheet matches the rulebook.

**Independent Test**: Open `docs/rulebook.md` and confirm the derived formulas, the 12 spells,
the 8 cantrips, the fumble table and the check difficulties appear exactly as the sheet shows
them today.

**Acceptance Scenarios**:

1. **Given** the repository, **When** a contributor looks for the spell list, **Then** it is
   found in `docs/rulebook.md` with name, cost, range and effect for all 20 entries.
2. **Given** `docs/treasury.md`, **When** a contributor looks up a magic item, **Then** its one
   rule-break is described in a single sentence.

---

### User Story 4 - Players update in one click (Priority: P1)

Existing 0.1.0 installs see the update in Foundry's setup screen and receive the packs without
losing their worlds.

**Why this priority**: The live server already runs 0.1.0 with a playtested world; a broken
update would cancel game day.

**Independent Test**: On a 0.1.0 install with an existing world, update via the manifest,
relaunch the world, confirm old actors still open and the compendiums appear.

**Acceptance Scenarios**:

1. **Given** a server on 0.1.0, **When** the GM checks for system updates, **Then** 0.2.0 is
   offered and installs from the published release.
2. **Given** a world created on 0.1.0, **When** it is launched on 0.2.0, **Then** every existing
   hero and monster opens with unchanged values and the new compendiums are present.

### Edge Cases

- A pack hero whose stored values disagree with the derived formulas (for example a Life max
  typed into the source JSON) must not be shipped; derived values are recomputed on load.
- A pack monster referencing token art that is not in the bundle shows a default image, never
  a broken image.
- The published zip must not contain pack source JSON, build tooling, agent folders or specs.
- Compendium pack folders must exist in the zip even when a pack is empty, or the world fails
  to load.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST ship three compendium packs: Bestiary (11 monsters), Heroes
  (6 pre-made heroes) and the Sand King adventure (journal entries).
- **FR-002**: Every pack actor MUST satisfy the current hero or monster data schema and MUST
  NOT store any value the system derives (hero Life max, MP max, Defense).
- **FR-003**: Pack content MUST be generated from human-readable source files kept in the
  repository, so content edits are reviewable diffs.
- **FR-004**: The three woodcut tokens MUST be bundled with the system and pre-assigned to
  their pack actors, including token bar configuration for Life (and MP for heroes).
- **FR-005**: `docs/rulebook.md` and `docs/treasury.md` MUST be added to the repository and
  MUST match the rules already encoded on the sheets (formulas, difficulties, fumble table).
- **FR-006**: The release MUST be published as version 0.2.0 with both the manifest file and the
  system archive, and existing 0.1.0 worlds MUST open unchanged after updating.
- **FR-007**: The release archive MUST exclude pack sources, build dependencies, specs, agent
  configuration and repository tooling.
- **FR-008**: The README test checklist MUST gain steps covering compendium import, token art
  and the update path.

### Key Entities

- **Bestiary entry**: a Monster with name, Life, Defense, attack die and bonus, damage type,
  Trick, notes and optional token art. Regular monsters carry +1/+2, bosses +3/+4.
- **Pre-made hero**: a Hero with the full Post-it: stats, race, trait, profession, move, Ace,
  cantrip, spells, three weapons, armor, gear, coins and token art.
- **Adventure journal**: ordered pages for the Sand King one-shot referencing bestiary
  entries by name.
- **Rules documents**: the rulebook and treasury text, the single source of truth for every
  rule string the sheet displays.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A GM can go from "create world" to "monster and hero tokens on a scene, attack
  rolled" in under 3 minutes without typing anything but the world name.
- **SC-002**: 100% of pack actors open without console errors and show correct derived values.
- **SC-003**: An existing 0.1.0 world updates to 0.2.0 with zero changes to any existing actor.
- **SC-004**: Every rule string shown on the sheets today can be located verbatim in
  `docs/rulebook.md`.

## Assumptions

- The v0.2.0 work exists as a zip outside this repository; it will be unpacked, rebased onto
  current `main` (which gained CLAUDE.md, deploy.sh, Spec Kit and .gitignore) and reviewed
  before merge. The owner must provide the zip's location.
- Version is shipped as 0.2.0 on its own, before spell casting, so the content reaches the
  next game day even if magic slips.
- Pack build tooling runs offline on the developer machine; it is not part of the runtime.
- Token art is the owner's own woodcut work and is safe to publish in the public repository.
- Bestiary placeholder icons for the remaining monsters are acceptable in this release
  (art pass is BACKLOG 6.2).
