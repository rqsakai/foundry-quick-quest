# Tasks: Portuguese (Brazil) Localization

**Input**: Design documents from `/specs/005-pt-br-localization/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/i18n-keys.md,
quickstart.md

**Tests**: No automated tests (constitution). Verification is the quickstart on the live server
plus the key-parity one-liner run locally.

**Organization**: Grouped by user story. US1 (centralize strings) is the prerequisite for US2
(pt-BR file); US3 (mixed languages) is verification only.

## Format: `[ID] [P?] [Story] Description`

## Path Conventions

Repository root: `languages/`, `templates/`, `module/quickquest.mjs`, `styles/quickquest.css`,
`system.json`, `docs/`, `README.md`, `CLAUDE.md`.

---

## Phase 1: Setup

- [X] T001 Restructure `languages/en.json`: keep `TYPES.Actor` and `QQ.Magic` as they are and add
      the groups `QQ.Sheet`, `QQ.Stat`, `QQ.Weapon` (with nested `Type` and `Reach` objects keyed
      by stored values, including the key `"thrown nearby"`), `QQ.Range`, `QQ.Roll`, `QQ.Fumble`,
      `QQ.Monster` with exactly the keys and English values in contracts/i18n-keys.md.

---

## Phase 2: Foundational

No blocking infrastructure beyond T001.

**Checkpoint**: `python3 -c "import json;json.load(open('languages/en.json'))"` succeeds.

---

## Phase 3: User Story 1 - Every string on the sheet has a home (Priority: P1) 🎯 MVP

**Goal**: No user-visible literal remains in templates or code; English output is identical.

**Independent Test**: quickstart step 1 plus the template grep in the quickstart prerequisites
printing nothing.

### Implementation for User Story 1

- [X] T002 [P] [US1] In `templates/hero-sheet.hbs` replace every literal with `{{localize}}`:
      name placeholder → `QQ.Sheet.HeroName`; Race/Profession labels; stat button text →
      `{{localize (concat "QQ.Stat." key)}}` and its `title` → `{{localize "QQ.Sheet.CheckTip"
      stat=(localize (concat "QQ.Stat." key))}}`; Life/Magic/Defense/armor; the Attack, Raging,
      Bonus dmg, Fumble controls; weapon header cells and the option labels for type and reach
      (`QQ.Weapon.Type.*`, `QQ.Weapon.Reach.*`; dice option labels stay literal) and the
      `title="Roll damage"` → `QQ.Weapon.RollDamage`, weapon name placeholder →
      `QQ.Weapon.EmptyName`; Ace box label, placeholder and checkbox; trait/move box label and
      placeholders; "Spells & cantrip" → `QQ.Sheet.Spells`; gear box label, placeholder, Gold,
      Silver; footer → `QQ.Sheet.HeroFooter`.
- [X] T003 [P] [US1] In `templates/monster-sheet.hbs` replace: name placeholder →
      `QQ.Sheet.MonsterName`; Life/Defense; Attack button → `QQ.Sheet.Attack`; damage type
      placeholder → `QQ.Monster.DamageType`; damage button title → `QQ.Weapon.RollDamage` and text
      → `QQ.Monster.Damage`; Trick label and placeholder; Notes; footer → `QQ.Monster.Footer`.
- [X] T004 [US1] In `module/quickquest.mjs`: turn `ATTACK_HINT` and `CHECK_HINT` into functions
      `attackHint()` / `checkHint()` that localize `QQ.Roll.AttackHint` / `QQ.Roll.CheckHint`
      at call time (constants evaluate before i18n is ready); in `pickMode()` localize the three
      button labels (`QQ.Roll.Disadvantage/Normal/Advantage`); in `#onRollCheck` build the title
      with `game.i18n.format("QQ.Roll.Check", { stat: game.i18n.localize("QQ.Stat." + stat) })`
      and suffix ` ${localize("QQ.Roll.AdvStat")}`; in both `#onRollAttack` handlers use
      `QQ.Roll.AttackTitle` / `QQ.Roll.MonsterAttackTitle`, `QQ.Roll.Attack`, `QQ.Roll.Adv`,
      `QQ.Roll.Dis`; in hero `#onRollDamage` use `QQ.Roll.Damage` with `{name}` (fallback
      `QQ.Roll.Weapon`), `QQ.Stat.<stat>` for the stat label, `QQ.Roll.Rage`, `QQ.Roll.Bonus`
      with the pre-signed bonus, and localize `w.dtype` / `w.reach` via `QQ.Weapon.Type.<v>` /
      `QQ.Weapon.Reach.<v>`; in `#onRollFumble` build the six entries from `QQ.Fumble.1`…`6`
      joined by ` · ` under `QQ.Fumble.Title`; monster `#onRollDamage` title →
      `QQ.Roll.DamageMonster`; `spellCardHtml` range → `QQ.Range.<range>`; sheet registration
      labels → `QQ.Sheet.HeroSheet` / `QQ.Sheet.MonsterSheet` (these are localized by Foundry
      when given a key string).
