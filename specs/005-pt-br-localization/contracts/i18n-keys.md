# Contract: `QQ.*` Localization Keys

**Feature**: 005-pt-br-localization | **Date**: 2026-10-19

Every key below exists in both `languages/en.json` and `languages/pt-BR.json`. English values are
authoritative; they reproduce the current sheet text exactly unless noted. `QQ.Magic.*` (23 keys)
is unchanged from feature 002 and omitted here.

## QQ.Sheet

| Key | English | Used in |
|---|---|---|
| HeroName | Hero name | hero name placeholder |
| MonsterName | Monster name | monster name placeholder |
| Race | Race | header |
| Profession | Profession | header |
| Life | Life | both sheets |
| Magic | Magic | hero pool |
| Defense | Defense | both sheets |
| Armor | armor | hero pool suffix |
| Attack | ⚔ Attack d20 | both attack buttons |
| Raging | Raging +2 | checkbox |
| BonusDmg | Bonus dmg | label |
| Fumble | Fumble d6 | button |
| CheckTip | Roll a {stat} check (advantage at 4+) | stat button tooltip |
| Ace | Ace — once per session | box label |
| AcePlaceholder | Unbreakable, Final Word… | input placeholder |
| AceUsed | Played this session | checkbox |
| TraitMove | Race trait & profession move | box label |
| Trait | Trait | placeholder |
| Move | Move | placeholder |
| Spells | Spells & cantrip | box label |
| Gear | Gear & coin | box label |
| GearPlaceholder | Rope, torches… | placeholder |
| Gold | Gold | coin label |
| Silver | Silver | coin label |
| HeroFooter | Hit: d20 ≥ Defense · nat 20 double · stat 4–5 = advantage on checks · channel: 2 Life per missing MP, once per fight | hero footer |
| HeroSheet | QuickQuest — Hero | sheet registration label |
| MonsterSheet | QuickQuest — Monster | sheet registration label |

## QQ.Stat

| Key | English |
|---|---|
| str | STR |
| agi | AGI |
| con | CON |
| int | INT |

## QQ.Weapon

| Key | English |
|---|---|
| Weapon | Weapon |
| Die | Die |
| Stat | Stat |
| ColType | Type |
| ColReach | Reach |
| RollDamage | Roll damage |
| EmptyName | — |
| Type.bludgeoning | Bludg. |
| Type.cutting | Cutting |
| Type.piercing | Piercing |
| Reach.touching | Touching |
| Reach.thrown nearby | Thrown |
| Reach.far | Far |

## QQ.Range (spell ranges, feature 002 cards)

| Key | English |
|---|---|
| touching | touching |
| nearby | nearby |
| far | far |

## QQ.Roll

| Key | English | Notes |
|---|---|---|
| AttackTitle | Attack roll | hero adv/dis dialog title |
| MonsterAttackTitle | Monster attack | monster dialog title |
| Attack | Attack | card title |
| Check | {stat} check | card title, stat already localized |
| Damage | {name} — damage | hero damage card title |
| DamageMonster | Damage | monster damage card title |
| Weapon | Weapon | fallback weapon name |
| Advantage | Advantage | dialog button |
| Disadvantage | Disadvantage | dialog button |
| Normal | Normal | dialog button |
| AdvStat | — advantage (stat 4+) | check card suffix (leading space added in code) |
| Adv | — advantage | attack card suffix |
| Dis | — disadvantage | attack card suffix |
| Rage | rage +2 | damage parts |
| Bonus | bonus {bonus} | damage parts, bonus pre-signed |
| AttackHint | Hits if ≥ target's Defense · nat 20 = double damage · nat 1 = fumble (roll d6) | |
| CheckHint | Easy 8 · Tricky 12 · Hard 16 | |

## QQ.Fumble

| Key | English |
|---|---|
| Title | Fumble! |
| 1 | 1 weapon flies away |
| 2 | 2 you trip |
| 3 | 3 hit the scenery |
| 4 | 4 wide open, next hit on you lands |
| 5 | 5 something loud breaks |
| 6 | 6 perfect — wrong target |

## QQ.Monster

| Key | English |
|---|---|
| DamageType | damage type |
| Damage | 🎲 Damage |
| Trick | Trick — the one thing they'll remember |
| TrickPlaceholder | Runs when half the pack falls… |
| Notes | Notes |
| Footer | Regular monsters +1/+2 · bosses +3/+4 · tougher = more Life, never more Defense |

## Not keys (by decision)

Dice names `d4`…`d10`; "QuickQuest"; spell/cantrip `name` and `effect` (content in the constant).
