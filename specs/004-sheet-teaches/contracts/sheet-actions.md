# UI Contract: Teaching Actions

**Feature**: 004-sheet-teaches | **Date**: 2026-10-19

## New sheet actions (hero unless noted)

| Action | Element | Reads | Writes | Posts |
|---|---|---|---|---|
| `playAce` | `<button data-action="playAce">` in the Ace box, disabled when `ace.name` empty or `ace.used` | `ace.name`, `ace.trigger`, `ace.used` | `ace.used = true` | Ace card |
| `treatWounds` | `<button data-action="treatWounds">` in the recovery row | `life`, `treated` | `life.value`, `treated` | Recovery card or notice |
| `drinkPotion` | `<button data-action="drinkPotion">` in the recovery row | `life` | `life.value` | Roll card (1d6+2) with heal applied and "costs your turn" |
| `weaponCard` | `<button data-action="weaponCard" data-weapon="w1|w2|w3">` 📜 beside the name | weapon row | none | Weapon usage card |

Existing actions change behaviour:

| Action | Change |
|---|---|
| `rollAttack` (hero, monster) | Shift → adv, Ctrl/Cmd → dis, else dialog. Card gains CRITICAL or FUMBLE badge; natural 1 adds the Roll Fumble button; natural 20 sets pending crit. |
| `rollCheck` | Shift → adv, Ctrl/Cmd → dis, else stat rule. |
| `rollDamage` (hero, monster) | If pending crit for this actor: confirm "double?"; yes → `(formula) * 2`. Pending crit cleared afterwards. |

## Chat render hook (init)

```
hook = game.release.generation >= 13 ? "renderChatMessageHTML" : "renderChatMessage"
Hooks.on(hook, (message, html) => {
  const root = html instanceof HTMLElement ? html : html[0];
  root.querySelectorAll('.qq-card-btn[data-action="rollFumble"]').forEach(btn =>
    btn.addEventListener("click", async () => rollFumble(await fromUuid(btn.dataset.actorUuid))));
});
```

`rollFumble(actor)` is the module-level function the sheet's Fumble button also calls.

## Card markup

### Attack card additions
```html
<!-- natural 20 -->
<div class="qq-card-badge qq-crit">{{QQ.Roll.Critical}}</div>
<!-- natural 1 -->
<div class="qq-card-badge qq-fumble">{{QQ.Roll.FumbleBadge}}</div>
<button type="button" class="qq-card-btn" data-action="rollFumble" data-actor-uuid="{uuid}">{{QQ.Roll.RollFumble}}</button>
```
Both are appended after the existing hint inside the flavor; the flavor stays the card body.

### Ace card
```html
<div class="qq-card qq-card-ace">
  <div class="qq-card-title">{{QQ.Ace.Played}}: {ace.name}</div>
  <div class="qq-card-body">{ace.trigger}</div>
  <div class="qq-card-foot">{{QQ.Ace.OncePerSession}}</div>
</div>
```

### Recovery card (Treat Wounds)
```html
<div class="qq-card qq-card-recover">
  <div class="qq-card-title">{{QQ.Recover.TreatTitle}}</div>
  <div class="qq-card-body">{{QQ.Recover.TreatBody}}</div>   <!-- "{from} → {to} Life (half of {missing} missing, rounded up)" -->
  <div class="qq-card-foot">{{QQ.Recover.OncePerFight}}</div>
</div>
```

### Potion: a normal `postRoll` card with flavor `{{QQ.Recover.PotionTitle}}` and hint
`{{QQ.Recover.PotionBody}}` ("+{heal} Life ({from} → {to}) · this costs your turn").

### Weapon usage card
```html
<div class="qq-card qq-card-weapon">
  <div class="qq-card-title">{name}</div>
  <div class="qq-card-meta">{die}+{STAT} · {type} · {reach}</div>
  <div class="qq-card-body">{{QQ.Flavor.<dtype>}}</div>
</div>
```

## Tooltips

Every `input`, `select`, `button`, `label` and `.qq-lbl`/`.qq-boxlbl` on both sheets carries
`title="{{localize 'QQ.Tip.<Key>'}}"`. Full key list in [i18n-keys.md](i18n-keys.md).

## Notices (no card)

`ui.notifications.info` with `QQ.Recover.NothingToTreat` or `QQ.Recover.AlreadyTreated`.
