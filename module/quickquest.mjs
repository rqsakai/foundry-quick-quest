/* ============================================================
   QUICKQUEST — a rules-lite d20 system
   Four stats, one die, no wrong answers.
   ============================================================ */

const fields = foundry.data.fields;
const { HandlebarsApplicationMixin, DialogV2, ApplicationV2 } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/* ------------------------------------------------------------
   MAGIC DATA — the game has exactly 12 spells and 8 cantrips.
   Source of truth: docs/rulebook.md. Edit text here only.
   Keep ids stable forever; heroes store them.
   ------------------------------------------------------------ */

const MAGIC_IS_PLACEHOLDER = false; // text below matches docs/rulebook.md "Magic"

// range: touching | nearby | far | self
const SPELLS = Object.freeze([
  { id: "fireball",         name: "Fireball",         cost: 3, range: "far",      effect: "d6 damage to everything in a small area. Everything. Check where your friends are." },
  { id: "summon-lightning", name: "Summon Lightning", cost: 3, range: "far",      effect: "d8 to one target you can see. Ignores their Defense entirely — it just hits." },
  { id: "healing-hands",    name: "Healing Hands",    cost: 2, range: "touching", effect: "Restore d6+2 Life. The only thing that gets someone up from 0 mid-fight." },
  { id: "shield-of-air",    name: "Shield of Air",    cost: 2, range: "nearby",   effect: "You or an ally gets +3 Defense until the fight ends." },
  { id: "sleep",            name: "Sleep",            cost: 3, range: "nearby",   effect: "One creature sleeps until shaken or hurt. Not the very large; not the undead." },
  { id: "bless",            name: "Bless",            cost: 1, range: "nearby",   effect: "An ally rolls 2d20, takes the better, on their next attack." },
  { id: "grasping-vines",   name: "Grasping Vines",   cost: 2, range: "nearby",   effect: "Vines hold one creature. It fights but can't move; escaping takes its turn + STR vs 12." },
  { id: "frost-bite",       name: "Frost Bite",       cost: 2, range: "nearby",   effect: "d6 damage, and frozen feet — no move on its next turn." },
  { id: "double",           name: "Double",           cost: 2, range: "self",     effect: "A shimmering twin. The next attack that would hit you hits it, and it pops." },
  { id: "reveal",           name: "Reveal",           cost: 1, range: "nearby",   effect: "Hidden things glow: secret doors, tracks, invisible creatures, poison in the cup." },
  { id: "purify",           name: "Purify",           cost: 1, range: "touching", effect: "Cleanse poison or disease from food, drink, or a person." },
  { id: "whispering-wind",  name: "Whispering Wind",  cost: 1, range: "far",      effect: "One sentence, into the ear of anyone you can see. Only they hear it." }
]);

const CANTRIPS = Object.freeze([
  { id: "spark",       name: "Spark",       cost: 0, range: "nearby",   effect: "Light a candle, fuse, or campfire from a few feet away." },
  { id: "mend",        name: "Mend",        cost: 0, range: "touching", effect: "Fix one broken small object." },
  { id: "light",       name: "Light",       cost: 0, range: "touching", effect: "An object glows like a torch for an hour." },
  { id: "ghost-sound", name: "Ghost Sound", cost: 0, range: "nearby",   effect: "A noise of your choice, from where you point." },
  { id: "chill",       name: "Chill",       cost: 0, range: "touching", effect: "Cool a drink, freeze a puddle, frost a doorknob." },
  { id: "float",       name: "Float",       cost: 0, range: "nearby",   effect: "Lift something book-sized across the room." },
  { id: "clean",       name: "Clean",       cost: 0, range: "touching", effect: "One object or person becomes spotless." },
  { id: "trickster",   name: "Trickster",   cost: 0, range: "nearby",   effect: "A tiny illusion, hand-sized. It can't touch anything." }
]);

/** Look up a spell or cantrip by stored id; null for "" or unknown ids (= empty slot). */
function magicEntry(id) {
  if (!id) return null;
  return SPELLS.find(s => s.id === id) ?? CANTRIPS.find(c => c.id === id) ?? null;
}

/* ------------------------------------------------------------
   HERO DATA — exactly 6 races and 5 professions (docs/rulebook.md).
   Heroes store only the id; trait, move, Ace and kit are looked up.
   ------------------------------------------------------------ */

const RACES = Object.freeze([
  { id: "human",    name: "Human",    trait: "Lucky. Once per session, reroll any die." },
  { id: "elf",      name: "Elf",      trait: "Night vision. You see in the dark as if it were dim light." },
  { id: "dwarf",    name: "Dwarf",    trait: "Stone sense. You know when rock is unstable, hollow, or hiding a door." },
  { id: "halfling", name: "Halfling", trait: "Small and quick. Hide behind almost anything; squeeze through gaps others can't." },
  { id: "orc",      name: "Orc",      trait: "Fierce. Once per fight, add +2 to one damage roll." },
  { id: "gnome",    name: "Gnome",    trait: "Small-speech. Talk with animals no bigger than a dog." }
]);

const weapon = (name, die, stat, dtype, reach) => ({ name, die, stat, dtype, reach });

