import type { PathLike } from "node:fs";
import {
  getFactions,
  getFaction,
  type Unit,
  type Faction,
  getCard,
} from "wishgranter";
import type {
  getCardsJSON,
  getCommsJSON,
  getUpgradesJSON,
} from "../jsonResultFactory.ts";
import {
  type BaseGameEnemeyUnit,
  type BaseGamePlayerUnit,
  cardFromBaseGameCard,
} from "./cardFactory.ts";
import type { projectData } from "../../wishgranterTypes/gdjs.ts";

export class Encounter {
  name: string;
  comms: string[][];
  waves: Wave[] = [];
  constructor(name: string, comms: string[][] = [], ...waves: Wave[]) {
    this.name = name;
    this.comms = comms;
    this.waves = waves;
  }
  getId(faction?: Faction) {
    return `enc_${faction?.short_name ?? ""}${faction ? "_" : ""}${this.name}`;
  }
  *getComms(
    faction?: Faction,
  ): Iterable<[string, Record<`text_${number}`, string[]>]> {
    yield [
      `${faction?.short_name ?? ""}${faction ? "_" : ""}enc_${this.name}`,
      Object.fromEntries(
        this.comms.map((comm, index) => [`text_${index.toString()}`, comm]),
      ),
    ];
  }
}
export class Wave {
  varaiants: [
    orbit_3: Unit[],
    orbit_2: Unit[],
    orbit_1: Unit[],
    orbit_0: Unit[],
  ][] = [];
  music?: PathLike;
  screen_text?: string;
  constructor(
    ...enemies:
      | Unit[]
      | [orbit_3: Unit[], orbit_2: Unit[], orbit_1: Unit[], orbit_0: Unit[]][]
  ) {
    if (enemies.length <= 0) return;
    if (Array.isArray(enemies[0])) {
      this.varaiants = enemies as [
        orbit_3: Unit[],
        orbit_2: Unit[],
        orbit_1: Unit[],
        orbit_0: Unit[],
      ][];
      return;
    }
    this.varaiants = [[enemies as Unit[], [], [], []]];
  }
  *getUsedCards(): Iterable<Unit> {
    for (const varaiant of this.varaiants) {
      for (const orbit of varaiant) {
        for (const card of orbit) {
          yield card;
        }
      }
    }
  }
}

interface BaseGameEncounter extends Record<`wave${number}`, BaseGameWave> {
  comment_wave_enemies: string;
}
interface BaseGameWave extends Record<
  `variant${number}`,
  Record<`o${3 | 2 | 1 | 0}_unit${number}`, ReturnType<Unit["getId"]>>
> {
  wave_rand: number;
  wave_music?: number;
  wave_screen_text?: string;
}

export function applyEncountersJson(
  hyperspace_deck_command_location: PathLike,
  base_game_encounters: ReturnType<typeof getEncountersJSON>,
  comms: ReturnType<typeof getCommsJSON>,
  music: Record<number, [PathLike, PathLike | undefined]>,
  cards: ReturnType<typeof getCardsJSON>,
  resources: projectData["resources"]["resources"],
  upgrades: ReturnType<typeof getUpgradesJSON>,
) {
  Object.getOwnPropertyNames(music).forEach(
    (index) =>
      (music_map[Number.parseInt(index)] = music[Number.parseInt(index)]),
  );
  Object.getOwnPropertyNames(base_game_encounters).forEach((encounter_id) => {
    const encounter =
      base_game_encounters[encounter_id as `enc_${string}_${string}`];
    const faction_short_name = encounter_id.split("_")[1];
    const faction = getFaction(faction_short_name);
    const base_comm = comms[`gc_${encounter_id}`] as
      | Record<`text_${number}`, string[]>
      | undefined;
    const comm = base_comm
      ? Object.getOwnPropertyNames(base_comm).map(
          (name) => base_comm[name as keyof typeof base_comm],
        )
      : undefined;
    const out = new Encounter(
      encounter_id
        .split("_")
        .slice(2)
        .reduce((prev, cur) => prev + (prev == "" ? "" : "_") + cur, ""),
      comm,
      ...Object.getOwnPropertyNames(encounter)
        .filter((name) => !["comment_wave_enemies"].includes(name))
        .map((name) =>
          waveFromBaseGameWave(
            encounter[name as keyof typeof encounter] as BaseGameWave,
            hyperspace_deck_command_location,
            cards,
            comms,
            resources,
            upgrades,
          ),
        ),
    );
    (faction ? faction.addEncounters.bind(faction) : addGlobalEncounter)(out);
  });
}

