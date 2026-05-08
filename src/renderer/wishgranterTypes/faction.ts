import {
  Ability,
  Sprite,
  type Card,
  type Dongle,
  type FleetUpgrade,
  type Encounter,
  type PlayerUnit,
  type Unit,
  type PlayerCard,
  type StartingCardTag,
  type Megaship,
  type Commander,
  type Depletable,
  type Construct,
} from "wishgranter";
import type { gdjs } from "../wishgranterTypes/gdjs.ts";
import type { PathLike } from "node:fs";

export class Faction {
  name: string;
  short_name: string;
  color: [number, number, number];
  default_portrait: Sprite[];
  commander_background: Sprite;
  holo_unit_border: Sprite;
  holo_ability_border: Sprite;

  boarders_breach_bark?: string[][];
  boarders_success?: string[][];
  boarders_fight_bark?: string[][];
  boarders_win_bark?: string[][];

  security_arrive_bark?: string[][];
  security_success_bark?: string[][];
  security_fight_bark?: string[][];
  security_win_bark?: string[][];

  private encounters: Encounter[] = [];

  private fleet_upgrades: FleetUpgrade[] = [];

  private dongles: Dongle[] = [];
  private starting_base_flagship_dongles: Dongle[] = [];
  private starting_stat_flagship_dongles: Dongle[] = [];

  private cards: PlayerCard[] = [];
  private ship_combos = new Map<Faction, PlayerUnit>();
  private tech_combos = new Map<Faction, Ability>();
  private starting_commanders = new Map<
    Commander,
    (PlayerUnit | [Ability, StartingCardTag])[]
  >();
  private starting_flagships: PlayerUnit[] = [];
  private starting_auxiliary: (PlayerUnit | [Ability, StartingCardTag])[] = [];
  private starting_megaships = new Map<
    Megaship,
    (PlayerUnit | [Ability, StartingCardTag])[]
  >();

  constructor(
    name: string,
    color: [number, number, number],
    default_portrait: Sprite[],
    commander_background_path: PathLike,
    holo_unit_border_path: PathLike,
    holo_ability_border_path: PathLike,
    short_name?: string,
  ) {
    this.name = name;
    this.color = color;
    this.default_portrait = default_portrait;
    this.commander_background = new Sprite(commander_background_path);
    this.holo_unit_border = new Sprite(holo_unit_border_path);
    this.holo_ability_border = new Sprite(holo_ability_border_path);
    if (short_name) this.short_name = short_name;
    else this.short_name = name.substring(0, 3);
  }
  getNotableStatusEffectString(): string {
    return "";
  }

  addEncounters(...encounters: Encounter[]) {
    this.encounters.push(...encounters);
  }
  addFleetUpgrades(...upgrades: FleetUpgrade[]) {
    this.fleet_upgrades.push(...upgrades);
  }
  addDongles(...dongles: Dongle[]) {
    this.dongles.push(...dongles);
  }
  addStartingBaseDongles(...dongles: Dongle[]) {
    this.starting_base_flagship_dongles.push(...dongles);
  }
  addStartingStatDongles(...dongles: Dongle[]) {
    this.starting_stat_flagship_dongles.push(...dongles);
  }
  addCards(
    ...cards: (PlayerCard | [card: PlayerCard, additional_faction: Faction])[]
  ) {
    for (const card of cards) {
      if (Array.isArray(card))
        (card[0] instanceof Ability ? this.tech_combos : this.ship_combos).set(
          card[1],
          card[0] as Ability & PlayerUnit,
        );
      else this.cards.push(card);
    }
  }
  addFlagships(...flagships: PlayerUnit[]) {
    this.starting_flagships.push(...flagships);
  }
  addAuxiliaryStartingShip(...ships: PlayerUnit[]) {
    this.starting_auxiliary.push(...ships);
  }
  addCommander(
    commander?: Commander,
    ...cards: (PlayerUnit | [Ability, StartingCardTag])[]
  ) {
    if (commander) this.starting_commanders.set(commander, cards);
  }
  addMegaship(
    megaship?: Megaship,
    ...cards: (PlayerUnit | [Ability, StartingCardTag])[]
  ) {
    if (megaship) this.starting_megaships.set(megaship, cards);
  }

