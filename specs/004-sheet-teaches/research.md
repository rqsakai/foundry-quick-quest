# Research: The Sheet Teaches Combat

**Feature**: 004-sheet-teaches | **Date**: 2026-10-19

## R1. Reading the kept d20

- **Decision**: After `postRoll` returns the evaluated `Roll`, `keptD20(roll)` returns
  `roll.dice[0].results.find(r => r.active)?.result`. For `1d20` that is the only die; for
  `2d20kh`/`2d20kl` the kept one. Natural 20 / 1 are judged on that value.
- **Rationale**: Spec edge case: with advantage, a discarded 20 is not a crit.
- **Alternatives**: `roll.total` (wrong under keep-high/low only when equal, but semantically
  the die is what the rule names).

## R2. Where the pending critical lives

- **Decision**: Module-level `const PENDING_CRIT = new Set()` of actor ids. Set on a natural
  20 attack; the next damage roll by that actor offers ×2 via `DialogV2.confirm` and then
  deletes the id whatever the answer; any new attack roll by that actor deletes it first.
- **Rationale**: Spec: "a prompt on the damage roll, not a stored buff; expires on the next attack
  roll". Flags would persist across reloads and become stale state. Loss on page reload is
  acceptable (the chat card still says CRITICAL).
- **Alternatives**: actor flag (rejected: persisted stale state); only the chat badge with no
  damage prompt (rejected: BACKLOG 4.7 asks the damage button to offer ×2).

## R3. Doubling formula

- **Decision**: Wrap the existing damage formula: `(1d8 + 3 + 2) * 2`. Flavor says "CRITICAL ×2".
- **Rationale**: Foundry evaluates parenthesised arithmetic; keeps one roll, one card.

## R4. Fumble button on the chat card

- **Decision**: Attack cards with a natural 1 include
  `<button type="button" data-action="rollFumble" data-actor-uuid="…">Roll Fumble d6</button>`.
  On `init`, register one hook: `renderChatMessageHTML` when `game.release.generation >= 13`,
  else `renderChatMessage` (unwrapping jQuery with `html[0]`). The handler finds the button
  inside `.qq-card`, and on click resolves the actor with `fromUuid` and calls the shared
  `rollFumble(actor)`.
- **Rationale**: v13 renamed the hook and passes an `HTMLElement`; registering only the matching
  one avoids deprecation warnings and double binding. `fromUuid` works for world and token
  actors.
- **Alternatives**: inline `onclick` (blocked by CSP in some setups); making the sheet's fumble
  button the only path (rejected: the spec wants the prompt on the card).

## R5. Ace trigger text

- **Decision**: Add `ace.trigger` (string) typed by the player ("when an ally falls"); the Ace
  button shows `name` and the tooltip shows the trigger; the card prints both. Per-profession
  defaults arrive with the creation wizard (003).
- **Rationale**: BACKLOG 4.3 wants trigger text, but profession data is not in the repo yet.

## R6. Healing arithmetic

- **Decision**: Treat Wounds: `heal = Math.ceil((max - value) / 2)`; refused if `value >= max`
  (nothing to treat) or `treated` ticked; on success `life.value += heal`, `treated = true`, card
  shows "`value` → `value+heal` (half of `max-value` missing, rounded up)". Drink Potion:
  `Roll("1d6 + 2")`, `heal = Math.min(total, max - value)`, card shows the dice and "this costs
  your turn"; no checkbox.
- **Rationale**: Spec FR-005/006 verbatim.

## R7. Modifier clicks

- **Decision**: In roll handlers: `event.shiftKey → "adv"`, `event.ctrlKey || event.metaKey →
  "dis"`, else `pickMode()`. Checks: shift forces advantage, ctrl forces disadvantage even at
  stat 4+, otherwise the stat rule. Damage, fumble, cast ignore modifiers.
- **Rationale**: BACKLOG 4.4; meta key covers Mac users.

## R8. Weapon usage card trigger

- **Decision**: A small 📜 button in a new seventh weapon-grid column (`data-action="weaponCard"`),
  not a click on the name input (which must stay editable). Card: name · die+STAT · type · reach
  — flavor line keyed by damage type (`QQ.Flavor.<dtype>`).
- **Rationale**: Spec says "clicking a weapon's name"; an input cannot be both editable and a
  button without surprising beginners. The icon sits beside the name.

## R9. Tooltip source and scope

- **Decision**: One `QQ.Tip.<Element>` key per element on both sheets, wording from the rules the
  code already encodes (formulas, 0 Life = down, 4–5 advantage, reach bands, monster bonuses).
  Where the rulebook text is not in the repo (MP recovery, damage-type effects) the BACKLOG
  wording is used and flagged for the owner in the glossary.
- **Rationale**: Spec FR-001; the owner approves wording later.

## R10. Monster parity

- **Decision**: Monster attack gets the same crit/fumble card and ×2 offer on damage; monster
  sheet gets tooltips; no Ace/recovery/weapon card (monsters have none).