export const music_map: ([PathLike, PathLike | undefined] | undefined)[] = [
  ["this is", "the mute value"],
];
export function encounterToBaseGameEncounter(
  encounter: Encounter,
  faction?: Faction,
): BaseGameEncounter {
  return {
    comment_wave_enemies: encounter.waves.reduce((prev, wave) => {
      const wave_cards: string = (
        wave.getUsedCards()[Symbol.iterator]() as IteratorObject<Unit>
      ).reduce((prev, card) => `${prev} ${card.getId(faction)}`, "");
      return `${prev} ${wave_cards}`;
    }, ""),
    ...Object.fromEntries(
      encounter.waves.map((wave, index) => [
        `wave${index.toString()}`,
        waveToBaseGameWave(wave, faction),
      ]),
    ),
  };
}

function waveToBaseGameWave(wave: Wave, faction?: Faction): BaseGameWave {
  let music_index = music_map.findIndex(
    (music) => music && music[0] == wave.music,
  );
  if (wave.music && music_index == -1) {
    music_index = music_map.findIndex((music) => music);
    if (music_index == -1) music_index = music_map.length;
    music_map[music_index] = [wave.music, undefined];
  }
  return {
    wave_rand: wave.varaiants.length,
    wave_music: wave.music ? music_index : undefined,
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
function waveFromBaseGameWave(
  wave: BaseGameWave,
  hyperspace_deck_command_location: PathLike,
  cards: ReturnType<typeof getCardsJSON>,
  comms: ReturnType<typeof getCommsJSON>,
  resources: projectData["resources"]["resources"],
  upgrades: ReturnType<typeof getUpgradesJSON>,
): Wave {
  const out = new Wave();
  for (const base_game_variant_key in wave) {
    if (
      ["wave_rand", "wave_music", "wave_screen_text"].includes(
        base_game_variant_key,
      )
    )
      continue;
    const base_game_variant = wave[base_game_variant_key as `variant${number}`];
    const variant: [
      orbit_3: Unit[],
      orbit_2: Unit[],
      orbit_1: Unit[],
      orbit_0: Unit[],
    ] = [[], [], [], []];
    for (const base_game_enemy_key in base_game_variant) {
      const card_id =
        base_game_variant[
          base_game_enemy_key as `o${3 | 2 | 1 | 0}_unit${number}`
        ];
      const base_game_card = cards[card_id] as
        | BaseGameEnemeyUnit
        | BaseGamePlayerUnit
        | undefined;
      if (base_game_card == undefined) continue;
      variant[
        3 - Number.parseInt(base_game_enemy_key.split("_")[0].substring(1))
      ].push(
        (getCard(card_id) as Unit | undefined) ??
          (cardFromBaseGameCard(
            card_id,
            hyperspace_deck_command_location,
            base_game_card,
            comms,
            resources,
            upgrades,
          ) as Unit),
      );
    }
    out.varaiants.push(variant);
  }
  return out;
}

const gloabl_encounters: Encounter[] = [];

export function addGlobalEncounter(encounter: Encounter) {
  gloabl_encounters.push(encounter);
}
export function getEncounter(encounter_name: string): Encounter | undefined {
  for (const faction of getFactions()) {
    const encounter = faction.getEncounter(encounter_name);
    if (encounter) return encounter;
  }
}
export function getGlobalEncounters(): IteratorObject<Encounter> {
  return gloabl_encounters[Symbol.iterator]();
}
export function removeEncounter(encounter: Encounter) {
  for (const faction of getFactions()) {
    faction.removeEncounter(encounter);
  }
  if (gloabl_encounters.includes(encounter))
    gloabl_encounters.splice(gloabl_encounters.indexOf(encounter), 1);
}

export function getEncountersJSON(): Record<
  `enc_${string}_${string}`,
  BaseGameEncounter
> {
  return {
    ...Object.fromEntries(
      (getFactions()[Symbol.iterator]() as IteratorObject<Faction>).flatMap(
        (faction) =>
          (
            faction
              .getEncounters()
              [Symbol.iterator]() as IteratorObject<Encounter>
          ).map((encounter) => [
            encounter.getId(faction),
            encounterToBaseGameEncounter(encounter, faction),
          ]),
      ),
    ),
    ...Object.fromEntries(
      (gloabl_encounters[Symbol.iterator]() as IteratorObject<Encounter>).map(
        (encounter) => [
          encounter.getId(),
          encounterToBaseGameEncounter(encounter),
        ],
      ),
    ),
  };
}