// kit.armor: clothes 0 · leather 1 · chainmail 2 · plate 3 · shield +1 (Defense = 10 + armor)
const PROFESSIONS = Object.freeze([
  { id: "warrior", name: "Warrior", caster: false, spellPicks: 0, fixedSpell: null,
    move: "Guard. When an attack would hit someone next to you, take it instead.",
    ace: { name: "Unbreakable", trigger: "you drop to 0 Life",
      effect: "You don't fall. You stay standing at 1 Life, and nothing can take you below 1 until the fight is over. When it ends, so do you — you collapse and need treating like anyone else." },
    kit: { weapons: [weapon("Sword", "d6", "str", "cutting", "touching")], armor: 3, gear: "Shield, chainmail", gold: 20 } },
  { id: "barbarian", name: "Barbarian", caster: false, spellPicks: 0, fixedSpell: null,
    move: "Rage. Once per fight: +2 damage, −2 Defense for the rest of it.",
    ace: { name: "Blood Frenzy", trigger: "you're at half Life or less",
      effect: "For the rest of the fight, every attack of yours that lands rolls damage twice and takes the higher. You also take double damage from everything. There is no calling it off." },
    kit: { weapons: [weapon("Greataxe", "d8", "str", "cutting", "touching")], armor: 1, gear: "Leather armor", gold: 10 } },
  { id: "rogue", name: "Rogue", caster: false, spellPicks: 0, fixedSpell: null,
    move: "Sneak Attack. Attacking someone who hasn't noticed you: 2d20 take the better, +2 damage.",
    ace: { name: "The Opening", trigger: "you can see the enemy and they haven't seen you move",
      effect: "You've been waiting the whole fight. Your attack hits automatically and counts as a critical — double damage, plus your Sneak Attack bonus. No roll. You just say where the dagger goes." },
    kit: { weapons: [weapon("Dagger", "d4", "agi", "cutting", "thrown nearby"), weapon("Dagger", "d4", "agi", "cutting", "thrown nearby"), weapon("Bow", "d6", "agi", "piercing", "far")],
      armor: 1, gear: "Leather armor, lockpicks, rope (50 ft)", gold: 15 } },
  { id: "wizard", name: "Wizard", caster: true, spellPicks: 2, fixedSpell: null,
    move: "Magic Points = INT × 3. Knows two spells.",
    ace: { name: "Final Word", trigger: "your Magic Points are at 0",
      effect: "Empty, exhausted, and still standing. Cast any spell you know, for free, at double effect — double damage, double healing, double duration." },
    kit: { weapons: [weapon("Staff", "d4", "str", "bludgeoning", "touching")], armor: 0, gear: "Clothes, spellbook", gold: 10 } },
  { id: "healer", name: "Healer", caster: true, spellPicks: 1, fixedSpell: "healing-hands",
    move: "Magic Points = INT × 3. Knows Healing Hands + one more.",
    ace: { name: "Second Breath", trigger: "at least one ally is at 0 Life",
      effect: "Every ally you can see gets back on their feet and recovers half their missing Life. Costs no Magic Points." },
    kit: { weapons: [weapon("Mace", "d6", "str", "bludgeoning", "touching")], armor: 1, gear: "Leather armor, bandages (3 treatments)", gold: 15 } }
]);

function raceById(id)       { return id ? RACES.find(r => r.id === id) ?? null : null; }
function professionById(id) { return id ? PROFESSIONS.find(p => p.id === id) ?? null : null; }

/* ------------------------------------------------------------
   DATA MODELS
   ------------------------------------------------------------ */

function statField() {
  return new fields.NumberField({ required: true, integer: true, min: 1, max: 5, initial: 2 });
}

function weaponField() {
  return new fields.SchemaField({
    name:  new fields.StringField({ initial: "" }),
    die:   new fields.StringField({ initial: "d6" }),
    stat:  new fields.StringField({ initial: "str" }),
    dtype: new fields.StringField({ initial: "cutting" }),
    reach: new fields.StringField({ initial: "touching" })
  });
}

class HeroData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      stats: new fields.SchemaField({
        str: statField(), agi: statField(), con: statField(), int: statField()
      }),
      life: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 11 })
      }),
      mp: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 0 })
      }),
      armor: new fields.NumberField({ required: true, integer: true, min: 0, max: 4, initial: 0 }),
      race:       new fields.StringField({ initial: "" }),   // a RACES id or ""
      profession: new fields.StringField({ initial: "" }),   // a PROFESSIONS id or ""
      // Trait, move and the Ace's name/trigger/effect are looked up from RACES / PROFESSIONS.
      ace: new fields.SchemaField({
        used: new fields.BooleanField({ initial: false })    // ticked by Play Ace; a human unticks
      }),
      magic: new fields.SchemaField({
        cantrip:   new fields.StringField({ initial: "" }),   // a CANTRIPS id or "" (empty slot)
        spell1:    new fields.StringField({ initial: "" }),   // a SPELLS id or ""
        spell2:    new fields.StringField({ initial: "" }),   // a SPELLS id or ""
        channeled: new fields.BooleanField({ initial: false }) // once per fight — a human unticks it
      }),
      gear:    new fields.StringField({ initial: "" }),
      gold:    new fields.NumberField({ required: true, integer: true, initial: 0 }),
      silver:  new fields.NumberField({ required: true, integer: true, initial: 0 }),
      raging:  new fields.BooleanField({ initial: false }),
      treated: new fields.BooleanField({ initial: false }), // "Treated this fight" — a human unticks
      bonus:   new fields.NumberField({ required: true, integer: true, initial: 0 }),
      weapons: new fields.SchemaField({
        w1: weaponField(), w2: weaponField(), w3: weaponField()
      })
    };
  }

  prepareDerivedData() {
    this.raceData       = raceById(this.race);
    this.professionData = professionById(this.profession);
    this.life.max = 7 + this.stats.con * 2;                              // Life = 7 + CON × 2
    this.mp.max   = this.professionData?.caster ? this.stats.int * 3 : 0; // MP = INT × 3, casters only
    this.defense  = 10 + this.armor - (this.raging ? 2 : 0);             // Defense = 10 + armor, −2 raging
    this.initiativeRank = 2;                                             // players act before monsters
    // "At 0 MP, your Ace wakes up" — the Wizard's Final Word.
    this.aceReady = this.profession === "wizard" && this.mp.value === 0 && !this.ace.used;
  }
}

class MonsterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      life: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, initial: 6 }),
        max:   new fields.NumberField({ required: true, integer: true, initial: 6 })
      }),
      defense: new fields.NumberField({ required: true, integer: true, initial: 11 }),
      attack: new fields.SchemaField({
        die:   new fields.StringField({ initial: "d6" }),
        bonus: new fields.NumberField({ required: true, integer: true, initial: 1 }),
        dtype: new fields.StringField({ initial: "" })
      }),
      trick: new fields.StringField({ initial: "" }),
      notes: new fields.StringField({ initial: "" })
    };
  }

  prepareDerivedData() {
    this.initiativeRank = 1;                  // monsters act after players
  }
}

/* ------------------------------------------------------------
   ROLL HELPERS
   ------------------------------------------------------------ */

/** Localize a key; with data, format it. All user-visible text goes through here. */
function t(key, data) {
  return data ? game.i18n.format(key, data) : game.i18n.localize(key);
}

// Hints are built at call time: i18n is not ready when the module loads.
const attackHint = () => `<span class="qq-hint">${t("QQ.Roll.AttackHint")}</span>`;
const checkHint  = () => `<span class="qq-hint">${t("QQ.Roll.CheckHint")}</span>`;

/** " — advantage" / " — disadvantage" / "" for a pickMode() result. */
function modeLabel(mode) {
  return mode === "adv" ? ` ${t("QQ.Roll.Adv")}` : mode === "dis" ? ` ${t("QQ.Roll.Dis")}` : "";
}

async function postRoll(actor, formula, flavor) {
  const roll = await new Roll(formula).evaluate();
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor
  });
  return roll;
}

/** Post a plain chat card (no dice) from an actor. */
async function postCard(actor, html) {
  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: html
  });
}

/** Letterpress chat card for a spell or cantrip. The card must teach the whole rule. */
function spellCardHtml(entry, { mpLeft, mpMax, channeledLife = null, cantrip = false }) {
  const L = k => game.i18n.localize(`QQ.Magic.${k}`);
  const range = t(`QQ.Range.${entry.range}`);
  const meta = cantrip
    ? `${L("Range")}: ${range}`
    : `${L("Range")}: ${range} · ${L("Cost")}: ${entry.cost} ${L("MP")}`;
  const foot = cantrip
    ? L("CantripFree")
    : `${L("MPLeft")}: ${mpLeft} / ${mpMax}`;
  const badge = channeledLife === null ? "" :
    `<div class="qq-card-badge">${L("ChanneledBadge")} — ${channeledLife} ${L("Life")}</div>`;
  return `<div class="qq-card qq-card-spell">
    <div class="qq-card-title">${entry.name}</div>
    <div class="qq-card-meta">${meta}</div>
    <div class="qq-card-body">${entry.effect}</div>
    <div class="qq-card-foot">${foot}</div>
    ${badge}
  </div>`;
}

async function pickMode(title) {
  return DialogV2.wait({
    window: { title },
    buttons: [
      { action: "dis",    label: t("QQ.Roll.Disadvantage") },
      { action: "normal", label: t("QQ.Roll.Normal"), default: true },
      { action: "adv",    label: t("QQ.Roll.Advantage") }
    ],
    rejectClose: false
  });
}

function d20Formula(mode) {
  return mode === "adv" ? "2d20kh" : mode === "dis" ? "2d20kl" : "1d20";
}

/** Shift → advantage, Ctrl/Cmd → disadvantage, else null (ask with the dialog). */
function pickModeFromEvent(event) {
  if (event?.shiftKey) return "adv";
  if (event?.ctrlKey || event?.metaKey) return "dis";
  return null;
}

/** Natural 20 / natural 1 are judged on the kept die, not the total. */
function keptD20(roll) {
  return roll.dice[0]?.results.find(r => r.active)?.result ?? null;
}

// A natural 20 earns one doubled damage roll. In memory only — never stored on the actor —
// and cleared by that actor's next damage roll or next attack roll.
const PENDING_CRIT = new Set();

