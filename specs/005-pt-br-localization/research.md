# Research: Portuguese (Brazil) Localization

**Feature**: 005-pt-br-localization | **Date**: 2026-10-19

## R1. Key namespace

- **Decision**: Everything under `QQ.` with one group per surface: `Sheet` (labels,
  placeholders, footers), `Stat` (str/agi/con/int abbreviations), `Weapon` (columns, damage
  types, reach, keyed by the stored values), `Range` (spell ranges), `Roll` (card titles, hints,
  dialog buttons), `Fumble` (the six table entries), `Monster` (monster-only text), `Magic`
  (already exists). `TYPES.Actor` stays as Foundry requires.
- **Rationale**: Groups mirror the sheet sections so a translator can work top to bottom; the
  `QQ.Magic.*` keys from feature 002 already follow this shape.
- **Alternatives considered**: flat `QQ.<Label>` (rejected: 100 keys with no structure); keys
  mirroring template file names (rejected: shared strings would duplicate).

## R2. Stored enum values vs labels

- **Decision**: Weapon damage type and reach keep their stored English values (`cutting`,
  `thrown nearby`, …) and are displayed via `QQ.Weapon.Type.<value>` / `QQ.Weapon.Reach.<value>`.
  Spell range the same via `QQ.Range.<value>`. JSON keys may contain a space
  (`"thrown nearby"`); Foundry's `localize` resolves dotted paths with `getProperty`, which
  accepts it.
- **Rationale**: Changing stored values would be a data migration for nothing; labels are what
  players see.
- **Alternatives considered**: renaming `thrown nearby` to `thrown` (rejected: touches actor data
  and the 001 pack sources).

## R3. Stat buttons

- **Decision**: `{{localize (concat "QQ.Stat." key)}}` inside the existing `{{#each system.stats}}`
  loop, so pt-BR shows FOR / AGI / CON / INT. The `data-stat` attribute keeps the schema key.
- **Rationale**: `concat` is a Foundry built-in helper; the CSS `text-transform: uppercase` stays.

## R4. Formatted strings

- **Decision**: Strings with values use `{placeholders}` and `game.i18n.format` in code or
  `{{localize "KEY" stat=key}}` in templates (the helper formats when given hash arguments).
- **Rationale**: Word order differs in Portuguese ("teste de FOR" vs "FOR check").

## R5. Fallback behaviour

- **Decision**: Rely on Foundry: the system's `en` file is always loaded first and the selected
  language is merged over it, so a missing pt-BR key shows English, never the key. Enforce
  parity anyway with the one-liner in quickstart.md before each release.
- **Rationale**: Platform guarantee plus a cheap check satisfies FR-004 and SC-002.

## R6. What is not translated

- **Decision**: Dice names (`d4`, `d6`, …), the system name QuickQuest, and the word "Ace" (spec
  default pending the owner). Spell/cantrip `name`, `range` label is translated but `effect` text
  is content from the rulebook and stays as the owner writes it in the constant.
- **Rationale**: Spec assumptions; the glossary records these so later features follow suit.

## R7. Where the glossary lives

- **Decision**: `docs/glossary.md`, a two-column table (term → pt-BR, or "keep"). Feature 001
  will add `docs/rulebook.md` and `docs/treasury.md` beside it.
- **Rationale**: Spec FR-006 wants it in repository docs; this starts the `docs/` folder.

## R8. Chat cards in mixed-language tables

- **Decision**: Cards are rendered at post time in the roller's client language and stored as
  HTML; viewers see that language. Accepted by the spec (Story 3 edge case). No per-viewer
  rendering.
- **Rationale**: Foundry chat messages store rendered content; per-viewer localisation would need
  a message renderer hook and flags, out of proportion for a six-person table.

## R9. Layout risk

- **Decision**: Widen the weapon grid's Type and Reach columns slightly (84→92px, 92→100px) and
  the magic slot label column (52→64px); verify in pt-BR at the default 660px sheet width.
- **Rationale**: "Perfuração" and "Arremesso" are the longest option labels; everything else fits.

## R10. pt-BR wording source

- **Decision**: Draft the pt-BR values now (the owner is Brazilian and will correct them); mark
  the file header with a comment-free note in the glossary that wording is a draft until the
  owner signs off.
- **Rationale**: Owner said to develop first and fix afterwards.
