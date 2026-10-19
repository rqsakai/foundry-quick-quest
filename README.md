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
11. Magic box: Cantrip select lists 8 entries, Spell 1 / Spell 2 list 12 with MP cost; pick
    one each, close and reopen the sheet -> choices persist, a Cast button sits beside each.
12. Hero INT 2 (MP 6): Cast a 3-MP spell -> MP reads 3 and the chat card shows name, range,
    cost, effect and "MP left: 3 / 6". Cast again -> MP 0, Ace box glows with a tooltip.
13. Cast the cantrip 3 times -> 3 cards, MP and Life unchanged.
14. Channeling: at MP 0 (Life 11) cast a 4-MP spell -> dialog offers 8 Life; Cancel changes
    nothing; Channel -> Life 3, MP 0, "Channeled this fight" ticked, card carries the badge.
    Cast again -> refused (already channeled). Untick the box, cast again at Life 3 ->
    refused (cannot survive the cost).
15. Before release: no "placeholder" hint in the magic box and no console warning about
    SPELLS/CANTRIPS; the 20 entries match docs/rulebook.md.
16. Client Settings -> Language -> Português (Brasil), reload: both sheets, every roll card,
    the adv/dis dialog and the Create Actor types read in pt-BR with nothing clipped. Switch
    back to English -> everything reads as in steps 1-15.

## Not included yet
- Items/compendia (weapons live as 3 rows on the sheet)
- Automatic crit doubling (chat reminds you on the roll)
- Bless/effects automation (use the bonus field + checkboxes, untick by hand)
- Portrait editing from the sheet (set token art via token config)

Compatibility: minimum v12, verified v14. If your server is v14, it will run
