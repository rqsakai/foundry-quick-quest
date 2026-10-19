# Implementation Plan: The Sheet Teaches Magic

**Branch**: `002-spell-casting` | **Date**: 2026-10-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-spell-casting/spec.md`

## Summary

Replace the hero sheet's free-text cantrip and spells with selects fed by a fixed `SPELLS` (12)
and `CANTRIPS` (8) constant, add a **Cast** action per slot that deducts MP and posts a teaching
chat card, offer channeling (2 Life per missing MP, once per fight, refused if Life would reach
0) through a `DialogV2`, and highlight the Ace row when MP is 0. Everything lives in the existing
single module, the existing AppV2 action pattern and the letterpress CSS. Spell text is not in
the repo yet, so the constant ships with clearly marked placeholder entries the owner fills in.

## Technical Context

**Language/Version**: JavaScript ES2022 module (`.mjs`), browser runtime inside Foundry VTT

**Primary Dependencies**: Foundry VTT core API only: `foundry.abstract.TypeDataModel`,
`foundry.data.fields`, `HandlebarsApplicationMixin(ActorSheetV2)`, `DialogV2`, `ChatMessage`,
built-in Handlebars helpers (`selectOptions`, `localize`, `eq`, `checked`). No npm packages.

**Storage**: Foundry Actor documents (world database). New persisted fields under
`system.magic.*`; the old free-text `system.cantrip` / `system.spells` fields are deleted
(no real heroes exist yet, test worlds only).

**Testing**: Manual, via the numbered checklist in `README.md` run on the live server
(Foundry v14) after `./deploy.sh`. No automated test runner exists or is introduced.

**Target Platform**: Foundry VTT v12 minimum, v14 verified; live at ttrpg.cafofo.cloud.

**Project Type**: Foundry VTT game system (single ES module + Handlebars templates + CSS).

**Performance Goals**: Sheet re-render after a cast is imperceptible (< 100 ms); a cast is one
click plus at most one dialog.

**Constraints**: No attack modifiers; derived values never stored; no timers or effect engines;
letterpress styling; single `module/quickquest.mjs`; no `system.json` change in this feature
(no Return-to-Setup needed for players), except the version bump at release.

**Scale/Scope**: 1 hero sheet, 2 spell slots + 1 cantrip, 20 fixed magic entries, ~6 players.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / constraint | Status | Evidence |
|---|---|---|
| I. One Die, No Modifiers | PASS | Spells never touch attack rolls; no d20 formula is built or changed. `pickMode()` / `d20Formula()` untouched. |
| II. Derived, Never Stored | PASS | New stored fields are player choices (`magic.cantrip`, `magic.spell1`, `magic.spell2`) and one human state (`magic.channeled`). `aceReady` is computed in `prepareDerivedData()`, never persisted. MP max formula unchanged. |
| III. Automate Math, Humans Handle Timing | PASS | Code deducts MP and Life and posts cards. "Once per fight" is `magic.channeled`, a checkbox a human unticks; nothing expires automatically. |
| IV. The Sheet Replaces the Rulebook | PASS | Options show cost; Cast is one click; every card carries name, range, effect and MP left; channel dialog states the exact Life cost; tooltips on Cast and the Channeled box. |
| V. Rules-Lite Scope | PASS | Exactly 12 + 8 entries enforced by a startup assertion; two slots; no mana-crystal button (BACKLOG 3.5 rejected); monsters untouched. |
| AppV2 pattern | PASS | New `castSpell` entry in `DEFAULT_OPTIONS.actions`; private static handler; `submitOnChange` keeps selects persisting. |
| Plain named inputs, built-in helpers only | PASS | `<select name="system.magic.spell1">` with `{{selectOptions}}`; `{{localize}}`; `{{checked}}`. |
| Rolls through `postRoll()` | PASS (extended) | Casting rolls no dice, so a sibling `postCard(actor, html)` helper posts a plain `ChatMessage` in the same ROLL HELPERS section; `postRoll()` unchanged. |
| Letterpress styling | PASS | New `.qq-card`, `.qq-ace-ready`, `.qq-magic` rules use `--qq-spot`, ink, paper, IM Fell labels, square corners. |
| Single module, no build step | PASS | All code in `module/quickquest.mjs`; data constant in a marked block (BACKLOG 3.1). |
| i18n for strings | PASS (early) | Not required until v0.4, but new UI chrome strings go in `languages/en.json` under `QQ.Magic.*` now; spell content stays in the constant. |

Gate result: **PASS**, no Complexity Tracking entries needed.

## Project Structure

### Documentation (this feature)

```text
specs/002-spell-casting/
├── plan.md              # This file
├── research.md          # Phase 0: decisions and alternatives
├── data-model.md        # Phase 1: schema additions, spell entry shape, state rules
├── quickstart.md        # Phase 1: manual validation script for the live server
├── contracts/
│   ├── sheet-actions.md # data-action contract, dialog flows, chat card structure
│   └── spell-data.md    # SPELLS / CANTRIPS constant contract and placeholder rules
└── tasks.md             # Phase 2 output (/speckit-tasks), not created here
```

### Source Code (repository root)

```text
module/quickquest.mjs        # HeroData.defineSchema: + magic SchemaField, − cantrip, − spells
                             # HeroData.prepareDerivedData: + aceReady
                             # NEW block "MAGIC DATA": SPELLS, CANTRIPS, lookup helper, count assertion
                             # ROLL HELPERS: + postCard()
                             # QuickQuestHeroSheet: action castSpell;
                             #   _prepareContext: + spellChoices, cantripChoices, slots
templates/hero-sheet.hbs     # "Spells & cantrip" box → magic box: 3 selects + Cast buttons,
                             #   Channeled checkbox; Ace box gets qq-ace-ready class
styles/quickquest.css        # .qq-magic layout, .qq-card chat card, .qq-ace-ready highlight
languages/en.json            # QQ.Magic.* UI strings
README.md                    # checklist steps for casting, channeling, cantrip, Ace highlight
system.json                  # version → 0.3.0 at release only (not during development)
```

**Structure Decision**: Keep the single-module layout the constitution mandates. The feature adds
one marked data block and one sheet action group to `module/quickquest.mjs`, edits the magic box
in `templates/hero-sheet.hbs`, and appends CSS. No new directories.

## Phase 0: Research

See [research.md](research.md). All Technical Context items were resolvable from the codebase
and the constitution; no NEEDS CLARIFICATION remained after the owner's answer on channeling.

## Phase 1: Design

- [data-model.md](data-model.md): `magic` schema, removed fields, spell entry shape, state rules.
- [contracts/sheet-actions.md](contracts/sheet-actions.md): actions, dialogs, card HTML.
- [contracts/spell-data.md](contracts/spell-data.md): constant shape, placeholder convention.
- [quickstart.md](quickstart.md): manual validation on the live server.

## Constitution Check (post-design)

Re-evaluated after writing the design artifacts: unchanged, all PASS. The only addition to shared
helpers is `postCard()`, which mirrors `postRoll()` without a `Roll`; the data-model confirms no
derived value is persisted and no timer exists.

## Complexity Tracking

No violations to justify.
