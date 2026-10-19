# QuickQuest — Foundry VTT system

Rules-lite d20 tabletop RPG for a monthly 2-hour remote game day with coworkers who are
total RPG beginners. Design goal: **a character fits on a Post-it, zero arithmetic at the
table, fun over simulation.** The ruleset is the owner's own; this repo is its Foundry VTT
implementation. Live server: **ttrpg.cafofo.cloud** (Foundry v14).

Tagline: *Four stats, one die, no wrong answers.*

---

## Hard rules — never violate these

The game rules below are encoded in `module/quickquest.mjs`. Code that breaks them is wrong
even if it "works".

### Rolling
- **One roll type:** d20, meets-or-beats target.
- **Attack rolls NEVER get numeric modifiers.** No item, feature, flag or code path may add
  `+X` to hit. Ever. The only roll modifier in the game is **advantage / disadvantage**
  (`2d20kh` / `2d20kl`). See `d20Formula()` and `pickMode()`; keep them the only way a d20
  formula is built.
- **Checks:** if the relevant stat is **4 or 5**, the check rolls with advantage
  automatically (`#onRollCheck`). This applies to **checks only, never attacks**.
  Difficulty hints posted with every check: **Easy 8 · Tricky 12 · Hard 16**.
- **Damage** = weapon die + **STR or AGI** (+2 while *Raging*, + the free `system.bonus`
  field). Nat 20 = **double damage, applied manually** — the chat card reminds, code does
  not double. Nat 1 = **fumble**: roll d6 on the table
  (1 weapon flies away · 2 you trip · 3 hit the scenery · 4 wide open, next hit on you
  lands · 5 something loud breaks · 6 perfect — wrong target).

### Derived values — computed, never stored
All in `prepareDerivedData()`. The hero schema deliberately has **no** `life.max`,
`mp.max` or `defense` fields. Do not add them.

| Value | Formula | Code |
|---|---|---|
| Life max | `7 + CON × 2` | `HeroData.prepareDerivedData` |
| MP max | `INT × 3` | same |
| Defense | `10 + armor` | same |
| Initiative rank | hero `2`, monster `1` | both models |

- Stats are integers **1–5** (`statField()`). Armor is **0–4**, so Defense is 10–14.
- **Monsters are different on purpose:** their `life.max` and `defense` ARE stored
  (GM types them). Do not "fix" this to be derived.

### Monsters
- Damage = die (**d4–d10**) + flat bonus printed on the sheet: **+1/+2 regular, +3/+4 boss**.
- **Tougher = more Life, never more Defense.**
- No stats, no checks. One *Trick* text and notes.

### Initiative
- Heroes rank 2, monsters rank 1, **no rolling**. Players always go first.
- `CONFIG.Combat.initiative = { formula: "@initiativeRank", decimals: 0 }`.

### Other sheet rules
- Hero weapons: **three fixed rows** `w1..w3`. Die d4/d6/d8, stat STR/AGI,
  type bludgeoning/cutting/piercing, reach touching / thrown nearby / far.
- **Ace**: one named once-per-session move, tracked by a "Played this session" checkbox.
- **Channeling** (automated in `#offerChanneling`): casting with too little MP offers
  **2 Life per missing MP, once per fight**. Refused when Life would reach 0 or below, and
  refused while the "Channeled this fight" checkbox (`magic.channeled`) is ticked. A human
  unticks it after the fight.
- Magic is **exactly 12 spells + 8 cantrips**, held in the `SPELLS` / `CANTRIPS` constants
  (MAGIC DATA block); init throws if the counts differ. Heroes store entry ids in
  `magic.cantrip`, `magic.spell1`, `magic.spell2`. Cantrips cost 0 and cast free. While
  `MAGIC_IS_PLACEHOLDER` is true the entries are TODO stubs; never release in that state.

### Automation philosophy
**"Automate the math, let humans handle the timing."**
Checkboxes over auto-expiring effects. No effect-duration engine. No Active Effects
pipeline. If a rule needs someone to remember *when* it ends, give them a checkbox and a
chat reminder, not a timer.
Also out of scope, permanently (see `BACKLOG.md` Non-Goals): XP, levels or advancement
(treasure and Aces are the progression), and automating GM judgment (damage-type
halving/doubling, opportunity attacks, range enforcement). Chat reminds; humans rule.

---

## Architecture (working in production)

```
system.json                 manifest: id "quickquest", documentTypes Actor {hero, monster},
                            compat min 12 / verified 14, primaryTokenAttribute "life",
                            manifest+download → GitHub releases/latest
module/quickquest.mjs       everything: DataModels → roll helpers → hero sheet →
                            monster sheet → registration in Hooks.once("init")
templates/hero-sheet.hbs    hero markup, plain named inputs
templates/monster-sheet.hbs monster markup
styles/quickquest.css       the "letterpress" look (see below)
languages/en.json           ALL UI strings under QQ.* (+ TYPES.Actor); pt-BR.json mirrors it 1:1
docs/glossary.md            EN → pt-BR term table every string follows
README.md                   install notes + the manual test checklist (our only test suite)
```

