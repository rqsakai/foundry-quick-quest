# Quickstart: Validating pt-BR Localization

**Feature**: 005-pt-br-localization | **Date**: 2026-10-19

## Prerequisites

- Deployed to the server (`./deploy.sh`). **`system.json` changed** (new language entry), so:
  Return to Setup → relaunch the world, then F5.
- Key parity, run locally before deploying (both must print nothing):

```bash
python3 -c "import json;a=json.load(open('languages/en.json'));b=json.load(open('languages/pt-BR.json'))
def k(d,p=''):
  return {p+x if not isinstance(v,dict) else None for x,v in d.items()}|{y for x,v in d.items() if isinstance(v,dict) for y in k(v,p+x+'.')}-{None}
print(sorted(k(a)^k(b)))"
grep -n '>[^<{]*[A-Za-z][^<{]*<\|placeholder="[^{]\|title="[^{]' templates/*.hbs | grep -v 'd[0-9]'
```

## Steps

| # | Action | Expected |
|---|---|---|
| 1 | English client: open hero and monster sheets, roll check, attack, damage, fumble, cast a spell | Every label, placeholder, tooltip, footer and card reads exactly as before the change. No `QQ.` text anywhere. |
| 2 | Client Settings → Language → Português (Brasil); reload | Setting is offered (system registered the file). |
| 3 | Open the hero sheet | Header, stat buttons (FOR AGI CON INT), pools, action row, weapon columns and options, Ace, trait, magic box, gear, footer all in pt-BR. No clipping at the default 660px width. |
| 4 | Open the monster sheet | All labels, placeholders, footer in pt-BR. |
| 5 | Roll a check, an attack (pick Vantagem), damage, fumble, cast a spell, trigger channel dialog | Dialog titles and buttons, card titles, hints, fumble table, spell card labels in pt-BR. Spell name/effect still as written in the constant. |
| 6 | Combat Tracker and Create Actor dialog | Actor types read Herói / Monstro. |
| 7 | Second client left on English while the first is pt-BR; first rolls an attack | Both see a well-formed card in Portuguese (roller's language); no blanks, no keys. |
| 8 | Temporarily delete one key from pt-BR.json, reload | That string shows in English, not as a key path. Restore the key. |
| 9 | Review `docs/glossary.md` against the sheets | Terms are used consistently (one word per concept). |

## References

- Key table: [contracts/i18n-keys.md](contracts/i18n-keys.md)
- Namespace rules: [data-model.md](data-model.md)
