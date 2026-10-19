# Tasks: Guided Character Creation

**Input**: Design documents from `/specs/003-creation-wizard/`

**Tests**: Manual (constitution); quickstart.md on the live server.

**Organization**: Foundational data + formula changes first (they also change the sheet), then
US1/US2 (the wizard itself; US2 is defaults, delivered by the same code), then US3 (skip/rebuild).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [X] T001 [P] Add `QQ.Wizard.*` keys to `languages/en.json`: Title ("Make your hero"), Step
      ("Step {step} of 5"), StepStats ("Spread your points"), StatsHint ("Start at 1 each and
      spend 6 more. 4 or 5 means advantage on that stat's checks."), Points ("{spent} of 6 points
      spent"), NeedPoints ("Spend exactly 6 points to continue"), StepRace ("Pick a race"),
      StepProfession ("Pick a profession"), AceLine ("Ace: {name} — plays when {trigger}"),
      KitLine ("Kit: {kit}"), HasMP ("Magic Points = INT × 3"), NoMP ("No Magic Points — you
      don't need them"), StepMagic ("Pick your magic"), Cantrip ("Your cantrip — free, forever"),
      Spells ("Your spells"), FixedSpell ("{spell} (always known)"), NeedSpells ("Pick {n}
      different spells to continue"), StepName ("Name your hero"), NamePlaceholder ("Leave blank
      to be called by your profession"), Summary ("Your hero"), Back, Next, Finish ("Done —
      make my hero"), Cancel; plus `QQ.Sheet.Rebuild` ("Rebuild"), `QQ.Sheet.PickRace` ("Pick a
      race to see its trait"), `QQ.Sheet.PickProfession` ("Pick a profession to see its move and
      Ace"), `QQ.Sheet.PlaysWhen` ("plays when {trigger}"), and update `QQ.Tip.Race` /
      `QQ.Tip.Profession` / `QQ.Tip.Ace` wording for selects.
- [X] T002 [P] Same keys in `languages/pt-BR.json` per `docs/glossary.md`.

---

## Phase 2: Foundational (data, formulas, sheet lookups)

- [X] T003 In `module/quickquest.mjs`, add a `HERO DATA` block after MAGIC DATA with `RACES`,
      `PROFESSIONS`, `raceById()`, `professionById()` exactly per contracts/hero-data.md.
- [X] T004 In `HeroData.defineSchema()`: remove `trait`, `move`, `ace.name`, `ace.trigger`; keep
      `race`, `profession` (ids), `ace.used`.
- [X] T005 In `HeroData.prepareDerivedData()`: `this.raceData`, `this.professionData`;
      `mp.max = professionData?.caster ? INT × 3 : 0`; `defense = 10 + armor − (raging ? 2 : 0)`;
      `aceReady = profession === "wizard" && mp.value === 0 && !ace.used`.
- [X] T006 In `Hooks.once("init")`: assert `RACES.length === 6 && PROFESSIONS.length === 5`.
- [X] T007 Hero sheet `_prepareContext`: `raceChoices` / `professionChoices` objects for
      `selectOptions`; `race`, `profession` data for the template.
- [X] T008 `templates/hero-sheet.hbs`: race/profession selects; trait/move box → read-only
      `.qq-ro` lines with pick hints; Ace box → read-only name + plays-when line (effect as
      tooltip), Play Ace button disabled when no profession or used, used checkbox; header
      Rebuild button (`openWizard`).
- [X] T009 `#onPlayAce`: use `professionData.ace`; disabled rules updated.
- [X] T010 [P] `styles/quickquest.css`: `.qq-ro` (read-only line, Alegreya 12px), header button
      sizing, `.qq-wizard` layout, `.qq-choice` cards (letterpress box, selected = spot outline),
      `.qq-statrow` with − / + buttons, `.qq-summary`.

**Checkpoint**: sheet opens; MP 0 for non-casters; Raging lowers Defense; Ace from profession.

---

## Phase 3: User Story 1 + 2 - A stranger builds a legal hero; defaults are correct (P1) 🎯 MVP

- [X] T011 [US1] Add `class QuickQuestCreationWizard extends HandlebarsApplicationMixin(ApplicationV2)`
      in `module/quickquest.mjs`: `DEFAULT_OPTIONS` (classes `quickquest qq-hero qq-wizard`,
      window title `QQ.Wizard.Title`, position 540×640, actions `statInc`, `statDec`, `pick`,
      `back`, `next`, `finish`, `cancel`), `PARTS.body` → `templates/creation-wizard.hbs`,
      constructor `{ actor, mode }`, `#defaults()`, `#spent()`, `#valid(step)`, `_prepareContext`
      building per-step view data (choices with `selected` flags, summary numbers), `_onRender`
      binding `change` on `[data-field]` selects/inputs to update `choices` and re-render.
- [X] T012 [US1] Create `templates/creation-wizard.hbs` per contracts/wizard-ui.md (five
      `{{#if (eq step N)}}` blocks, footer buttons with `disabled` from `canNext`).
- [X] T013 [US1] Implement `finish` per data-model.md (create payload), `close()` after update,
      render the sheet if closed.
- [X] T014 [US2] Verify defaults produce a legal Human Warrior with Spark when Next ×4 → Finish
      (code review of defaults + quickstart step 8).
- [X] T015 [US1] In `init`, register `Hooks.on("createActor", …)` per contracts/wizard-ui.md.

---

## Phase 4: User Story 3 - Skip or redo (P2)

- [X] T016 [US3] Cancel / × writes nothing (no partial state; verify `close()` paths).
- [X] T017 [US3] Rebuild mode: `openWizard` sheet action opens the wizard with `mode: "rebuild"`
      pre-filled from the actor; Finish writes the rebuild subset and clamps `life.value` /
      `mp.value` to the new maxima.

---

## Phase 5: Polish

- [X] T018 [P] `README.md` steps 23–25 (wizard flow, defaults hero, rebuild + raging Defense).
- [X] T019 [P] `CLAUDE.md`: wizard class, `createActor` hook with `qqSkipWizard`, removed fields.
- [X] T020 Parity one-liner `[]`; `node --check`; template literal grep clean; no references to
      `system.trait`, `system.move`, `ace.name`, `ace.trigger` remain.
- [ ] T021 Owner: quickstart 1–15 on the live server.

## Dependencies

T001 ∥ T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009; T010 ∥ T003–T009.
T011 → T012 → T013 → T014 → T015 → T016 → T017. Polish last.
