# Data Model: Guided Character Creation

**Feature**: 003-creation-wizard | **Date**: 2026-10-19

## Constants (code, not persisted)

### Race
| Field | Type | Rule |
|---|---|---|
| `id` | string | `human`, `elf`, `dwarf`, `halfling`, `orc`, `gnome` — stable forever |
| `name` | string | display name |
| `trait` | string | one sentence from the rulebook |

### Profession
| Field | Type | Rule |
|---|---|---|
| `id` | string | `warrior`, `barbarian`, `rogue`, `wizard`, `healer` |
| `name` | string | |
| `move` | string | one sentence |
| `caster` | boolean | Wizard, Healer true |
| `spellPicks` | integer | Wizard 2, Healer 1, others 0 |
| `fixedSpell` | string \| null | Healer `healing-hands` |
| `ace.name`, `ace.trigger`, `ace.effect` | strings | from the Ace table |
| `kit.weapons[]` | `{ name, die, stat, dtype, reach }` | ≤ 3 entries, Armory values |
| `kit.armor` | 0–4 | clothes 0 · leather 1 · chain 2 · plate 3 · shield +1 |
| `kit.gear` | string | non-weapon items |
| `kit.gold` | integer | starting gold |

Invariants asserted at init: `RACES.length === 6`, `PROFESSIONS.length === 5`.

## HeroData schema changes

| Field | Change |
|---|---|
| `race` | kept, now holds a race id or "" |
| `profession` | kept, now holds a profession id or "" |
| `trait`, `move` | **removed** (derived from `raceData` / `professionData`) |
| `ace.name`, `ace.trigger` | **removed** (derived from `professionData.ace`) |
| `ace.used` | kept |

## Derived (prepareDerivedData, never stored)

| Name | Formula |
|---|---|
| `raceData` | `RACES.find(r => r.id === race) ?? null` |
| `professionData` | `PROFESSIONS.find(p => p.id === profession) ?? null` |
| `life.max` | `7 + CON × 2` (unchanged) |
| `mp.max` | `professionData?.caster ? INT × 3 : 0` |
| `defense` | `10 + armor − (raging ? 2 : 0)` |
| `aceReady` | `profession === "wizard" && mp.value === 0 && !ace.used` |
| `initiativeRank` | 2 (unchanged) |

## Wizard state (in-memory on the application instance)

```
step:    1..5
mode:    "create" | "rebuild"
choices: { name, stats: {str,agi,con,int}, race, profession, cantrip, spell1, spell2 }
```
Defaults (create): name "", stats 3/3/2/2, race `human`, profession `warrior`, cantrip `spark`,
spells per profession default (Wizard `fireball` + `summon-lightning`; Healer `healing-hands` +
`bless`; others ""). Rebuild: current actor values, falling back to defaults where empty.

### Validation per step
| Step | Rule |
|---|---|
| 1 Stats | each 1–5; `sum − 4 === 6` |
| 2 Race | id in RACES |
| 3 Profession | id in PROFESSIONS |
| 4 Magic | cantrip in CANTRIPS; caster: `spellPicks` distinct valid spells, `fixedSpell` in slot 1 when set; non-caster: spell slots "" |
| 5 Name | if empty → profession name |

### Finish payload (create)
```
name, system.stats.*, system.race, system.profession, system.armor = kit.armor,
system.gear = kit.gear, system.gold = kit.gold, system.silver = 0,
system.weapons.w1..w3 = kit.weapons (missing rows → empty name, defaults),
system.magic.cantrip/spell1/spell2, system.magic.channeled = false,
system.life.value = 7 + CON×2, system.mp.value = caster ? INT×3 : 0,
system.ace.used = false, system.raging = false, system.treated = false, system.bonus = 0
```
Rebuild writes the same minus gear/gold/silver/bonus and the checkboxes; `life.value` and
`mp.value` are clamped to the new maxima instead of reset.
