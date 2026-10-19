# Research: The Sheet Teaches Magic

**Feature**: 002-spell-casting | **Date**: 2026-10-19

Every item below was decided from the existing codebase (`module/quickquest.mjs`,
`templates/hero-sheet.hbs`, `styles/quickquest.css`), the constitution and the owner's answers.
No external research was required; Foundry API choices are the ones the system already uses.

## R1. Where the 20 magic entries live

- **Decision**: Two frozen arrays, `SPELLS` (12) and `CANTRIPS` (8), in a clearly delimited
  `MAGIC DATA` block at the top of `module/quickquest.mjs`, each entry
  `{ id, name, cost, range, effect }`. A startup assertion in `Hooks.once("init")` throws if the
  counts are not exactly 12 and 8.
- **Rationale**: BACKLOG 3.1 says "single source in quickquest.mjs"; the constitution keeps the
  system in one module. 20 five-field objects are ~60 lines, easy for the owner to edit.
- **Alternatives considered**: separate `module/spells.mjs` (rejected: no demonstrated need to
  split yet); a compendium of spell items (rejected: Item documents are v0.5 and would make casting
  depend on content import); JSON in `languages/en.json` (rejected: spell text is content, not UI
  chrome, and cost/range are data).

## R2. Placeholders while `docs/rulebook.md` is absent

- **Decision**: Ship the constant with entries named `TODO Spell 1`…`TODO Spell 12` and
  `TODO Cantrip 1`…`TODO Cantrip 8`, plausible costs (spells 1–4 MP spread so channeling can be
  tested), range `nearby`, effect `TODO — copy from docs/rulebook.md`. A module-level
  `MAGIC_IS_PLACEHOLDER` flag is `true` until the owner edits; while true, init logs a
  `console.warn` and the magic box shows a small italic "spell list is placeholder" hint for the GM.
- **Rationale**: Lets the whole flow be built and tested on the live server now; makes it
  impossible to ship 0.3.0 without noticing (the hint is visible, the README step checks it).
- **Alternatives considered**: block the feature until 001 merges (rejected: owner asked to plan
  with placeholders); invent names (rejected: would leak into play as if real).

## R3. Schema shape for choices

- **Decision**: Add `magic: SchemaField({ cantrip, spell1, spell2: StringField(""),
  channeled: BooleanField(false) })` storing entry ids, and **delete** the old free-text
  `cantrip` and `spells` fields from `HeroData`.
- **Rationale**: The owner confirmed no game has been played yet; only test worlds exist, so
  there is nothing to preserve (spec FR-010). Nesting under `magic` keeps the four related fields
  together and leaves the top-level names free. New fields take their initials on load; stale
  data for removed fields is ignored by the DataModel. No `system.json` change is needed.
- **Alternatives considered**: keeping the old fields as read-only "Old notes" with a clear
  button (rejected: dead code for data that does not exist); reusing the old `cantrip` field for
  ids (rejected: mixes a string label with an id in the same key across versions).

## R4. Select rendering

- **Decision**: `{{selectOptions choices selected=system.magic.spell1 blank=""}}` where
  `choices` is prepared in `_prepareContext` as `{ [id]: "Name (3 MP)" }` for spells and
  `{ [id]: "Name" }` for cantrips. Blank option = empty slot.
- **Rationale**: `selectOptions` is a Foundry built-in helper, allowed by the constitution, and
  avoids twelve hand-written `<option>` lines per slot.
- **Alternatives considered**: `{{#each}}` + `{{#if (eq …)}}` like the weapon selects (works,
  but 3 × 20 options is where the pattern stops scaling).

## R5. Cast flow and MP arithmetic

- **Decision**: `castSpell` action with `data-slot="cantrip|spell1|spell2"`. Resolve the entry;
  cantrip → post card only. Spell: `have = Math.min(mp.value, mp.max)`;
  if `have >= cost` → `update({"system.mp.value": have - cost})`, post card. Otherwise
  `missing = cost - have`, `lifeCost = 2 * missing`:
  - if `magic.channeled` → `DialogV2.prompt` "Already channeled this fight", no change;
  - else if `life.value - lifeCost <= 0` → `DialogV2.prompt` "You cannot survive the cost",
    no change (owner's Q1 answer: B);
  - else `DialogV2.confirm` showing missing MP and Life cost; on yes update
    `life.value -= lifeCost`, `mp.value = 0`, `magic.channeled = true`, post card with a
    "channeled" badge.
- **Rationale**: Matches spec FR-004…FR-008 and the edge case that a hand-typed MP above max is
  clamped at cast time rather than on blur. One `actor.update()` per cast keeps it atomic.
- **Alternatives considered**: Active Effects for channeling (violates Principle III); clamping
  MP in `prepareDerivedData` (would silently rewrite a typed value, rejected by spec).

## R6. Posting a card without a roll

- **Decision**: Add `postCard(actor, html)` next to `postRoll()`:
  `ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: html })`. Card body
  uses a `.qq-card` wrapper with title, range/cost line, effect text and "MP left: N".
- **Rationale**: `postRoll()` requires a formula; spells roll nothing. Keeping both helpers in the
  ROLL HELPERS section preserves the "all chat goes through one place" convention.
- **Alternatives considered**: `postRoll(actor, "0", flavor)` (rejected: a meaningless roll on
  every card and a dice-so-nice animation for nothing).

## R7. Ace readiness highlight

- **Decision**: `HeroData.prepareDerivedData()` sets `this.aceReady = this.mp.value === 0 &&
  !this.ace.used`. Template adds class `qq-ace-ready` and a `title` tooltip to the Ace box when
  true. CSS: spot-colour outline plus a slow 2-step box-shadow pulse, no JS.
- **Rationale**: Derived, not stored; pure presentation per BACKLOG 3.4.
- **Alternatives considered**: computing in `_prepareContext` only (fine, but the model is the
  canonical place for derived state and tokens/macros could reuse it).

## R8. Strings

- **Decision**: New UI chrome strings (Cast, Channeled this fight, dialog titles and bodies, card
  labels, placeholder hint) go in `languages/en.json` under `QQ.Magic.*`, read with
  `game.i18n.localize` / `game.i18n.format` in JS and `{{localize}}` in the template. Spell
  names, ranges and effects stay in the constant (content; feature 005 decides how to translate
  them).
- **Rationale**: Cheap now, avoids re-touching this code in 005; the constitution requires it
  from v0.4 anyway.
- **Alternatives considered**: inline strings like the rest of v0.1 (rejected: 005 would have to
  redo this feature).

## R9. Testing approach

- **Decision**: Extend the README checklist with five numbered steps (pick from lists; cast with
  enough MP; cantrip is free; channel; refusals: already channeled / cannot survive; Ace glow)
  and run them on the live server after `./deploy.sh`. See quickstart.md.
- **Rationale**: Constitution: verification is manual; no runner exists and adding one for a
  ~150-line change is out of proportion.
- **Alternatives considered**: a headless Foundry test harness (rejected for scope).
