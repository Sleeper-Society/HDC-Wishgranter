import type { Card } from "./card.ts";
import type { Dongle } from "./dongle.ts";
import type { Encounter } from "./encounter.ts";
import type { gdjs } from "./gdjs.ts";

export class Faction {
  name: string;
  short_name: string;

  encounters: Encounter[] = [];
  starting_decks: Card[] = [];
  encounter_reward_dongles: Dongle[] = [];
  encounter_reward_cards: Card[] = [];
  sold_cards = new Map<Faction, Card[]>();
  sold_dongles = new Map<Faction, Dongle[]>();

  constructor(name: string, short_name?: string) {
    this.name = name;
    if (short_name) this.short_name = short_name;
    else this.short_name = name.substring(0, 3);
  }

  addCardToStores(card: Card, additional_faction?: Faction) {
    this.sold_cards.getOrInsert(additional_faction ?? this, []).push(card);
  }
  addDongleToStores(dongle: Dongle, additional_faction?: Faction) {
    this.sold_dongles.getOrInsert(additional_faction ?? this, []).push(dongle);
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
    this.starting_decks.push(card);
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

  *getCards(): Iterable<Card> {
    for (const card of this.encounter_reward_cards) yield card;
    for (const cards of this.sold_cards.values())
      for (const card of cards) yield card;
  }
  getSoldShips(): Iterable<Card> {}
  getSoldTechs(): Iterable<Card> {}
  getSoldShipCombos(): Map<Faction, Iterable<Card>> {}
  getSoldTechCombos(): Map<Faction, Iterable<Card>> {}
  getSoldConsumables(): Iterable<Card> {}
  getSoldBuffs(): Iterable<Card> {}
  *getDongles(): Iterable<Dongle> {
    for (const dongle of this.encounter_reward_dongles) yield dongle;
    for (const dongles of this.sold_dongles.values())
      for (const dongle of dongles) yield dongle;
  }
  getEncounterRewardDongles() {
    return this.encounter_reward_dongles;
  }
  getStartingGeneralDongles(): Iterable<Dongle> {}
  getStartingStatDongles(): Iterable<Dongle> {}
  getEncounters(): Iterable<Encounter> {
    return this.encounters;
  }

  removeCard(card: Card) {
    for (const cards of Array.from(this.sold_cards.values()).concat(
      this.encounter_reward_cards,
    ))
      if (cards.includes(card)) cards.splice(cards.indexOf(card), 1);
  }
  removeDongle(dongle: Dongle) {
    for (const dongles of Array.from(this.sold_dongles.values()).concat(
      this.encounter_reward_dongles,
    ))
      if (dongles.includes(dongle)) dongles.splice(dongles.indexOf(dongle), 1);
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
