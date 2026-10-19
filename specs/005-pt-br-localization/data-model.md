# Data Model: Localization Keys

**Feature**: 005-pt-br-localization | **Date**: 2026-10-19

No actor data changes. The "model" is the key namespace both language files must satisfy.

## Files

| File | Role |
|---|---|
| `languages/en.json` | Source of truth for the key set and English values |
| `languages/pt-BR.json` | Same key set, Brazilian Portuguese values |
| `docs/glossary.md` | Term decisions the translations follow |

## Namespace

```
TYPES.Actor.{hero,monster}          Foundry-required type labels
QQ.Sheet.*                          labels, placeholders, footers, sheet titles, tooltips
QQ.Stat.{str,agi,con,int}           stat abbreviations shown on the four buttons
QQ.Weapon.{Weapon,Die,Stat,ColType,ColReach,RollDamage,EmptyName}
QQ.Weapon.Type.{bludgeoning,cutting,piercing}      keyed by the stored value
QQ.Weapon.Reach.{touching,"thrown nearby",far}     keyed by the stored value
QQ.Range.{touching,nearby,far}      spell ranges
QQ.Roll.*                           card titles, adv/dis labels, dialog buttons, hints
QQ.Fumble.{Title,1,2,3,4,5,6}       the fumble table
QQ.Monster.*                        monster-only labels
QQ.Magic.*                          unchanged from feature 002
```

## Naming rules

- PascalCase for labels (`QQ.Sheet.BonusDmg`); stored enum values verbatim as keys
  (`QQ.Weapon.Reach.thrown nearby`).
- Placeholders inside values use `{name}` and are formatted with `game.i18n.format` or the
  `localize` helper's hash arguments.
- A key is never reused for two meanings; a new meaning gets a new key even if the English is
  identical (e.g. `QQ.Roll.Attack` on cards vs `QQ.Sheet.Attack` on the button).

## Invariants

- `keys(en) == keys(pt-BR)` (checked by the one-liner in quickstart.md).
- No user-visible literal remains in `templates/*.hbs` or in the user-facing paths of
  `module/quickquest.mjs` (spell content constant excepted).
- Dice names and "QuickQuest" are not keys.

The complete key list with English values is the contract: [contracts/i18n-keys.md](contracts/i18n-keys.md).
