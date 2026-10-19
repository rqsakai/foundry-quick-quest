# QuickQuest Constitution

QuickQuest is a rules-lite d20 tabletop RPG and its Foundry VTT implementation, built for a
monthly two-hour remote game day with players who are total RPG beginners. A character fits
on a Post-it. There is zero arithmetic at the table. Fun beats simulation. This constitution
governs every change to the system; `CLAUDE.md` carries the same rules with code pointers
and `BACKLOG.md` is the roadmap of record.

## Core Principles

### I. One Die, No Modifiers (NON-NEGOTIABLE)
Every roll is a d20 that meets or beats a target. Attack rolls MUST NEVER receive a numeric
modifier: no item, feature, condition, flag or code path may add or subtract from a to-hit
roll. The only permitted roll variation is advantage or disadvantage (`2d20kh` / `2d20kl`),
chosen by a human in a dialog. Checks made with a stat of 4 or 5 MUST roll with advantage
automatically; this applies to checks only, never to attacks. Difficulty targets are
Easy 8, Tricky 12, Hard 16 and MUST be shown on every check card.
Rationale: beginners never have to add numbers, and no feature can creep in power via +X.

### II. Derived, Never Stored
Hero Life max (`7 + CON × 2`), MP max (`INT × 3` for Wizards and Healers, `0` for every
other profession), Defense (`10 + armor`, `−2` while Raging) and initiative rank (heroes 2,
monsters 1) MUST be computed in `prepareDerivedData()` and MUST NOT exist as persisted schema
fields. Race trait, profession move and the Ace's name, trigger and effect are looked up from
the `RACES` / `PROFESSIONS` constants by the stored race and profession ids; they are never
stored as text. Monsters are the deliberate exception: their Life max and Defense
are typed by the GM and stored. Monsters get tougher by gaining Life, never Defense.
Stats are integers 1–5; armor is 0–4. Any feature that needs a new number MUST say whether
it is stored (`defineSchema()`) or derived (`prepareDerivedData()`), and MUST NOT duplicate
a derived value into storage.
Rationale: one formula in one place means the sheet can never disagree with the rulebook.

### III. Automate the Math, Humans Handle the Timing
Code MAY add dice and flat bonuses, deduct MP, compute pools and post results. Code MUST NOT
decide *when* a rule starts or stops: no effect-duration engine, no auto-expiring effects,
no Active Effects pipeline, no turn-based bookkeeping. Anything with a lifetime (rage,
channeling once per fight, Ace once per session, treat-wounds once per fight) is a checkbox
a human unticks, paired with a chat reminder. Nat 20 double damage and nat 1 fumbles are
detected and prompted, never silently applied. GM judgment (damage-type halving or
doubling, opportunity attacks, range enforcement) is reminded, never enforced.
Rationale: timing automation is where simulation complexity hides; reminders teach instead.

### IV. The Sheet Replaces the Rulebook
Players arrive knowing nothing and will not read the books. Every feature MUST pass all
four UX laws: (1) any in-play action is at most one click from the sheet; (2) every number
explains itself with one plain-English sentence on hover; (3) every chat card states the
relevant rule alongside the result; (4) a player who configures nothing plays correctly.
If a player has to ask "how does X work?", that is a UI bug, not a player bug. Features
MUST add their rule text to the button, tooltip or chat card they introduce.
Rationale: the audience is the design constraint; teaching is the product.

### V. Rules-Lite Scope
The following are permanently out of scope and MUST NOT be implemented: XP, levels or any
advancement system (treasure and Aces are the progression); inventory systems beyond the
planned `weapon` and `relic` item types (plain gear stays a text box); simulationist
subsystems of any kind. Monsters have no stats and make no checks: one attack line, one
Trick, notes. Spells are a closed set of exactly 12 spells and 8 cantrips; races are exactly
6 and professions exactly 5, all as written in `docs/rulebook.md`. Features MUST
ship small: one minor version per game-day month, and anything in the BACKLOG Icebox needs
an explicit decision before work starts.
Rationale: every rule added is a rule a beginner must learn at a two-hour table.

