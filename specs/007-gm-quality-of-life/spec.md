# Feature Specification: GM Quality of Life

**Feature Branch**: `007-gm-quality-of-life`

**Created**: 2026-10-19

**Status**: Draft

**Input**: User description: "BACKLOG.md v0.6 (items 6.1–6.5) — monster Trick posts to chat on click; bestiary art pass replacing placeholder icons (license-check first); adventure packs #2 and #3 (The Fallen Watchtower, Rats in the Walls) as journal compendiums; a party overview bar showing every hero's Life, MP and Ace state; a GitHub Action that compiles packs and builds the release zip on tag."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The GM sees the whole party at a glance (Priority: P1)

During a fight the GM opens a compact overview listing every hero with current Life over max,
MP over max and whether their Ace is spent. It updates live as sheets change.

**Why this priority**: The GM is also a near-beginner running four heroes; this replaces
tabbing through sheets mid-combat.

**Independent Test**: Open the overview with four heroes in the world; change a hero's Life
on its sheet; the overview reflects it without reopening.

**Acceptance Scenarios**:

1. **Given** heroes exist in the world, **When** the GM opens the party overview, **Then** each
   hero shows name, Life current/max, MP current/max and Ace used or ready.
2. **Given** a value changes on any hero sheet, **When** the overview is visible, **Then** it
   updates within a second without user action.
3. **Given** a player client, **When** they look for the overview, **Then** it is not offered
   (GM-only).

---

### User Story 2 - The Trick is one click away (Priority: P1)

The GM clicks the Trick on a monster sheet and it posts to chat as a GM-visible or public card,
reminding them mid-fight of the one thing that monster does.

**Why this priority**: Tricks are what make fights memorable and are what the GM forgets under
pressure. Trivial to deliver.

**Independent Test**: Click a Trick: card posts with the monster's name and the Trick text.

**Acceptance Scenarios**:

1. **Given** a monster with a Trick, **When** the GM clicks it, **Then** a card with the
   monster's name and the Trick text posts, whispered to the GM by default.
2. **Given** an empty Trick, **When** the sheet renders, **Then** no post button is offered.

---

### User Story 3 - Releases build themselves (Priority: P2)

Pushing a version tag compiles the compendium packs and publishes the release with both
required assets, replacing the manual zip steps.

**Why this priority**: Removes the most error-prone step in shipping (see the v0.1.0 tag
mishap) and makes monthly releases a one-command habit.

**Independent Test**: Push a tag on a test branch; the release appears with `system.json` and
`quickquest.zip`, the zip contains only runtime files and compiled packs, and the manifest
version matches the tag.

**Acceptance Scenarios**:

1. **Given** a pushed tag `vX.Y.Z`, **When** the automation finishes, **Then** a GitHub release
   exists with exactly the manifest and the archive attached.
2. **Given** the archive, **When** inspected, **Then** it excludes pack sources, build
   dependencies, specs, agent folders and repository tooling.
3. **Given** a tag whose version does not match `system.json`, **When** the automation runs,
   **Then** it fails loudly and publishes nothing.

---

### User Story 4 - More adventures in the box (Priority: P2)

Two more one-shots, The Fallen Watchtower and Rats in the Walls, ship as journal compendiums
in the same format as the Sand King.

**Why this priority**: Content for months two and three; the writing exists already.

**Independent Test**: Import both; pages read in order; referenced monsters exist in the
Bestiary.

**Acceptance Scenarios**:

1. **Given** the adventure compendiums, **When** opened, **Then** three adventures are listed
   and each reads top to bottom with scenes, monsters and treasure.
2. **Given** a monster named in an adventure, **When** searched in the Bestiary, **Then** it
   exists.

---

### User Story 5 - The Bestiary looks finished (Priority: P3)

Placeholder icons on bestiary monsters are replaced with proper token art whose license allows
redistribution in this public repository.

**Why this priority**: Visual polish; blocked on license review and art sourcing.

**Independent Test**: Every Bestiary token shows dedicated art; a license file lists the source
and terms for each.

**Acceptance Scenarios**:

1. **Given** the Bestiary, **When** any monster is dragged to a scene, **Then** it shows
   dedicated art, not a core placeholder.
2. **Given** the repository, **When** licenses are reviewed, **Then** every bundled image has a
   recorded source and redistribution-compatible terms.

### Edge Cases

- Party overview with zero heroes: shows an empty state, not an error.
- Heroes in compendiums are not in the overview; only world actors are.
- Trick post visibility: whispered to GM by default; a modifier click posts publicly.
- Release automation on a tag without a matching changelog: still ships; notes default to the
  tag name.
- Art whose license forbids redistribution is never committed, even temporarily.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A GM-only party overview MUST list every world hero with Life, MP and Ace state and
  MUST update live.
- **FR-002**: The monster Trick MUST be postable to chat with one click, whispered to the GM by
  default.
- **FR-003**: Pushing a version tag MUST build the packs and publish a release containing exactly
  the manifest and the archive, failing if the tag and manifest versions differ.
- **FR-004**: The archive MUST follow the exclusion rules documented in the repository.
- **FR-005**: The Fallen Watchtower and Rats in the Walls MUST ship as journal compendiums in
  the Sand King format, with every referenced monster present in the Bestiary.
- **FR-006**: Bestiary tokens MUST use dedicated art with recorded, redistribution-compatible
  licenses; AI-generated art MUST NOT be committed.
- **FR-007**: The README checklist MUST gain steps for the overview, Trick posting and the
  release check.

### Key Entities

- **Party overview row**: hero name, Life current/max, MP current/max, Ace state.
- **Adventure journal**: as in feature 001.
- **Art license record**: image → source, author, license, URL.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The GM runs a full combat without opening a hero sheet to check Life or MP.
- **SC-002**: A release is produced from tag push to downloadable manifest with zero manual
  steps and zero mis-tagged versions.
- **SC-003**: Three complete adventures are available in a fresh world.
- **SC-004**: 100% of bundled art has a recorded license.

## Assumptions

- The two adventures' text is already written and will be supplied by the owner in the same
  shape as the Sand King source.
- Art sourcing (for example Forgotten Adventures) is subject to a license check before any file
  is added; if no compatible source exists, placeholders remain and the story is deferred.
- Release automation lives in the repository's CI; it reuses the exclusion list from the
  shipping docs so hand and automated builds match.
- Stories are independent and may ship in any order across more than one release.
