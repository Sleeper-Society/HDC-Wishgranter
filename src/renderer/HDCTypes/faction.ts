import type { Card } from "./card.ts";
import type { Dongle } from "./dongle.ts";
import type { Encounter } from "./encounter.ts";

export class Faction {
  addCardToStores(card: Card, additional_faction?: Faction) {}
  addDongleToStores(dongle: Dongle, additional_faction?: Faction) {}
  addCardToEncounterRewards(card: Card) {}
  addDongleToEncounterRewards(dongle: Dongle) {}
  addEncounter(encounter: Encounter) {}
  addCardToStartingDecks(card: Card) {}

  getCard(card: string): Card {}
  getDongle(dongle: string): Dongle {}
  getEncounter(encounter: string): Encounter {}

  getCards(): Card[] {}
  getDongles(): Dongle[] {}
  getEncounters(): Encounter[] {}
}