### What we do NOT have, on purpose
- **No `template.json`** — deprecated path. Types come from `system.json` `documentTypes`
  plus `TypeDataModel` subclasses registered on `CONFIG.Actor.dataModels`.
- **No Item documents.** Weapons are three schema rows on the hero. Gear is a textarea.
- **No compendia in `main`** (an unmerged v0.2.0 adds packs — see backlog).
- No build step, no `package.json`, no bundler, no automated tests.

### Data models (`module/quickquest.mjs`)
- `HeroData extends foundry.abstract.TypeDataModel` — `stats.{str,agi,con,int}`,
  `life.value`, `mp.value`, `armor`, `race`, `trait`, `profession`, `move`,
  `ace.{name,used}`, `magic.{cantrip,spell1,spell2,channeled}`, `gear`, `gold`, `silver`,
  `raging`, `bonus`, `weapons.{w1,w2,w3}` (each `name, die, stat, dtype, reach`).
  Derived: `life.max`, `mp.max`, `defense`, `initiativeRank`, `aceReady`.
- `MonsterData` — `life.{value,max}`, `defense`, `attack.{die,bonus,dtype}`, `trick`, `notes`.
- New persistent fields go in `defineSchema()`. New computed values go in
  `prepareDerivedData()`. Nothing else.

### Sheet pattern (AppV2) — follow exactly
```js
class XSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["quickquest", "qq-hero" | "qq-monster"],
    position: { width, height }, window: { resizable: true },
    form: { submitOnChange: true },              // no Save button, ever
    actions: { rollCheck: XSheet.#onRollCheck }  // data-action → private static handler
  };
  static PARTS = { sheet: { template: "systems/quickquest/templates/x.hbs" } };
  async _prepareContext(options) { /* expose actor, system, (weapons[]) */ }
  static async #onRollCheck(event, target) { /* `this` is the sheet; read target.dataset */ }
}
```
- Buttons in templates: `<button type="button" data-action="name" data-foo="…">`.
  Add a matching entry to `actions`. No jQuery, no `activateListeners`.
- Templates are **plain named inputs**: `name="system.x.y"`, `{{checked …}}` for booleans,
  `{{#if (eq a "b")}}selected{{/if}}` for selects. Only Foundry's built-in helpers;
  no custom Handlebars helpers are registered.
- **Every user-visible string is a key** in `languages/en.json` **and** `languages/pt-BR.json`
  (identical key sets; groups `QQ.Sheet/Stat/Weapon/Range/Roll/Fumble/Monster/Magic`).
  Templates use `{{localize}}` (+ `concat` for stat keys); code uses the `t(key, data)` helper.
  Hints are built at call time (`attackHint()`), never as module-level constants. Dice names,
  "QuickQuest" and spell content are not keys. Wording follows `docs/glossary.md`.
- Rolls go through `postRoll(actor, formula, flavor)` → `Roll` + `toMessage`. Cards without
  dice (spells) go through `postCard(actor, html)`. Adv/dis via `pickMode(title)`
  (`DialogV2.wait`, buttons dis/normal/adv, `rejectClose: false`).
- Every chat card carries a rules hint (`ATTACK_HINT`, `CHECK_HINT`, or inline
  `<span class="qq-hint">`). Keep doing this — the players are beginners.
- Sheets are registered with `DocumentSheetConfig.registerSheet` using the
  `foundry.applications.apps?.DocumentSheetConfig ?? globalThis.DocumentSheetConfig`
  fallback so v12 still works.
- `CONFIG.Actor.trackableAttributes`: hero bars `life`, `mp`; monster bar `life`;
  both expose `defense` as a value.

### Styling — the "letterpress" look (`styles/quickquest.css`)
All new UI must match. Class prefix `qq-`.

| Token | Value | Use |
|---|---|---|
| paper | `#f6efdf` | window background, label backplates |
| input paper | `#fffaf0` | inputs, selects, buttons |
| ink | `#29211a` (`--qq-ink`) | text, borders |
| rule | `#c9bba0` (`--qq-rule`) | input borders |
| muted | `#8d7f6b`, `#6b6155` | max values, hints, footer |
| hero spot | indigo `#3b5273` | `--qq-spot` under `.qq-hero` |
| monster spot | oxblood `#7c3128` | `--qq-spot` under `.qq-monster` / `.qq-msheet` |

- Fonts (Google Fonts `@import`): **IM Fell English SC** for labels, buttons, the name
  field; **Alegreya** body; **Alegreya Sans** for inputs and hints.
- Buttons: 1.5px ink border, **square corners**, hard `2px 2px 0 var(--qq-spot)` shadow,
  invert to spot-on-paper on hover.
- Boxes: 1.5px ink border, translucent `#fff9ec66` fill, floating `.qq-boxlbl` label.
- Header/footer rules are `3px double` ink. Chat hints use `.qq-hint` (italic, muted).
- Always use `var(--qq-spot)` for accent so one template serves both sheet colours.

---

## Dev workflow