  getEncounter(encounter_name: string): Encounter | undefined {
    return this.encounters.find(
      (encounter) => encounter.name == encounter_name,
    );
  }
  getFleetUpgrade(upgrade_id: string): FleetUpgrade | undefined {
    return this.fleet_upgrades.find((upgrade) =>
      [upgrade.id, upgrade.header].includes(upgrade_id),
    );
  }
  getDongle(dongle_id: string): Dongle | undefined {
    return (
      this.getDongles()[Symbol.iterator]() as IteratorObject<Dongle>
    ).find((dongle) => [dongle.id, dongle.header].includes(dongle_id));
  }
  getCard(card_name: string): Card | undefined {
    return (this.getCards()[Symbol.iterator]() as IteratorObject<Card>).find(
      (card) => [card.getId(this), card.name].includes(card_name),
    );
  }

  getEncounters(): Iterable<Encounter> {
    return this.encounters;
  }
  getFleetUpgrades(): Iterable<FleetUpgrade> {
    return this.fleet_upgrades;
  }
  getDongles(): Iterable<Dongle> {
    return this.dongles
      .concat(this.starting_base_flagship_dongles)
      .concat(this.starting_stat_flagship_dongles);
  }
  getStartingGeneralDongles(): Iterable<Dongle> {
    return this.starting_base_flagship_dongles;
  }
  getStartingStatDongles(): Iterable<Dongle> {
    return this.starting_stat_flagship_dongles;
  }
  *getCards(): Iterable<Card> {
    yield* this.cards;
    yield* this.ship_combos.values();
    yield* this.tech_combos.values();
    yield* this.encounters[Symbol.iterator]()
      .flatMap((encounter) => encounter.waves)
      .flatMap((wave) => wave.getUsedCards());
  }
  getShips(): Iterable<PlayerUnit> {
    return this.cards.filter(
      (card) => card.getType() == "ship",
    ) as PlayerUnit[];
  }
  getTechs(): Iterable<Ability> {
    return this.cards.filter((card) => card.getType() == "tech") as Ability[];
  }
  getShipCombos(): Map<Faction, PlayerUnit> {
    return this.ship_combos;
  }
  getTechCombos(): Map<Faction, Ability> {
    return this.tech_combos;
  }
  getDepletables(): Iterable<Depletable> {
    return this.cards.filter(
      (card) => card.getType() == "depletable",
    ) as Depletable[];
  }
  getConstructs(): Iterable<Construct> {
    return this.cards.filter(
      (card) => card.getType() == "construct",
    ) as Construct[];
  }
  getStartingCommanderSets() {
    return this.starting_commanders.entries();
  }
  getStartingFlagships() {
    return this.starting_flagships;
  }
  getStartingAuxiliaries() {
    return this.starting_auxiliary;
  }
  getStartingMegashipSet() {
    return this.starting_megaships.entries();
  }
  *getStartingAbilities(): Iterable<[Ability, StartingCardTag]> {
    yield* this.starting_commanders
      .values()
      [Symbol.iterator]()
      .flatMap((value_set) => value_set)
      .filter((card) => Array.isArray(card));
    yield* this.starting_megaships
      .values()
      [Symbol.iterator]()
      .flatMap((value_set) => value_set)
      .filter((card) => Array.isArray(card));
    yield* this.starting_auxiliary[Symbol.iterator]().filter((card) =>
      Array.isArray(card),
    );
  }
  *getStartingConstructs(): Iterable<Construct> {
    yield* this.starting_commanders
      .values()
      [Symbol.iterator]()
      .flatMap((value_set) => value_set)
      .filter(
        (card) => !Array.isArray(card) && card.getType() == "construct",
      ) as IteratorObject<Construct>;
    yield* this.starting_megaships
      .values()
      [Symbol.iterator]()
      .flatMap((value_set) => value_set)
      .filter(
        (card) => !Array.isArray(card) && card.getType() == "construct",
      ) as IteratorObject<Construct>;
    yield* this.starting_auxiliary[Symbol.iterator]().filter(
      (card) => !Array.isArray(card) && card.getType() == "construct",
    ) as IteratorObject<Construct>;
  }
  *getComms(): Iterable<[string, Record<`text_${number}`, string[]> | string]> {
    yield* (this.getCards()[Symbol.iterator]() as IteratorObject<Card>).flatMap(
      (card) => card.getComms(this),
    );
    for (const name of Object.getOwnPropertyNames(this).filter((name) =>
      name.endsWith("_bark"),
    )) {
      yield [
        `${name.substring(0, name.length - "_bark".length)}_${this.short_name}`,
        Object.fromEntries(
          (
            this[name as `${string}_bark` & keyof typeof this] as string[][]
          ).map(
            (comm, index) =>
              [`text_${index.toString()}`, comm] as [
                `text_${number}`,
                string[],
              ],
          ),
        ),
      ];
    }
  }

