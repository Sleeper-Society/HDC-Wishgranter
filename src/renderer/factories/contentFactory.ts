import type { Card } from "../HDCTypes/card.ts";
import type { Dongle } from "../HDCTypes/dongle.ts";
import type { Encounter } from "../HDCTypes/encounter.ts";
import { Faction } from "../HDCTypes/faction.ts";

const factions: Faction[] = [];
const credits: Record<string, string[]> = {};

export function addFaction(faction_name: string): Faction {
  const faction = new Faction(faction_name);
  factions.push(faction);
  return faction;
}

//**@param faction_name Full name of new or existing faction or short name of existing faction*/
export function getFaction(
  faction_name: string,
  create_new = true,
): Faction | undefined {
  const existing_faction = factions.find(
    (faction) =>
      faction.name == faction_name || faction.short_name == faction_name,
  );
  if (!create_new || existing_faction) return existing_faction;
  return addFaction(faction_name);
}
export function getFactions(): Iterable<Faction> {
  return factions;
}
export function getCard(card_name: string): Card | undefined {
  for (const faction of factions) {
    const card = faction.getCard(card_name);
    if (card) return card;
  }
}
export function getDongle(dongle_name: string): Dongle | undefined {
  for (const faction of factions) {
    const dongle = faction.getDongle(dongle_name);
    if (dongle) return dongle;
  }
}
export function getEncounter(encounter_name: string): Encounter | undefined {
  for (const faction of factions) {
    const encounter = faction.getEncounter(encounter_name);
    if (encounter) return encounter;
  }
}

export function removeFaction(faction: Faction) {
  if (factions.includes(faction)) factions.splice(factions.indexOf(faction), 1);
}
export function removeCard(card: Card) {
  factions.forEach((faction) => {
    faction.removeCard(card);
  });
}
export function removeDongle(dongle: Dongle) {
  factions.forEach((faction) => {
    faction.removeDongle(dongle);
  });
}
export function removeEncounter(encounter: Encounter) {
  factions.forEach((faction) => {
    faction.removeEncounter(encounter);
  });
}

export function addCredit(catagory: string, credit: string) {
  if (!Object.keys(credits).includes(catagory)) credits[catagory] = [];
  credits[catagory].push(credit);
}
