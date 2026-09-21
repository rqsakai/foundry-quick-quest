# QuickQuest — Foundry VTT system v0.1.0

Four stats, one die, no wrong answers.

## Install
1. Copy this whole `quickquest/` folder into your Foundry user data: `Data/systems/quickquest/`
   (the folder containing `system.json` must be named `quickquest`)
2. Restart the Foundry server.
3. Create a new World and pick **QuickQuest** as its game system.

## Test checklist (in order — stop at the first failure and report it)
1. World loads with no red errors in the F12 console.
2. Create Actor -> type "Hero" -> sheet opens with stats, Life, Magic, Defense.
3. Set CON to 4 -> Life max shows 15. Set armor to 2 -> Defense shows 12.
4. Click a stat button (e.g. STR at 5) -> chat shows a check, with advantage at 4+.
5. Click "Attack d20" -> advantage dialog -> roll lands in chat.
6. Fill weapon row 1 (d8, STR), click its dice button -> damage = d8 + STR in chat.
7. Tick "Raging" -> damage roll now includes +2.
8. Create a "Monster" actor -> set die/bonus -> Attack and Damage buttons work.
9. Drop hero + monster tokens in a scene, add to Combat Tracker, "roll all"
   -> heroes sort above monsters automatically (players go first).
10. Token bars: hero bar1 = life, bar2 = mp (configure once on the prototype token).

## v0.1 scope — deliberately not included yet
- Items/compendia (weapons live as 3 rows on the sheet)
- Automatic crit doubling (chat reminds you on the roll)
- Bless/effects automation (use the bonus field + checkboxes, untick by hand)
- Portrait editing from the sheet (set token art via token config)

Compatibility: minimum v12, verified v14. If your server is v14, it will run
