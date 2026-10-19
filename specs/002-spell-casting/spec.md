# Feature Specification: The Sheet Teaches Magic

**Feature Branch**: `002-spell-casting`

**Created**: 2026-10-19

**Status**: Draft

**Input**: User description: "BACKLOG.md v0.3 — The sheet teaches magic (items 3.1–3.4): the 12 spells and 8 cantrips as fixed data; cantrip select and two spell-slot selects replacing free text; a Cast button per slot that checks MP, deducts it, posts a teaching chat card and offers channeling (2 Life per missing MP) when short; wizard at 0 MP sees that their Ace is ready. Item 3.5 (mana crystal button) is explicitly rejected."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cast a spell with one click (Priority: P1)

A player with a spell in a slot clicks **Cast**. The sheet checks they have the MP, takes it,
and posts a chat card that names the spell, its range, its effect and how much MP they have
left. Nobody at the table does subtraction or looks anything up.

**Why this priority**: Magic is the only part of the game that still requires reading and
arithmetic. This story alone removes both.

**Independent Test**: Give a hero INT 3 (9 MP), slot a 3-MP spell, click Cast three times:
MP reads 6, 3, 0 and three cards appear with the spell text.

**Acceptance Scenarios**:

1. **Given** a hero with MP ≥ the spell's cost, **When** the player clicks Cast on that slot,
   **Then** MP is reduced by the cost and a chat card shows spell name, range, effect text and
   "MP left: N".
2. **Given** a slot with no spell chosen, **When** the player looks at the sheet, **Then** no
   Cast button is offered for that slot.
3. **Given** a cast that succeeds, **When** the card is read by a beginner, **Then** it contains
   the complete rule for that spell; the player never needs the rulebook.

---

### User Story 2 - Choose magic from fixed lists (Priority: P1)

Instead of typing spell names into a text box, the player picks one cantrip and up to two
spells from dropdowns listing exactly the game's 8 cantrips and 12 spells, with the MP cost
visible in each option.

**Why this priority**: Fixed lists are what make Cast possible and remove misspellings and
invented spells. Ships together with Story 1.

**Independent Test**: Open a hero sheet, open each dropdown, count 8 and 12 entries, pick
one, close and reopen the sheet, the choice persists.

**Acceptance Scenarios**:

1. **Given** the hero sheet, **When** the player opens the cantrip dropdown, **Then** it lists
   exactly the 8 cantrips plus an empty choice.
2. **Given** either spell slot dropdown, **When** opened, **Then** it lists exactly the 12 spells
   with their MP cost plus an empty choice.

---

### User Story 3 - Channel blood when the mana runs out (Priority: P2)

A player clicks Cast without enough MP. The sheet offers channeling: pay 2 Life for every
missing MP, once per fight. If they accept, Life drops, MP goes to zero, the card says the
spell was channeled, and a "Channeled this fight" box is ticked for them to untick when the
fight ends.

**Why this priority**: Channeling is the dramatic beat of the magic rules and the one players
most often get wrong. It depends on Story 1.

**Independent Test**: Hero with 1 MP casts a 3-MP spell: dialog offers 4 Life; accept; Life
drops by 4, MP reads 0, card notes "channeled", box is ticked; a second attempt that fight is
refused with a reminder.

**Acceptance Scenarios**:

1. **Given** MP below the spell's cost and channeling unused this fight, **When** Cast is
   clicked, **Then** a dialog states the missing MP and the Life cost and offers Channel or Cancel.
2. **Given** the player accepts, **When** the cast resolves, **Then** Life is reduced by
   2 × missing MP, MP becomes 0, the card is marked as channeled and the once-per-fight box is
   ticked.
3. **Given** the once-per-fight box is already ticked, **When** Cast is clicked with insufficient
   MP, **Then** the sheet refuses and the card or dialog reminds that channeling was already used.
4. **Given** the player cancels, **When** the dialog closes, **Then** nothing changes.
5. **Given** the Life cost would reduce Life to 0 or below, **When** Cast is clicked with
   insufficient MP, **Then** channeling is refused, the dialog says the hero cannot survive the
   cost, and no values change.

---

### User Story 4 - Cantrips are free (Priority: P2)

Clicking Cast on the cantrip posts its card and changes no numbers.

**Why this priority**: Cheap to deliver with Story 1, and it teaches the cantrip's effect text
at the moment of use.

**Independent Test**: Cast the cantrip five times; MP never changes; five cards appear.

**Acceptance Scenarios**:

