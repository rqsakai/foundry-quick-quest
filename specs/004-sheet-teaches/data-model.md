# Data Model: The Sheet Teaches Combat

**Feature**: 004-sheet-teaches | **Date**: 2026-10-19

## HeroData schema additions (persisted)

```
ace: SchemaField (existing)
  name:    StringField  (existing)
  trigger: StringField  initial ""   // NEW — when the Ace may be played, player-typed
  used:    BooleanField (existing)   // ticked by playAce; a human unticks for the next session
treated:   BooleanField initial false // NEW — "Treated this fight"; a human unticks after the fight
```

No derived additions. `aceReady` (feature 002) unchanged.

## Transient state (never persisted)

| Name | Type | Lifecycle |
|---|---|---|
| `PENDING_CRIT` | module-level `Set<actorId>` | add on natural-20 attack; delete on the actor's next damage roll (after the ×2 prompt) or next attack roll; lost on reload |

## Chat card data attributes

| Attribute | Where | Purpose |
|---|---|---|
| `data-action="rollFumble"` | button inside attack card on natural 1 | bound by the chat render hook |
| `data-actor-uuid` | same button | `fromUuid` → actor that rolls the fumble |

## Click → outcome tables

### Attack (hero or monster)

| Kept d20 | Card | Side effect |
|---|---|---|
| 20 | badge "CRITICAL — double the damage roll" | `PENDING_CRIT.add(actor.id)` |
| 1 | badge "FUMBLE" + Roll Fumble d6 button | none |
| other | as today | `PENDING_CRIT.delete(actor.id)` (any attack clears a stale crit) |

### Damage (hero weapon or monster)

| `PENDING_CRIT` has actor | Prompt | Formula |
|---|---|---|
| yes → user picks ×2 | confirm | `(<formula>) * 2`, flavor adds "CRITICAL ×2" |
| yes → user declines | confirm | `<formula>` |
| no | none | `<formula>` |

Always `PENDING_CRIT.delete(actor.id)` after the roll.

### Treat Wounds

| State | Result |
|---|---|
| `life.value >= life.max` | notice "nothing to treat"; no change |
| `treated` ticked | notice "already treated this fight"; no change |
| else | `heal = ceil((max - value)/2)`; `life.value += heal`; `treated = true`; card |

### Drink Potion

`roll = 1d6 + 2`; `heal = min(roll.total, max - value)`; `life.value += heal`; card says it costs
the turn. No state.

### Play Ace

| State | Button | Click |
|---|---|---|
| `ace.name` empty | disabled, label "Set your Ace" | nothing |
| `ace.used` | disabled, tooltip "played this session" | nothing |
| else | enabled | card with name + trigger; `ace.used = true` |

### Modifier clicks (attack and check buttons)

| Keys held | Mode |
|---|---|
| Shift | advantage, no dialog |
| Ctrl / Cmd | disadvantage, no dialog |
| none | attack: dialog; check: stat rule (4–5 → advantage) |
