import { type Card, Unit, type Ability } from "./card.ts";
import type { Dongle } from "./dongle.ts";
import type { Encounter } from "./encounter.ts";
import type { gdjs } from "./gdjs.ts";

export class Faction {
  name: string;
  short_name: string;
  color: [number, number, number] = [0, 0, 0];

  encounters: Encounter[] = [];

  encounter_reward_dongles: Dongle[] = [];
  sold_dongles: Dongle[] = [];
  starting_dongles: Dongle[] = [];

  encounter_reward_cards: Card[] = [];
  sold_cards: Card[] = [];
  sold_ship_combos = new Map<Faction, Unit>();
  sold_tech_combos = new Map<Faction, Ability>();
  starting_cards: Card[] = [];

  constructor(name: string, short_name?: string) {
    this.name = name;
    if (short_name) this.short_name = short_name;
    else this.short_name = name.substring(0, 3);
  }

  addCardToStores(card: Card, additional_faction?: Faction) {
    if (additional_faction)
      (card instanceof Unit
        ? this.sold_ship_combos
        : this.sold_tech_combos
      ).set(additional_faction, card as Ability & Unit);
    else this.sold_cards.push(card);
  }
  addDongleToStores(dongle: Dongle) {
    this.sold_dongles.push(dongle);
  }
  addCardToEncounterRewards(card: Card) {
    this.encounter_reward_cards.push(card);
  }
  addDongleToEncounterRewards(dongle: Dongle) {
    this.encounter_reward_dongles.push(dongle);
  }
  addEncounter(encounter: Encounter) {
    this.encounters.push(encounter);
  }
  addCardToStartingDecks(card: Card) {
    this.starting_cards.push(card);
  }
  addDongleToStartingDecks(dongle: Dongle) {
    this.starting_dongles.push(dongle);
  }

  getCard(card_name: string): Card | undefined {
    for (const card of this.getCards()) {
      if (card.name == card_name) return card;
    }
  }
  getDongle(dongle_id: string): Dongle | undefined {
    for (const dongle of this.getDongles()) {
      if (dongle.id == dongle_id) return dongle;
    }
  }
  getEncounter(encounter_name: string): Encounter | undefined {
    return this.encounters.find(
      (encounter) => encounter.name == encounter_name,
    );
  }

  getCards(): Iterable<Card> {
    return this.encounter_reward_cards
      .concat(Array.from(this.sold_ship_combos.values()))
      .concat(Array.from(this.sold_tech_combos.values()))
      .concat(this.sold_cards)
      .concat(this.starting_cards);
  }
  getSoldShips(): Iterable<Card> {
    return this.sold_cards.filter((card) => card.getType() == "ship");
  }
  getSoldTechs(): Iterable<Card> {
    return this.sold_cards.filter((card) => card.getType() == "tech");
  }
  getSoldShipCombos(): Map<Faction, Card> {
    return this.sold_ship_combos;
  }
  getSoldTechCombos(): Map<Faction, Card> {
    return this.sold_tech_combos;
  }
  getSoldUsables(): Iterable<Card> {
    return this.sold_cards.filter((card) => card.getType() == "useable");
  }
  getSoldStructures(): Iterable<Card> {
    return this.sold_cards.filter((card) => card.getType() == "structure");
  }
  getDongles(): Iterable<Dongle> {
    return this.encounter_reward_dongles
      .concat(this.sold_dongles)
      .concat(this.starting_dongles);
  }
  getEncounterRewardDongles() {
    return this.encounter_reward_dongles;
  }
  getStartingGeneralDongles(): Iterable<Dongle> {
    return this.starting_dongles.filter((dongle) => dongle.as_dongle);
  }
  getStartingStatDongles(): Iterable<Dongle> {
    return this.starting_dongles.filter((dongle) => !dongle.as_dongle);
  }
  getEncounters(): Iterable<Encounter> {
    return this.encounters;
  }
  getNotableStatusEffectString(): string {
    return "";
  }

  removeCard(card: Card) {
    if (this.encounter_reward_cards.includes(card))
      this.encounter_reward_cards.splice(
        this.encounter_reward_cards.indexOf(card),
        1,
      );
    if (this.sold_cards.includes(card))
      this.sold_cards.splice(this.sold_cards.indexOf(card), 1);
    if (this.starting_cards.includes(card))
      this.starting_cards.splice(this.starting_cards.indexOf(card), 1);
    for (const key of this.sold_ship_combos.keys()) {
      if (this.sold_ship_combos.get(key) == card)
        this.sold_ship_combos.delete(key);
    }
    for (const key of this.sold_tech_combos.keys()) {
      if (this.sold_tech_combos.get(key) == card)
        this.sold_tech_combos.delete(key);
    }
  }
  removeDongle(dongle: Dongle) {
    if (this.encounter_reward_dongles.includes(dongle))
      this.encounter_reward_dongles.splice(
        this.encounter_reward_dongles.indexOf(dongle),
        1,
      );
    if (this.sold_dongles.includes(dongle))
      this.sold_dongles.splice(this.sold_dongles.indexOf(dongle), 1);
    if (this.starting_dongles.includes(dongle))
      this.starting_dongles.splice(this.starting_dongles.indexOf(dongle), 1);
  }
  removeEncounter(encounter: Encounter) {
    if (this.encounters.includes(encounter))
      this.encounters.splice(this.encounters.indexOf(encounter), 1);
  }

  getUnitObject(
    example: gdjs["projectData"]["layouts"][0]["objects"][0],
  ): gdjs["projectData"]["layouts"][0]["objects"][0] {
    const output = structuredClone(example);
    output.name = "obj_unit_" + this.short_name;
    output.animations = Array.from(this.getCards())
      .map((card) => card.getAnimation(this))
      .flat();
    return output;
  }
}
