# Research: Guided Character Creation

**Feature**: 003-creation-wizard | **Date**: 2026-10-19

## R1. Application type

- **Decision**: `class QuickQuestCreationWizard extends HandlebarsApplicationMixin(ApplicationV2)`
  with `DEFAULT_OPTIONS.actions` (`next`, `back`, `finish`, `cancel`, `statInc`, `statDec`,
  `pick`), one `PARTS.body` template, `window.title` localized, position ~520×620, not
  resizable. State (`step`, `choices`) lives on the instance; every action mutates it and calls
  `this.render()`.
- **Rationale**: DialogV2 is single-screen; a five-step flow with live validation needs a real
  application. ApplicationV2 + actions is the same pattern the sheets use.
- **Alternatives**: chained DialogV2s (rejected: no Back, no shared state); a form inside the
  sheet (rejected: beginners need one thing on screen at a time).

## R2. Opening automatically

- **Decision**: `Hooks.on("createActor", (actor, options, userId) => { if (actor.type ===
  "hero" && userId === game.user.id && !options.qqSkipWizard) new
  QuickQuestCreationWizard({ actor }).render(true); })`. Compendium imports from 001 pass
  `qqSkipWizard: true` so pre-made heroes do not trigger it.
- **Rationale**: Only the creating client gets the dialog (spec edge case: two players create
  at once). The option flag keeps future pack imports quiet.

## R3. Stats step semantics

- **Decision**: Each stat has − / + buttons and shows its value; the counter reads "{spent} of 6
  points" where `spent = sum(stats) − 4`. Minimum 1, maximum 5 per stat; + is disabled when
  spent = 6, − when the stat is 1. Next is enabled only at exactly 6 spent. Defaults 3/3/2/2.
- **Rationale**: Owner answer Q2 = B (start at 1, spend 6) and the book's "balanced hero" as the
  default so that pressing Next five times yields a legal hero (Story 2).

## R4. Race / profession as data

- **Decision**: `RACES = [{ id, name, trait }]` (6) and `PROFESSIONS = [{ id, name, move, caster,
  spellPicks, fixedSpell, ace: { name, trigger, effect }, kit: { weapons: [{ name, die, stat,
  dtype, reach }], armor, gear, gold } }]` (5), transcribed from `docs/rulebook.md`. Stored on the
  hero as ids; `prepareDerivedData()` sets `raceData` / `professionData`.
- **Rationale**: Owner chose "selects, text locked": the sheet shows the book's wording and nobody
  can drift from it. Same content policy as spells (English text in the constant).
- **Alternatives**: keep free text and copy on Finish (rejected by the owner).

## R5. Formulas (constitution 1.1.0)

- **Decision**: `mp.max = professionData?.caster ? INT × 3 : 0`; `defense = 10 + armor −
  (raging ? 2 : 0)`; `aceReady = profession === "wizard" && mp.value === 0 && !ace.used`.
- **Rationale**: The book: non-casters have 0 MP; Rage is +2 damage / −2 Defense; "At 0 MP, your
  Ace wakes up" is the Wizard's Final Word. An empty profession counts as non-caster.

## R6. Armor from the kit

- **Decision**: `kit.armor` is the armor value: clothes 0, leather 1, chainmail 2, plate 3, shield
  +1. Warrior = chain + shield = 3 (Defense 13, matches The Shieldwall); Barbarian, Rogue, Healer
  leather = 1; Wizard clothes = 0.
- **Rationale**: The book's armor table maps 1:1 onto the existing 0–4 field.

## R7. Weapons from the kit

- **Decision**: Rows from the Armory table. Warrior: Sword d6 STR cutting touching. Barbarian:
  Greataxe d8 STR cutting touching. Rogue: Dagger d4 AGI cutting "thrown nearby", Dagger (second),
  Bow d6 AGI piercing far. Wizard: Staff d4 STR bludgeoning touching. Healer: Mace d6 STR
  bludgeoning touching. Extra kit items (shield, lockpicks, rope, spellbook, bandages) go to the
  gear text. Spear-style "touching · thrown nearby" collapses to the stored value `thrown nearby`.
- **Rationale**: Three rows exist; no kit exceeds three weapons.

## R8. Magic step

- **Decision**: Everyone picks one cantrip (default Spark). Wizard also picks two distinct spells;
  Healer has Healing Hands fixed in slot 1 and picks one more. Non-casters see only the cantrip
  list. Defaults: Wizard Fireball + Summon Lightning, Healer Healing Hands + Bless (the book's
  ready-made heroes).
- **Rationale**: A legal caster needs spells; defaults are the book's own examples.

## R9. Finish payload

- **Decision**: One `actor.update()` with name, stats, race, profession, armor, gear, gold,
  silver 0, weapons w1–w3 (empty rows reset), magic.cantrip/spell1/spell2, `life.value = 7 +
  CON × 2`, `mp.value = caster ? INT × 3 : 0`, and `ace.used/raging/treated/magic.channeled =
  false`. Rebuild from the sheet pre-fills the wizard from current values and on Finish keeps
  `life.value`, `mp.value`, coins and gear edits that the player made (spec Story 3): it writes
  only stats, race, profession, armor, weapons, magic choices and name, and recomputes
  `life.value`/`mp.value` only if they exceed the new max.
- **Rationale**: Atomic; no half-written hero on disconnect (spec edge case).

## R10. Strings

- **Decision**: Wizard chrome in `QQ.Wizard.*` (titles, buttons, counter, labels) in both files;
  race/profession/Ace/kit text is content in the constants; the sheet's `QQ.Tip.Race` /
  `QQ.Tip.Profession` wording updated for selects.
