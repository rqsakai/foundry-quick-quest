# Contract: `RACES` and `PROFESSIONS`

**Feature**: 003-creation-wizard | **Date**: 2026-10-19 | Source: `docs/rulebook.md`

Both live in a `HERO DATA` block in `module/quickquest.mjs`, frozen, with lookup helpers
`raceById(id)` / `professionById(id)` returning `null` for "" or unknown ids.

## RACES (6)

| id | name | trait |
|---|---|---|
| human | Human | Lucky. Once per session, reroll any die. |
| elf | Elf | Night vision. You see in the dark as if it were dim light. |
| dwarf | Dwarf | Stone sense. You know when rock is unstable, hollow, or hiding a door. |
| halfling | Halfling | Small and quick. Hide behind almost anything; squeeze through gaps others can't. |
| orc | Orc | Fierce. Once per fight, add +2 to one damage roll. |
| gnome | Gnome | Small-speech. Talk with animals no bigger than a dog. |

## PROFESSIONS (5)

| id | name | move | caster | spellPicks | fixedSpell |
|---|---|---|---|---|---|
| warrior | Warrior | Guard. When an attack would hit someone next to you, take it instead. | false | 0 | — |
| barbarian | Barbarian | Rage. Once per fight: +2 damage, −2 Defense for the rest of it. | false | 0 | — |
| rogue | Rogue | Sneak Attack. Attacking someone who hasn't noticed you: 2d20 take the better, +2 damage. | false | 0 | — |
| wizard | Wizard | Magic Points = INT × 3. Knows two spells. | true | 2 | — |
| healer | Healer | Magic Points = INT × 3. Knows Healing Hands + one more. | true | 1 | healing-hands |

### Aces

| id | ace.name | ace.trigger | ace.effect |
|---|---|---|---|
| warrior | Unbreakable | you drop to 0 Life | You don't fall. You stay standing at 1 Life, and nothing can take you below 1 until the fight is over. When it ends, so do you — you collapse and need treating like anyone else. |
| barbarian | Blood Frenzy | you're at half Life or less | For the rest of the fight, every attack of yours that lands rolls damage twice and takes the higher. You also take double damage from everything. There is no calling it off. |
| rogue | The Opening | you can see the enemy and they haven't seen you move | You've been waiting the whole fight. Your attack hits automatically and counts as a critical — double damage, plus your Sneak Attack bonus. No roll. You just say where the dagger goes. |
| wizard | Final Word | your Magic Points are at 0 | Empty, exhausted, and still standing. Cast any spell you know, for free, at double effect — double damage, double healing, double duration. |
| healer | Second Breath | at least one ally is at 0 Life | Every ally you can see gets back on their feet and recovers half their missing Life. Costs no Magic Points. |

### Kits

| id | weapons (name · die · stat · dtype · reach) | armor | gear | gold |
|---|---|---|---|---|
| warrior | Sword · d6 · str · cutting · touching | 3 (chainmail 2 + shield 1) | Shield, chainmail | 20 |
| barbarian | Greataxe · d8 · str · cutting · touching | 1 (leather) | Leather armor | 10 |
| rogue | Dagger · d4 · agi · cutting · thrown nearby; Dagger · d4 · agi · cutting · thrown nearby; Bow · d6 · agi · piercing · far | 1 (leather) | Leather armor, lockpicks, rope (50 ft) | 15 |
| wizard | Staff · d4 · str · bludgeoning · touching | 0 (clothes) | Clothes, spellbook | 10 |
| healer | Mace · d6 · str · bludgeoning · touching | 1 (leather) | Leather armor, bandages (3 treatments) | 15 |

## Rules

1. Exactly 6 and 5; init throws otherwise.
2. Ids never change once a release ships; text may.
3. Text is the rulebook's wording; edit `docs/rulebook.md` first.
