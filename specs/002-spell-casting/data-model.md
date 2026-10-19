# Data Model: The Sheet Teaches Magic

**Feature**: 002-spell-casting | **Date**: 2026-10-19

## Magic entry (code constant, not persisted)

| Field | Type | Rules |
|---|---|---|
| `id` | string | Stable, kebab-case, unique across SPELLS ∪ CANTRIPS (`spell-01`…`spell-12`, `cantrip-01`…`cantrip-08`). Stored on heroes; never renamed once shipped. |
| `name` | string | Display name. Placeholder until `docs/rulebook.md` lands. |
| `cost` | integer | Spells ≥ 1; cantrips exactly 0. |
| `range` | enum | `touching` \| `nearby` \| `far` (same vocabulary as weapon reach). |
| `effect` | string | One to three sentences, verbatim from the rulebook. Shown on the card. |

Invariants: `SPELLS.length === 12`, `CANTRIPS.length === 8`, asserted at init.
`MAGIC_IS_PLACEHOLDER` (boolean constant) is `true` while any entry still carries TODO text.

## HeroData schema additions (persisted)

```
magic: SchemaField
  cantrip:   StringField  initial ""   // a CANTRIPS id or "" (empty slot)
  spell1:    StringField  initial ""   // a SPELLS id or ""
  spell2:    StringField  initial ""   // a SPELLS id or ""
  channeled: BooleanField initial false // "Channeled this fight" — human-unticked
```

Validation: an id that no longer exists in the constant renders as an empty slot (select shows
blank) and is overwritten on the next pick; no error. The same spell in both slots is allowed.

## Removed fields

| Field | Action |
|---|---|
| `cantrip` (string, top-level) | Deleted from `HeroData.defineSchema()` |
| `spells` (string, top-level) | Deleted from `HeroData.defineSchema()` |

No migration: no real heroes exist yet (test worlds only). Any stale values on test actors are
dropped by the DataModel on load.

## Existing fields used

| Field | Role in this feature |
|---|---|
| `mp.value` (stored) | Deducted on cast; set to 0 on channel. Clamped to `mp.max` at cast time only. |
| `mp.max` (derived) | `INT × 3`, unchanged. |
| `life.value` (stored) | Reduced by `2 × missing MP` on channel. |
| `ace.used` (stored) | Read for `aceReady`. |

## Derived additions (computed in `prepareDerivedData`, never stored)

| Name | Formula |
|---|---|
| `aceReady` | `mp.value === 0 && !ace.used` |

## Cast state machine (per click, no persisted intermediate state)

```
castSpell(slot)
 ├─ slot empty ............................ no button rendered (unreachable)
 ├─ entry is cantrip ...................... post card; no changes
 ├─ have = min(mp.value, mp.max) ≥ cost ... mp.value = have − cost; post card
 └─ have < cost: missing = cost − have, lifeCost = 2 × missing
     ├─ magic.channeled == true ............ prompt "already channeled"; no changes
     ├─ life.value − lifeCost ≤ 0 .......... prompt "cannot survive"; no changes
     └─ confirm(channel?) 
         ├─ cancel ........................ no changes
         └─ accept ........................ life.value −= lifeCost; mp.value = 0;
                                            magic.channeled = true; post card (channeled)
```

All writes in a branch happen in a single `actor.update()` call.

## Sheet context (transient, built in `_prepareContext`)

| Key | Shape |
|---|---|
| `spellChoices` | `{ [id]: "Name (N MP)" }` for the 12 spells |
| `cantripChoices` | `{ [id]: "Name" }` for the 8 cantrips |
| `slots` | `[{ key: "cantrip"\|"spell1"\|"spell2", entry: MagicEntry\|null }]` |
| `magicPlaceholder` | `MAGIC_IS_PLACEHOLDER` |
