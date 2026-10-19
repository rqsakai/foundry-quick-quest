# Feature Specification: Portuguese (Brazil) Localization

**Feature Branch**: `005-pt-br-localization`

**Created**: 2026-10-19

**Status**: Draft

**Input**: User description: "BACKLOG.md item 4.8 — pt-BR localization (languages/pt-BR.json for all sheet strings and chat cards). The team is Brazilian. Prerequisite: strings are centralized via i18n keys."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every string on the sheet has a home (Priority: P1)

All text a player can see on the hero and monster sheets, in dialogs and on chat cards is
collected into one English language file with stable keys. Nothing changes visually.

**Why this priority**: This is the prerequisite for any translation and the constitution
requires it from v0.4 onward. It also lets features 003 and 004 add strings the right way.

**Independent Test**: Switch the client to a language with no QuickQuest file; the sheets still
render in English with no raw key names or blanks.

**Acceptance Scenarios**:

1. **Given** the English client, **When** both sheets, every dialog and every card type are
   rendered, **Then** the output is identical to before the change.
2. **Given** the English language file, **When** reviewed, **Then** it contains every visible
   string, including rules hints, tooltips, dialog buttons and card flavor.
3. **Given** a missing key, **When** rendered, **Then** the English text is shown, never a blank
   or a key path.

---

### User Story 2 - The Brazilian table plays in Portuguese (Priority: P1)

A player whose Foundry client is set to Português (Brasil) sees the sheets, dialogs, chat cards
and the Combat Tracker type names in natural pt-BR, in the same letterpress layout.

**Why this priority**: The actual players are Brazilian beginners; English rules text is a
reading barrier the game is designed to remove.

**Independent Test**: Set the client language to pt-BR, open both sheets, roll a check, an
attack, damage, a fumble; everything reads in Portuguese with no English leaks and no
overflowing layout.

**Acceptance Scenarios**:

1. **Given** a pt-BR client, **When** a hero sheet opens, **Then** all labels, placeholders,
   buttons, footer reminders and tooltips are in pt-BR.
2. **Given** a pt-BR client, **When** any roll is made, **Then** the chat card and its rules hint
   are in pt-BR.
3. **Given** a pt-BR client, **When** actor types are listed, **Then** "Herói" and "Monstro" (or
   the owner's approved terms) appear.
4. **Given** longer Portuguese strings, **When** the sheet renders, **Then** nothing is clipped
   or wraps into an unreadable layout.

---

### User Story 3 - Mixed-language tables still work (Priority: P2)

A GM on English and players on pt-BR share one world; each sees cards in their own language
where the card is rendered on their client, and nothing breaks when languages differ.

**Why this priority**: Likely real-world setup (the owner authors in English). Must not crash
or mix.

**Independent Test**: Two clients, two languages, the same roll; both see a card in their own
language or, where the card text is fixed at post time, in the roller's language, consistently.

**Acceptance Scenarios**:

1. **Given** two clients with different languages, **When** one rolls, **Then** both see a
   well-formed card with no missing text.

### Edge Cases

- Game terms the owner wants kept in English (for example "Ace", spell names) are listed once
  and reused; the glossary decides, not each translator.
- Strings with numbers (MP left: N, +2 rage) keep correct word order in Portuguese.
- Rule text quoted from the rulebook must match the pt-BR rulebook if one exists; otherwise the
  owner approves the translation.
- Chat cards are rendered once at post time; the spec accepts that a card shows the roller's
  language unless the platform renders per viewer.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every user-visible string in sheets, dialogs, tooltips, footers and chat cards
  MUST be defined in the English language file under stable keys; none may remain inline.
- **FR-002**: The system MUST ship a pt-BR language file covering 100% of those keys.
- **FR-003**: Actor type names MUST be localized in both languages.
- **FR-004**: A missing translation MUST fall back to English, never to a blank or a key.
- **FR-005**: The letterpress layout MUST accommodate pt-BR string lengths without clipping.
- **FR-006**: A glossary of game terms and their pt-BR rendering MUST be recorded in the
  repository docs and used consistently.
- **FR-007**: Subsequent features MUST add strings to both files in the same change.
- **FR-008**: The README checklist MUST gain a pt-BR pass over both sheets and all card types.

### Key Entities

- **Language file**: key → string, one per language, same key set.
- **Glossary**: game term → approved pt-BR term or "keep English".

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 inline user-visible strings remain in templates or code after the change.
- **SC-002**: 100% key parity between English and pt-BR files, checked before each release.
- **SC-003**: Brazilian playtesters complete a full combat round without asking what any
  on-screen word means.
- **SC-004**: No layout clipping in pt-BR on both sheets at default window sizes.

## Assumptions

- Foundry's client language setting selects the file; no in-sheet language switcher.
- The owner provides or approves the pt-BR wording for rule text; machine translation is a
  draft only.
- Spell names and other proper nouns follow the glossary; the default is to translate
  everything except "QuickQuest" and "Ace" pending the owner's decision.
- This feature is best done before or alongside features 003 and 004, which add many strings.
