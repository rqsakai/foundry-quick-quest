# Tasks: The Sheet Teaches Magic

**Input**: Design documents from `/specs/002-spell-casting/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/sheet-actions.md,
contracts/spell-data.md, quickstart.md

**Tests**: No automated tests (constitution: verification is manual via the README checklist and
quickstart.md on the live server). No test tasks are generated.

**Organization**: Tasks are grouped by user story. Story order follows the spec's priorities, with
US2 (choose from lists) placed before US1 (cast) because a slot must hold a spell before Cast can
be exercised; both are P1 and ship together as the MVP.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1…US5 from spec.md)
- Include exact file paths in descriptions

## Path Conventions

Single-module Foundry system at repository root: `module/quickquest.mjs`,
`templates/hero-sheet.hbs`, `styles/quickquest.css`, `languages/en.json`, `README.md`.
No `src/` or `tests/` directories exist or are created.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: String keys and the data block every story reads.

- [X] T001 [P] Add the `QQ.Magic` object to `languages/en.json` with keys and English values:
      `Cantrip`, `Spell1`, `Spell2`, `Cast`, `CastTip` ("Spend the MP and post the spell to chat;
      cantrips are free"), `Channeled` ("Channeled this fight"), `ChanneledTip` ("Short on MP?
      Pay 2 Life per missing MP, once per fight. Untick when the fight ends."), `ChannelTitle`
      ("Channel your blood?"), `ChannelBody` ("You are {missing} MP short. Channel {lifeCost} Life
      to cast {spell}?"), `ChannelButton` ("Channel"), `Cancel`, `AlreadyChanneled` ("You already
      channeled this fight. Untick the box when the fight ends."), `CannotSurvive` ("Channeling
      would cost {lifeCost} Life and you have {life}. You cannot survive the cost."), `Range`,
      `Cost`, `MPLeft` ("MP left"), `CantripFree` ("Cantrip, free"), `ChanneledBadge`
      ("Channeled"), `Life`, `AceReadyTip` ("Out of MP — your Ace is ready. Play it when the
      moment comes."), `PlaceholderHint` ("Spell list is placeholder — fill SPELLS/CANTRIPS from
      docs/rulebook.md"), `Empty` ("—").
- [X] T002 [P] Add the `MAGIC DATA` block to `module/quickquest.mjs` directly after the
      `const { ActorSheetV2 }` line: `const MAGIC_IS_PLACEHOLDER = true;`, `const SPELLS =
      Object.freeze([...])` with exactly 12 entries `{ id: "spell-01".."spell-12", name: "TODO
      Spell N", cost, range: "nearby", effect: "TODO — copy from docs/rulebook.md" }` with costs
      spread 1,1,2,2,2,3,3,3,3,4,4,4; `const CANTRIPS = Object.freeze([...])` with exactly 8
      entries `{ id: "cantrip-01".."cantrip-08", name: "TODO Cantrip N", cost: 0, range:
      "nearby", effect: "TODO — copy from docs/rulebook.md" }`; and `function magicEntry(id)`
      returning the matching entry from SPELLS then CANTRIPS, else `null`. Follow
      contracts/spell-data.md verbatim, including the header comment naming docs/rulebook.md
      as the source of truth.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema, helpers, assertions and base styling that every story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 In `module/quickquest.mjs` `HeroData.defineSchema()`: remove the top-level
      `cantrip: new fields.StringField(...)` and `spells: new fields.StringField(...)` lines and
      add `magic: new fields.SchemaField({ cantrip: new fields.StringField({ initial: "" }),
      spell1: new fields.StringField({ initial: "" }), spell2: new fields.StringField({ initial:
      "" }), channeled: new fields.BooleanField({ initial: false }) })` (data-model.md: ids or
      "" for empty slot; `channeled` is human-unticked state).
- [X] T004 In `module/quickquest.mjs` ROLL HELPERS section, add `async function postCard(actor,
      html)` that calls `ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content:
      html })` and returns the message. Leave `postRoll()`, `pickMode()`, `d20Formula()` untouched.
- [X] T005 In `module/quickquest.mjs` `Hooks.once("init")`, before registering data models, add:
      `if (SPELLS.length !== 12 || CANTRIPS.length !== 8) throw new Error("QuickQuest | SPELLS
      must have 12 entries, CANTRIPS 8");` and `if (MAGIC_IS_PLACEHOLDER) console.warn("QuickQuest
      | SPELLS/CANTRIPS are placeholders");`.
- [X] T006 [P] In `styles/quickquest.css`, append a `/* ---------- magic & cards ---------- */`
      section with: `.qq-magic` (flex column, gap 4px), `.qq-slot` (grid `auto 1fr auto`, gap 5px,
      align center), `.qq-slot .qq-lbl` reuse, `.qq-slot select` (flex 1), `.qq-cast` (button,
      font-size 11px, shadow `1.5px 1.5px 0 var(--qq-spot)`), `.qq-card` (border-left `3px solid
      var(--qq-spot)`, padding `4px 8px`, background `#fff9ec`, color `var(--qq-ink)`, font-family
      Alegreya), `.qq-card-title` (IM Fell English SC, 15px, letter-spacing .08em, color
      `var(--qq-spot)`), `.qq-card-meta` and `.qq-card-foot` (Alegreya Sans 11px, color
      `#6b6155`), `.qq-card-body` (13px, margin `3px 0`), `.qq-card-badge` (inline-block,
      border `1.5px solid var(--qq-ink)`, padding `0 6px`, IM Fell 11px, background
      `var(--qq-spot)`, color `#f6efdf`, margin-top 3px). All colours from the letterpress token
      table in CLAUDE.md; square corners only.

**Checkpoint**: Reload the world: no console errors except the placeholder warning; hero sheet
still opens (the old spells box is still present until Phase 3).

---

## Phase 3: User Story 2 - Choose magic from fixed lists (Priority: P1) 🎯 MVP part 1

**Goal**: Replace the free-text cantrip/spells box with one cantrip select and two spell-slot
selects fed by the constant, costs visible, choices persisted.

**Independent Test**: Open a hero, open each select (8 and 12 entries plus blank), pick one in
each, close and reopen the sheet, choices persist (quickstart steps 1–3 without Cast buttons).

### Implementation for User Story 2

- [X] T007 [US2] In `module/quickquest.mjs` `QuickQuestHeroSheet._prepareContext()`, add
      `context.spellChoices` = object `{ [s.id]: \`${s.name} (${s.cost} MP)\` }` over SPELLS,
      `context.cantripChoices` = `{ [c.id]: c.name }` over CANTRIPS, `context.slots` = array of
      `{ key, label, entry }` for keys `cantrip`, `spell1`, `spell2` with `label` the localized
      `QQ.Magic.<Key>` and `entry = magicEntry(this.actor.system.magic[key])`, and
      `context.magicPlaceholder = MAGIC_IS_PLACEHOLDER`.
- [X] T008 [US2] In `templates/hero-sheet.hbs`, replace the "Spells &amp; cantrip" `.qq-box`
      (the one containing `system.cantrip` and `system.spells`) with a `.qq-box.qq-magic` whose
      `.qq-boxlbl` is `{{localize "QQ.Magic.Cantrip"}} &amp; spells`; inside, `{{#each slots as
      |slot|}}` renders a `.qq-slot` row with `<span class="qq-lbl">{{slot.label}}</span>` and
      `<select name="system.magic.{{slot.key}}">` containing `{{selectOptions (if (eq slot.key
      "cantrip") ../cantripChoices ../spellChoices) selected=(lookup ../system.magic slot.key)
      blank=(localize "QQ.Magic.Empty")}}`; after the loop, when `magicPlaceholder` is true render
      `<span class="qq-hint">{{localize "QQ.Magic.PlaceholderHint"}}</span>`. Remove every
      reference to `system.cantrip` and `system.spells`. (Cast button and Channeled box are added
      in later phases; leave a third grid cell empty for now.)
- [ ] T009 [US2] Verify on the live server after `./deploy.sh`: quickstart steps 1–3 (selects
      present, counts correct, costs in labels, persistence on reopen, no console errors beyond the
      placeholder warning).

**Checkpoint**: Choices persist; the free-text box is gone; nothing else on the sheet changed.

---

## Phase 4: User Story 1 - Cast a spell with one click (Priority: P1) 🎯 MVP part 2

**Goal**: A Cast button beside each filled slot deducts MP (clamped to max first) and posts a
teaching card with name, range, cost, effect and MP left.

**Independent Test**: INT 2 hero, 3-MP spell slotted, MP 6: Cast → MP 3 and a full card; Cast →
MP 0 (quickstart steps 5, 6 first half, 11).

### Implementation for User Story 1

- [X] T010 [US1] In `module/quickquest.mjs`, add `spellCardHtml(entry, { mpLeft, mpMax,
      channeledLife = null, cantrip = false })` returning the `.qq-card.qq-card-spell` markup from
      contracts/sheet-actions.md: title, meta line `{{Range}}: {range} · {{Cost}}: {cost} MP`
      (omit cost for cantrips), body `effect`, foot `{{MPLeft}}: {mpLeft} / {mpMax}` for spells
      or `{{CantripFree}}` for cantrips, and a `.qq-card-badge` "{{ChanneledBadge}} — {n}
      {{Life}}" only when `channeledLife` is a number. Use `game.i18n.localize` for labels.
- [X] T011 [US1] In `module/quickquest.mjs` `QuickQuestHeroSheet`, register `castSpell:
      QuickQuestHeroSheet.#onCastSpell` in `DEFAULT_OPTIONS.actions` and implement `static async
      #onCastSpell(event, target)`: read `slot = target.dataset.slot`, `entry =
      magicEntry(this.actor.system.magic[slot])`, return if null; if `entry.cost === 0` →
      `postCard(this.actor, spellCardHtml(entry, { cantrip: true, mpLeft, mpMax }))` (US4 covers
      verification); else `have = Math.min(mp.value, mp.max)`; if `have >= cost` → `await
      this.actor.update({ "system.mp.value": have - cost })` then post the card with `mpLeft =
      have - cost`; otherwise call `this.#offerChanneling(entry, have)` (implemented in Phase 5;
      until then, stub it to `ui.notifications.warn("Not enough MP")`).
- [X] T012 [US1] In `templates/hero-sheet.hbs` `.qq-slot` row, fill the third grid cell with
      `{{#if slot.entry}}<button type="button" class="qq-cast" data-action="castSpell"
      data-slot="{{slot.key}}" title="{{localize 'QQ.Magic.CastTip'}}">{{localize
      "QQ.Magic.Cast"}}</button>{{/if}}`.
- [ ] T013 [US1] Verify on the live server: quickstart steps 5, 6 (MP and card content) and 11
      (MP typed above max is clamped to max before deducting).

**Checkpoint**: MVP complete: pick spells, cast them, read the rule on the card.

---

## Phase 5: User Story 3 - Channel blood when the mana runs out (Priority: P2)

**Goal**: When MP is short, offer channeling with the exact Life cost; refuse when already
channeled this fight or when Life would reach 0 or below; on accept, deduct Life, zero MP, tick
the once-per-fight box and badge the card.

**Independent Test**: Quickstart steps 7–10 (cancel, accept, already-channeled refusal,
cannot-survive refusal).

### Implementation for User Story 3

- [X] T014 [US3] In `module/quickquest.mjs` `HeroData` is unchanged (field added in T003);
      in `templates/hero-sheet.hbs` `.qq-magic` box, after the slot rows add `<label
      class="qq-check" title="{{localize 'QQ.Magic.ChanneledTip'}}"><input type="checkbox"
      name="system.magic.channeled" {{checked system.magic.channeled}}/> {{localize
      "QQ.Magic.Channeled"}}</label>`.
- [X] T015 [US3] In `module/quickquest.mjs` `QuickQuestHeroSheet`, implement `async
      #offerChanneling(entry, have)`: `missing = entry.cost - have`, `lifeCost = 2 * missing`,
      `sys = this.actor.system`. If `sys.magic.channeled` → `await DialogV2.prompt({ window: {
      title: localize("QQ.Magic.ChannelTitle") }, content: "<p>" + localize("QQ.Magic.AlreadyChanneled") + "</p>", rejectClose: false })` and return. If `sys.life.value - lifeCost <= 0` →
      `DialogV2.prompt` with `game.i18n.format("QQ.Magic.CannotSurvive", { lifeCost, life:
      sys.life.value })` and return (owner decision Q1 = B). Else `const ok = await
      DialogV2.confirm({ window: { title }, content: "<p>" + game.i18n.format("QQ.Magic.ChannelBody", { missing, lifeCost, spell: entry.name }) + "</p>", yes: { label:
      localize("QQ.Magic.ChannelButton"), default: true }, no: { label: localize("QQ.Magic.Cancel") }, rejectClose: false })`; if not `ok` return; else `await this.actor.update({
      "system.life.value": sys.life.value - lifeCost, "system.mp.value": 0,
      "system.magic.channeled": true })` in one call, then `postCard(this.actor,
      spellCardHtml(entry, { mpLeft: 0, mpMax: sys.mp.max, channeledLife: lifeCost }))`. Replace
      the T011 stub with this call.
- [ ] T016 [US3] Verify on the live server: quickstart steps 7, 8, 9, 10 in order, checking Life,
      MP, the checkbox state and the badge after each.

**Checkpoint**: Channeling works, both refusals work, nothing auto-expires.

---

## Phase 6: User Story 4 - Cantrips are free (Priority: P2)

**Goal**: Casting the cantrip posts its card and changes no numbers.

**Independent Test**: Quickstart step 4 (five casts, MP and Life unchanged, five cards).

### Implementation for User Story 4

- [X] T017 [US4] In `module/quickquest.mjs` `#onCastSpell`, confirm the `cost === 0` branch
      performs no `actor.update()` and passes `cantrip: true` so `spellCardHtml` omits the cost and
      prints `QQ.Magic.CantripFree` in the foot; confirm `spellCardHtml` omits the MP-left line for
      cantrips.
- [ ] T018 [US4] Verify on the live server: quickstart step 4.

**Checkpoint**: Cantrips teach without costing.

---

## Phase 7: User Story 5 - The empty wizard knows their Ace is ready (Priority: P3)

**Goal**: When MP is 0 and the Ace is unused, the Ace box is highlighted with a one-sentence
tooltip; nothing else changes.

**Independent Test**: Quickstart steps 6 (second half) and 12.

### Implementation for User Story 5

- [X] T019 [P] [US5] In `module/quickquest.mjs` `HeroData.prepareDerivedData()`, add
      `this.aceReady = this.mp.value === 0 && !this.ace.used;` (derived, never stored).
- [X] T020 [P] [US5] In `styles/quickquest.css`, append `.qq-ace-ready { outline: 2px solid
      var(--qq-spot); outline-offset: 2px; animation: qq-ace-pulse 2.4s ease-in-out infinite; }`
      and `@keyframes qq-ace-pulse { 0%,100% { box-shadow: 0 0 0 0 var(--qq-spot); } 50% {
      box-shadow: 0 0 0 4px #3b527333; } }`; square corners, no colour outside the token table.
- [X] T021 [US5] In `templates/hero-sheet.hbs`, change the Ace `.qq-box` opening tag to `<div
      class="qq-box{{#if system.aceReady}} qq-ace-ready{{/if}}" {{#if system.aceReady}}title="{{localize 'QQ.Magic.AceReadyTip'}}"{{/if}}>`.
- [ ] T022 [US5] Verify on the live server: quickstart step 6 (highlight appears at MP 0) and
      step 12 (disappears when Ace used or MP > 0).

**Checkpoint**: All five stories independently verified.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, regression sweep, and release readiness.

- [X] T023 [P] In `README.md`, append checklist steps 11–15: pick cantrip + two spells and
      persist; cast with enough MP shows MP deducted and full card; cantrip cast is free; channel
      flow with both refusals (already channeled, cannot survive); Ace highlight at 0 MP. Add a
      line to the "v0.1 scope" section renaming it to "Not included yet" and removing
      "Bless/effects automation" wording only if it conflicts; otherwise leave.
- [X] T024 [P] In `CLAUDE.md`, under "Hard rules → Other sheet rules", replace "Channeling (not
      yet automated)… Currently only a footer reminder" with the implemented behaviour (dialog,
      2 Life per missing MP, refused at ≤ 0 Life, once-per-fight checkbox) and change "Magic is
      12 spells + 8 cantrips… (free-text today — see backlog)" to point at the `SPELLS` /
      `CANTRIPS` constant.
