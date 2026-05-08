import { type Card, getFactions, getFaction, Sprite } from "wishgranter";
import type {
  getLootListUpJSON,
  getUpgradesJSON,
} from "../jsonResultFactory.ts";
import type { PathLike } from "node:fs";

export class Dongle {
  id: string;
  icon: Sprite;
  icon_priority: number;
  header: string;
  text: string;
  apply?: (card: Card) => Card;
  constructor(
    id: string,
    header: string,
    text: string,
    icon_source: PathLike,
    icon_priority: number,
    applicator?: (card: Card) => Card,
  ) {
    this.id = id;
    this.header = header;
    this.text = text;
    this.apply = applicator;
    this.icon_priority = icon_priority;
    this.icon = new Sprite(icon_source);
  }
}

export interface BaseGameDongle {
  header: string;
  txt: string;
}
export interface BaseGameStartingDongle {
  icon: string;
  icon_prio: number;
}

export function dongleToBaseGame(dongle: Dongle): BaseGameDongle {
  return { header: dongle.header, txt: dongle.text };
}
export function dongleFromBaseGame(
  id: string,
  dongle: BaseGameDongle | BaseGameStartingDongle,
  hyperspace_deck_command_location: PathLike,
): Dongle {
  return new Dongle(
    id,
    (dongle as Partial<BaseGameDongle>).header ?? "Custom Modification",
    (dongle as Partial<BaseGameDongle>).txt ?? " Does not use an upgrade slot.",
    `${hyperspace_deck_command_location.toString()}${window.remote_replace.path.sep()}resources${window.remote_replace.path.sep()}app.asar${window.remote_replace.path.sep()}app${window.remote_replace.path.sep()}up_${(dongle as Partial<BaseGameStartingDongle>).icon ? `start_${(dongle as BaseGameStartingDongle).icon}` : id.substring("up_".length)}}.png`,
    (dongle as Partial<BaseGameStartingDongle>).icon_prio ?? 0,
  );
}

const global_dongles: Dongle[] = [];

export function addGlobalDongle(dongle: Dongle) {
  global_dongles.push(dongle);
}
export function applyLootListUpJson(
  loot_list_up: ReturnType<typeof getLootListUpJSON>,
  upgrades: ReturnType<typeof getUpgradesJSON>,
  hyperspace_deck_command_location: PathLike,
) {
  loot_list_up.up.glo.forEach((id) => {
    addGlobalDongle(
      dongleFromBaseGame(id, upgrades[id], hyperspace_deck_command_location),
    );
  });
  Object.getOwnPropertyNames(loot_list_up.up)
    .filter((name) => !["glo"].includes(name))
    .forEach((faction_name) => {
      const faction = getFaction(faction_name);
      (loot_list_up.up as Record<string, string[]>)[faction_name].forEach(
        (id) =>
          faction?.addDongles(
            dongleFromBaseGame(
              id,
              upgrades[id],
              hyperspace_deck_command_location,
            ),
          ),
      );
    });
  Object.getOwnPropertyNames(loot_list_up.start)
    .filter((name) => !["glo"].includes(name))
    .forEach((faction_name) => {
      const faction = getFaction(faction_name);
      loot_list_up.start[faction_name].gen.forEach((id) =>
        faction?.addStartingBaseDongles(
          dongleFromBaseGame(
            id,
            upgrades[id],
            hyperspace_deck_command_location,
          ),
        ),
      );
      loot_list_up.start[faction_name].stat.forEach((id) => {
        if (upgrades[id] as BaseGameDongle | BaseGameStartingDongle | undefined)
          faction?.addStartingStatDongles(
            dongleFromBaseGame(
              id,
              upgrades[id],
              hyperspace_deck_command_location,
            ),
          );
      });
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
