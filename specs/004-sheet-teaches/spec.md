# Feature Specification: The Sheet Teaches Combat

**Feature Branch**: `004-sheet-teaches`

**Created**: 2026-10-19

**Status**: Draft

**Input**: User description: "BACKLOG.md v0.4 items 4.2–4.7 — tooltips on every field; the Ace as a real button that posts a dramatic card and ticks itself used; Shift-click advantage / Ctrl-click disadvantage on roll buttons; recovery buttons Treat Wounds (half of missing Life, rounded up, once per fight) and Drink Potion (d6+2, costs the turn); weapon name click posts a usage card; fumble and critical flow on the attack card (nat 1 prompts the fumble roll, nat 20 shouts critical and damage offers ×2)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every number explains itself (Priority: P1)

A player hovers any field on the hero or monster sheet and reads one plain sentence of rule:
what the number means and when it matters.

**Why this priority**: UX law 2. Cheapest way to make the sheet replace the rulebook across
the whole surface at once.

**Independent Test**: Hover every input, label and button on both sheets; each shows one
sentence; none shows nothing or a technical name.

**Acceptance Scenarios**:

1. **Given** the hero sheet, **When** a player hovers a stat, **Then** they read that 4–5 gives
   advantage on checks.
2. **Given** Life, **When** hovered, **Then** they read that 0 means down, not dead.
3. **Given** MP, **When** hovered, **Then** they read how MP comes back (crystals, places of
   power, or your own blood).
4. **Given** Defense, Raging, Bonus, Ace, each weapon column, and each monster field, **When**
   hovered, **Then** each shows its one-sentence rule sourced from the rulebook.

---

### User Story 2 - Crits and fumbles announce themselves (Priority: P1)

A player rolls an attack. On a natural 20 the card shouts CRITICAL and tells them to double
the damage; the damage button then offers a ×2 roll. On a natural 1 the card offers a "Roll
Fumble" prompt right there. The GM still narrates; nothing is applied silently.

**Why this priority**: These are the two most-missed rules at the table and the moments
players remember. Detection plus prompt is fully inside "automate the math, humans handle the
timing".

**Independent Test**: Force or observe nat 1 and nat 20 attack results; verify the card
content and that the follow-up buttons appear and work.

**Acceptance Scenarios**:

1. **Given** an attack roll shows a natural 20, **When** the card posts, **Then** it is visibly
   marked critical, states "double the damage roll", and the hero's damage buttons offer a
   doubled roll for that one use.
2. **Given** a natural 1, **When** the card posts, **Then** it is marked fumble and carries a
   Roll Fumble d6 prompt that posts the fumble table result.
3. **Given** any other result, **When** the card posts, **Then** it looks as it does today.
4. **Given** a monster attack, **When** it shows nat 20 or nat 1, **Then** the same prompts
   appear for the GM.

---

### User Story 3 - The Ace is a button, not a text box (Priority: P2)

The hero's Ace shows its name and trigger condition. When played, one click posts a dramatic
chat card, ticks "used" and greys the button out. Only a human (GM or player) unticks it for
the next session.

**Why this priority**: The Ace is the signature once-per-session moment; making it a button
makes it visible and teaches when it can be used.

**Independent Test**: Click the Ace: card posts, button greys, box ticked; untick by hand,
button is live again.

**Acceptance Scenarios**:

1. **Given** an unused Ace with a name, **When** the Ace button is clicked, **Then** a card
   names the Ace and its effect, the used box is ticked and the button is disabled.
2. **Given** a used Ace, **When** the sheet renders, **Then** the button is greyed and its
   tooltip says it was played this session.
3. **Given** a used Ace, **When** a human unticks the box, **Then** the button is live again
   with no other side effect.

---

### User Story 4 - Heal without maths (Priority: P2)

Two recovery buttons: **Treat Wounds** heals half of the missing Life, rounded up, posts a
card and ticks a once-per-fight box; **Drink Potion** rolls d6+2 Life and the card says it
costs the turn. Neither exceeds Life max.

**Why this priority**: Healing is the other place players compute badly under stress.

**Independent Test**: Hero at 5/15 Life: Treat Wounds → 10/15, box ticked, second click
refused; Drink Potion → +d6+2 capped at 15, card says it costs the turn.

**Acceptance Scenarios**:

1. **Given** Life below max and treatment unused this fight, **When** Treat Wounds is clicked,
   **Then** Life rises by half the missing amount rounded up, the card shows the maths, and the
   once-per-fight box is ticked.