1. **Given** a hero with a cantrip chosen, **When** Cast is clicked on it, **Then** a card with
   name, range and effect appears and MP and Life are unchanged.

---

### User Story 5 - The empty wizard knows their Ace is ready (Priority: P3)

When a hero's MP reaches 0, the Ace row visibly glows and its tooltip says the Ace is ready,
nudging the player toward the "Final Word" style of play. Nothing is automated beyond the hint.

**Why this priority**: Pure teaching polish; valuable but not required to run magic.

**Independent Test**: Spend MP to 0, observe the Ace row highlight and tooltip; regain MP,
highlight disappears.

**Acceptance Scenarios**:

1. **Given** MP is 0 and the Ace is not yet used, **When** the sheet renders, **Then** the Ace
   row is visually highlighted and hovering it reads a one-sentence reminder.
2. **Given** MP above 0 or the Ace already used, **When** the sheet renders, **Then** no highlight.

### Edge Cases

- MP exactly equal to the cost: cast succeeds, no channeling offered, MP reads 0.
- Channeling would reduce Life to 0 or below: refused. The dialog explains that the hero
  cannot survive the cost and offers only Cancel; no values change.
  hero to channel down to 0 Life (down, not dead) or is channeling refused when Life would not
  survive it? Default if unanswered: allow it with a red warning in the dialog.]
- The same spell is chosen in both slots: allowed; each slot casts independently.
- A spell's cost exceeds the hero's MP max (low INT): channeling is the only way; offered as usual.
- MP value typed above max by hand: the sheet keeps the typed value until the next cast, which
  clamps the result to the max; no silent correction on blur.
- Dropdowns on a monster sheet: not shown; monsters have no spells.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST hold the game's exact 12 spells and 8 cantrips as a single fixed
  list with name, MP cost (0 for cantrips), range and effect text sourced verbatim from
  `docs/rulebook.md`.
- **FR-002**: The hero sheet MUST offer one cantrip selection and two spell-slot selections
  drawn only from that list; free-text spell entry is removed.
- **FR-003**: Each filled slot MUST show a Cast action at most one click from the sheet.
- **FR-004**: Casting with sufficient MP MUST deduct the cost and post a chat card containing
  spell name, range, effect text and remaining MP.
- **FR-005**: Casting a cantrip MUST post the card and change no value.
- **FR-006**: Casting with insufficient MP MUST offer channeling: 2 Life per missing MP, shown
  as a concrete number before the player accepts. If that cost would bring Life to 0 or
  below, channeling MUST be refused with an explanation and nothing changes.
- **FR-007**: Accepting channeling MUST reduce Life accordingly, set MP to 0, mark the card as
  channeled and tick a "Channeled this fight" box that only a human unticks.
- **FR-008**: Channeling MUST be refused while that box is ticked, with a visible reminder.
- **FR-009**: When MP is 0 and the Ace is unused, the Ace row MUST be highlighted with a
  one-sentence tooltip; no other Ace automation.
- **FR-010**: The free-text cantrip and spells fields MUST be removed; no real heroes exist yet
  (only test worlds), so no migration or legacy display is needed.
- **FR-011**: The README checklist MUST gain steps for casting, channeling, cantrips and the
  Ace highlight.

### Key Entities

- **Spell**: name, MP cost, range (touching / nearby / far), effect text; exactly 12.
- **Cantrip**: name, range, effect text; cost 0; exactly 8.
- **Spell slot**: one of two positions on a hero holding a chosen spell or nothing.
- **Channeling state**: a once-per-fight flag on the hero, human-reset.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A beginner casts a spell and knows what happened, from click to reading the card,
  in under 10 seconds with zero arithmetic.
- **SC-002**: 100% of casts leave MP equal to the hand-calculated value; 0 cases of negative MP.
- **SC-003**: In a playtest, no player asks "how much does this cost?" or "how does channeling
  work?" after the first cast.
- **SC-004**: The 20 magic entries on the sheet match `docs/rulebook.md` word for word.

## Assumptions

- The spell and cantrip definitions come from `docs/rulebook.md` (feature 001). If 001 has
  not merged, the owner supplies the 20 definitions directly.
- "Once per fight" is tracked by a checkbox the player or GM unticks after combat, consistent
  with the Raging and Ace boxes; no combat-tracker integration.
- Mana crystals, places of power and other MP recovery remain GM narration; the MP field stays
  directly editable for that purpose (BACKLOG 3.5 rejected).
- Spell slots are fixed at two; the rulebook does not grant more.
- Sheet strings introduced here are written so they can be moved to language files in
  feature 005.
