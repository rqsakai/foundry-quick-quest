# Feature Specification: Items Without Inventory Hell

**Feature Branch**: `006-weapon-relic-items`

**Created**: 2026-10-19

**Status**: Draft

**Input**: User description: "BACKLOG.md v0.5 (items 5.1–5.3) — Item documents of exactly two types, weapon and relic (magic item); plain gear stays a text box forever. Drag from compendium → appears on sheet; weapon rows become real items but the sheet still shows max 3 with the same columns. Treasury compendium: the 15 magic items, each implementing its ONE rule-break as a button or checkbox; no item grants +to-hit. Loot flow: GM drags an item to a hero sheet or the map; a card announces the find."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A weapon from the compendium lands on the sheet (Priority: P1)

The GM or player drags a weapon from the Armory compendium onto a hero. It fills the first
empty weapon row with the same five columns as today and its damage button works exactly as
before. The sheet still shows at most three weapons.

**Why this priority**: Makes loot tangible without changing how the sheet reads. Foundation
for relics.

**Independent Test**: Drag three weapons onto a hero; rows fill in order; roll damage from
each; drag a fourth and observe the replace prompt.

**Acceptance Scenarios**:

1. **Given** a hero with an empty weapon row, **When** a weapon is dropped on the sheet,
   **Then** the row shows its name, die, stat, type and reach and its damage button rolls
   die + stat (+ rage + bonus) as today.
2. **Given** three filled rows, **When** a fourth weapon is dropped, **Then** the player is asked
   which weapon to replace or to cancel; the dropped weapon never silently vanishes.
3. **Given** a hero from 0.1–0.4 with typed weapon rows, **When** opened on this version,
   **Then** the rows read identically and still roll.

---

### User Story 2 - A relic does its one trick with one click (Priority: P1)

A relic (magic item) sits on the sheet with its name, a one-sentence rule and exactly one
control: a button that posts a card when its rule-break is used, or a checkbox when the effect
is a state the human toggles. Consumables delete themselves when used.

**Why this priority**: This is how treasure becomes play without a bonus system. Each relic
is a tiny teaching card.

**Independent Test**: Give a hero the Turtleshell: click "Ignore one hit" → card posts. Give
Storm-in-a-Jar: click → it casts Summon Lightning once and disappears from the sheet.

**Acceptance Scenarios**:

1. **Given** a relic with a button-style rule-break, **When** clicked, **Then** a card names the
   relic and states its effect; no numbers on the sheet change unless the rule says so.
2. **Given** a consumable relic, **When** used, **Then** its effect card posts and the relic is
   removed from the sheet.
3. **Given** a relic that grants advantage in a situation, **When** read, **Then** its text says
   exactly when; it never alters attack rolls numerically.
4. **Given** any relic, **When** inspected, **Then** it has exactly one control.

---

### User Story 3 - The Treasury ships complete (Priority: P2)

All 15 magic items from `docs/treasury.md` exist in a Treasury compendium, each with its rule
text and its one control configured.

**Why this priority**: Content is the value; depends on Story 2's mechanics.

**Independent Test**: Import all 15; each opens, reads its rule, and its control behaves as
its text says.

**Acceptance Scenarios**:

1. **Given** the Treasury compendium, **When** listed, **Then** exactly 15 relics appear with
   names matching the treasury document.
2. **Given** any of the 15, **When** its control is used, **Then** behaviour matches its one
   sentence in `docs/treasury.md`.

---

### User Story 4 - Loot is announced (Priority: P3)

The GM drags an item onto a hero or onto the map. A card announces the find to the table
with the item's name and rule.

**Why this priority**: Drama and teaching at the moment of discovery; small.

**Independent Test**: Drag a relic onto a hero sheet: a "found" card posts to chat; drag onto
the map: a pickable token or note appears and the card posts.

**Acceptance Scenarios**:

1. **Given** the GM drops an item on a hero, **When** it lands, **Then** a chat card announces
   who found what and what it does.
2. **Given** the GM drops an item on the map, **When** a hero later takes it, **Then** the same
   card posts and the item moves to that hero.

### Edge Cases

- Dropping a weapon on a monster: refused with a reminder that monsters use their attack line.
- Two copies of the same relic: allowed; each has its own control state.
- A relic whose rule interacts with timing (once per fight, once per session): a human-unticked
  checkbox, never a timer.
- Plain gear (rope, torches) is never an item; it stays in the gear text box.
- Deleting a weapon item from a hero: the row empties; nothing else changes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST support exactly two item kinds: weapon and relic. No other item
  kinds may be added.
- **FR-002**: A weapon item MUST carry name, die, stat, damage type and reach and MUST occupy
  one of three weapon rows on the hero sheet, which keeps its current columns and behaviour.
- **FR-003**: Dropping a weapon on a hero with three weapons MUST prompt to replace or cancel.
- **FR-004**: Existing typed weapon rows MUST keep working unchanged after this feature.
- **FR-005**: A relic MUST carry name, one-sentence rule text and exactly one control: a button
  that posts its effect card or a checkbox for a human-toggled state.
- **FR-006**: Consumable relics MUST remove themselves after use and say so on the card.
- **FR-007**: No item MAY add a numeric modifier to any attack roll; items that grant advantage
  MUST state the situation in their text.
- **FR-008**: The Treasury compendium MUST contain the 15 relics from `docs/treasury.md` with
  controls configured.
- **FR-009**: An Armory compendium MUST contain the rulebook's standard weapons.
- **FR-010**: Dropping an item on a hero or the map MUST post an announcement card.
- **FR-011**: Plain gear MUST remain a free-text box.
- **FR-012**: The README checklist MUST gain steps for drops, relic use, consumables and loot.

### Key Entities

- **Weapon item**: name, die (d4/d6/d8), stat (STR/AGI), damage type, reach.
- **Relic item**: name, rule sentence, control kind (button or checkbox), consumable flag,
  optional linked spell for items that cast.
- **Armory / Treasury compendiums**: standard weapons; the 15 relics.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player receives a relic and uses it correctly within 30 seconds without asking
  the GM how it works.
- **SC-002**: 100% of relics have exactly one control and zero attack-roll modifiers.
- **SC-003**: Zero regressions on the weapon rows: every existing hero rolls identical damage
  before and after the update.
- **SC-004**: The whole treasury is importable and demonstrable in one session.

## Assumptions

- This feature only matters once magic items reach the table (BACKLOG sequencing); it follows
  v0.4.
- `docs/treasury.md` (feature 001) is the source for the 15 relics; the owner resolves any
  rule that would need a modifier by rewriting it as advantage, a reroll or narration.
- Weapon rows migrate to items on first open, preserving the typed values; the plain-text
  fallback remains for heroes that never receive a weapon item.
- Strings follow feature 005's language files.
