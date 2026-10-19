# Implementation Plan: Guided Character Creation

**Branch**: `003-creation-wizard` | **Date**: 2026-10-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-creation-wizard/spec.md`, owner decisions of
2026-10-19 (MP for casters only; Rage −2 Defense; race/profession as locked selects; wizard
picks spells for casters).

## Summary

Add `RACES` (6) and `PROFESSIONS` (5) constants transcribed from `docs/rulebook.md`; store
only their ids on the hero and derive trait, move, Ace, caster flag and kit from them. Change
the derived formulas per the book: MP max is `INT × 3` for casters and `0` otherwise; Defense
drops by 2 while Raging. Add a five-step creation wizard (`HandlebarsApplicationMixin(
ApplicationV2)`) that opens automatically when a hero is created and can be reopened from the
sheet: stats (balanced default, live counter), race, profession, magic (cantrip + spells for
casters), name. Finish writes everything in one `actor.update()`; Cancel writes nothing. The
sheet's race/profession become selects and the trait/move/Ace boxes become read-only lookups.

## Technical Context

**Language/Version**: JavaScript ES2022 module, Handlebars, CSS, JSON language files

**Primary Dependencies**: Foundry core: `foundry.applications.api.ApplicationV2` +
`HandlebarsApplicationMixin`, `Hooks.on("createActor")`, `selectOptions`, i18n. No packages.

**Storage**: Hero schema: `race`, `profession` become ids (still `StringField`); `trait`,
`move`, `ace.name`, `ace.trigger` are **removed** (derived now). Wizard state is in-memory on the
application instance until Finish.

**Testing**: Manual (README checklist, quickstart.md) on the live server.

**Target Platform**: Foundry v12–v14.

**Project Type**: Foundry VTT game system.

**Performance Goals**: Wizard opens within a second of actor creation; each step re-renders
instantly.

**Constraints**: Constitution 1.1.0 (amended today for the formulas); letterpress styling; both
language files; `system.json` unchanged.

**Scale/Scope**: 2 constants (~70 lines), 1 new application class (~200 lines), 1 new template,
~45 new UI strings, sheet template edits, 4 schema fields removed.

## Constitution Check (v1.1.0)

| Principle / constraint | Status | Evidence |
|---|---|---|
| I. One Die, No Modifiers | PASS | No roll changes. |
| II. Derived, Never Stored | PASS | Trait/move/Ace text are no longer stored; `mp.max` and `defense` formulas follow the amended principle; `raceData` / `professionData` are lookups in `prepareDerivedData()`. |
| III. Automate Math, Humans Handle Timing | PASS | Wizard does the point arithmetic; Rage stays a checkbox. |
| IV. The Sheet Replaces the Rulebook | PASS | Every wizard option shows its one-sentence rule; defaults are a legal hero. |
| V. Rules-Lite Scope | PASS | Exactly 6 races / 5 professions, asserted at init. |
| Non-sheet UI pattern | PASS | `HandlebarsApplicationMixin(ApplicationV2)` with `actions`; writes only on Finish. |
| i18n | PASS | UI chrome in `QQ.Wizard.*`; race/profession/Ace text is rulebook content in the constants (same policy as spells). |
| Letterpress | PASS | Wizard reuses `.qq-*` tokens; radio cards use the `.qq-box` look. |
| Single module | PASS | Constants and wizard class live in `module/quickquest.mjs`. |

Gate result: **PASS**.

## Project Structure

### Documentation (this feature)

```text
specs/003-creation-wizard/
├── plan.md, research.md, data-model.md, quickstart.md, tasks.md
└── contracts/
    ├── hero-data.md       # RACES / PROFESSIONS shape and the book's values
    └── wizard-ui.md       # steps, actions, validation, Finish payload, sheet changes
```

### Source Code (repository root)

```text
module/quickquest.mjs          # HERO DATA block: RACES, PROFESSIONS, raceById, professionById
                               # HeroData: schema −trait −move −ace.name −ace.trigger; derived mp.max/defense/
                               #   aceReady per 1.1.0; + raceData, professionData
                               # hero sheet: context raceChoices/professionChoices; action openWizard;
                               #   playAce reads professionData.ace
                               # NEW class QuickQuestCreationWizard (ApplicationV2)
                               # init: createActor hook opens the wizard for the creating user
templates/hero-sheet.hbs       # race/profession selects; trait/move/Ace read-only; Rebuild button
templates/creation-wizard.hbs  # NEW five-step template
styles/quickquest.css          # .qq-wizard layout, .qq-choice cards, stat +/- controls
languages/en.json, pt-BR.json  # QQ.Wizard.*, QQ.Sheet.Rebuild, tip updates
README.md                      # steps 23–25
CLAUDE.md                      # already amended for rules; add wizard notes
```

**Structure Decision**: Single module. The wizard template is the second `.hbs` for heroes;
no new directories.

## Phase 0 / Phase 1

[research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/),
[quickstart.md](quickstart.md).

## Constitution Check (post-design)

Unchanged, all PASS.

## Complexity Tracking

No violations to justify.