2. **Given** the box is ticked, **When** Treat Wounds is clicked, **Then** it is refused with a
   reminder.
3. **Given** any Life, **When** Drink Potion is clicked, **Then** Life rises by d6+2 capped at
   max and the card says "this costs your turn".

---

### User Story 5 - Faster rolls for the confident (Priority: P3)

Holding Shift while clicking any roll button rolls with advantage; holding Ctrl rolls with
disadvantage; a plain click still opens the dialog beginners rely on.

**Why this priority**: Speeds up the GM and returning players without changing the beginner
path.

**Independent Test**: Shift-click attack → advantage card, no dialog; Ctrl-click → disadvantage;
plain click → dialog as today.

**Acceptance Scenarios**:

1. **Given** any roll button, **When** Shift-clicked, **Then** the roll is made with advantage
   without a dialog and the card says advantage.
2. **Given** any roll button, **When** Ctrl-clicked, **Then** disadvantage, no dialog.
3. **Given** a plain click, **When** released, **Then** the dialog appears as it does today.

---

### User Story 6 - The weapon tells you how to use it (Priority: P3)

Clicking a weapon's name posts a short usage card: name, die + stat, damage type, reach and a
flavor line for the damage type.

**Why this priority**: Teaches reach and damage-type narration; nice-to-have.

**Independent Test**: Click a mace named "Mace": card reads "Mace · d6+STR · bludgeoning ·
touching — skeletons hate this".

**Acceptance Scenarios**:

1. **Given** a weapon row with a name, **When** the name is clicked, **Then** a usage card posts
   with die, stat, type, reach and the type's flavor line.

### Edge Cases

- Critical with no damage button used afterwards: the ×2 offer lasts until the next attack
  roll by that actor, then clears; it is never applied automatically.
- Advantage roll where one die is 20 and the kept die is lower: no critical; only the kept
  result counts.
- Treat Wounds at full Life: refused with "nothing to treat".
- Drink Potion that would exceed max: capped, card shows the capped amount.
- Ace with no name: button reads "Set your Ace" and opens nothing but a tooltip.
- Tooltips must exist in every supported language (feature 005).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every field, label and button on both sheets MUST show a one-sentence rule tooltip
  sourced from the rulebook.
- **FR-002**: Attack cards MUST mark natural 20 as critical with the doubling instruction and
  natural 1 as fumble with a Roll Fumble prompt, for heroes and monsters.
- **FR-003**: After a critical, the actor's damage roll MUST offer a doubled roll once; the
  doubling MUST never be applied without the player choosing it.
- **FR-004**: The Ace MUST be a button that posts a card, ticks used and disables itself; only a
  human may untick it.
- **FR-005**: Treat Wounds MUST heal half of missing Life rounded up, post the arithmetic, tick a
  once-per-fight box and be refused while ticked.
- **FR-006**: Drink Potion MUST heal d6+2 capped at Life max and state that it costs the turn.
- **FR-007**: Shift-click MUST roll with advantage and Ctrl-click with disadvantage on every roll
  button without a dialog; a plain click MUST still open the dialog.
- **FR-008**: Clicking a weapon name MUST post a usage card with die, stat, type, reach and a
  per-type flavor line.
- **FR-009**: No part of this feature MAY add a numeric modifier to any attack roll.
- **FR-010**: All new strings MUST be defined so they can be translated (feature 005).
- **FR-011**: The README checklist MUST gain steps for each story above.

### Key Entities

- **Rule tooltip**: a one-sentence string per sheet element, keyed for translation.
- **Pending critical**: a per-actor marker that the next damage roll may be doubled, cleared by
  the next attack roll.
- **Once-per-fight boxes**: Treated wounds; shares behaviour with Channeled (feature 002).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of sheet elements show a tooltip; zero show a technical field name.
- **SC-002**: In a playtest, zero missed criticals or fumbles (every nat 20 / nat 1 is acted on).
- **SC-003**: Healing values match hand calculation in 100% of cases and never exceed max.
- **SC-004**: Returning players roll with advantage in one click; beginners still see the dialog.

## Assumptions

- Tooltip and card text come from `docs/rulebook.md`; where the rulebook is silent (flavor lines
  per damage type) the owner approves the wording.
- "Once per fight" is a human-unticked checkbox, matching Raging, Ace and Channeled.
- Potion is a GM-granted resource; the sheet does not count potions (gear stays a text box until
  feature 006).
- The critical ×2 offer is a prompt on the damage roll, not a stored buff; it expires on the next
  attack roll to avoid stale state.