  removeEncounter(encounter: Encounter) {
    if (this.encounters.includes(encounter))
      this.encounters.splice(this.encounters.indexOf(encounter), 1);
  }
  removeFleetUpgrade(upgrade: FleetUpgrade) {
    if (this.fleet_upgrades.includes(upgrade)) {
      this.fleet_upgrades.splice(this.fleet_upgrades.indexOf(upgrade), 1);
    }
  }
  removeDongle(dongle: Dongle) {
    if (this.dongles.includes(dongle))
      this.dongles.splice(this.dongles.indexOf(dongle), 1);
    if (this.starting_base_flagship_dongles.includes(dongle))
      this.starting_base_flagship_dongles.splice(
        this.starting_base_flagship_dongles.indexOf(dongle),
        1,
      );
    if (this.starting_stat_flagship_dongles.includes(dongle))
      this.starting_stat_flagship_dongles.splice(
        this.starting_stat_flagship_dongles.indexOf(dongle),
        1,
      );
  }
  removeCard(card: Card) {
    if (this.cards.includes(card as PlayerCard))
      this.cards.splice(this.cards.indexOf(card as PlayerCard), 1);
    if (this.starting_flagships.includes(card as PlayerUnit))
      this.starting_flagships.splice(
        this.starting_flagships.indexOf(card as PlayerUnit),
        1,
      );
    if (
      this.starting_auxiliary
        .map((ship) => (Array.isArray(ship) ? ship[0] : ship))
        .includes(card as PlayerCard)
    )
      this.starting_auxiliary.splice(
        this.starting_auxiliary
          .map((ship) => (Array.isArray(ship) ? ship[0] : ship))
          .indexOf(card as PlayerCard),
        1,
      );
    for (const key of this.starting_commanders.keys()) {
      if (key == card) this.starting_commanders.delete(key);
      else if (
        this.starting_commanders
          .get(key)
          ?.map((ship) => (Array.isArray(ship) ? ship[0] : ship))
          .includes(card as PlayerCard)
      ) {
        this.starting_commanders.get(key)?.splice(
          this.starting_commanders
            .get(key)
            ?.map((ship) => (Array.isArray(ship) ? ship[0] : ship))
            .indexOf(card as PlayerCard) ?? 0,
          1,
        );
      }
    }
    for (const key of this.starting_megaships.keys()) {
      if (key == card) this.starting_megaships.delete(key);
      else if (
        this.starting_megaships
          .get(key)
          ?.map((ship) => (Array.isArray(ship) ? ship[0] : ship))
          .includes(card as PlayerCard)
      ) {
        this.starting_megaships.get(key)?.splice(
          this.starting_megaships
            .get(key)
            ?.map((ship) => (Array.isArray(ship) ? ship[0] : ship))
            .indexOf(card as PlayerCard) ?? 0,
          1,
        );
      }
    }
    for (const key of this.ship_combos.keys()) {
      if (this.ship_combos.get(key) == card) this.ship_combos.delete(key);
    }
    for (const key of this.tech_combos.keys()) {
      if (this.tech_combos.get(key) == card) this.tech_combos.delete(key);
    }
    this.encounters.forEach((encounter) => {
      encounter.waves.forEach((wave) => {
        wave.varaiants.forEach((variant) => {
          if (variant[0].includes(card as Unit))
            variant[0].splice(variant[0].indexOf(card as Unit), 1);
          if (variant[1].includes(card as Unit))
            variant[1].splice(variant[1].indexOf(card as Unit), 1);
          if (variant[2].includes(card as Unit))
            variant[2].splice(variant[2].indexOf(card as Unit), 1);
        });
      });
    });
  }

  getUnitObject(
    example: gdjs["projectData"]["layouts"][0]["objects"][0],
  ): gdjs["projectData"]["layouts"][0]["objects"][0] {
    const output = structuredClone(example);
    output.name = "obj_unit_" + this.short_name.toLowerCase();
    output.animations = Array.from(this.getCards())
      .map((card) => card.getAnimation(this))
      .flat();
    return output;
  }
}
