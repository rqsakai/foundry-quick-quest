# Quickstart: Validating The Sheet Teaches Combat

**Feature**: 004-sheet-teaches | **Date**: 2026-10-19

## Prerequisites

- Deployed (`./deploy.sh`), F5. `system.json` unchanged → no Return to Setup.
- Parity one-liner (CLAUDE.md "Shipping a release" step 3) prints `[]`.
- Hero: CON 2 (Life max 11), one weapon row filled (d8, STR, cutting, touching, "Mace").

## Steps

| # | Action | Expected |
|---|---|---|
| 1 | Hover every input, select, button and label on the hero sheet, then the monster sheet | Each shows one plain sentence; none is blank or a key path. |
| 2 | Click Attack d20 repeatedly until a natural 20 | Card carries "CRITICAL — double the damage roll". |
| 3 | Click the weapon's 🎲 | Dialog "Critical hit! Double this damage roll?" → Double → card formula `(1d8 + 2) * 2` style, tag "CRITICAL ×2". |
| 4 | Click 🎲 again | No dialog; normal damage. |
| 5 | Attack until a natural 1 | Card carries "FUMBLE" and a "Roll Fumble d6" button; click it → fumble table card from the same hero. |
| 6 | Shift-click Attack | Advantage card, no dialog. Ctrl-click → disadvantage, no dialog. Plain click → dialog. |
| 7 | Shift-click a stat at 2 | Check rolls with advantage. Ctrl-click a stat at 5 → disadvantage. |
| 8 | Set Life 5/11, click Treat wounds | Life 8, "Treated this fight" ticked, card "5 → 8 Life (half of 6 missing, rounded up)". Click again → notice "Already treated". Untick, set Life 11, click → notice "Nothing to treat". |
| 9 | Set Life 9/11, click Drink potion | Roll card 1d6+2; Life rises by the roll but caps at 11; card says it costs your turn. |
| 10 | Ace: empty name | Button reads "Set your Ace", disabled. Type a name and trigger → button "Play Ace" enabled. |
| 11 | Click Play Ace | Card with name and trigger; "Played this session" ticked; button disabled with tooltip. Untick → enabled again. |
| 12 | Click 📜 on the weapon | Card "Mace · d8+STR · Cutting · Touching — Bleeds what has blood…". |
| 13 | Monster: attack to a 20 and a 1; 🎲 Damage after the 20 | Same badges, fumble button works for the monster, ×2 prompt on monster damage. |
| 14 | Switch client to pt-BR, repeat 1, 3, 5, 8, 11, 12 | All new text in Portuguese. |
| 15 | Regression: README steps 1–16 | All pass. |

## References

- [contracts/sheet-actions.md](contracts/sheet-actions.md), [contracts/i18n-keys.md](contracts/i18n-keys.md), [data-model.md](data-model.md)
