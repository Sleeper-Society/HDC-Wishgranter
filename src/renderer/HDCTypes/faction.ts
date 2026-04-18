import type { Card } from "./card.ts";
import type { Dongle } from "./dongle.ts";
import type { Encounter } from "./encounter.ts";
import type { gdjs } from "./gdjs.ts";

export class Faction {
  name: string;
  short_name: string;

  constructor(name: string, short_name?: string) {
    this.name = name;
    if (short_name) this.short_name = short_name;
    else this.short_name = name.substring(0, 3);
  }

  addCardToStores(card: Card, additional_faction?: Faction) {}
  addDongleToStores(dongle: Dongle, additional_faction?: Faction) {}
  addCardToEncounterRewards(card: Card) {}
  addDongleToEncounterRewards(dongle: Dongle) {}
  addEncounter(encounter: Encounter) {}
  addCardToStartingDecks(card: Card) {}

  getCard(card: string): Card | undefined {}
  getDongle(dongle: string): Dongle | undefined {}
  getEncounter(encounter: string): Encounter | undefined {}

  getCards(): Iterable<Card> {}
  getDongles(): Iterable<Dongle> {}
  getEncounters(): Iterable<Encounter> {}

  removeCard(card: Card) {}
  removeDongle(dongle: Dongle) {}
  removeEncounter(encounter: Encounter) {}

  getUnitObject(
    example: gdjs["projectData"]["layouts"][0]["objects"][0],
  ): gdjs["projectData"]["layouts"][0]["objects"][0] {
    const output = structuredClone(example);
    output.name = "obj_unit_" + this.short_name;
    output.animations = this.getCards()
      .map((card) => card.getAnimation(this))
      .flat();
    return output;
  }
}
