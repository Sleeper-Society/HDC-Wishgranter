import { type Card, getFactions, getFaction } from "wishgranter";
import type {
  getLootListUpJSON,
  getUpgradesJSON,
} from "../jsonResultFactory.ts";

export class Dongle {
  id: string;
  header: string;
  text: string;
  apply?: (card: Card) => Card;
  constructor(
    id: string,
    header: string,
    text: string,
    applicator?: (card: Card) => Card,
  ) {
    this.id = id;
    this.header = header;
    this.text = text;
    this.apply = applicator;
  }
}

export interface BaseGameDongle {
  header: string;
  txt: string;
}

export function dongleToBaseGame(dongle: Dongle): BaseGameDongle {
  return { header: dongle.header, txt: dongle.text };
}
export function dongleFromBaseGame(id: string, dongle: BaseGameDongle): Dongle {
  return new Dongle(id, dongle.header, dongle.txt);
}

const global_dongles: Dongle[] = [];

export function addGlobalDongle(dongle: Dongle) {
  global_dongles.push(dongle);
}
export function applyLootListUpJson(
  loot_list_up: ReturnType<typeof getLootListUpJSON>,
  upgrades: ReturnType<typeof getUpgradesJSON>,
) {
  loot_list_up.up.glo.forEach((id) => {
    addGlobalDongle(dongleFromBaseGame(id, upgrades[id]));
  });
  Object.getOwnPropertyNames(loot_list_up.up)
    .filter((name) => !["glo"].includes(name))
    .forEach((faction_name) => {
      const faction = getFaction(faction_name);
      (loot_list_up.up as Record<string, string[]>)[faction_name].forEach(
        (id) => faction?.addDongles(dongleFromBaseGame(id, upgrades[id])),
      );
    });
  Object.getOwnPropertyNames(loot_list_up.start)
    .filter((name) => !["glo"].includes(name))
    .forEach((faction_name) => {
      const faction = getFaction(faction_name);
      loot_list_up.start[faction_name].gen.forEach((id) =>
        faction?.addStartingBaseDongles(dongleFromBaseGame(id, upgrades[id])),
      );
      loot_list_up.start[faction_name].stat.forEach((id) =>
        faction?.addStartingStatDongles(dongleFromBaseGame(id, upgrades[id])),
      );
    });
}

export function getGlobalDongles(): IteratorObject<Dongle> {
  return global_dongles[Symbol.iterator]();
}

export function removeDongle(dongle: Dongle) {
  for (const faction of getFactions()) {
    faction.removeDongle(dongle);
  }
  if (global_dongles.includes(dongle))
    global_dongles.splice(global_dongles.indexOf(dongle), 1);
}

export function getDongle(dongle_id: string): Dongle | undefined {
  for (const faction of getFactions()) {
    const dongle = faction.getDongle(dongle_id);
    if (dongle) return dongle;
  }
  for (const dongle of global_dongles) {
    if ([dongle.id].includes(dongle_id)) return dongle;
  }
}
