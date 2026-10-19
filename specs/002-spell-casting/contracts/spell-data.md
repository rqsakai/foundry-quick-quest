# Data Contract: `SPELLS` and `CANTRIPS`

**Feature**: 002-spell-casting | **Date**: 2026-10-19

Location: a delimited block near the top of `module/quickquest.mjs`:

```js
/* ------------------------------------------------------------
   MAGIC DATA — the game has exactly 12 spells and 8 cantrips.
   Source of truth: docs/rulebook.md. Edit text here only.
   ------------------------------------------------------------ */
const MAGIC_IS_PLACEHOLDER = true; // set false once every TODO below is replaced

const SPELLS = Object.freeze([
  { id: "spell-01", name: "TODO Spell 1", cost: 1, range: "nearby", effect: "TODO — copy from docs/rulebook.md" },
  // … 12 entries total
]);

const CANTRIPS = Object.freeze([
  { id: "cantrip-01", name: "TODO Cantrip 1", cost: 0, range: "nearby", effect: "TODO — copy from docs/rulebook.md" },
  // … 8 entries total
]);
```

## Rules

1. Exactly 12 spells and 8 cantrips. `Hooks.once("init")` throws
   `QuickQuest | SPELLS must have 12 entries, CANTRIPS 8` otherwise. This is the constitution's
   closed-set rule made executable.
2. `id` is stable forever once a release ships; renaming an id orphans every hero that chose it.
   Reorder, rename `name`, change `cost` or `effect` freely.
3. `cost` is an integer; spells ≥ 1, cantrips 0. The sheet shows the cost in the option label.
4. `range` ∈ `touching | nearby | far`.
5. `effect` is the complete rule as players should read it on the card. No abbreviations.
6. Placeholder convention: `name` starts with `TODO`, `effect` starts with `TODO`. While
   `MAGIC_IS_PLACEHOLDER` is `true`: console warning at init and an italic hint in the magic box.
   Flipping it to `false` with TODO text remaining is a review failure (README step checks it).
7. Placeholder costs are spread 1–4 across the 12 spells so channeling can be exercised on a
   default INT 2 hero (6 MP) before the real costs arrive.

## Lookup helper

```js
function magicEntry(id) {
  return SPELLS.find(s => s.id === id) ?? CANTRIPS.find(c => c.id === id) ?? null;
}
```

Returns `null` for `""` or unknown ids; callers treat `null` as an empty slot.

## Handoff to the owner

When `docs/rulebook.md` (feature 001) is available, or sooner from the owner's notes:
replace the 20 `name`/`cost`/`range`/`effect` values, set `MAGIC_IS_PLACEHOLDER = false`,
run README steps for magic, and confirm SC-004 (sheet text matches the rulebook word for word).
