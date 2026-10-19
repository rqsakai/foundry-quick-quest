# Quickstart: Validating The Sheet Teaches Magic

**Feature**: 002-spell-casting | **Date**: 2026-10-19

Manual validation on the live server; there is no automated runner (constitution, Development
Workflow). Run top to bottom and stop at the first failure.

## Prerequisites

- Changes committed on `main` and deployed: `./deploy.sh "feat: spell casting"` (placeholders
  in `deploy.sh` filled, or `git pull` by hand on the server).
- No `system.json` change in this feature, so a browser **F5** is enough; no Return to Setup.
- A test world with one hero. Set INT 2 (MP max 6), CON 2 (Life max 11), Life 11, MP 6.
- F12 console open; the only expected QuickQuest warning is the placeholder notice while
  `MAGIC_IS_PLACEHOLDER` is `true`.

## Steps

| # | Action | Expected |
|---|---|---|
| 1 | Reload; open the hero sheet | No red errors. Magic box shows Cantrip, Spell 1, Spell 2 selects, a Channeled checkbox, and (while placeholders) the italic placeholder hint. Old free-text spells box is gone. |
| 2 | Open each select | Cantrip: blank + 8 entries. Spells: blank + 12 entries, each labelled with its MP cost. |
| 3 | Pick a cantrip and two spells (one costing 3, one costing 4); close and reopen sheet | Choices persist. A Cast button sits beside each filled slot. |
| 4 | Click Cast on the cantrip 3 times | 3 cards with name, range, effect, "Cantrip, free". MP still 6, Life still 11. |
| 5 | Click Cast on the 3-MP spell | MP reads 3. Card shows name, range, cost 3 MP, effect, "MP left: 3 / 6". |
| 6 | Click Cast on the 3-MP spell again | MP reads 0. Card shows "MP left: 0 / 6". Ace box now highlighted; hover shows the Ace-ready tooltip. |
| 7 | Click Cast on the 4-MP spell (MP 0, Life 11) | Dialog: "4 MP short, channel 8 Life?" Click Cancel → nothing changes. |
| 8 | Click Cast again, click Channel | Life reads 3, MP reads 0, Channeled box ticked, card carries the "Channeled — 8 Life" badge. |
| 9 | Click Cast on the 4-MP spell again | Dialog: already channeled this fight. OK → nothing changes. |
| 10 | Untick Channeled by hand; Cast the 4-MP spell again (Life 3) | Dialog: cannot survive the cost (8 Life vs 3). OK → nothing changes. |
| 11 | Set MP to 9 by hand (above max 6), Cast the 3-MP spell | MP reads 3 (clamped to max before deducting), card "MP left: 3 / 6". |
| 12 | Tick Ace "Played this session" with MP 0 | Ace highlight disappears. Untick → returns. Set MP > 0 → disappears. |
| 13 | Open a monster sheet | Unchanged; no magic UI. |
| 14 | Roll an attack and a check from the hero | Identical to before: `1d20` / `2d20kh` / `2d20kl` only, no modifiers. |
| 15 | Before release only | `MAGIC_IS_PLACEHOLDER` is `false`, no `TODO` in SPELLS/CANTRIPS, hint and console warning gone, 20 entries match `docs/rulebook.md`. |

## Release

When step 15 passes: bump `system.json` and README header to 0.3.0, commit, tag from that
commit, build the zip with the exclusion list in `CLAUDE.md`, publish `system.json` +
`quickquest.zip`. Players then need Return to Setup → relaunch (because `system.json` changed).

## References

- Behaviour and card structure: [contracts/sheet-actions.md](contracts/sheet-actions.md)
- Constant shape and placeholder rules: [contracts/spell-data.md](contracts/spell-data.md)
- Fields and state machine: [data-model.md](data-model.md)
