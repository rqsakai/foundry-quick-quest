# Contract: New `QQ.*` keys for feature 004

Added to both `languages/en.json` and `languages/pt-BR.json`.

## QQ.Tip (tooltips)

| Key | English |
|---|---|
| Name | Your hero's name — the table will shout it |
| Race | Where you come from; gives your trait |
| Profession | What you do; gives your move, Ace and kit |
| Stat | 1 to 5. At 4 or 5 you roll checks with advantage |
| Life | 0 Life = down, not dead. Max is 7 + CON × 2 |
| MP | Spend to cast. Max is INT × 3. Comes back from crystals, places of power, or your own blood |
| Defense | 10 + armor. An attack hits you if its d20 is this or higher |
| Armor | 0 to 4. Each point is +1 Defense |
| Attack | Roll d20; hits if it meets the target's Defense. Nothing ever adds to this roll |
| Raging | +2 damage while ticked. Untick when the rage ends |
| Bonus | Extra flat damage from a blessing or a ruling. Clear it by hand |
| Fumble | Rolled a natural 1? Roll this d6 and read the result |
| WeaponName | What you swing. 📜 posts a usage card |
| WeaponDie | Damage die: d4 light, d6 standard, d8 heavy |
| WeaponStat | Damage adds STR for heavy weapons, AGI for quick or thrown ones |
| WeaponType | Bludgeoning smashes · cutting bleeds · piercing finds gaps. The GM may halve or double |
| WeaponReach | Touching = next to you · thrown = nearby · far = across the room |
| WeaponRoll | Roll damage: die + stat (+2 raging, + bonus) |
| WeaponCard | Post how this weapon is used |
| Ace | Once per session, your signature moment. Play it when the trigger happens |
| AceName | Name your Ace |
| AceTrigger | When may you play it? e.g. "when an ally falls" |
| AceUsed | Ticked when played. Untick at the start of the next session |
| Trait | Your race's one special thing |
| Move | Your profession's one special move |
| Gear | Everything you carry that is not a weapon |
| Gold | Coins: 1 gold = 10 silver |
| Silver | Small change |
| Treat | Heal half of your missing Life, rounded up. Once per fight |
| Treated | Ticked after treating. Untick when the fight ends |
| Potion | Drink: heal d6+2. Costs your turn |
| MonsterName | What the players will call it |
| MonsterLife | Tougher monsters get more Life, never more Defense |
| MonsterDefense | What the d20 must meet. 11–13 for most monsters |
| MonsterDie | Damage die; d10 for the nastiest |
| MonsterBonus | Flat damage: +1/+2 regular, +3/+4 boss |
| MonsterDtype | How it hurts: claws cut, clubs smash, fangs pierce |
| Trick | The one thing the table will remember about this monster |
| Notes | Anything else |

## QQ.Roll additions

| Key | English |
|---|---|
| Critical | CRITICAL — double the damage roll |
| FumbleBadge | FUMBLE |
| RollFumble | Roll Fumble d6 |
| CritPromptTitle | Critical hit! |
| CritPromptBody | Double this damage roll? |
| Double | Double it |
| NormalDamage | Normal damage |
| CritTag | CRITICAL ×2 |

## QQ.Ace

| Key | English |
|---|---|
| Play | Play Ace |
| SetFirst | Set your Ace |
| PlayedTip | Played this session — untick to reset |
| Played | Ace played |
| OncePerSession | Once per session. The GM says yes. |

## QQ.Recover

| Key | English |
|---|---|
| Treat | Treat wounds |
| Treated | Treated this fight |
| Potion | Drink potion |
| TreatTitle | Wounds treated |
| TreatBody | {from} → {to} Life (half of {missing} missing, rounded up) |
| OncePerFight | Once per fight — untick when it ends |
| NothingToTreat | Nothing to treat — Life is full |
| AlreadyTreated | Already treated this fight |
| PotionTitle | Potion |
| PotionBody | +{heal} Life ({from} → {to}) · this costs your turn |

## QQ.Flavor (weapon usage card, by damage type)

| Key | English |
|---|---|
| bludgeoning | Smashes bone and shield — skeletons hate this |
| cutting | Bleeds what has blood — fleshy things fear it |
| piercing | Finds the gap in armor and scale |
