import { getFaction, getFactions } from "wishgranter";
import type {
  getLootListUpJSON,
  getUpgradesJSON,
} from "../jsonResultFactory.ts";

export class FleetUpgrade {
  id: string;
  header: string;
  text: string;
  text_on_equip: string;
  apply?: unknown;
  constructor(
    id: string,
    header: string,
    text: string,
    text_on_equip: string,
    applicator?: unknown,
  ) {
    this.id = id;
    this.header = header;
    this.text = text;
    this.text_on_equip = text_on_equip;
    this.apply = applicator;
  }
}
export interface BaseGameFleetUpgrade {
  header: string;
  txt: string;
  txt_equip: string;
}
export function fleetUpgradeToBaseGame(
  upgrade: FleetUpgrade,
): BaseGameFleetUpgrade {
  return {
    header: upgrade.header,
    txt: upgrade.text,
    txt_equip: upgrade.text_on_equip,
  };
}
export function fleetUpgradeFromBaseGame(
  id: string,
  upgrade: BaseGameFleetUpgrade,
): FleetUpgrade | undefined {
  return new FleetUpgrade(id, upgrade.header, upgrade.txt, upgrade.txt_equip);
}

const boss_reward_fleet_upgrades: FleetUpgrade[] = [];
const global_fleet_upgrades: FleetUpgrade[] = [];

export function addBossRewardFleetUpgrade(upgrade?: FleetUpgrade) {
  if (upgrade) boss_reward_fleet_upgrades.push(upgrade);
}
export function addGlobalFleetUpgrade(upgrade?: FleetUpgrade) {
  if (upgrade) global_fleet_upgrades.push(upgrade);
}
export function applyLootListUpJson(
  loot_list_up: ReturnType<typeof getLootListUpJSON>,
  upgrades: ReturnType<typeof getUpgradesJSON>,
) {
  loot_list_up.fleet.boss.forEach((id) => {
    addBossRewardFleetUpgrade(
      fleetUpgradeFromBaseGame(id, upgrades[id] as BaseGameFleetUpgrade),
    );
  });
  loot_list_up.fleet.glo.forEach((id) => {
    addGlobalFleetUpgrade(
      fleetUpgradeFromBaseGame(id, upgrades[id] as BaseGameFleetUpgrade),
    );
  });
  Object.getOwnPropertyNames(loot_list_up.fleet)
    .filter((name) => !["boss", "glo"].includes(name))
    .forEach((faction_name) => {
      getFaction(faction_name)?.addFleetUpgrades(
        ...Object.getOwnPropertyNames(loot_list_up.fleet[faction_name])
          .map((id) =>
            fleetUpgradeFromBaseGame(id, upgrades[id] as BaseGameFleetUpgrade),
          )
          .filter((upgrade) => upgrade != undefined),
      );
    });
}
export function getBossRewardFleetUpgrades(): IteratorObject<FleetUpgrade> {
  return boss_reward_fleet_upgrades[Symbol.iterator]();
}
export function getGlobalFleetUpgrades(): IteratorObject<FleetUpgrade> {
  return global_fleet_upgrades[Symbol.iterator]();
}
export function getFleetUpgrade(
  upgrade_name: string,
): FleetUpgrade | undefined {
  for (const faction of getFactions()) {
    const upgrade = faction.getFleetUpgrade(upgrade_name);
    if (upgrade) return upgrade;
  }
}
export function removeFleetUpgrade(upgrade: FleetUpgrade) {
  for (const faction of getFactions()) {
    faction.removeFleetUpgrade(upgrade);
  }
  if (boss_reward_fleet_upgrades.includes(upgrade))
    boss_reward_fleet_upgrades.splice(
      boss_reward_fleet_upgrades.indexOf(upgrade),
      1,
    );
  if (global_fleet_upgrades.includes(upgrade))
    global_fleet_upgrades.splice(global_fleet_upgrades.indexOf(upgrade), 1);
}