/** Extra card HTML for a kept 20 (CRITICAL) or kept 1 (FUMBLE + roll button). */
function attackBadges(roll, actor) {
  const kept = keptD20(roll);
  if (kept === 20) {
    PENDING_CRIT.add(actor.id);
    return `<div class="qq-card-badge qq-crit">${t("QQ.Roll.Critical")}</div>`;
  }
  PENDING_CRIT.delete(actor.id);
  if (kept === 1) {
    return `<div class="qq-card-badge qq-fumble">${t("QQ.Roll.FumbleBadge")}</div>
      <button type="button" class="qq-card-btn" data-action="rollFumble" data-actor-uuid="${actor.uuid}">${t("QQ.Roll.RollFumble")}</button>`;
  }
  return "";
}

/** Attack roll for heroes and monsters: adv/dis from keys or dialog; never a modifier. */
async function postAttack(actor, event, title) {
  const mode = pickModeFromEvent(event) ?? await pickMode(title);
  if (!mode) return;
  const roll = await new Roll(d20Formula(mode)).evaluate();
  const flavor = `<b>${t("QQ.Roll.Attack")}</b>${modeLabel(mode)}<br>${attackHint()}${attackBadges(roll, actor)}`;
  await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor });
  return roll;
}

/** After a natural 20, offer to double the next damage roll. Returns the formula to use. */
async function maybeDouble(actor, formula, parts) {
  if (!PENDING_CRIT.has(actor.id)) return formula;
  PENDING_CRIT.delete(actor.id);
  const ok = await DialogV2.confirm({
    window: { title: t("QQ.Roll.CritPromptTitle") },
    content: `<p>${t("QQ.Roll.CritPromptBody")}</p>`,
    yes: { label: t("QQ.Roll.Double"), default: true },
    no:  { label: t("QQ.Roll.NormalDamage") },
    rejectClose: false
  });
  if (!ok) return formula;
  parts.unshift(t("QQ.Roll.CritTag"));
  return `(${formula}) * 2`;
}

/** The fumble table. Shared by the sheet button and the chat-card button. */
async function rollFumble(actor) {
  if (!actor) return;
  const table = [1, 2, 3, 4, 5, 6].map(n => t(`QQ.Fumble.${n}`)).join(" · ");
  const flavor = `<b>${t("QQ.Fumble.Title")}</b><br><span class="qq-hint">${table}</span>`;
  return postRoll(actor, "1d6", flavor);
}

/* ------------------------------------------------------------
   HERO SHEET
   ------------------------------------------------------------ */

