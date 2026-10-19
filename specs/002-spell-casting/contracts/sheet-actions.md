# UI Contract: Hero Sheet Magic Actions

**Feature**: 002-spell-casting | **Date**: 2026-10-19

The hero sheet is the only interface. Contracts are the `data-action` names the template
exposes, what each handler reads from the DOM, the dialogs it may open, and the chat card it
posts. Handlers are private static methods on `QuickQuestHeroSheet` registered in
`DEFAULT_OPTIONS.actions`, following the existing `rollCheck` / `rollDamage` pattern.

## Actions

### `castSpell`

| | |
|---|---|
| Element | `<button type="button" data-action="castSpell" data-slot="cantrip|spell1|spell2">` |
| Rendered when | the slot holds a valid entry id |
| Reads | `target.dataset.slot`, `actor.system.magic[slot]`, `actor.system.mp`, `actor.system.life`, `actor.system.magic.channeled` |
| Writes | see data-model "Cast state machine"; at most one `actor.update()` |
| Posts | one Spell Card (below), or nothing when refused/cancelled |
| Tooltip | `QQ.Magic.CastTip` ("Spend the MP and post the spell to chat; cantrips are free") |

### Form fields (no handler; `submitOnChange`)

| Name | Control | Options |
|---|---|---|
| `system.magic.cantrip` | `<select>` | blank + 8 cantrips (`selectOptions cantripChoices`) |
| `system.magic.spell1` | `<select>` | blank + 12 spells with cost (`selectOptions spellChoices`) |
| `system.magic.spell2` | `<select>` | same as spell1 |
| `system.magic.channeled` | `<input type="checkbox">` | label `QQ.Magic.Channeled` ("Channeled this fight"), tooltip explains 2 Life per missing MP, once per fight, untick after the fight |

## Dialogs (`DialogV2`)

| Situation | Kind | Title key | Body (formatted) | Buttons |
|---|---|---|---|---|
| MP short, channel available | `confirm` | `QQ.Magic.ChannelTitle` | `QQ.Magic.ChannelBody` → "You are {missing} MP short. Channel {lifeCost} Life to cast {spell}?" | Channel (default) / Cancel |
| MP short, already channeled | `prompt` | `QQ.Magic.ChannelTitle` | `QQ.Magic.AlreadyChanneled` → "You already channeled this fight. Untick the box when the fight ends." | OK |
| MP short, Life would reach 0 | `prompt` | `QQ.Magic.ChannelTitle` | `QQ.Magic.CannotSurvive` → "Channeling would cost {lifeCost} Life and you have {life}. You cannot survive the cost." | OK |

All dialogs use `rejectClose: false`; closing equals Cancel.

## Spell Card (chat message, no roll)

Posted via `postCard(actor, html)`; speaker is the casting actor.

```html
<div class="qq-card qq-card-spell">
  <div class="qq-card-title">{name}</div>            <!-- IM Fell, spot colour -->
  <div class="qq-card-meta">{Range}: {range} · {Cost}: {cost} MP</div>
  <div class="qq-card-body">{effect}</div>
  <div class="qq-card-foot">{MP left}: {mpLeft} / {mpMax}</div>
  <!-- only when channeled: -->
  <div class="qq-card-badge">{Channeled} — {lifeCost} Life</div>
  <!-- only for cantrips: -->
  <div class="qq-card-foot">{Cantrip, free}</div>
</div>
```

Labels come from `QQ.Magic.*` keys; `{name}`, `{range}`, `{effect}` from the constant. The card
must be readable without the sheet: it always contains the complete effect text.

## Ace readiness (presentation only)

| | |
|---|---|
| Condition | `system.aceReady` (derived) |
| Template | Ace `.qq-box` gains class `qq-ace-ready` and `title="{{localize 'QQ.Magic.AceReadyTip'}}"` |
| CSS | spot-colour outline + slow box-shadow pulse; no JavaScript |
| Text | `QQ.Magic.AceReadyTip` → "Out of MP — your Ace is ready. Play it when the moment comes." |

## Placeholder notice

| | |
|---|---|
| Condition | `MAGIC_IS_PLACEHOLDER === true` |
| Template | italic `.qq-hint` line in the magic box: `QQ.Magic.PlaceholderHint` → "Spell list is placeholder — fill SPELLS/CANTRIPS from docs/rulebook.md" |
| Console | one `console.warn("QuickQuest | SPELLS/CANTRIPS are placeholders")` at init |

## Non-contracts (explicitly unchanged)

`rollCheck`, `rollAttack`, `rollDamage`, `rollFumble`, `postRoll()`, `pickMode()`,
`d20Formula()`, the monster sheet, `system.json`. The old `system.cantrip` / `system.spells`
inputs are removed from the template along with their schema fields.