- [ ] T025 Run quickstart.md steps 13–14 (monster sheet unchanged; attack and check formulas
      unchanged: `1d20`, `2d20kh`, `2d20kl` only) and re-read `#onRollAttack` to confirm no
      modifier was introduced (Constitution I).
- [X] T026 Review `module/quickquest.mjs` for stray strings not in `languages/en.json` (grep for
      quoted English in the magic code) and move any to `QQ.Magic.*`.
- [ ] T027 Owner handoff: when `docs/rulebook.md` is available, replace the 20 TODO entries,
      set `MAGIC_IS_PLACEHOLDER = false`, run quickstart step 15, then bump `system.json` and the
      README header to 0.3.0 and release per CLAUDE.md "Shipping a release". Do not release
      while the placeholder flag is true.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 and T002 independent; start immediately.
- **Foundational (Phase 2)**: T003–T005 edit `module/quickquest.mjs` sequentially after T002;
  T006 (CSS) in parallel. Blocks all stories.
- **US2 (Phase 3)** → **US1 (Phase 4)**: US1 needs a filled slot to click Cast, so US2 first.
  Together they are the MVP.
- **US3 (Phase 5)**: depends on US1 (`#onCastSpell` calls `#offerChanneling`).
- **US4 (Phase 6)**: depends on US1 (same handler); trivial verification of the cost-0 branch.
- **US5 (Phase 7)**: depends only on Foundational; can run in parallel with Phases 3–6 if split
  across people, but shares `templates/hero-sheet.hbs` so merge carefully.