class QuickQuestHeroSheet extends HandlebarsApplicationMixin(ActorSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["quickquest", "qq-hero"],
    position: { width: 660, height: 780 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      rollCheck:  QuickQuestHeroSheet.#onRollCheck,
      rollAttack: QuickQuestHeroSheet.#onRollAttack,
      rollDamage: QuickQuestHeroSheet.#onRollDamage,
      rollFumble: QuickQuestHeroSheet.#onRollFumble,
      castSpell:  QuickQuestHeroSheet.#onCastSpell,
      playAce:     QuickQuestHeroSheet.#onPlayAce,
      treatWounds: QuickQuestHeroSheet.#onTreatWounds,
      drinkPotion: QuickQuestHeroSheet.#onDrinkPotion,
      weaponCard:  QuickQuestHeroSheet.#onWeaponCard,
      openWizard:  QuickQuestHeroSheet.#onOpenWizard
    }
  };

  static PARTS = {
    sheet: { template: "systems/quickquest/templates/hero-sheet.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const sys = this.actor.system;
    context.actor = this.actor;
    context.system = sys;
    context.weapons = ["w1", "w2", "w3"].map(k => ({ key: k, ...sys.weapons[k] }));

    // Magic: one cantrip slot + two spell slots, fed by the fixed lists.
    const spellChoices   = Object.fromEntries(SPELLS.map(s => [s.id, `${s.name} (${s.cost} ${t("QQ.Magic.MP")})`]));
    const cantripChoices = Object.fromEntries(CANTRIPS.map(c => [c.id, c.name]));
    context.slots = [
      { key: "cantrip", label: game.i18n.localize("QQ.Magic.Cantrip"), choices: cantripChoices },
      { key: "spell1",  label: game.i18n.localize("QQ.Magic.Spell1"),  choices: spellChoices },
      { key: "spell2",  label: game.i18n.localize("QQ.Magic.Spell2"),  choices: spellChoices }
    ].map(s => ({ ...s, value: sys.magic[s.key], entry: magicEntry(sys.magic[s.key]) }));
    context.magicPlaceholder = MAGIC_IS_PLACEHOLDER;

    // Race and profession are fixed selects; the sheet shows the book's text read-only.
    context.raceChoices       = Object.fromEntries(RACES.map(r => [r.id, r.name]));
    context.professionChoices = Object.fromEntries(PROFESSIONS.map(p => [p.id, p.name]));
    return context;
  }

  /* ---- magic ---- */

  static async #onCastSpell(event, target) {
    const slot = target.dataset.slot;
    const entry = magicEntry(this.actor.system.magic[slot]);
    if (!entry) return;
    const sys = this.actor.system;
    const mpMax = sys.mp.max;

    // Cantrips are free: card only, no numbers change.
    if (entry.cost === 0) {
      return postCard(this.actor, spellCardHtml(entry, { cantrip: true, mpLeft: sys.mp.value, mpMax }));
    }

    // A hand-typed MP above max is clamped here, at cast time, never on blur.
    const have = Math.min(sys.mp.value, mpMax);
    if (have >= entry.cost) {
      const mpLeft = have - entry.cost;
      await this.actor.update({ "system.mp.value": mpLeft });
      return postCard(this.actor, spellCardHtml(entry, { mpLeft, mpMax }));
    }

    return this.#offerChanneling(entry, have);
  }

  /** Short on MP: 2 Life per missing MP, once per fight, never below 1 Life. */
  async #offerChanneling(entry, have) {
    const sys = this.actor.system;
    const L = k => game.i18n.localize(`QQ.Magic.${k}`);
    const missing  = entry.cost - have;
    const lifeCost = 2 * missing;
    const title = L("ChannelTitle");

    if (sys.magic.channeled) {
      await DialogV2.prompt({
        window: { title },
        content: `<p>${L("AlreadyChanneled")}</p>`,
        rejectClose: false
      });
      return;
    }

    if (sys.life.value - lifeCost <= 0) {
      await DialogV2.prompt({
        window: { title },
        content: `<p>${game.i18n.format("QQ.Magic.CannotSurvive", { lifeCost, life: sys.life.value })}</p>`,
        rejectClose: false
      });
      return;
    }

    const ok = await DialogV2.confirm({
      window: { title },
      content: `<p>${game.i18n.format("QQ.Magic.ChannelBody", { missing, lifeCost, spell: entry.name })}</p>`,
      yes: { label: L("ChannelButton"), default: true },
      no:  { label: L("Cancel") },
      rejectClose: false
    });
    if (!ok) return;

    await this.actor.update({
      "system.life.value": sys.life.value - lifeCost,
      "system.mp.value": 0,
      "system.magic.channeled": true
    });
    return postCard(this.actor, spellCardHtml(entry, { mpLeft: 0, mpMax: sys.mp.max, channeledLife: lifeCost }));
  }

  /* ---- rolls ---- */

  static async #onRollCheck(event, target) {
    const stat = target.dataset.stat;
    const value = this.actor.system.stats[stat];
    const adv = value >= 4;
    const forced = pickModeFromEvent(event);           // Shift/Ctrl override the stat rule
    const formula = forced ? d20Formula(forced) : (adv ? "2d20kh" : "1d20");
    const suffix = forced ? modeLabel(forced) : (adv ? ` ${t("QQ.Roll.AdvStat")}` : "");
    const title = t("QQ.Roll.Check", { stat: t(`QQ.Stat.${stat}`) });
    await postRoll(this.actor, formula, `<b>${title}</b>${suffix}<br>${checkHint()}`);
  }

  static async #onRollAttack(event, target) {
    await postAttack(this.actor, event, t("QQ.Roll.AttackTitle"));
  }

  static async #onRollDamage(event, target) {
    const w = this.actor.system.weapons[target.dataset.weapon];
    const sys = this.actor.system;
    const statVal = sys.stats[w.stat] ?? 0;
    let formula = `1${w.die} + ${statVal}`;
    const parts = [`${w.die} + ${t(`QQ.Stat.${w.stat}`)}`];
    if (sys.raging) { formula += " + 2"; parts.push(t("QQ.Roll.Rage")); }
    if (sys.bonus)  { formula += ` + ${sys.bonus}`; parts.push(t("QQ.Roll.Bonus", { bonus: `${sys.bonus > 0 ? "+" : ""}${sys.bonus}` })); }
    const name = w.name || t("QQ.Roll.Weapon");
    const dtype = w.dtype ? t(`QQ.Weapon.Type.${w.dtype}`) : "";
    const reach = w.reach ? t(`QQ.Weapon.Reach.${w.reach}`) : "";
    formula = await maybeDouble(this.actor, formula, parts);
    const flavor = `<b>${t("QQ.Roll.Damage", { name })}</b> (${parts.join(", ")})<br><span class="qq-hint">${dtype}${reach ? " · " + reach : ""}</span>`;
    await postRoll(this.actor, formula, flavor);
  }

  static async #onRollFumble(event, target) {
    return rollFumble(this.actor);
  }

  /* ---- teaching buttons ---- */

  static async #onPlayAce(event, target) {
    const sys = this.actor.system;
    const ace = sys.professionData?.ace;
    if (!ace || sys.ace.used) return;
    await this.actor.update({ "system.ace.used": true });
    return postCard(this.actor, `<div class="qq-card qq-card-ace">
      <div class="qq-card-title">${t("QQ.Ace.Played")}: ${ace.name}</div>
      <div class="qq-card-meta">${t("QQ.Sheet.PlaysWhen", { trigger: ace.trigger })}</div>
      <div class="qq-card-body">${ace.effect}</div>
      <div class="qq-card-foot">${t("QQ.Ace.OncePerSession")}</div>
    </div>`);
  }

  static #onOpenWizard(event, target) {
    new QuickQuestCreationWizard({ actor: this.actor, mode: "rebuild" }).render(true);
  }

  static async #onTreatWounds(event, target) {
    const sys = this.actor.system;
    const missing = sys.life.max - sys.life.value;
    if (missing <= 0) return ui.notifications.info(t("QQ.Recover.NothingToTreat"));
    if (sys.treated)  return ui.notifications.info(t("QQ.Recover.AlreadyTreated"));
    const heal = Math.ceil(missing / 2);                 // half of what is missing, rounded up
    const from = sys.life.value, to = from + heal;
    await this.actor.update({ "system.life.value": to, "system.treated": true });
    return postCard(this.actor, `<div class="qq-card qq-card-recover">
      <div class="qq-card-title">${t("QQ.Recover.TreatTitle")}</div>
      <div class="qq-card-body">${t("QQ.Recover.TreatBody", { from, to, missing })}</div>
      <div class="qq-card-foot">${t("QQ.Recover.OncePerFight")}</div>
    </div>`);
  }

  static async #onDrinkPotion(event, target) {
    const sys = this.actor.system;
    const roll = await new Roll("1d6 + 2").evaluate();
    const from = sys.life.value;
    const heal = Math.max(0, Math.min(roll.total, sys.life.max - from)); // never above max
    const to = from + heal;
    if (heal > 0) await this.actor.update({ "system.life.value": to });
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<b>${t("QQ.Recover.PotionTitle")}</b><br><span class="qq-hint">${t("QQ.Recover.PotionBody", { heal, from, to })}</span>`
    });
  }

  static async #onWeaponCard(event, target) {
    const w = this.actor.system.weapons[target.dataset.weapon];
    const name = w.name || t("QQ.Roll.Weapon");
    const meta = `${w.die}+${t(`QQ.Stat.${w.stat}`)} · ${t(`QQ.Weapon.Type.${w.dtype}`)} · ${t(`QQ.Weapon.Reach.${w.reach}`)}`;
    return postCard(this.actor, `<div class="qq-card qq-card-weapon">
      <div class="qq-card-title">${name}</div>
      <div class="qq-card-meta">${meta}</div>
      <div class="qq-card-body">${t(`QQ.Flavor.${w.dtype}`)}</div>
    </div>`);
  }
}

/* ------------------------------------------------------------
   MONSTER SHEET
   ------------------------------------------------------------ */

class QuickQuestMonsterSheet extends HandlebarsApplicationMixin(ActorSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["quickquest", "qq-monster"],
    position: { width: 480, height: 520 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      rollAttack: QuickQuestMonsterSheet.#onRollAttack,
      rollDamage: QuickQuestMonsterSheet.#onRollDamage
    }
  };

  static PARTS = {
    sheet: { template: "systems/quickquest/templates/monster-sheet.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.actor = this.actor;
    context.system = this.actor.system;
    return context;
  }

  static async #onRollAttack(event, target) {
    await postAttack(this.actor, event, t("QQ.Roll.MonsterAttackTitle"));
  }

  static async #onRollDamage(event, target) {
    const a = this.actor.system.attack;
    let formula = `1${a.die}`;
    if (a.bonus) formula += ` + ${a.bonus}`;
    const parts = [`${a.die}${a.bonus ? " + " + a.bonus : ""}`];
    formula = await maybeDouble(this.actor, formula, parts);
    const flavor = `<b>${t("QQ.Roll.DamageMonster")}</b> (${parts.join(", ")})${a.dtype ? `<br><span class="qq-hint">${a.dtype}</span>` : ""}`;
    await postRoll(this.actor, formula, flavor);
  }
}

/* ------------------------------------------------------------
   CREATION WIZARD — five steps; writes the actor only on Finish
   ------------------------------------------------------------ */

const STAT_KEYS = ["str", "agi", "con", "int"];
const POINTS_TO_SPEND = 6; // every stat starts at 1; the book's 10-point spread

class QuickQuestCreationWizard extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    classes: ["quickquest", "qq-hero", "qq-wizard"],
    position: { width: 560, height: "auto" },
    window: { title: "QQ.Wizard.Title", resizable: false },
    actions: {
      statInc: QuickQuestCreationWizard.#onStat,
      statDec: QuickQuestCreationWizard.#onStat,
      pick:    QuickQuestCreationWizard.#onPick,
      back:    QuickQuestCreationWizard.#onBack,
      next:    QuickQuestCreationWizard.#onNext,
      finish:  QuickQuestCreationWizard.#onFinish,
      cancel:  QuickQuestCreationWizard.#onCancel
    }
  };

  static PARTS = {
    body: { template: "systems/quickquest/templates/creation-wizard.hbs" }
  };

  constructor({ actor, mode = "create", ...options } = {}) {
    super(options);
    this.actor = actor;
    this.mode = mode;          // "create" resets the hero; "rebuild" keeps Life, MP, coins, gear
    this.step = 1;
    this.choices = this.#initialChoices();
    this.#applySpellDefaults();
  }

  /* ---- state ---- */

  #initialChoices() {
    const def = { name: "", stats: { str: 3, agi: 3, con: 2, int: 2 }, race: "human",
                  profession: "warrior", cantrip: "spark", spell1: "", spell2: "" };
    if (this.mode !== "rebuild") return def;
    const sys = this.actor.system;
    return {
      name: this.actor.name,
      stats: Object.fromEntries(STAT_KEYS.map(k => [k, sys.stats[k]])),
      race: sys.raceData ? sys.race : def.race,
      profession: sys.professionData ? sys.profession : def.profession,
      cantrip: magicEntry(sys.magic.cantrip) ? sys.magic.cantrip : def.cantrip,
      spell1: sys.magic.spell1,
      spell2: sys.magic.spell2
    };
  }

  #prof() { return professionById(this.choices.profession); }
  #spent() { return STAT_KEYS.reduce((sum, k) => sum + this.choices.stats[k], 0) - STAT_KEYS.length; }

  /** Casters always leave with legal spells; the book's ready-made heroes are the defaults. */
  #applySpellDefaults() {
    const prof = this.#prof(), c = this.choices;
    if (!prof?.caster) { c.spell1 = ""; c.spell2 = ""; return; }
    const isSpell = id => SPELLS.some(s => s.id === id);
    if (prof.fixedSpell) c.spell1 = prof.fixedSpell;
    else if (!isSpell(c.spell1)) c.spell1 = "fireball";
    if (!isSpell(c.spell2) || c.spell2 === c.spell1) {
      c.spell2 = prof.fixedSpell ? "bless" : (c.spell1 === "summon-lightning" ? "fireball" : "summon-lightning");
    }
  }

  #spellProblem() {
    const prof = this.#prof();
    if (!prof?.caster) return null;
    const slots = [this.choices.spell1, this.choices.spell2];
    const valid    = slots.every(id => SPELLS.some(s => s.id === id));
    const distinct = new Set(slots).size === slots.length;
    const fixedOk  = !prof.fixedSpell || this.choices.spell1 === prof.fixedSpell;
    return (valid && distinct && fixedOk) ? null : t("QQ.Wizard.NeedSpells", { n: prof.spellPicks });
  }

  #valid(step = this.step) {
    const s = this.choices.stats;
    switch (step) {
      case 1: return this.#spent() === POINTS_TO_SPEND && STAT_KEYS.every(k => s[k] >= 1 && s[k] <= 5);
      case 2: return !!raceById(this.choices.race);
      case 3: return !!this.#prof();
      case 4: return !!magicEntry(this.choices.cantrip) && !this.#spellProblem();
      default: return true;
    }
  }

  /* ---- rendering ---- */

  async _prepareContext(options) {
    const c = this.choices, prof = this.#prof(), race = raceById(c.race);
    const spent = this.#spent();
    const spellLabel = s => `${s.name} (${s.cost} ${t("QQ.Magic.MP")})`;
    const spellChoices = Object.fromEntries(SPELLS.map(s => [s.id, spellLabel(s)]));
    const pickSlots = prof?.caster
      ? [...Array(prof.spellPicks)].map((_, i) => {
          const key = prof.fixedSpell ? `spell${i + 2}` : `spell${i + 1}`;
          return { key, value: c[key], choices: spellChoices, entry: magicEntry(c[key]) };
        })
      : [];
    return {
      step: this.step,
      canNext: this.#valid(),
      spent,
      stats: STAT_KEYS.map(k => ({
        key: k, label: t(`QQ.Stat.${k}`), value: c.stats[k],
        canInc: c.stats[k] < 5 && spent < POINTS_TO_SPEND, canDec: c.stats[k] > 1
      })),
      races: RACES.map(r => ({ ...r, selected: r.id === c.race })),
      professions: PROFESSIONS.map(p => ({
        ...p, selected: p.id === c.profession,
        aceLine: t("QQ.Wizard.AceLine", { name: p.ace.name, trigger: p.ace.trigger }),
        kitLine: t("QQ.Wizard.KitLine", { kit: [...p.kit.weapons.map(w => w.name), p.kit.gear, `${p.kit.gold} ${t("QQ.Sheet.Gold").toLowerCase()}`].join(", ") }),
        mpLine: t(p.caster ? "QQ.Wizard.HasMP" : "QQ.Wizard.NoMP")
      })),
      cantrips: CANTRIPS.map(x => ({ ...x, selected: x.id === c.cantrip })),
      caster: !!prof?.caster,
      fixedSpell: prof?.fixedSpell ? magicEntry(prof.fixedSpell) : null,
      spellSlots: pickSlots,
      spellProblem: this.#spellProblem(),
      name: c.name,
      namePlaceholder: prof?.name ?? "",
      summary: (prof && race) ? {
        raceName: race.name, profName: prof.name,
        stats: STAT_KEYS.map(k => `${t(`QQ.Stat.${k}`)} ${c.stats[k]}`).join(" · "),
        life: 7 + c.stats.con * 2,
        mp: prof.caster ? c.stats.int * 3 : 0,
        defense: 10 + prof.kit.armor,
        weapons: prof.kit.weapons.map(w => `${w.name} ${w.die}+${t(`QQ.Stat.${w.stat}`)}`).join(", "),
        magic: [c.cantrip, c.spell1, c.spell2].map(id => magicEntry(id)?.name).filter(Boolean).join(", ")
      } : null
    };
  }

  /** Selects and the name input are not actions; read them on change. */
  _onRender(context, options) {
    super._onRender(context, options);
    this.element.querySelectorAll("[data-field]").forEach(el => {
      el.addEventListener("change", () => {
        this.choices[el.dataset.field] = el.value;
        this.render();
      });
    });
  }

  /* ---- actions ---- */

  static #onStat(event, target) {
    const k = target.dataset.stat;
    const delta = target.dataset.action === "statInc" ? 1 : -1;
    const next = this.choices.stats[k] + delta;
    if (next < 1 || next > 5) return;
    if (delta > 0 && this.#spent() >= POINTS_TO_SPEND) return;
    this.choices.stats[k] = next;
    this.render();
  }

  static #onPick(event, target) {
    const { field, value } = target.dataset;
    this.choices[field] = value;
    if (field === "profession") this.#applySpellDefaults();
    this.render();
  }

  static #onBack()   { if (this.step > 1) { this.step--; this.render(); } }
  static #onNext()   { if (this.step < 5 && this.#valid()) { this.step++; this.render(); } }
  static #onCancel() { this.close(); }   // nothing was written

  static async #onFinish() {
    const bad = [1, 2, 3, 4].find(s => !this.#valid(s));
    if (bad) { this.step = bad; return this.render(); }

    const c = this.choices, prof = this.#prof(), sys = this.actor.system;
    const weapons = {};
    ["w1", "w2", "w3"].forEach((k, i) => {
      weapons[k] = prof.kit.weapons[i] ? { ...prof.kit.weapons[i] }
                                       : { name: "", die: "d6", stat: "str", dtype: "cutting", reach: "touching" };
    });
    const lifeMax = 7 + c.stats.con * 2;
    const mpMax   = prof.caster ? c.stats.int * 3 : 0;

    const update = {
      name: c.name.trim() || prof.name,
      "system.stats": { ...c.stats },
      "system.race": c.race,
      "system.profession": c.profession,
      "system.armor": prof.kit.armor,
      "system.weapons": weapons,
      "system.magic.cantrip": c.cantrip,
      "system.magic.spell1": prof.caster ? c.spell1 : "",
      "system.magic.spell2": prof.caster ? c.spell2 : ""
    };
    if (this.mode === "create") {
      Object.assign(update, {
        "system.gear": prof.kit.gear, "system.gold": prof.kit.gold, "system.silver": 0, "system.bonus": 0,
        "system.life.value": lifeMax, "system.mp.value": mpMax,
        "system.ace.used": false, "system.raging": false, "system.treated": false, "system.magic.channeled": false
      });
    } else {
      // Rebuild keeps the player's Life, MP, coins and gear; only clamps to the new maxima.
      update["system.life.value"] = Math.min(sys.life.value, lifeMax);
      update["system.mp.value"]   = Math.min(sys.mp.value, mpMax);
    }

    await this.actor.update(update);
    await this.close();
    if (!this.actor.sheet.rendered) this.actor.sheet.render(true);
  }
}

/* ------------------------------------------------------------
   REGISTRATION
   ------------------------------------------------------------ */

Hooks.once("init", () => {
  console.log("QuickQuest | Initializing");

  // The spell list is a closed set by rule; make that executable.
  if (SPELLS.length !== 12 || CANTRIPS.length !== 8) {
    throw new Error("QuickQuest | SPELLS must have 12 entries, CANTRIPS 8");
  }
  if (MAGIC_IS_PLACEHOLDER) console.warn("QuickQuest | SPELLS/CANTRIPS are placeholders");
  if (RACES.length !== 6 || PROFESSIONS.length !== 5) {
    throw new Error("QuickQuest | RACES must have 6 entries, PROFESSIONS 5");
  }

  // A brand-new hero opens the guided creation for whoever created it.
  // Pack imports can pass { qqSkipWizard: true } to stay quiet.
  Hooks.on("createActor", (actor, options, userId) => {
    if (actor.type !== "hero" || userId !== game.user.id || options?.qqSkipWizard) return;
    new QuickQuestCreationWizard({ actor, mode: "create" }).render(true);
  });

  // Chat-card buttons (the fumble prompt on a natural 1). v13 renamed the hook and passes an
  // HTMLElement instead of jQuery; register only the matching one.
  const chatHook = game.release.generation >= 13 ? "renderChatMessageHTML" : "renderChatMessage";
  Hooks.on(chatHook, (message, html) => {
    const root = html instanceof HTMLElement ? html : html?.[0];
    root?.querySelectorAll('.qq-card-btn[data-action="rollFumble"]').forEach(btn => {
      btn.addEventListener("click", async () => rollFumble(await fromUuid(btn.dataset.actorUuid)));
    });
  });

  Object.assign(CONFIG.Actor.dataModels, {
    hero: HeroData,
    monster: MonsterData
  });

  CONFIG.Actor.trackableAttributes = {
    hero:    { bar: ["life", "mp"], value: ["defense"] },
    monster: { bar: ["life"],       value: ["defense"] }
  };

  // Players act first: heroes rank 2, monsters rank 1, no rolling.
  CONFIG.Combat.initiative = { formula: "@initiativeRank", decimals: 0 };

  const DSC = foundry.applications.apps?.DocumentSheetConfig ?? globalThis.DocumentSheetConfig;
  DSC.registerSheet(Actor, "quickquest", QuickQuestHeroSheet, {
    types: ["hero"], makeDefault: true, label: "QQ.Sheet.HeroSheet"
  });
  DSC.registerSheet(Actor, "quickquest", QuickQuestMonsterSheet, {
    types: ["monster"], makeDefault: true, label: "QQ.Sheet.MonsterSheet"
  });
});
