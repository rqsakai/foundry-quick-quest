# Implementation Plan: The Sheet Teaches Combat

**Branch**: `004-sheet-teaches` | **Date**: 2026-10-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-sheet-teaches/spec.md`

## Summary

Six independent teaching upgrades to the existing sheets: a one-sentence rule tooltip on every
element; critical and fumble detection on attack cards with a Roll Fumble button and a one-time
×2 offer on the next damage roll; the Ace as a button that posts a card and ticks itself used;
Treat Wounds and Drink Potion buttons that do the healing arithmetic; Shift/Ctrl-click shortcuts
for advantage/disadvantage; and a weapon usage card. All text goes through the `QQ.*` keys in
both language files (feature 005). No attack roll gains a modifier; every timing rule stays a
human-ticked checkbox or a prompt.

## Technical Context

**Language/Version**: JavaScript ES2022 module, Handlebars, CSS, JSON language files

**Primary Dependencies**: Foundry core: `Roll` (die inspection via `roll.dice[0].results`),
`ChatMessage`, `DialogV2`, chat render hook (`renderChatMessageHTML` on v13+,
`renderChatMessage` on v12), `fromUuid`, i18n. No packages.

**Storage**: Two new persisted hero fields: `ace.trigger` (string) and `treated` (boolean).
Pending-critical state is in-memory only (module-level `Set` of actor ids).

**Testing**: Manual via README checklist / quickstart.md on the live server.

**Target Platform**: Foundry v12–v14.

**Project Type**: Foundry VTT game system.

**Performance Goals**: None beyond unchanged render time.

**Constraints**: No attack modifiers (Principle I); crit doubling only on explicit choice
(Principle III); tooltips sourced from the rulebook wording; letterpress styling; strings in both
language files; `system.json` unchanged.

**Scale/Scope**: ~35 tooltip keys + ~25 card/dialog keys, 2 schema fields, 5 new actions,
1 chat hook.

## Constitution Check

| Principle / constraint | Status | Evidence |
|---|---|---|
| I. One Die, No Modifiers | PASS | Shift/Ctrl only choose adv/dis; crit/fumble read the kept die; no formula gains a term. |
| II. Derived, Never Stored | PASS | New stored fields are player choices/state (`ace.trigger`, `treated`); pending crit is in-memory, not a document field; heal math computed at click time. |
| III. Automate Math, Humans Handle Timing | PASS | Heal amounts computed; "once per fight" = `treated` checkbox; crit ×2 is a yes/no prompt cleared by the next attack; Ace untick is manual. |
| IV. The Sheet Replaces the Rulebook | PASS | Tooltips everywhere; cards carry the rule; crit/fumble prompts appear where the roll is. |
| V. Rules-Lite Scope | PASS | No new rules; potion count is not tracked (gear stays text). |
| i18n | PASS | All new strings in `QQ.Tip.*`, `QQ.Roll.*`, `QQ.Ace.*`, `QQ.Recover.*`, `QQ.Flavor.*` in en + pt-BR. |
| AppV2 pattern | PASS | New actions `playAce`, `treatWounds`, `drinkPotion`, `weaponCard`; chat-card button handled by a render hook, the only non-sheet listener (justified: it lives in chat, not on a sheet). |
| Letterpress | PASS | New `.qq-card-ace`, `.qq-crit`, `.qq-recover` reuse tokens. |
| Single module | PASS | |

Gate result: **PASS**.

## Project Structure

### Documentation (this feature)

```text
specs/004-sheet-teaches/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── sheet-actions.md   # new actions, modifier-click rules, chat hook, card HTML
│   └── i18n-keys.md       # new keys with English values
└── tasks.md
```

### Source Code (repository root)

```text
module/quickquest.mjs      # HeroData: + ace.trigger, + treated
                           # helpers: keptD20(roll), PENDING_CRIT set, rollFumble(actor), attackCard(...)
                           # hero sheet: actions playAce, treatWounds, drinkPotion, weaponCard;
                           #   modifier-click in rollAttack/rollCheck; crit offer in rollDamage
                           # monster sheet: modifier-click, crit/fumble card, crit offer
                           # init: chat render hook binding [data-action=rollFumble]
templates/hero-sheet.hbs   # title= on every element; Ace button + trigger input; recovery row; weapon info button
templates/monster-sheet.hbs# title= on every element
styles/quickquest.css      # .qq-recover, .qq-card-ace, .qq-crit, .qq-card button, weapon grid 7 cols
languages/en.json, languages/pt-BR.json   # QQ.Tip, QQ.Ace, QQ.Recover, QQ.Flavor, more QQ.Roll
README.md                  # steps 17–22
CLAUDE.md                  # new actions, treated/ace.trigger fields, chat hook note
```

**Structure Decision**: Unchanged single-module layout.

## Phase 0: Research — [research.md](research.md)

## Phase 1: Design — [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

## Constitution Check (post-design)

Unchanged, all PASS. The chat render hook is the one new listener outside a sheet; it only
binds a button inside our own `.qq-card` markup and routes to the same `rollFumble(actor)`
the sheet uses.

## Complexity Tracking

No violations to justify.