- This clone is the **dev copy**. The server loads its own git checkout at
  `<foundry-data>/Data/systems/quickquest`.
- Iteration loop: edit here → commit + push → `git pull` on the server → **F5** in the
  browser. `./deploy.sh "message"` does commit + push + ssh pull in one go (fill in the
  host/path placeholders first, or export `QQ_SERVER_HOST` / `QQ_SERVER_PATH`).
- **Changes to `system.json` need more:** Return to Setup → relaunch the world.
- Regression testing is manual: run the numbered checklist in `README.md` top to bottom
  and stop at the first failure.
- Keep the whole system in one `.mjs` until there is a real reason not to.

### Spec Kit (GitHub `specify` CLI, installed 2026-10-19)
- Scaffolded with `specify init --here --integration claude`; skills live in
  `.claude/skills/speckit-*` and are committed. State lives in `.specify/`
  (`feature.json` is per-machine and already ignored there).
- Flow for a non-trivial feature: `/speckit-specify` → `/speckit-clarify` (optional) →
  `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`. Feature folders land in `specs/`.
- `.specify/memory/constitution.md` v1.0.0 restates the Hard rules as Principles I–V.
  Any rule change is mirrored here and there in the same commit.
- `specs/001`–`007` hold one spec per BACKLOG milestone (content, spells, creation wizard,
  sheet teaches, pt-BR, items, GM QoL). `.specify/feature.json` points at the active one;
  switch with `export SPECIFY_FEATURE_DIRECTORY=specs/NNN-name`.

## Shipping a release

1. Bump `"version"` in `system.json` **and** the version in the `README.md` header.
2. Commit and push. **Tag/release from that final commit** (v0.1.0 was tagged one commit
   early — don't repeat).
3. Check language-file parity (must print `[]`):
   ```bash
   python3 -c "import json;a=json.load(open('languages/en.json'));b=json.load(open('languages/pt-BR.json'))
   def k(d,p=''):
     return {p+x for x,v in d.items() if not isinstance(v,dict)}|{y for x,v in d.items() if isinstance(v,dict) for y in k(v,p+x+'.')}
   print(sorted(k(a)^k(b)))"
   ```
4. Build the zip from the repo root. `system.json` must sit at the zip root.
   ```bash
   zip -r quickquest.zip . -x ".git/*" "node_modules/*" "*.zip" ".remember/*" ".claude/*" "CLAUDE.md" "deploy.sh" ".gitignore" ".specify/*" "specs/*" "BACKLOG.md"
   ```
5. Publish — **both assets are mandatory**; the loose `system.json` is the manifest Foundry
   polls for updates:
   ```bash
   gh release create vX.Y.Z --title "QuickQuest X.Y.Z" --notes "..." system.json quickquest.zip
   ```
6. Delete the local zip (it is git-ignored, but don't let it linger).

---

## Current state & backlog

**`BACKLOG.md` is the roadmap of record** — North Star, UX laws, non-goals, versioned items
with acceptance criteria. Read it before proposing or scoping anything. Summary only:

- **`main` = v0.1.0**, live on the server, playtested 2026-10-19.
- **v0.2 — content ships with the system.** Mostly built, unmerged, exists only as a zip
  outside this repo: compendium packs (Bestiary 11, Heroes 6, Sand King adventure) built
  with `@foundryvtt/foundryvtt-cli` from `packs/_source`, woodcut tokens, and a `docs/`
  folder with `rulebook.md` + `treasury.md` (the rules currently live outside the repo).
  Decide versioning when merging.
- **v0.3 — the sheet teaches magic.** `SPELLS` (12) + `CANTRIPS` (8) constants; cantrip
  select + two spell-slot selects replacing free text; **Cast** button that deducts MP,
  offers channeling (2 Life per missing MP) via `DialogV2` when short, posts a chat card.
- **v0.4+** — zero-reading sheet (creation wizard, tooltips, Ace button, pt-BR), then
  Items (weapon/relic only), then GM quality of life. Details and sequencing in `BACKLOG.md`.
- Crit auto-doubling is detection + prompt only (BACKLOG 4.7), never silent math.

## Before you change anything — checklist

- [ ] Does this add a numeric modifier to any **attack** roll? → **No. Stop.**
- [ ] Does it store a value that should be derived (Life max, MP max, hero Defense)? → No.
- [ ] New button? `data-action` in the template **and** entry in `DEFAULT_OPTIONS.actions`.
- [ ] New field? `defineSchema()`. New computed value? `prepareDerivedData()`.
- [ ] New UI? `qq-` classes, letterpress tokens, `var(--qq-spot)`, IM Fell for labels.
- [ ] New string? Add the key to `languages/en.json` **and** `languages/pt-BR.json`; use
      `{{localize}}` or `t()`; pick wording from `docs/glossary.md`.
- [ ] New roll? Goes through `postRoll()`, carries a `.qq-hint` rules reminder.
- [ ] Does it introduce timers, durations or auto-expiring effects? → Use a checkbox.
- [ ] Touched `system.json`? Remind the user: Return to Setup → relaunch world.
