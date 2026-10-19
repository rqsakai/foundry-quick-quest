# Quickstart: Validating Guided Character Creation

**Feature**: 003-creation-wizard | **Date**: 2026-10-19

## Prerequisites

Deployed, F5 (no `system.json` change). Parity one-liner prints `[]`.

## Steps

| # | Action | Expected |
|---|---|---|
| 1 | Create Actor → Hero | Sheet opens and the wizard opens on step 1 with STR 3 · AGI 3 · CON 2 · INT 2, counter "6 of 6 points spent", Next enabled. |
| 2 | Press − on STR | STR 2, counter "5 of 6", Next disabled with the hint. Press + on INT → INT 3, Next enabled. Try + beyond 5 or when 6 spent → button disabled. |
| 3 | Next → race | Six cards; Human pre-selected; each shows its trait. Pick Elf. |
| 4 | Next → profession | Five cards with move, Ace line, kit line, MP line. Pick Wizard. |
| 5 | Next → magic | Cantrip cards (Spark selected) and two spell selects defaulting to Fireball and Summon Lightning. Set both to Fireball → inline "pick two different spells", Next disabled. Fix it. |
| 6 | Next → name | Summary shows Life 11, MP 9 (INT 3), Defense 10, Staff d4+STR, Fireball, Summon Lightning, Spark. Leave name blank, Finish. |
| 7 | Sheet | Name "Wizard", Race select Elf, Profession select Wizard, trait and move read-only, Ace box reads "Final Word — plays when your Magic Points are at 0", Play Ace enabled, MP 9/9, Defense 10, weapon row Staff, gear "Clothes, spellbook", gold 10, cantrip Spark, spells Fireball + Summon Lightning. |
| 8 | Create another Hero, press Next ×4 and Finish | Human Warrior "Warrior": Life 11, MP 0/0, Defense 13, Sword d6 STR cutting, gear "Shield, chainmail", gold 20, cantrip Spark, no spells. |
| 9 | Tick Raging on that warrior | Defense reads 11; untick → 13. |
| 10 | Create a Hero and close the wizard with × on step 2 | Hero exists with sheet defaults (stats 2/2/2/2, empty selects); nothing half-written. |
| 11 | On the Warrior, click Rebuild in the header | Wizard opens pre-filled with its current values; change profession to Healer, Finish → weapon row Mace, armor 1, MP 6/6 (INT 2), Healing Hands fixed + Bless; gold, gear text, Life and MP edits made by hand before are kept (rebuild never resets them). |
| 12 | Set MP 0 on the Wizard hero | Ace box glows. On the Warrior MP is 0 but no glow (Final Word is Wizard-only). |
| 13 | Play Ace on the Wizard | Card: "Ace played: Final Word", trigger, effect; used ticked; button disabled. |
| 14 | pt-BR client: repeat 1–7 | Wizard chrome in Portuguese; race/profession/Ace text as written in the constants. |
| 15 | README steps 1–22 regression | All pass (note: trait/move/Ace inputs are gone; race/profession are selects). |

## References

[contracts/wizard-ui.md](contracts/wizard-ui.md), [contracts/hero-data.md](contracts/hero-data.md), [data-model.md](data-model.md)