- [X] T005 [US1] Run the template grep from quickstart.md prerequisites; fix any remaining
      literal. Run `node --check module/quickquest.mjs`.

**Checkpoint**: English output unchanged; zero literals in templates.

---

## Phase 4: User Story 2 - The Brazilian table plays in Portuguese (Priority: P1)

**Goal**: pt-BR file with full parity, registered in `system.json`, layout holds.

**Independent Test**: quickstart steps 2–6 and the parity one-liner printing `[]`.

### Implementation for User Story 2

- [X] T006 [P] [US2] Create `docs/glossary.md`: table of game terms → pt-BR (draft, owner to
      approve): Hero Herói · Monster Monstro · Life Vida · Magic/MP Magia / PM · Defense Defesa ·
      Check Teste · Attack Ataque · Damage Dano · Advantage Vantagem · Disadvantage Desvantagem ·
      Raging Fúria · Fumble Falha · Ace Ace (keep) · Trait Traço · Move Manobra · Profession
      Profissão · Race Raça · Spell Magia · Cantrip Encanto · Channeling Canalizar · Trick
      Truque · Gear Equipamento · Gold/Silver Ouro/Prata · touching/nearby/far toque/perto/longe
      · bludgeoning/cutting/piercing impacto/corte/perfuração · thrown arremesso · Easy/Tricky/Hard
      Fácil/Complicado/Difícil · dice names keep · QuickQuest keep. Note that strings are a draft
      until the owner signs off.
- [X] T007 [P] [US2] Create `languages/pt-BR.json` with the identical key set to `en.json`
      (including `TYPES.Actor` → Herói/Monstro and all `QQ.Magic.*`), values following the
      glossary.
- [X] T008 [P] [US2] In `system.json` `languages`, add `{ "lang": "pt-BR", "name": "Português
      (Brasil)", "path": "languages/pt-BR.json" }`. Do not change `version`.
- [X] T009 [P] [US2] In `styles/quickquest.css`: `.qq-wrow` grid columns `1fr 56px 62px 92px
      100px 34px`; `.qq-slot` first column `64px`.
- [X] T010 [US2] Run the parity one-liner (expects `[]`) and `python3 -c "import
      json;json.load(open('languages/pt-BR.json'))"`.

**Checkpoint**: Both files valid, parity exact, system registers the language.

---

## Phase 5: User Story 3 - Mixed-language tables still work (Priority: P2)

**Goal**: Confirm card behaviour with two client languages; no code expected.

- [ ] T011 [US3] Verify on the live server: quickstart steps 7 and 8. If step 8 shows a key path
      instead of English, report it (Foundry's fallback should prevent it).

---

## Phase 6: Polish & Cross-Cutting

- [X] T012 [P] In `README.md`, add step 16: switch the client to Português (Brasil), open both
      sheets and roll each card type; everything in pt-BR, nothing clipped; back to English looks
      as before.
- [X] T013 [P] In `CLAUDE.md`: in Architecture, `languages/` now holds en + pt-BR with full key
      parity; in "Before you change anything", add "New string? Key in `languages/en.json` AND
      `languages/pt-BR.json`, `{{localize}}` / `game.i18n`"; in "Shipping a release", add the
      parity one-liner before building the zip; in Hard rules → Other sheet rules, note the
      glossary.
- [ ] T014 Verify on the live server: quickstart steps 1–6 (English unchanged, then pt-BR
      sheets, cards, dialogs, actor types).

---

## Dependencies & Execution Order

- T001 → (T002 ∥ T003 ∥ T004) → T005 → (T006 ∥ T007 ∥ T008 ∥ T009) → T010 → T011/T014 on server.
- T012 ∥ T013 any time after T005.

## Implementation Strategy

MVP = Phase 3 (centralize). Deploy and confirm English is unchanged before adding the pt-BR
file, so a regression is attributable to the move, not the translation.
