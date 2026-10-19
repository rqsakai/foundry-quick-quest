# UI Contract: Creation Wizard and Sheet Changes

**Feature**: 003-creation-wizard | **Date**: 2026-10-19

## Opening

| Trigger | Behaviour |
|---|---|
| `createActor` hook, `actor.type === "hero"`, `userId === game.user.id`, no `options.qqSkipWizard` | `new QuickQuestCreationWizard({ actor }).render(true)` in create mode |
| Sheet button `data-action="openWizard"` (header, label `QQ.Sheet.Rebuild`) | wizard in rebuild mode, pre-filled |
| Close (×) or Cancel | nothing written |

## Steps (`PARTS.body` → `templates/creation-wizard.hbs`)

| # | Title key | Content | Actions |
|---|---|---|---|
| 1 | `QQ.Wizard.StepStats` | four rows: stat label, value, − / + buttons; counter `QQ.Wizard.Points` "{spent} of 6 points spent"; hint `QQ.Wizard.StatsHint` | `statDec` / `statInc` (`data-stat`), `next` disabled until spent = 6 |
| 2 | `QQ.Wizard.StepRace` | six `.qq-choice` cards: name + trait | `pick` (`data-field="race" data-value=id`), `back`, `next` |
| 3 | `QQ.Wizard.StepProfession` | five cards: name, move, Ace line (`QQ.Wizard.AceLine` "{name} — plays when {trigger}"), kit line, MP line (`QQ.Wizard.HasMP` / `QQ.Wizard.NoMP`) | `pick` (`data-field="profession"`) |
| 4 | `QQ.Wizard.StepMagic` | cantrip cards (8); for casters a spell section: slot 1 fixed for Healer (shown, not pickable), one or two selects over SPELLS with cost; validation text when picks are missing or duplicate | `pick` (`data-field="cantrip"`), selects `data-field="spell1"/"spell2"` handled on `change` via `pick`-like update |
| 5 | `QQ.Wizard.StepName` | name input (placeholder = profession name), summary box (stats, race, profession, Life, MP, Defense, weapons, cantrip, spells) | `back`, `finish` |

Footer on every step: `QQ.Wizard.Cancel`, `QQ.Wizard.Back` (not on 1), `QQ.Wizard.Next`
(1–4) or `QQ.Wizard.Finish` (5). Step indicator "{step} / 5".

## Finish

Single `actor.update()` per data-model.md; then `this.close()`; the sheet re-renders by itself.
In create mode also `actor.sheet.render(true)` if it is not already open.

## Sheet changes (`templates/hero-sheet.hbs`)

| Element | Before | After |
|---|---|---|
| Race | text input | `<select name="system.race">` from `raceChoices` (blank + 6) |
| Profession | text input | `<select name="system.profession">` from `professionChoices` (blank + 5) |
| Trait & move box | two text inputs | two read-only lines: `raceData.trait`, `professionData.move` (or `QQ.Sheet.PickRace` / `QQ.Sheet.PickProfession` hints) |
| Ace box | name + trigger inputs, button, used box | read-only name + "plays when" line + effect tooltip, Play Ace button (disabled when no profession or used), used box |
| Header | — | small `Rebuild` button (`openWizard`) |

`playAce` posts the card with `professionData.ace.name`, `.trigger`, `.effect`.

## Notices

Step validation messages render inline in the wizard (`QQ.Wizard.NeedPoints`,
`QQ.Wizard.NeedSpells`); no `ui.notifications`.
