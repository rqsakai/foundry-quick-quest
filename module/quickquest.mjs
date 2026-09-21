/* ============================================================
   QUICKQUEST — a rules-lite d20 system
   Four stats, one die, no wrong answers.
   ============================================================ */

const fields = foundry.data.fields;
const { HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

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
      cantrip: new fields.StringField({ initial: "" }),
      spells:  new fields.StringField({ initial: "" }),
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

const ATTACK_HINT = `<span class="qq-hint">Hits if &ge; target's Defense · nat 20 = double damage · nat 1 = fumble (roll d6)</span>`;
const CHECK_HINT  = `<span class="qq-hint">Easy 8 · Tricky 12 · Hard 16</span>`;

async function postRoll(actor, formula, flavor) {
  const roll = await new Roll(formula).evaluate();
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor
  });
  return roll;
}

async function pickMode(title) {
  return DialogV2.wait({
    window: { title },
    buttons: [
      { action: "dis",    label: "Disadvantage" },
      { action: "normal", label: "Normal", default: true },
      { action: "adv",    label: "Advantage" }
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
      rollFumble: QuickQuestHeroSheet.#onRollFumble
    }
  };

  static PARTS = {
    sheet: { template: "systems/quickquest/templates/hero-sheet.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.actor = this.actor;
    context.system = this.actor.system;
    context.weapons = ["w1", "w2", "w3"].map(k => ({ key: k, ...this.actor.system.weapons[k] }));
    return context;
  }

  static async #onRollCheck(event, target) {
    const stat = target.dataset.stat;
    const value = this.actor.system.stats[stat];
    const adv = value >= 4;
    const flavor = `<b>${stat.toUpperCase()} check</b>${adv ? " — advantage (stat 4+)" : ""}<br>${CHECK_HINT}`;
    await postRoll(this.actor, adv ? "2d20kh" : "1d20", flavor);
  }

  static async #onRollAttack(event, target) {
    const mode = await pickMode("Attack roll");
    if (!mode) return;
    const label = mode === "adv" ? " — advantage" : mode === "dis" ? " — disadvantage" : "";
    await postRoll(this.actor, d20Formula(mode), `<b>Attack</b>${label}<br>${ATTACK_HINT}`);
  }

  static async #onRollDamage(event, target) {
    const w = this.actor.system.weapons[target.dataset.weapon];
    const sys = this.actor.system;
    const statVal = sys.stats[w.stat] ?? 0;
    let formula = `1${w.die} + ${statVal}`;
    const parts = [`${w.die} + ${w.stat.toUpperCase()}`];
    if (sys.raging) { formula += " + 2"; parts.push("rage +2"); }
    if (sys.bonus)  { formula += ` + ${sys.bonus}`; parts.push(`bonus ${sys.bonus > 0 ? "+" : ""}${sys.bonus}`); }
    const name = w.name || "Weapon";
    const flavor = `<b>${name} — damage</b> (${parts.join(", ")})<br><span class="qq-hint">${w.dtype}${w.reach ? " · " + w.reach : ""}</span>`;
    await postRoll(this.actor, formula, flavor);
  }

  static async #onRollFumble(event, target) {
    const flavor = `<b>Fumble!</b><br><span class="qq-hint">1 weapon flies away · 2 you trip · 3 hit the scenery · 4 wide open, next hit on you lands · 5 something loud breaks · 6 perfect — wrong target</span>`;
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
    const mode = await pickMode("Monster attack");
    if (!mode) return;
    const label = mode === "adv" ? " — advantage" : mode === "dis" ? " — disadvantage" : "";
    await postRoll(this.actor, d20Formula(mode), `<b>Attack</b>${label}<br>${ATTACK_HINT}`);
  }

  static async #onRollDamage(event, target) {
    const a = this.actor.system.attack;
    let formula = `1${a.die}`;
    if (a.bonus) formula += ` + ${a.bonus}`;
    const flavor = `<b>Damage</b> (${a.die}${a.bonus ? " + " + a.bonus : ""})${a.dtype ? `<br><span class="qq-hint">${a.dtype}</span>` : ""}`;
    await postRoll(this.actor, formula, flavor);
  }
}

/* ------------------------------------------------------------
   REGISTRATION
   ------------------------------------------------------------ */

Hooks.once("init", () => {
  console.log("QuickQuest | Initializing");

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
    types: ["hero"], makeDefault: true, label: "QuickQuest — Hero"
  });
  DSC.registerSheet(Actor, "quickquest", QuickQuestMonsterSheet, {
    types: ["monster"], makeDefault: true, label: "QuickQuest — Monster"
  });
});
