import type { Card } from "../HDCTypes/card.ts";
import type { Dongle } from "../HDCTypes/dongle.ts";
import type { Encounter } from "../HDCTypes/encounter.ts";
import { Faction } from "../HDCTypes/faction.ts";

const factions: Faction[] = [];
const boss_reward_dongles: Dongle[] = [];
const global_reward_dongles: Dongle[] = [];
const gloabl_dongles: Dongle[] = [];
const credits: Record<string, string[]> = {
  "": ["Hyperspace Deck Command", "by Sleeper Games"],
};

export function addFaction(faction_name: string): Faction {
  const faction = new Faction(faction_name);
  factions.push(faction);
  return faction;
}

export function addBossRewardDongle(dongle: Dongle) {
  boss_reward_dongles.push(dongle);
}

export function addGlobalRewardDongle(dongle: Dongle) {
  global_reward_dongles.push(dongle);
}

export function addGlobalDongle(dongle: Dongle) {
  gloabl_dongles.push(dongle);
}

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
  if (boss_reward_dongles.includes(dongle))
    boss_reward_dongles.splice(boss_reward_dongles.indexOf(dongle), 1);
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

export function getCredits() {
  return credits;
}

export function getBossRewardFleetUpgradeDongles() {
  return boss_reward_dongles;
}
export function getGlobalFleetUpgradeDongles() {
  return global_reward_dongles;
}
export function getGlobalDongles() {
  return gloabl_dongles;
}
