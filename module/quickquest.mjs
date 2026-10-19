/* ============================================================
   QUICKQUEST — a rules-lite d20 system
   Four stats, one die, no wrong answers.
   ============================================================ */

const fields = foundry.data.fields;
const { HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/* ------------------------------------------------------------
   MAGIC DATA — the game has exactly 12 spells and 8 cantrips.
   Source of truth: docs/rulebook.md. Edit text here only.
   Keep ids stable forever; heroes store them.
   ------------------------------------------------------------ */

const MAGIC_IS_PLACEHOLDER = true; // set false once every TODO below is replaced

const SPELLS = Object.freeze([
  { id: "spell-01", name: "TODO Spell 1",  cost: 1, range: "nearby", effect: "TODO — copy from docs/rulebook.md" },
  { id: "spell-02", name: "TODO Spell 2",  cost: 1, range: "nearby", effect: "TODO — copy from docs/rulebook.md" },
  { id: "spell-03", name: "TODO Spell 3",  cost: 2, range: "nearby", effect: "TODO — copy from docs/rulebook.md" },
  { id: "spell-04", name: "TODO Spell 4",  cost: 2, range: "nearby", effect: "TODO — copy from docs/rulebook.md" },
  { id: "spell-05", name: "TODO Spell 5",  cost: 2, range: "nearby", effect: "TODO — copy from docs/rulebook.md" },
  { id: "spell-06", name: "TODO Spell 6",  cost: 3, range: "nearby", effect: "TODO — copy from docs/rulebook.md" },
  { id: "spell-07", name: "TODO Spell 7",  cost: 3, range: "nearby", effect: "TODO — copy from docs/rulebook.md" },
  { id: "spell-08", name: "TODO Spell 8",  cost: 3, range: "nearby", effect: "TODO — copy from docs/rulebook.md" },
  { id: "spell-09", name: "TODO Spell 9",  cost: 3, range: "nearby", effect: "TODO — copy from docs/rulebook.md" },
  { id: "spell-10", name: "TODO Spell 10", cost: 4, range: "nearby", effect: "TODO — copy from docs/rulebook.md" },
  { id: "spell-11", name: "TODO Spell 11", cost: 4, range: "nearby", effect: "TODO — copy from docs/rulebook.md" },
  { id: "spell-12", name: "TODO Spell 12", cost: 4, range: "nearby", effect: "TODO — copy from docs/rulebook.md" }
]);

const CANTRIPS = Object.freeze([
  { id: "cantrip-01", name: "TODO Cantrip 1", cost: 0, range: "nearby", effect: "TODO — copy from docs/rulebook.md" },
  { id: "cantrip-02", name: "TODO Cantrip 2", cost: 0, range: "nearby", effect: "TODO — copy from docs/rulebook.md" },
  { id: "cantrip-03", name: "TODO Cantrip 3", cost: 0, range: "nearby", effect: "TODO — copy from docs/rulebook.md" },
  { id: "cantrip-04", name: "TODO Cantrip 4", cost: 0, range: "nearby", effect: "TODO — copy from docs/rulebook.md" },
  { id: "cantrip-05", name: "TODO Cantrip 5", cost: 0, range: "nearby", effect: "TODO — copy from docs/rulebook.md" },
  { id: "cantrip-06", name: "TODO Cantrip 6", cost: 0, range: "nearby", effect: "TODO — copy from docs/rulebook.md" },
  { id: "cantrip-07", name: "TODO Cantrip 7", cost: 0, range: "nearby", effect: "TODO — copy from docs/rulebook.md" },
  { id: "cantrip-08", name: "TODO Cantrip 8", cost: 0, range: "nearby", effect: "TODO — copy from docs/rulebook.md" }
]);

/** Look up a spell or cantrip by stored id; null for "" or unknown ids (= empty slot). */
function magicEntry(id) {
  if (!id) return null;
  return SPELLS.find(s => s.id === id) ?? CANTRIPS.find(c => c.id === id) ?? null;
}

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
      race:       new fields.StringField({ initial: "" }),
      trait:      new fields.StringField({ initial: "" }),
      profession: new fields.StringField({ initial: "" }),
      move:       new fields.StringField({ initial: "" }),
      ace: new fields.SchemaField({
        name: new fields.StringField({ initial: "" }),
        used: new fields.BooleanField({ initial: false })
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
      bonus:   new fields.NumberField({ required: true, integer: true, initial: 0 }),
      weapons: new fields.SchemaField({
        w1: weaponField(), w2: weaponField(), w3: weaponField()
      })
    };
  }

  prepareDerivedData() {
    this.life.max = 7 + this.stats.con * 2;   // Life = 7 + CON × 2
    this.mp.max   = this.stats.int * 3;       // MP = INT × 3
    this.defense  = 10 + this.armor;          // Defense = 10 + armor
    this.initiativeRank = 2;                  // players act before monsters
    this.aceReady = this.mp.value === 0 && !this.ace.used; // out of MP → nudge the Ace
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
      castSpell:  QuickQuestHeroSheet.#onCastSpell
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
    const title = t("QQ.Roll.Check", { stat: t(`QQ.Stat.${stat}`) });
    const flavor = `<b>${title}</b>${adv ? ` ${t("QQ.Roll.AdvStat")}` : ""}<br>${checkHint()}`;
    await postRoll(this.actor, adv ? "2d20kh" : "1d20", flavor);
  }

  static async #onRollAttack(event, target) {
    const mode = await pickMode(t("QQ.Roll.AttackTitle"));
    if (!mode) return;
    await postRoll(this.actor, d20Formula(mode), `<b>${t("QQ.Roll.Attack")}</b>${modeLabel(mode)}<br>${attackHint()}`);
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
    const flavor = `<b>${t("QQ.Roll.Damage", { name })}</b> (${parts.join(", ")})<br><span class="qq-hint">${dtype}${reach ? " · " + reach : ""}</span>`;
    await postRoll(this.actor, formula, flavor);
  }

  static async #onRollFumble(event, target) {
    const table = [1, 2, 3, 4, 5, 6].map(n => t(`QQ.Fumble.${n}`)).join(" · ");
    const flavor = `<b>${t("QQ.Fumble.Title")}</b><br><span class="qq-hint">${table}</span>`;
    await postRoll(this.actor, "1d6", flavor);
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
    const mode = await pickMode(t("QQ.Roll.MonsterAttackTitle"));
    if (!mode) return;
    await postRoll(this.actor, d20Formula(mode), `<b>${t("QQ.Roll.Attack")}</b>${modeLabel(mode)}<br>${attackHint()}`);
  }

  static async #onRollDamage(event, target) {
    const a = this.actor.system.attack;
    let formula = `1${a.die}`;
    if (a.bonus) formula += ` + ${a.bonus}`;
    const flavor = `<b>${t("QQ.Roll.DamageMonster")}</b> (${a.die}${a.bonus ? " + " + a.bonus : ""})${a.dtype ? `<br><span class="qq-hint">${a.dtype}</span>` : ""}`;
    await postRoll(this.actor, formula, flavor);
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
