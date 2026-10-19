# Tasks: The Sheet Teaches Combat

**Input**: Design documents from `/specs/004-sheet-teaches/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual (constitution). Server steps are listed per story and left for the owner.

**Organization**: By user story, spec priority order. Stories are independent after Phase 2;
US2 (crit/fumble) and US5 (modifier clicks) both touch the attack handlers, so they are
sequential in the same file.

## Format: `[ID] [P?] [Story] Description`

## Path Conventions

Repository root: `module/quickquest.mjs`, `templates/*.hbs`, `styles/quickquest.css`,
`languages/en.json`, `languages/pt-BR.json`, `README.md`, `CLAUDE.md`.

---

## Phase 1: Setup

- [X] T001 [P] Add every key from contracts/i18n-keys.md to `languages/en.json` (groups
      `QQ.Tip`, `QQ.Ace`, `QQ.Recover`, `QQ.Flavor`, additions to `QQ.Roll`).
- [X] T002 [P] Add the same keys with pt-BR values to `languages/pt-BR.json`, following
      `docs/glossary.md` (Ace stays "Ace"; Treat wounds "Tratar ferimentos"; Drink potion "Beber
      poção"; CRITICAL "CRÍTICO"; FUMBLE "FALHA").

---

## Phase 2: Foundational

- [X] T003 In `module/quickquest.mjs` `HeroData.defineSchema()`: add `trigger: new
      fields.StringField({ initial: "" })` inside `ace`, and `treated: new fields.BooleanField({
      initial: false })` at top level (data-model.md).
- [X] T004 In `module/quickquest.mjs` ROLL HELPERS: add `const PENDING_CRIT = new Set();`,
      `function keptD20(roll)` (first die's active result), `function pickModeFromEvent(event)`
      (shift → "adv", ctrl/meta → "dis", else null), module-level `async function
      rollFumble(actor)` (moved from the sheet handler; same card), and `function
      attackBadges(roll, actor)` returning the extra HTML for kept 20 (badge, `PENDING_CRIT.add`)
      or kept 1 (badge + `<button type="button" data-action="rollFumble"
      data-actor-uuid="${actor.uuid}">`), else "" and `PENDING_CRIT.delete`.
- [X] T005 In `module/quickquest.mjs` `Hooks.once("init")`: register the chat hook per
      contracts/sheet-actions.md (`renderChatMessageHTML` on generation ≥ 13 else
      `renderChatMessage`), binding `.qq-card [data-action="rollFumble"]` to
      `rollFumble(await fromUuid(uuid))`.
- [X] T006 [P] In `styles/quickquest.css`: `.qq-recover` row (flex, gap 8px, align center),
      `.qq-card button` (same letterpress button rules, 11px), `.qq-card-badge.qq-crit`
      (background `#7c3128`), `.qq-card-badge.qq-fumble` (background `#6b6155`), `.qq-ace-btn`
      (full width), weapon grid `grid-template-columns: 1fr 56px 62px 92px 100px 26px 34px`.

**Checkpoint**: module parses; sheets open unchanged.

---

## Phase 3: User Story 1 - Every number explains itself (Priority: P1) 🎯 MVP

**Goal**: Tooltip on every element of both sheets.

**Independent Test**: quickstart step 1.

- [X] T007 [P] [US1] In `templates/hero-sheet.hbs` add `title="{{localize 'QQ.Tip.<Key>'}}"` to:
      name input (Name), race/profession labels, each stat input (Stat; the button keeps
      `QQ.Sheet.CheckTip`), Life input and label, MP input and label, Defense label/value,
      armor input, Attack button (Attack), Raging label, Bonus label/input, Fumble button,
      weapon header cells and each row's name/die/stat/type/reach controls and 🎲 button
      (WeaponName/Die/Stat/Type/Reach/Roll), Ace box label (Ace), ace name input (AceName),
      ace used label (AceUsed), trait/move inputs, gear textarea, gold/silver inputs.
- [X] T008 [P] [US1] In `templates/monster-sheet.hbs` add titles: name (MonsterName), Life
      inputs/label (MonsterLife), Defense (MonsterDefense), die select (MonsterDie), bonus
      (MonsterBonus), dtype (MonsterDtype), Trick textarea/label (Trick), Notes (Notes).

**Checkpoint**: no element without a tooltip.

---

## Phase 4: User Story 2 - Crits and fumbles announce themselves (Priority: P1)

**Independent Test**: quickstart steps 2–5 and 13.

- [X] T009 [US2] In both `#onRollAttack` handlers: capture `const roll = await postRoll(...)`
      is not possible before posting badges, so restructure: evaluate `const roll = await new
      Roll(formula).evaluate()`, compute `badges = attackBadges(roll, this.actor)`, then
      `roll.toMessage({ speaker, flavor: flavor + badges })`. Extract this into a shared
      `postAttack(actor, mode)` helper used by hero and monster.
- [X] T010 [US2] In hero `#onRollDamage` and monster `#onRollDamage`: before rolling, if
      `PENDING_CRIT.has(this.actor.id)` → `DialogV2.confirm` with `QQ.Roll.CritPromptTitle/Body`,
      yes `QQ.Roll.Double`, no `QQ.Roll.NormalDamage`; on yes wrap `formula = \`(${formula}) *
      2\`` and prepend `t("QQ.Roll.CritTag")` to the parts; always `PENDING_CRIT.delete` after.
- [X] T011 [US2] Replace the sheet's `#onRollFumble` body with `return rollFumble(this.actor)`.

---

## Phase 5: User Story 3 - The Ace is a button (Priority: P2)

**Independent Test**: quickstart steps 10–11.

- [X] T012 [US3] In `templates/hero-sheet.hbs` Ace box: add `<input type="text"
      name="system.ace.trigger" placeholder="{{localize 'QQ.Sheet.AceTriggerPlaceholder'}}"
      title="{{localize 'QQ.Tip.AceTrigger'}}">` under the name, and a `<button type="button"
      class="qq-ace-btn" data-action="playAce" {{#unless system.ace.name}}disabled{{/unless}}
      {{#if system.ace.used}}disabled title="{{localize 'QQ.Ace.PlayedTip'}}"{{else}}
      title="{{system.ace.trigger}}"{{/if}}>` reading `QQ.Ace.SetFirst` when no name else
      `QQ.Ace.Play`. Add `QQ.Sheet.AceTriggerPlaceholder` ("when an ally falls…") to both files.
- [X] T013 [US3] In `module/quickquest.mjs` hero sheet: action `playAce` → if no name or used,
      return; `await this.actor.update({ "system.ace.used": true })`; `postCard` with the Ace
      card markup from contracts/sheet-actions.md.

---

## Phase 6: User Story 4 - Heal without maths (Priority: P2)

**Independent Test**: quickstart steps 8–9.

- [X] T014 [US4] In `templates/hero-sheet.hbs` add a `<section class="qq-recover">` after the
      action row: Treat wounds button (`data-action="treatWounds"`, title Tip.Treat), checkbox
      `system.treated` labelled `QQ.Recover.Treated` (title Tip.Treated), Drink potion button
      (`data-action="drinkPotion"`, title Tip.Potion).
- [X] T015 [US4] In `module/quickquest.mjs` hero sheet: `treatWounds` per data-model.md (two
      refusals via `ui.notifications.info`, else heal = ceil(missing/2), single `update` of
      `life.value` and `treated`, recovery card); `drinkPotion`: `const roll = await new
      Roll("1d6 + 2").evaluate()`, heal = min(total, missing), update, then `roll.toMessage` with
      flavor `QQ.Recover.PotionTitle` + hint `QQ.Recover.PotionBody`.

---

## Phase 7: User Story 5 - Faster rolls for the confident (Priority: P3)

**Independent Test**: quickstart steps 6–7.

- [X] T016 [US5] In `postAttack` callers (hero and monster `#onRollAttack`): `const mode =
      pickModeFromEvent(event) ?? await pickMode(title)`. In `#onRollCheck`: `const forced =
      pickModeFromEvent(event)`; formula = forced ? d20Formula(forced) : (adv ? "2d20kh" :
      "1d20"); label reflects the forced mode (`QQ.Roll.Adv` / `QQ.Roll.Dis`) or the stat rule.

---

## Phase 8: User Story 6 - The weapon tells you how to use it (Priority: P3)

**Independent Test**: quickstart step 12.

- [X] T017 [US6] In `templates/hero-sheet.hbs` weapon rows: add a 📜 button
      (`data-action="weaponCard" data-weapon="{{w.key}}"`, title Tip.WeaponCard) before the 🎲
      button; add an empty header cell for the new column.
- [X] T018 [US6] In `module/quickquest.mjs` hero sheet: `weaponCard` → `postCard` with the
      weapon card markup (name or `QQ.Roll.Weapon`, `die+STAT`, localized type and reach,
      `QQ.Flavor.<dtype>`).

---

## Phase 9: Polish

- [X] T019 [P] `README.md`: steps 17–22 (tooltips; crit badge + ×2 prompt; fumble button;
      Shift/Ctrl; treat/potion; Ace button; weapon card).
- [X] T020 [P] `CLAUDE.md`: new actions, `ace.trigger` and `treated` fields, `PENDING_CRIT`
      in-memory rule, chat render hook note, "any attack clears a stale crit".
- [X] T021 Parity one-liner prints `[]`; `node --check module/quickquest.mjs`; template grep for
      literals prints nothing.
- [ ] T022 Owner: run quickstart steps 1–15 on the live server; approve tooltip and flavor
      wording in both languages.

---

## Dependencies

T001 ∥ T002 → T003 → T004 → T005; T006 ∥ T003–T005. Then US1 (T007 ∥ T008), US2 (T009 → T010 →
T011), US3 (T012 → T013), US4 (T014 → T015), US5 (T016, after T009), US6 (T017 → T018). Polish
after all.

## Implementation Strategy

MVP = tooltips (US1) + crit/fumble (US2): the two P1 stories. Then US3–US6 in order.
