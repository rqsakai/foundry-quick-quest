# Feature Specification: Guided Character Creation

**Feature Branch**: `003-creation-wizard`

**Created**: 2026-10-19

**Status**: Draft

**Input**: User description: "BACKLOG.md item 4.1 — Guided character creation wizard (dialog on new hero): point-buy with live 'X of 10 points' counter → race picker (shows trait) → profession picker (auto-fills move, Ace, starting weapons, armor, gear, gold, MP) → cantrip picker → name → done. A person who has never seen a TTRPG produces a legal hero in under 3 minutes with zero typing except the name."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A stranger to RPGs builds a legal hero (Priority: P1)

A new player creates a Hero. Instead of an empty sheet, a short guided dialog walks them
through five steps: spend points on four stats, pick a race, pick a profession, pick a
cantrip, type a name. Every pick explains itself in one sentence. When they finish, the sheet
is completely filled and correct.

**Why this priority**: This is the single highest-UX-value item in the backlog. The empty
sheet is where beginners stall today.

**Independent Test**: Hand the dialog to someone who has never played; time them from "Create
Actor" to a finished sheet; verify the sheet against the rulebook's creation rules.

**Acceptance Scenarios**:

1. **Given** a player creates a new Hero, **When** the actor is created, **Then** the guided
   dialog opens automatically on step 1.
2. **Given** the stats step with all four stats at 1, **When** the player raises a stat,
   **Then** a live counter shows points spent of 6 and the player cannot proceed until all 6 are
   spent and every stat is within 1–5.
3. **Given** the race step, **When** a race is highlighted, **Then** its trait is shown in one
   plain sentence before the player commits.
4. **Given** the profession step, **When** a profession is chosen, **Then** move, Ace, starting
   weapons, armor, gear and gold are filled in automatically and shown for review.
5. **Given** the cantrip step, **When** the player picks, **Then** the cantrip's effect is shown
   in one sentence.
6. **Given** the name step, **When** the player types a name and confirms, **Then** the dialog
   closes and the sheet shows every field filled, with Life, MP and Defense already correct.

---

### User Story 2 - Nothing is wrong by default (Priority: P1)

A player who clicks through accepting whatever is pre-selected still ends with a legal hero:
a valid stat spread, a race, a profession with its kit, a cantrip and a placeholder name.

**Why this priority**: UX law 4: defaults are always correct. Protects the player who panics
and clicks Next five times.

**Independent Test**: Create a hero pressing only Next and Finish; compare the result to the
rulebook's creation rules.

**Acceptance Scenarios**:

1. **Given** the dialog opens, **When** the player accepts every default, **Then** the finished
   hero violates no creation rule and has a non-empty name.

---

### User Story 3 - Experienced users can skip or redo (Priority: P2)

The GM or a returning player can dismiss the wizard and fill the sheet by hand, and can
reopen the wizard later from the sheet to rebuild a hero.

**Why this priority**: Keeps the GM fast and makes the wizard recoverable, but the beginner
path matters more.

**Independent Test**: Dismiss on step 1, confirm the plain sheet is usable; reopen from the
sheet, confirm it starts from the hero's current values.

**Acceptance Scenarios**:

1. **Given** the dialog is open, **When** the user closes it, **Then** the hero exists with
   sheet defaults and no partial wizard state.
2. **Given** an existing hero, **When** the user triggers "Rebuild with wizard" from the sheet,
   **Then** the dialog opens pre-filled with the hero's current choices.
3. **Given** a hero being rebuilt, **When** the wizard finishes, **Then** it overwrites only the
   fields the wizard owns and leaves Life and MP current values, coins earned, and gear notes
   that the player added by hand.

### Edge Cases

- Stat total: all four stats start at 1 and the player spends 6 more points (counter reads
  "X of 6 points"); every stat stays within 1–5, so the finished spread always totals 10.
- A profession that grants armor: Defense on the finished sheet reflects it without extra input.
- A profession whose kit includes more than three weapons: only three rows exist; the wizard
  picks the first three and lists the rest in gear.
- Name left empty: a placeholder such as the profession name is used; the player can rename.
- The dialog is closed mid-way by a disconnect: no half-written values; the hero is either at
  defaults or fully built.
- Two players create heroes at once: each sees only their own wizard.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Creating a new Hero MUST open a guided creation dialog for the creating user.
- **FR-002**: The dialog MUST walk through, in order: stats, race, profession, cantrip, name.
- **FR-003**: The stats step MUST start every stat at 1, offer exactly 6 points to spend with a
  live "X of 6" counter, keep each stat within 1–5, and block progress until all 6 are spent.
- **FR-004**: The race step MUST list the rulebook's races and show each race's trait in one
  sentence before selection.
- **FR-005**: The profession step MUST list the rulebook's professions and, on selection, fill
  move, Ace name, starting weapons (up to three rows), armor, gear and starting gold.
- **FR-006**: The cantrip step MUST list the 8 cantrips with one-sentence effects (shared with
  feature 002).
- **FR-007**: The finished hero MUST have correct derived values with no further input.
- **FR-008**: Every step MUST be completable with pointer clicks only; typing is required only
  for the name.
- **FR-009**: The dialog MUST be dismissible at any step, leaving a hero with ordinary defaults
  and no partial data.
- **FR-010**: The hero sheet MUST offer a way to reopen the wizard on an existing hero,
  pre-filled with current values, overwriting only wizard-owned fields.
- **FR-011**: Race, profession and kit definitions MUST come from the rulebook text in the
  repository and MUST be kept in one place.
- **FR-012**: The README checklist MUST gain a timed "stranger builds a hero" step.

### Key Entities

- **Race**: name, trait sentence.
- **Profession**: name, move sentence, Ace name and trigger, starting weapons, armor value,
  starting gear, starting gold, and whether it uses magic.
- **Creation state**: the in-progress choices for one hero, discarded on cancel.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time player produces a legal hero in under 3 minutes with no typing except
  the name.
- **SC-002**: 100% of wizard-built heroes pass the rulebook's creation rules.
- **SC-003**: In a playtest, zero "what do I put here?" questions during creation.
- **SC-004**: Accepting all defaults yields a legal hero every time.

## Assumptions

- Race and profession text, point totals and starting kits come from `docs/rulebook.md`
  (feature 001); if absent the owner supplies them.
- The wizard runs after the next game day, per BACKLOG sequencing, so real confusion observed at
  the table shapes the step order and wording; this spec will be revised then.
- Spell slots are not chosen in the wizard; beginners start with a cantrip only and pick spells
  on the sheet (feature 002) when the GM introduces magic.
- All wizard strings use the language files from feature 005 so the Brazilian table gets it in
  pt-BR.
