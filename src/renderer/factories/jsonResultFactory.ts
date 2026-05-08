import {
  type Faction,
  type FleetUpgrade,
  type Dongle,
  getFactions,
  type Card,
  type Encounter,
} from "wishgranter";
import { getCredits } from "./contentFactory.ts";
import { original_data } from "./modFactories/wishgranterModFactory.ts";
import {
  fleetUpgradeToBaseGame,
  getBossRewardFleetUpgrades,
  getGlobalFleetUpgrades,
} from "./hdcTypeFactories/fleetUpgradeFactory.ts";
import {
  dongleToBaseGame,
  getGlobalDongles,
} from "./hdcTypeFactories/dongleFactory.ts";
import { getGlobalEncounters } from "./hdcTypeFactories/encounterFactory.ts";

export { getEncountersJSON } from "./hdcTypeFactories/encounterFactory.ts";
export {
  getCardsJSON,
  getLootListCardJSON,
} from "./hdcTypeFactories/cardFactory.ts";

export function getLootListUpJSON(): {
  fleet: { boss: string[]; glo: string[]; [key: string]: string[] };
  up: { glo: string[]; [key: string]: string[] };
  start: Record<string, { gen: string[]; stat: string[] }>;
} {
  return {
    fleet: {
      boss: Array.from(
        getBossRewardFleetUpgrades().map((upgrade) => upgrade.id),
      ),
      glo: Array.from(getGlobalFleetUpgrades().map((upgrade) => upgrade.id)),
      ...(Object.fromEntries(
        (getFactions()[Symbol.iterator]() as IteratorObject<Faction>).map(
          (faction) =>
            Array.from(
              (
                faction
                  .getFleetUpgrades()
                  [Symbol.iterator]() as IteratorObject<FleetUpgrade>
              ).map((upgrade) => upgrade.id),
            ),
        ),
      ) as Record<string, string[]>),
    },
    up: {
      glo: Array.from(getGlobalDongles().map((dongle) => dongle.id)),
      ...(Object.fromEntries(
        (getFactions()[Symbol.iterator]() as IteratorObject<Faction>).map(
          (faction) => [
            faction.short_name,
            Array.from(
              (
                faction
                  .getDongles()
                  [Symbol.iterator]() as IteratorObject<Dongle>
              ).map((dongle) => dongle.id),
            ),
          ],
        ),
      ) as Record<string, string[]>),
    },
    start: Object.fromEntries(
      (getFactions()[Symbol.iterator]() as IteratorObject<Faction>).map(
        (faction) => {
          return [
            faction.short_name,
            {
              gen: Array.from(faction.getStartingGeneralDongles()).map(
                (dongle) => dongle.id,
              ),
              stat: Array.from(faction.getStartingStatDongles()).map(
                (dongle) => dongle.id,
              ),
            },
          ];
        },
      ),
    ),
  };
}

export function getUpgradesJSON() {
  return {
    ...Object.fromEntries(
      getBossRewardFleetUpgrades().map((fleet_upgrade) => [
        fleet_upgrade.id,
        fleetUpgradeToBaseGame(fleet_upgrade),
      ]),
    ),
    ...Object.fromEntries(
      getGlobalFleetUpgrades().map((fleet_upgrade) => [
        fleet_upgrade.id,
        fleetUpgradeToBaseGame(fleet_upgrade),
      ]),
    ),
    ...Object.fromEntries(
      (getFactions()[Symbol.iterator]() as IteratorObject<Faction>).flatMap(
        (faction) =>
          (
            faction
              .getFleetUpgrades()
              [Symbol.iterator]() as IteratorObject<FleetUpgrade>
          ).map((fleet_upgrade) => [
            fleet_upgrade.id,
            fleetUpgradeToBaseGame(fleet_upgrade),
          ]),
      ),
    ),
    ...Object.fromEntries(
      getGlobalDongles().map((dongle) => [dongle.id, dongleToBaseGame(dongle)]),
    ),
    ...Object.fromEntries(
      (getFactions()[Symbol.iterator]() as IteratorObject<Faction>).flatMap(
        (faction) =>
          (
            faction.getDongles()[Symbol.iterator]() as IteratorObject<Dongle>
          ).map((dongle) => [dongle.id, dongleToBaseGame(dongle)]),
      ),
    ),
  };
}

export function getCloudLablesJSON(): Record<
  string,
  { txt: string; size: number }
> {
  return {
    ...original_data?.cloud_lables,
    ...Object.fromEntries(
      (getFactions()[Symbol.iterator]() as IteratorObject<Faction>).map(
        (faction) => [
          `txt_${faction.short_name}`,
          {
            txt: `${faction.name} ${faction.getNotableStatusEffectString()}`,
            size: 80,
          },
        ],
      ),
    ),
  };
}
export function getCommsJSON(): Record<
  string,
  Record<`text_${number}`, string[]> | string
> {
  return {
    ...Object.fromEntries(
      (getFactions()[Symbol.iterator]() as IteratorObject<Faction>).flatMap(
        (faction) =>
          (
            faction.getCards()[Symbol.iterator]() as IteratorObject<Card>
          ).flatMap((card) => card.getComms(faction)),
      ),
    ),
    ...Object.fromEntries(
      (getFactions()[Symbol.iterator]() as IteratorObject<Faction>).flatMap(
        (faction) =>
          (
            faction
              .getEncounters()
              [Symbol.iterator]() as IteratorObject<Encounter>
          ).flatMap((encounter) => encounter.getComms(faction)),
      ),
    ),
    ...Object.fromEntries(
      getGlobalEncounters().flatMap((encounter) => encounter.getComms()),
    ),
  };
}
export function getCreditsJSON(): Record<
  number,
  { txt: string[]; size: number }
> {
  const credits = getCredits();
  const out = Object.keys(credits)
    .map((key) => [
      { txt: [key], size: 40 },
      { txt: credits[key], size: 30 },
    ])
    .flat();
  // A few exceptions to the size rule
  out[1].size = 80; //Title
  out[2].size = 60; //The Game
  out[4].size = 60; //The Music
  out.push({ txt: ["Thank you for playing!"], size: 60 });
  return Object.fromEntries(
    [{ txt: [""], size: 0 }].concat(out).map((value, index) => [index, value]),
  );
}
