import type { Card } from "../HDCTypes/card.ts";
import type { Dongle } from "../HDCTypes/dongle.ts";
import type { Encounter, Wave } from "../HDCTypes/encounter.ts";
import type { Faction } from "../HDCTypes/faction.ts";
import {
  getFactions,
  getCredits,
  getBossRewardFleetUpgradeDongles,
  getGlobalFleetUpgradeDongles,
  getGlobalDongles,
} from "./contentFactory.ts";

function factionMap<T>(
  mapping_function: (faction: Faction) => T,
): Record<string, T> {
  return Object.fromEntries(
    Array.from(getFactions()).map((faction) => [
      faction.short_name,
      mapping_function(faction),
    ]),
  );
}

function recordMappedCards<T>(
  name_mapping_function: (faction: Faction, card: Card) => string,
  mapping_function: (faction: Faction, card: Card) => T | undefined,
  filter_function?: (faction: Faction, card: Card) => boolean,
): Record<string, T> {
  return Object.fromEntries(
    mappedCards((faction: Faction, card: Card) => {
      const result = mapping_function(faction, card);
      if (result == undefined) return undefined;
      return [name_mapping_function(faction, card), result];
    }, filter_function),
  );
}

function* mappedCards<T>(
  mapping_function: (faction: Faction, card: Card) => T | undefined,
  filter_function?: (faction: Faction, card: Card) => boolean,
): Iterable<T> {
  for (const faction of getFactions()) {
    for (const card of faction.getCards()) {
      if (filter_function?.(faction, card) ?? true) {
        const result = mapping_function(faction, card);
        if (result != undefined) yield result;
      }
    }
  }
}

export function getCardsJSON() {
  return recordMappedCards(
    (faction: Faction, card: Card) => card.getId(faction),
    (faction: Faction, card: Card) => cardToBaseGameCard(faction, card),
  );
}

function cardToBaseGameCard(faction: Faction, card: Card): BaseGameCard {
  const out: BaseGameCard = {
    name: card.name,
    type: 2,
    data: card.datacloud ?? "0",
    dmg: card.damage,
    faction: faction.short_name,
    por_obj: `obj_unit_${faction.short_name}`,
  };
  return out;
}

export interface BaseGameCard extends Record<
  `effect_${number}`,
  BaseGameCardEffect
> {
  name: string;
  type: 1 | 2;
  data: string;
  dmg: number;
  faction: string;
  por_obj: `obj_unit_${string}` | `obj_ab_${string}`;
  por_back?: string;
  por_angle?: number;
  por_scale?: number;
  por_repos_rate?: number;
  por_repos_range?: number;
  hp?: number;
  size?: 1 | 2 | 3;
  timer?: number;
  attacks?: number;
  effect_count?: number;
  boss_up?: string;
  name_gp?: string;
  up_gp?: string;
  comms?: string;
  ab_comms_hos?: string;
  ab_comms_ally?: string;
  ab_comms_pl?: string;
  speaker?: string;
  dc_cond?: string;
  deck_group?: 0 | 1 | 2 | 3;
  jump_fx?: 1 | 2 | 3 | 4;
  gun_mounts?: number;
  death_fx_power?: 1 | 2 | 3 | 4 | 5;
  death_total?: 1;
  death_time_max?: number;
  srm_drop?: number;
  ab_type?: number;
  ab_target?: number;
  ab_attach_mount_type?: number;
  ab_attach_anim?: string;
  store_loc?: string;
  delayed_effect_time?: number;
  target_update_delay?: number;
}
export interface BaseGameCardEffect {
  effect_type: number;
  effect_status?: number;
  effect_power?: number;
  effect_anim?: string;
  effect_variant?: number;
  effect_force_anim?: number;
  effect_cmd_id?: string;
  effect_cmd_comms?: string;
  effect_cmd_tier?: number;
  effect_cmd_ability?: number;
  effect_card_id?: string;
  effect_card_convert?: string;
  effect_card_list?: string;
  effect_card_text?: string;
  effect_up_list?: string;
  effect_status_target?: number;
}

function recordMappedEncounters<T>(
  name_mapping_function: (faction: Faction, encounter: Encounter) => string,
  mapping_function: (faction: Faction, encounter: Encounter) => T | undefined,
  filter_function?: (faction: Faction, encounter: Encounter) => boolean,
): Record<string, T> {
  return Object.fromEntries(
    mappedEncounters((faction: Faction, encounter: Encounter) => {
      const result = mapping_function(faction, encounter);
      if (result == undefined) return undefined;
      return [name_mapping_function(faction, encounter), result];
    }, filter_function),
  );
}