- **Polish (Phase 8)**: after all stories.

### Within Each User Story

- Context/data (`_prepareContext`, schema) before template; template before server verification.
- Each story ends with a live-server verification task mapped to quickstart steps.

### Parallel Opportunities

- T001 ∥ T002 (different files).
- T006 ∥ T003–T005 (CSS vs module).
- T019 ∥ T020 (module vs CSS) within US5.
- T023 ∥ T024 (README vs CLAUDE.md).

---

## Parallel Example: Setup + Foundational

```bash
# In parallel (different files):
Task: "T001 Add QQ.Magic keys to languages/en.json"
Task: "T002 Add MAGIC DATA block to module/quickquest.mjs"
# Then, in parallel:
Task: "T003–T005 schema, postCard, init assertions in module/quickquest.mjs"
Task: "T006 magic & card styles in styles/quickquest.css"
```

---

## Implementation Strategy

### MVP First (US2 + US1)

1. Phase 1 and Phase 2.
2. Phase 3 (selects) → deploy → quickstart 1–3.
3. Phase 4 (Cast) → deploy → quickstart 5, 6, 11.
4. **STOP and VALIDATE** on the live server; this is already playable magic.

### Incremental Delivery

1. Add US3 channeling → quickstart 7–10.
2. Add US4 cantrip verification → quickstart 4.
3. Add US5 Ace highlight → quickstart 6, 12.
4. Polish: README, CLAUDE.md, regression sweep (13–14), owner handoff for real spell text
   and the 0.3.0 release.

### Notes

- No `system.json` change until release; players only need F5 during development.
- One `actor.update()` per cast branch; never write derived values.
- Every new string goes through `QQ.Magic.*`; spell content stays in the constant.
- Commit after each phase checkpoint with a message naming the story (e.g.
  `feat(magic): US2 spell selects`).
