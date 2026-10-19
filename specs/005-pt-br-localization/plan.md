# Implementation Plan: Portuguese (Brazil) Localization

**Branch**: `005-pt-br-localization` | **Date**: 2026-10-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-pt-br-localization/spec.md`

## Summary

Move every user-visible string in both sheets, all dialogs and all chat cards into
`languages/en.json` under a `QQ.*` namespace (templates use `{{localize}}`, code uses
`game.i18n.localize/format`), then ship `languages/pt-BR.json` with full key parity and register
it in `system.json`. Foundry's own fallback-to-English covers missing keys. A short glossary in
`docs/glossary.md` fixes the game terms. Spell and cantrip content stays in the `SPELLS` /
`CANTRIPS` constant and is not translated here.

## Technical Context

**Language/Version**: JavaScript ES2022 module, Handlebars templates, JSON language files

**Primary Dependencies**: Foundry core i18n (`game.i18n.localize`, `game.i18n.format`, the
`localize` and `concat` Handlebars helpers), `system.json` `languages` array. No packages.

**Storage**: None. Language files are static assets; no actor data changes.

**Testing**: Manual on the live server via README checklist and quickstart.md; plus a one-line
key-parity check run locally before every release (documented, not a build step).

**Target Platform**: Foundry VTT v12–v14; client language setting selects the file.

**Project Type**: Foundry VTT game system.

**Performance Goals**: None beyond unchanged sheet render time.

**Constraints**: No inline user-visible strings may remain; both files keep identical key sets;
letterpress layout must not clip pt-BR strings; spell content untouched; `system.json` gains the
pt-BR entry (players must Return to Setup once).

**Scale/Scope**: ~75 strings today (55 in templates, ~20 in code) plus the 23 `QQ.Magic.*` keys
already present; two languages.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / constraint | Status | Evidence |
|---|---|---|
| I. One Die, No Modifiers | PASS | No roll logic changes; only the text around rolls moves to keys. |
| II. Derived, Never Stored | PASS | No schema or derived-data changes. |
| III. Automate Math, Humans Handle Timing | PASS | No behaviour change. |
| IV. The Sheet Replaces the Rulebook | PASS | Rule hints become translatable so Brazilian beginners read them in their language; nothing is removed. |
| V. Rules-Lite Scope | PASS | No new rules. |
| i18n constraint ("strings from v0.4 on MUST use keys") | PASS | This feature retrofits v0.1–0.3 strings so the rule holds everywhere. |
| AppV2 pattern, plain inputs, built-in helpers | PASS | Only `localize` and `concat` helpers (both Foundry built-ins) are added to templates. |
| Letterpress styling | PASS | Minor width tweaks only, same tokens. |
| Single module, no build step | PASS | The parity check is a documented one-liner, not tooling. |

Gate result: **PASS**.

## Project Structure

### Documentation (this feature)

```text
specs/005-pt-br-localization/
├── plan.md
├── research.md
├── data-model.md          # key namespace structure
├── quickstart.md
├── contracts/
│   └── i18n-keys.md       # every key with its English value (the contract both files satisfy)
└── tasks.md
```

### Source Code (repository root)

```text
languages/en.json          # restructured: TYPES + QQ.{Sheet,Stat,Weapon,Range,Roll,Fumble,Monster,Magic}
languages/pt-BR.json       # NEW, same key set, Brazilian Portuguese values
system.json                # languages[] gains pt-BR entry (Return to Setup needed once)
templates/hero-sheet.hbs   # all text → {{localize}}; stat buttons via (concat "QQ.Stat." key)
templates/monster-sheet.hbs
module/quickquest.mjs      # hints, dialog labels, card flavor, sheet labels → game.i18n.*
styles/quickquest.css      # weapon grid / slot widths loosened for longer pt-BR words
docs/glossary.md           # NEW: game term → pt-BR rendering
README.md                  # checklist step 16: pt-BR pass
CLAUDE.md                  # i18n rule now applies to all strings; parity one-liner in release steps
```

**Structure Decision**: No new code structure. Strings move; files stay where they are.

## Phase 0: Research

See [research.md](research.md).

## Phase 1: Design

- [data-model.md](data-model.md): namespace layout and naming rules.
- [contracts/i18n-keys.md](contracts/i18n-keys.md): the full key table with English values.
- [quickstart.md](quickstart.md): validation on the live server in both languages.

## Constitution Check (post-design)

Unchanged, all PASS. No behaviour, schema or roll formula changes.

## Complexity Tracking

No violations to justify.