function* mappedEncounters<T>(
  mapping_function: (faction: Faction, encounter: Encounter) => T | undefined,
  filter_function?: (faction: Faction, encounter: Encounter) => boolean,
): Iterable<T> {
  for (const faction of getFactions()) {
    for (const encounter of faction.getEncounters()) {
      if (filter_function?.(faction, encounter) ?? true) {
        const result = mapping_function(faction, encounter);
        if (result != undefined) yield result;
      }
    }
  }
}
export function getEncountersJSON(): Record<string, BaseGameEncounter> {
  return recordMappedEncounters(
    (faction, encounter) => encounter.getId(faction),
    (faction, encounter) => encounterToBaseGameEncounter(faction, encounter),
  );
}
function encounterToBaseGameEncounter(
  faction: Faction,
  encounter: Encounter,
): BaseGameEncounter {
  return {
    comment_wave_enemies: encounter.waves.reduce((prev, wave) => {
      const wave_cards: string = wave
        .getUsedCards()
        .reduce((prev, card) => `${prev} ${card.getId(faction)}`, "");
      return `${prev} ${wave_cards}`;
    }, ""),
    ...Object.fromEntries(
      encounter.waves.map((wave, index) => [
        `wave${index.toString()}`,
        waveToBaseGameWave(faction, wave),
      ]),
    ),
  };
}
function waveToBaseGameWave(faction: Faction, wave: Wave): BaseGameWave {
  return {
    wave_rand: wave.varaiants.length,
    wave_music: wave.music,
    wave_screen_text: wave.screen_text,
    ...Object.fromEntries(
      wave.varaiants.map((variant, index) => [
        `variant${index.toString()}`,
        Object.fromEntries(
          variant[0]
            .map((card, index) => [
              `o3_unit${index.toString()}`,
              card.getId(faction),
            ])
            .concat(
              variant[1].map((card, index) => [
                `o2_unit${index.toString()}`,
                card.getId(faction),
              ]),
            )
            .concat(
              variant[2].map((card, index) => [
                `o1_unit${index.toString()}`,
                card.getId(faction),
              ]),
            ),
        ),
      ]),
    ),
  };
}

interface BaseGameEncounter extends Record<`wave${number}`, BaseGameWave> {
  comment_wave_enemies: string;
}
interface BaseGameWave extends Record<
  `variant${number}`,
  Record<`o${number}_unit${number}`, string>
> {
  wave_rand: number;
  wave_music?: number;
  wave_screen_text?: string;
}

function recordMappedDongles<T>(
  name_mapping_function: (faction: Faction, dongle: Dongle) => string,
  mapping_function: (faction: Faction, dongle: Dongle) => T | undefined,
  filter_function?: (faction: Faction, dongle: Dongle) => boolean,
): Record<string, T> {
  return Object.fromEntries(
    mappedDongles((faction: Faction, dongle: Dongle) => {
      const result = mapping_function(faction, dongle);
      if (result == undefined) return undefined;
      return [name_mapping_function(faction, dongle), result];
    }, filter_function),
  );
}

function* mappedDongles<T>(
  mapping_function: (faction: Faction, dongle: Dongle) => T | undefined,
  filter_function?: (faction: Faction, dongle: Dongle) => boolean,
): Iterable<T> {
  for (const faction of getFactions()) {
    for (const dongle of faction.getDongles()) {
      if (filter_function?.(faction, dongle) ?? true) {
        const result = mapping_function(faction, dongle);
        if (result != undefined) yield result;
      }
    }
  }
}

export function getUpgradesJSON(): Record<string, BaseGameDongle> {
  return recordMappedDongles(
    (_faction, dongle) => dongle.id,
    (_faction, dongle) => {
      return {
        header: dongle.header,
        txt: dongle.text,
        txt_equip: dongle.text_on_equip,
      };
    },
  );
}

interface BaseGameDongle {
  header: string;
  txt: string;
  txt_equip: string;
}

export function getCommsJSON(): Record<
  string,
  Record<`txt_${number}`, string[]>
> {
  return {};
}
export function getLootListUpJSON() {
  return {
    fleet: {
      boss: getBossRewardFleetUpgradeDongles().map((dongle) => dongle.id),
      glo: getGlobalFleetUpgradeDongles().map((dongle) => dongle.id),
      ...factionMap((faction) =>
        faction.getEncounterRewardDongles().map((dongle) => dongle.id),
      ),
    },
    up: {
      glo: getGlobalDongles().map((dongle) => dongle.id),
      ...factionMap((faction) =>
        Array.from(faction.getDongles()).map((dongle) => dongle.id),
      ),
    },
    start: factionMap((faction) => {
      return {
        gen: Array.from(faction.getStartingGeneralDongles()).map(
          (dongle) => dongle.id,
        ),
        stat: Array.from(faction.getStartingStatDongles()).map(
          (dongle) => dongle.id,
        ),
      };
    }),
  };
}
export function getUnlockCondJSON(): Record<
  string,
  { cond: string; unlock: string }
> {}
export function getLootListCardJSON() {
  return {
    start: { defense: [], damage: [], buff: [], control: [], const: [] },
    ...Object.fromEntries(
      Array.from(getFactions()).map((faction) => [
        faction.short_name,
        { shp: [], shp_combo: {}, str: [], tch: [], tch_combo: {}, use: [] },
      ]),
    ),
  };
}
export function getTextListsJSON(): {
  shop_loc: { [key: string]: string[] };
  con_insult: {
    adj: string[];
    noun: string[];
  };
  gp: {
    corp_1: string[];
    corp_2: string[];
    leg: string[];
  };
} {}

export function getCloudLabelsJSON(): Record<
  string,
  { txt: string; size: number }
> {}
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