## Technical Constraints

- Platform: Foundry VTT, compatibility minimum v12, verified v14; the live server runs v14.
- Types come from `system.json` `documentTypes` plus `TypeDataModel` subclasses registered
  on `CONFIG.Actor.dataModels`. `template.json` MUST NOT be introduced.
- Sheets MUST use `HandlebarsApplicationMixin(ActorSheetV2)` with `static DEFAULT_OPTIONS`,
  an `actions` map from `data-action` to private static handlers, `form.submitOnChange: true`
  and a single `PARTS.sheet`. No jQuery, no `activateListeners`, no Save buttons.
- Templates are plain named inputs (`name="system.x.y"`) using only Foundry's built-in
  Handlebars helpers.
- Non-sheet UI (the creation wizard) uses `HandlebarsApplicationMixin(ApplicationV2)` with the
  same `DEFAULT_OPTIONS.actions` pattern and writes to the actor only on Finish.
- All rolls go through `postRoll()`; advantage/disadvantage through `pickMode()` and
  `d20Formula()`. Every card carries a `.qq-hint` rule reminder.
- All UI MUST use the letterpress style: paper `#f6efdf`, ink `#29211a`, hero spot `#3b5273`,
  monster spot `#7c3128` via `var(--qq-spot)`, IM Fell English SC for labels and buttons,
  Alegreya body, Alegreya Sans inputs, square corners, hard spot-colour shadows, `qq-` class
  prefix.
- The system stays in one `module/quickquest.mjs` until a feature demonstrates a real need to
  split; no bundler or build step for runtime code. Compendium packs are built offline with
  `@foundryvtt/foundryvtt-cli` from `packs/_source`.
- User-visible strings introduced from v0.4 onward MUST go through i18n keys in
  `languages/*.json` to make pt-BR localization possible.

## Development Workflow

- `docs/rulebook.md` (the Player's Book) is the source of truth for every rule; change the rule
  there first, then the code. `CLAUDE.md` is the runtime guidance for agents; `BACKLOG.md` is
  the roadmap of record with acceptance criteria. Specs MUST cite the BACKLOG item(s) they implement and MUST NOT
  implement Non-Goals or Icebox items.
- Feature flow: `/speckit-specify` → `/speckit-clarify` (when ambiguous) → `/speckit-plan` →
  `/speckit-tasks` → `/speckit-implement`. Plans MUST include a Constitution Check against
  Principles I–V and the Technical Constraints before design begins.
- Verification is manual: every feature extends the numbered checklist in `README.md` with
  the steps that prove it, and the checklist is run top to bottom on the live server (Foundry
  v14) before release. Any `system.json` change requires Return to Setup and world relaunch.
- Shipping: bump `version` in `system.json` and the README header, tag from the final commit,
  build the zip with the exclusion list in `CLAUDE.md`, publish `system.json` and
  `quickquest.zip` together on the GitHub release (the loose `system.json` is the manifest).
- Pack sources, tokens and adventure content ship inside the system; AI-generated art stays
  out of the public repo.

## Governance

This constitution supersedes any other practice, prompt or template in the repository.
Every plan, task list and code review MUST verify compliance with Principles I–V and the
Technical Constraints; a violation blocks merge until the constitution is amended or the
change is withdrawn. Amendments are made by editing this file with a Sync Impact Report,
bumping the version (MAJOR for removing or redefining a principle, MINOR for adding one or
materially expanding guidance, PATCH for clarifications), and mirroring any rule change into
`CLAUDE.md` in the same commit so the two never disagree. The project owner, who also
authored the game rules, approves all amendments.

**Version**: 1.1.0 | **Ratified**: 2026-10-19 | **Last Amended**: 2026-10-19
