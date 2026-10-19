# QUICKQUEST — Product Backlog

## North Star
**The sheet replaces the rulebook.** Players arrive knowing nothing and will not read
the books. Every rule must surface exactly where and when it's needed: on the button,
in the tooltip, in the chat card. If a player ever has to ask "how does X work?", that's
a bug in the UI, not in the player.

## UX Laws (every feature must pass all four)
1. **One click from the sheet.** Any action a player takes in play is at most one click away.
2. **Every number explains itself.** Hover anything → one plain-English sentence of rule.
3. **Chat cards teach.** Every roll posts the relevant rule with the result ("hits if ≥ Defense · nat 20 doubles").
4. **Defaults are always correct.** A player who never configures anything plays correctly.

## Non-Goals (agents: never implement these)
- Numeric modifiers to attack rolls — from items, features, anything. Advantage/disadvantage is the only roll modifier in this game.
- Auto-expiring effect engines / duration tracking. Checkboxes humans untick.
- XP, levels, advancement. Treasure and Aces are the progression.
- Automating GM judgment (damage-type halving/doubling, opportunity attacks, range enforcement). Chat reminds; humans rule.

---

## v0.2 — Content ships with the system  `[mostly built, unmerged]`
| # | Item | Size | Notes |
|---|------|------|-------|
| 2.1 | Merge compendium packs branch: Bestiary (11), Heroes (6), Sand King adventure journal | S | Built with @foundryvtt/foundryvtt-cli; sources in packs/_source; zip exists |
| 2.2 | Bundle the 3 woodcut tokens in assets/tokens, pre-wired on pack actors | S | done in same branch |
| 2.3 | docs/ folder: rulebook.md + treasury.md into the repo (source of truth for agents) | S | currently the rules exist only outside the repo |
| 2.4 | Release flow: ship v0.2.0 (zip + system.json assets) | S | manual gh release; exclude _source/node_modules from zip |

## v0.3 — The sheet teaches magic
| # | Item | Size | Acceptance criteria |
|---|------|------|---------------------|
| 3.1 | SPELLS (12) + CANTRIPS (8) as data constants with cost/range/effect text | S | single source in quickquest.mjs; names/costs match docs/rulebook.md exactly |
| 3.2 | Hero sheet: cantrip `<select>`, two spell slot `<select>`s replacing free text | M | schema fields cantrip/spell1/spell2; old text fields migrated or dropped cleanly |
| 3.3 | **Cast button** per slot: checks MP → deducts → chat card (name, range, effect, MP left) | M | insufficient MP → DialogV2 offers **channeling** (2 Life per missing MP); card notes "channeled"; cantrips cast free |
| 3.4 | Ace awareness: wizard at 0 MP → Final Word row glows + tooltip "your Ace is ready" | S | pure CSS/state, no automation of the Ace itself |
| 3.5 | Mana crystal as a sheet button on gear? NO — keep as GM narration | — | explicitly rejected; GM hands MP back verbally |

## v0.4 — Zero-reading character sheet  `[the UX milestone]`
| # | Item | Size | Acceptance criteria |
|---|------|------|---------------------|
| 4.1 | **Guided character creation wizard** (dialog on new hero): point-buy with live "X of 10 points" counter → race picker (shows trait) → profession picker (auto-fills move, Ace, starting weapons, armor, gear, gold, MP) → cantrip picker → name → done | L | a person who has never seen a TTRPG produces a legal hero in under 3 minutes with zero typing except the name |
| 4.2 | Tooltips on every field: stats ("4–5 = advantage on checks"), Life ("0 = down, not dead"), MP ("comes back from crystals, places of power, or your own blood"), Defense, Raging, each weapon column | M | hover any element → one sentence; text sourced from rulebook |
| 4.3 | **Ace as a real button**: shows name + trigger condition, posts a dramatic chat card when played, auto-ticks "used", greys out | M | per-profession trigger text; un-tick only by GM/manual |
| 4.4 | Shift-click = advantage, Ctrl-click = disadvantage on any roll button (skips dialog) | S | dialog remains the default path for beginners |
| 4.5 | Recovery buttons: "Treat wounds" (heals half of missing Life, rounded up; posts card; once-per-fight checkbox beside it) and "Drink potion" (d6+2, card says it costs the turn) | M | math automated, timing manual per design law |
| 4.6 | Weapon name click → usage card ("Mace · d6+STR · bludgeoning · touching — skeletons hate this") | S | flavor strings per damage type |
| 4.7 | Fumble flow: attack roll result of nat 1 highlights a "Roll Fumble d6" prompt on the chat card; nat 20 card shouts "CRITICAL — double the damage roll" and damage button offers ×2 | M | detection + prompt only; GM still narrates |
| 4.8 | pt-BR localization (languages/pt-BR.json for all sheet strings + chat cards) | M | team is Brazilian; strings already centralized via i18n keys as prerequisite |

## v0.5 — Items without inventory hell
| # | Item | Size | Acceptance criteria |
|---|------|------|---------------------|
| 5.1 | Item documents, exactly two types: `weapon`, `relic` (magic item). Plain gear stays a text box forever | L | drag from compendium → appears on sheet; weapon rows become real items but sheet still shows max 3 with same columns |
| 5.2 | Treasury compendium: the 15 magic items, each implementing its ONE rule-break as a button/checkbox (Turtleshell "ignore one hit" button → chat card; Storm-in-a-Jar consumable → casts Summon Lightning once, deletes itself) | L | no item grants +to-hit; items that grant advantage say when |
| 5.3 | Loot flow: GM drags item to a hero sheet or to the map; card announces the find | M | |

## v0.6 — GM quality of life
| # | Item | Size |
|---|------|------|
| 6.1 | Monster "Trick" posts to chat on click (GM reminder mid-fight) | S |
| 6.2 | Bestiary art pass: replace core-icon placeholders with proper tokens (Forgotten Adventures, license-check before committing any) | M |
| 6.3 | Adventure packs #2 and #3: The Fallen Watchtower + Rats in the Walls as journal compendiums (content already written) | M |
| 6.4 | Party overview bar for the GM: all heroes' Life/MP/Ace-used at a glance | M |
| 6.5 | GitHub Action: compile packs + build release zip on tag (kill the manual zip) | S |

## Icebox (discuss before building)
- Character "scars" field (sacrifice/death rule leaves marks worth remembering)
- Distance helper: TOUCHING/NEARBY/FAR buttons that whisper reach reminders
- Soundboard integration; AI-generated scene art pipeline (keep out of public repo — Foundry AI-content policy)
- Public listing on the Foundry package directory (only if strangers should find it)

## Sequencing
**v0.2 → 0.3 → 0.4** is the order; 0.4.1 (creation wizard) is the single highest-UX-value
item in the whole backlog and the hardest — do it after the team has played once more,
so real confusion observed at the table shapes the wizard's steps. 0.5 only matters once
magic items actually enter play at the table. Ship small: one minor version per game-day month.
