import {
  getFactions,
  type Faction,
  type Sprite,
  type AnimatedSprite,
  type Dongle,
  type BaseGameCardEffect,
  getDongle,
  getFaction,
  getStoreLocation,
} from "wishgranter";
import type { Animation, projectData } from "../../wishgranterTypes/gdjs.ts";
import { getGlobalEncounters } from "./encounterFactory.ts";
import { getStoreLocationId } from "../contentFactory.ts";
import {
  backgroundSpriteToId,
  getBackgroundSprite,
  getCardSprites,
} from "../spriteFactory.ts";
import type { getCommsJSON, getUpgradesJSON } from "../jsonResultFactory.ts";
import type { PathLike } from "fs";
import { dongleFromBaseGame } from "./dongleFactory.ts";

export abstract class Card {
  name: string;
  damage: number;
  attacks = 1;
  effects: BaseGameCardEffect[]; //TODO Switch from unreadable id structs to object
  sprites: AnimatedSprite[];
  background_sprite: Sprite;
  sprite_rotation = 0;
  sprite_scale = 1;
  sprite_shake_rate = 0;
  sprite_shake_range = 0;
  delayed_effect_time = 0;
  target_update_delay = 0;
  datacloud_entry_text?: string;
  datacloud_unlock_condition?: string; //TODO Switch from ID to object

  constructor(
    name: string,
    sprites: AnimatedSprite[],
    background_sprite: Sprite,
    damage: number,
    ...effects: BaseGameCardEffect[]
  ) {
    this.name = name;
    this.sprites = sprites;
    this.background_sprite = background_sprite;
    this.damage = damage;
    this.effects = effects;
  }
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  getId(_faction?: Faction): string {
    return this.name.replace(/ /g, "_").toLowerCase();
  }
  getAnimation(faction: Faction): Animation {
    return {
      name: this.getId(faction),
      useMultipleDirections: false,
      directions: [
        {
          looping: true,
          timeBetweenFrames: 0.068,
          sprites: Array.from({ length: this.sprites.length }, () =>
            Array.from(
              { length: this.sprites.length },
              (_null, index) => index,
            ).toSorted(() => Math.random() * 2 - 1),
          )
            .flat()
            .map((index) =>
              this.sprites[index].getAnimationFrame(faction, this, index),
            ),
        },
      ],
    };
  }
  abstract getComms(
    faction?: Faction,
  ): Iterable<[string, Record<`text_${number}`, string[]>]>;
  abstract getType(): "construct" | "tech" | "depletable" | "ship";
}
export abstract class Unit extends Card {
  hull: number;
  timer: number;
  orbital_size: 1 | 2 | 3;
  death_effect_power = 1;
  jump_fx?: 1 | 2 | 3 | 4;
  gun_mounts?: number;
  death_fx_power?: 1 | 2 | 3 | 4 | 5;
  death_time_max?: number;
  comms?: string[][];
  srm_drop?: number;
  constructor(
    name: string,
    sprites: AnimatedSprite[],
    background_sprite: Sprite,
    damage: number,
    hull: number,
    timer: number,
    orbital_size: 1 | 2 | 3,
    ...effects: BaseGameCardEffect[]
  ) {
    super(name, sprites, background_sprite, damage, ...effects);
    this.hull = hull;
    this.timer = timer;
    this.orbital_size = orbital_size;
  }
  getId(faction?: Faction): `${string}_${string}` {
    return `${faction?.short_name ?? "heg"}_${super.getId(faction)}`;
  }
  getComms(faction?: Faction) {
    return [
      [
        this.getId(faction),
        Object.fromEntries(
          this.comms?.map((comm, index) => [
            `text_${index.toString()}`,
            comm,
          ]) ?? [],
        ),
      ] as [string, Record<`text_${number}`, string[]>],
    ];
  }
  getType() {
    return this.damage != -1 ? "ship" : "construct";
  }
}
export interface Construct extends Unit {
  getType(): "construct";
} //TODO Constrain Construct
interface PlayerCard extends Card {
  /** Lowest goes first in deck veiw*/
  deck_priority: number;
  /** Expected to be populated by a call to getStoreLocation*/
  store_location: string[];
}
export class EnemyUnit extends Unit {
  boss_upgrade?: Dongle;
  endless_mode_upgrade?: Dongle;
  endless_mode_name?: string;
  getId(faction?: Faction): `hos_${string}_${string}` {
    return `hos_${super.getId(faction)}`;
  }
}
export class PlayerUnit extends Unit implements PlayerCard {
  store_location: string[];
  deck_priority = Infinity;
  constructor(
    name: string,
    sprites: AnimatedSprite[],
    background_sprite: Sprite,
    store_location: string[],
    damage: number,
    hull: number,
    timer: number,
    orbital_size: 1 | 2 | 3,
    ...effects: BaseGameCardEffect[]
  ) {
    super(
      name,
      sprites,
      background_sprite,
      damage,
      hull,
      timer,
      orbital_size,
      ...effects,
    );
    this.store_location = store_location;
  }
  getId(faction?: Faction): `pl_${string}_${string}` {
    return `pl_${super.getId(faction)}`;
  }
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Megaship extends PlayerUnit {} //TODO Constrain Megaship
export interface Depletable extends PlayerCard {
  getType(): "depletable";
} //TODO Constrain Depleteable
export class Ability extends Card implements PlayerCard {
  attach_mount_type?: number; //TODO Switch from id to object
  attach_animation?: string; //TODO Switch from id to object
  type?: number;
  target: number;
  comms_player?: string[][];
  comms_ally?: string[][];
  comms_hos?: string[][];
  speaker?: string;
  store_location: string[];
  deck_priority = Infinity;
  constructor(
    name: string,
    sprites: AnimatedSprite[],
    background_sprite: Sprite,
    store_location: string[],
    damage: number,
    target: number,
    ...effects: BaseGameCardEffect[]
  ) {
    super(name, sprites, background_sprite, damage, ...effects);
    this.target = target;
    this.store_location = store_location;
  }
  getId(faction?: Faction): `ab_${string}` {
    return `ab_${super.getId(faction)}`;
  }
  *getComms(
    faction?: Faction,
  ): Iterable<[string, Record<`text_${number}`, string[]>]> {
    if (this.comms_ally)
      yield [
        `${this.getId(faction)}_ally`,
        Object.fromEntries(
          this.comms_ally.map((comm, index) => [
            `text_${index.toString()}`,
            comm,
          ]),
        ) as Record<`text_\${number}`, string[]>,
      ];
    if (this.comms_hos)
      yield [
        `${this.getId(faction)}_hos`,
        Object.fromEntries(
          this.comms_hos.map((comm, index) => [
            `text_${index.toString()}`,
            comm,
          ]),
        ) as Record<`text_\${number}`, string[]>,
      ];
    if (this.comms_player)
      yield [
        `${this.getId(faction)}_pl`,
        Object.fromEntries(
          this.comms_player.map((comm, index) => [
            `text_${index.toString()}`,
            comm,
          ]),
        ) as Record<`text_\${number}`, string[]>,
      ];
  }
  getType() {
    return this.damage != -1 ? "depletable" : "tech";
  }
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Commander extends Ability {} //TODO Constrain Commander

interface BaseGameCard extends Record<`effect_${number}`, BaseGameCardEffect> {
  name: string;
  data: string;
  dmg: number;
  faction: string;
  por_back: `cp_${string}`;
  por_angle?: number;
  por_scale?: number;
  por_repos_rate?: number;
  por_repos_range?: number;
  attacks?: number;
  effect_count?: number;
  dc_cond?: string;
  delayed_effect_time?: number;
  target_update_delay?: number;
}
interface BaseGamePlayerCard extends BaseGameCard {
  store_loc: string;
  deck_group?: number;
}
interface BaseGameUnit extends BaseGameCard {
  type: 1;
  hp: number;
  size: 1 | 2 | 3;
  timer: number;
  por_obj: `obj_unit_${string}`;
  srm_drop?: number;
  jump_fx?: 1 | 2 | 3 | 4;
  gun_mounts?: number;
  death_fx_power?: 1 | 2 | 3 | 4 | 5;
  death_total?: 1;
  death_time_max?: number;
  comms?: string;
}
export interface BaseGameEnemeyUnit extends BaseGameUnit {
  por_obj: `obj_unit_hos`;
  boss_up?: string;
  name_gp?: string;
  up_gp?: string;
}
export interface BaseGamePlayerUnit extends BaseGamePlayerCard, BaseGameUnit {}
interface BaseGameAbility extends BaseGamePlayerCard {
  type: 2;
  por_obj: `obj_ab_${string}`;
  ab_target: number;
  ab_type?: number;
  ab_attach_mount_type?: number;
  ab_attach_anim?: string;
  ab_comms_hos?: string;
  ab_comms_ally?: string;
  ab_comms_pl?: string;
  speaker?: string;
}

export function getCard(
  card_name: string,
): PlayerUnit | EnemyUnit | Ability | undefined {
  for (const faction of getFactions()) {
    const card = faction.getCard(card_name);
    if (card) return card;
  }
}
export function removeCard(card: PlayerUnit | EnemyUnit | Ability) {
  for (const faction of getFactions()) {
    faction.removeCard(card);
  }
}

export function getCardsJSON() {
  return {
    ...Object.fromEntries(
      getGlobalEncounters()
        .flatMap((encounter) => encounter.waves)
        .flatMap((wave) => wave.getUsedCards())
        .map(
          (card) =>
            [card.getId(), cardToBaseGameCard(card)] as [string, BaseGameCard],
        ),
    ),
    ...Object.fromEntries(
      (getFactions()[Symbol.iterator]() as IteratorObject<Faction>).flatMap(
        (faction) =>
          (
            faction.getCards()[Symbol.iterator]() as IteratorObject<
              EnemyUnit | PlayerUnit | Ability
            >
          ).map(
            (card) =>
              [card.getId(faction), cardToBaseGameCard(card, faction)] as [
                string,
                BaseGameCard,
              ],
          ),
      ),
    ),
  };
}
export function cardToBaseGameCard(
  card: EnemyUnit | PlayerUnit | Ability,
  faction?: Faction,
): BaseGameEnemeyUnit | BaseGamePlayerUnit | BaseGameAbility {
  let out: Partial<BaseGameEnemeyUnit | BaseGamePlayerUnit | BaseGameAbility> =
    {
      name: card.name,
      dmg: card.damage,
      por_back: backgroundSpriteToId(card.background_sprite),
      data: card.datacloud_entry_text ?? "0",
      faction: faction?.short_name ?? "heg",
      attacks: card.attacks,
      por_angle: card.sprite_rotation,
      por_scale: card.sprite_scale,
      por_repos_range: card.sprite_shake_range,
      por_repos_rate: card.sprite_shake_rate,
      delayed_effect_time: card.delayed_effect_time,
      target_update_delay: card.target_update_delay,
      dc_cond: card.datacloud_unlock_condition,
      effect_count: card.effects.length > 0 ? card.effects.length : undefined,
      ...Object.fromEntries(
        card.effects.map((effect, index) => [
          `effect_${index.toString()}`,
          effect,
        ]),
      ),
    } as BaseGameCard;
  if (card instanceof Ability || card instanceof PlayerUnit) {
    out = {
      ...out,
      store_loc: getStoreLocationId(card.store_location) ?? "",
      deck_group:
        card.deck_priority >= Infinity ? undefined : card.deck_priority,
    } as BaseGamePlayerCard;
  }
  if (card instanceof Ability) {
    out = {
      ...out,
      type: 2,
      por_obj: `obj_ab_${faction?.short_name ?? "universal"}`,
      ab_type: card.type,
      ab_target: card.target,
      ab_attach_anim: card.attach_animation,
      ab_attach_mount_type: card.attach_mount_type,
      ab_comms_ally: card.comms_ally
        ? `${card.getId(faction)}_ally`
        : undefined,
      ab_comms_hos: card.comms_hos ? `${card.getId(faction)}_hos` : undefined,
      ab_comms_pl: card.comms_player ? `${card.getId(faction)}_pl` : undefined,
      speaker: card.speaker,
    } as BaseGameAbility;
  } else {
    out = {
      ...out,
      type: 1,
      hp: card.hull,
      timer: card.timer,
      size: card.orbital_size,
      por_obj: `obj_unit_${(faction?.short_name ?? card instanceof EnemyUnit) ? "hos" : "universal"}`,
      comms: card.comms ? card.getId(faction) : undefined,
      srm_drop: card.srm_drop,
      jump_fx: card.jump_fx,
      gun_mounts: card.gun_mounts,
      death_fx_power: card.death_effect_power,
      death_time_max: card.death_time_max,
      death_total: 1,
    } as BaseGameUnit;
    if (card instanceof EnemyUnit) {
      out = {
        ...out,
        boss_up: card.boss_upgrade?.id,
        name_gp: card.endless_mode_name,
        up_gp: card.endless_mode_upgrade,
      } as BaseGameEnemeyUnit;
    }
  }
  return out as BaseGameEnemeyUnit | BaseGamePlayerUnit | BaseGameAbility;
}

export function cardFromBaseGameCard(
  id: ReturnType<(PlayerUnit | EnemyUnit | Ability)["getId"]>,
  hyperspace_deck_command_location: PathLike,
  card: BaseGameEnemeyUnit | BaseGamePlayerUnit | BaseGameAbility,
  comms: ReturnType<typeof getCommsJSON>,
  resources: projectData["resources"]["resources"],
  upgrades: ReturnType<typeof getUpgradesJSON>,
): PlayerUnit | EnemyUnit | Ability {
  const out =
    card.type == 2
      ? abilityFromBaseGameAbility(
          id as ReturnType<Ability["getId"]>,
          hyperspace_deck_command_location,
          card,
          comms,
          resources,
        )
      : unitFromBaseGameUnit(
          id as ReturnType<(PlayerUnit | EnemyUnit)["getId"]>,
          hyperspace_deck_command_location,
          card,
          comms,
          resources,
          upgrades,
        );
  out.attacks = card.attacks ?? 1;
  out.sprite_rotation = card.por_angle ?? 0;
  out.sprite_scale = card.por_scale ?? 1;
  out.sprite_shake_rate = card.por_repos_rate ?? 0;
  out.sprite_shake_range = card.por_repos_range ?? 0;
  out.delayed_effect_time = card.delayed_effect_time ?? 0;
  out.target_update_delay = card.target_update_delay ?? 0;
  out.datacloud_entry_text = card.data != "0" ? card.data : undefined;
  out.datacloud_unlock_condition = card.dc_cond;
  return out;
}
function abilityFromBaseGameAbility(
  id: ReturnType<Ability["getId"]>,
  hyperspace_deck_command_location: PathLike,
  ability: BaseGameAbility,
  comms: ReturnType<typeof getCommsJSON>,
  resources: projectData["resources"]["resources"],
): Ability {
  const effects = [...Array(ability.effect_count ?? 0).keys()].map(
    (index) => ability[`effect_${index.toString()}` as `effect_${number}`],
  );
  const out = new Ability(
    ability.name,
    getCardSprites(id, hyperspace_deck_command_location, resources),
    getBackgroundSprite(ability.por_back, hyperspace_deck_command_location),
    getStoreLocation(ability.store_loc) ?? ["Somewhere darker, yet darker"],
    ability.dmg,
    ability.ab_target,
    ...effects,
  );
  out.attach_animation = ability.ab_attach_anim;
  out.attach_mount_type = ability.ab_attach_mount_type;
  out.type = ability.ab_type;
  out.target = ability.ab_target;

  if (ability.ab_comms_ally)
    out.comms_ally = Object.getOwnPropertyNames(
      comms[ability.ab_comms_ally],
    ).map(
      (name) =>
        (comms[ability.ab_comms_ally ?? ""] ?? { [name]: [""] })[
          name as `text_${number}`
        ],
    );
  if (ability.ab_comms_hos)
    out.comms_hos = Object.getOwnPropertyNames(comms[ability.ab_comms_hos]).map(
      (name) =>
        (comms[ability.ab_comms_hos ?? ""] ?? { [name]: [""] })[
          name as `text_${number}`
        ],
    );
  if (ability.ab_comms_pl)
    out.comms_player = Object.getOwnPropertyNames(
      comms[ability.ab_comms_pl],
    ).map(
      (name) =>
        (comms[ability.ab_comms_pl ?? ""] ?? { [name]: [""] })[
          name as `text_${number}`
        ],
    );

  out.speaker = ability.speaker;
  out.store_location = getStoreLocation(ability.store_loc) ?? [];
  out.deck_priority = ability.deck_group ?? Infinity;
  return out;
}
function playerUnitFromBaseGamePlayerUnit(
  id: ReturnType<PlayerUnit["getId"]>,
  hyperspace_deck_command_location: PathLike,
  player_unit: BaseGamePlayerUnit,
  resources: projectData["resources"]["resources"],
): PlayerUnit {
  const effects = [...Array(player_unit.effect_count ?? 0).keys()].map(
    (index) => player_unit[`effect_${index.toString()}` as `effect_${number}`],
  );
  const out = new PlayerUnit(
    player_unit.name,
    getCardSprites(id, hyperspace_deck_command_location, resources),
    getBackgroundSprite(player_unit.por_back, hyperspace_deck_command_location),
    getStoreLocation(player_unit.store_loc) ?? ["Somewhere darker, yet darker"],
    player_unit.dmg,
    player_unit.hp,
    player_unit.timer,
    player_unit.size,
    ...effects,
  );
  out.deck_priority = player_unit.deck_group ?? Infinity;
  out.store_location = getStoreLocation(player_unit.store_loc) ?? [];
  return out;
}
function enemyUnitFromBaseGameEnemeyUnit(
  id: `hos_${string}_${string}`,
  hyperspace_deck_command_location: PathLike,
  enemey_unit: BaseGameEnemeyUnit,
  upgrades: ReturnType<typeof getUpgradesJSON>,
  resources: projectData["resources"]["resources"],
): EnemyUnit {
  const effects = [...Array(enemey_unit.effect_count ?? 0).keys()].map(
    (index) => enemey_unit[`effect_${index.toString()}` as `effect_${number}`],
  );
  const out = new EnemyUnit(
    enemey_unit.name,
    getCardSprites(id, hyperspace_deck_command_location, resources),
    getBackgroundSprite(enemey_unit.por_back, hyperspace_deck_command_location),
    enemey_unit.dmg,
    enemey_unit.hp,
    enemey_unit.timer,
    enemey_unit.size,
    ...effects,
  );
  out.boss_upgrade = enemey_unit.boss_up
    ? (getDongle(enemey_unit.boss_up) ??
      dongleFromBaseGame(enemey_unit.boss_up, upgrades[enemey_unit.boss_up]))
    : undefined;
  out.endless_mode_upgrade = enemey_unit.up_gp
    ? (getDongle(enemey_unit.up_gp) ??
      dongleFromBaseGame(enemey_unit.up_gp, upgrades[enemey_unit.up_gp]))
    : undefined;
  out.endless_mode_name = enemey_unit.name_gp;
  return out;
}
function unitFromBaseGameUnit(
  id: ReturnType<(EnemyUnit | PlayerUnit)["getId"]>,
  hyperspace_deck_command_location: PathLike,
  unit: BaseGameEnemeyUnit | BaseGamePlayerUnit,
  comms: ReturnType<typeof getCommsJSON>,
  resources: projectData["resources"]["resources"],
  upgrades: ReturnType<typeof getUpgradesJSON>,
): EnemyUnit | PlayerUnit {
  const out =
    unit.por_obj == "obj_unit_hos"
      ? enemyUnitFromBaseGameEnemeyUnit(
          id as ReturnType<EnemyUnit["getId"]>,
          hyperspace_deck_command_location,
          unit as BaseGameEnemeyUnit,
          upgrades,
          resources,
        )
      : playerUnitFromBaseGamePlayerUnit(
          id as ReturnType<PlayerUnit["getId"]>,
          hyperspace_deck_command_location,
          unit as BaseGamePlayerUnit,
          resources,
        );
  out.jump_fx = unit.jump_fx;
  out.death_effect_power = unit.death_fx_power ?? 1;
  out.death_time_max = unit.death_time_max;
  out.srm_drop = unit.srm_drop;
  out.gun_mounts = unit.gun_mounts;
  if (unit.comms)
    out.comms = Object.getOwnPropertyNames(comms[unit.comms]).map(
      (name) =>
        (comms[unit.comms ?? ""] ?? { [name]: [""] })[name as `text_${number}`],
    );

  return out;
}

interface FactionLoot {
  shp: ReturnType<PlayerUnit["getId"]>[];
  shp_combo: Record<string, ReturnType<PlayerUnit["getId"]>>;
  tch: ReturnType<Ability["getId"]>[];
  tch_combo: Record<string, ReturnType<Ability["getId"]>>;
  str: ReturnType<PlayerUnit["getId"]>[];
  use: ReturnType<Depletable["getId"]>[];
}
interface RandomStart {
  defense: ReturnType<Ability["getId"]>[];
  damage: ReturnType<Ability["getId"]>[];
  buff: ReturnType<Ability["getId"]>[];
  control: ReturnType<Ability["getId"]>[];
  const: ReturnType<Construct["getId"]>[];
}
export function getLootListCardJSON(): { start: RandomStart } & Record<
  string,
  FactionLoot | RandomStart
> {
  return {
    start: {
      defense: Array.from(
        (getFactions()[Symbol.iterator]() as IteratorObject<Faction>).flatMap(
          (faction) =>
            (
              faction
                .getStartingAbilities()
                [Symbol.iterator]() as IteratorObject<
                [Ability, StartingCardTag]
              >
            )
              .filter((ability_pair) => ability_pair[1] == "defense")
              .map((ability_pair) => ability_pair[0].getId(faction)),
        ),
      ),
      damage: Array.from(
        (getFactions()[Symbol.iterator]() as IteratorObject<Faction>).flatMap(
          (faction) =>
            (
              faction
                .getStartingAbilities()
                [Symbol.iterator]() as IteratorObject<
                [Ability, StartingCardTag]
              >
            )
              .filter((ability_pair) => ability_pair[1] == "damage")
              .map((ability_pair) => ability_pair[0].getId(faction)),
        ),
      ),
      buff: Array.from(
        (getFactions()[Symbol.iterator]() as IteratorObject<Faction>).flatMap(
          (faction) =>
            (
              faction
                .getStartingAbilities()
                [Symbol.iterator]() as IteratorObject<
                [Ability, StartingCardTag]
              >
            )
              .filter((ability_pair) => ability_pair[1] == "buff")
              .map((ability_pair) => ability_pair[0].getId(faction)),
        ),
      ),
      control: Array.from(
        (getFactions()[Symbol.iterator]() as IteratorObject<Faction>).flatMap(
          (faction) =>
            (
              faction
                .getStartingAbilities()
                [Symbol.iterator]() as IteratorObject<
                [Ability, StartingCardTag]
              >
            )
              .filter((ability_pair) => ability_pair[1] == "control")
              .map((ability_pair) => ability_pair[0].getId(faction)),
        ),
      ),
      const: Array.from(
        (getFactions()[Symbol.iterator]() as IteratorObject<Faction>).flatMap(
          (faction) =>
            (
              faction
                .getStartingConstructs()
                [Symbol.iterator]() as IteratorObject<Construct>
            ).map((construct) => construct.getId(faction)),
        ),
      ),
    },
    ...Object.fromEntries(
      (getFactions()[Symbol.iterator]() as IteratorObject<Faction>).map(
        (faction) => {
          return [
            faction.short_name,
            {
              shp: Array.from(faction.getShips()).map((card) =>
                card.getId(faction),
              ),
              shp_combo: Object.fromEntries(
                faction
                  .getShipCombos()
                  .entries()
                  .map(([sub_faction, card]) => [
                    sub_faction.short_name,
                    card.getId(faction),
                  ]),
              ),
              str: Array.from(faction.getConstructs()).map((card) =>
                card.getId(faction),
              ),
              tch: Array.from(faction.getTechs()).map((card) =>
                card.getId(faction),
              ),
              tch_combo: Object.fromEntries(
                faction
                  .getTechCombos()
                  .entries()
                  .map(([sub_faction, card]) => [
                    sub_faction.short_name,
                    card.getId(faction),
                  ]),
              ),
              use: Array.from(faction.getDepletables()).map((card) =>
                card.getId(faction),
              ),
            },
          ];
        },
      ),
    ),
  };
}

export type StartingCardTag = "defense" | "damage" | "buff" | "control";

export function applyLootListCardJson(
  hyperspace_deck_command_location: PathLike,
  loot_list_card: ReturnType<typeof getLootListCardJSON>,
  cards: ReturnType<typeof getCardsJSON>,
  comms: ReturnType<typeof getCommsJSON>,
  resources: projectData["resources"]["resources"],
  upgrades: ReturnType<typeof getUpgradesJSON>,
) {
  Object.getOwnPropertyNames(loot_list_card)
    .filter((name) => name != "start")
    .forEach((name) => {
      const faction = getFaction(name);
      const faction_loot = loot_list_card[name] as FactionLoot;
      faction?.addCards(
        ...faction_loot.use
          .concat(faction_loot.tch)
          .concat(faction_loot.str)
          .concat(faction_loot.shp)
          .map(
            (id) =>
              cardFromBaseGameCard(
                id as ReturnType<(Ability | PlayerUnit)["getId"]>,
                hyperspace_deck_command_location,
                cards[id] as BaseGameAbility | BaseGamePlayerUnit,
                comms,
                resources,
                upgrades,
              ) as Ability | PlayerUnit,
          ),
        ...(
          getFactions()[Symbol.iterator]() as IteratorObject<Faction>
        ).flatMap((sub_faction) => {
          const shp_id = faction_loot.shp_combo[sub_faction.short_name];
          const tch_id = faction_loot.tch_combo[sub_faction.short_name];
          return [
            [
              cardFromBaseGameCard(
                shp_id,
                hyperspace_deck_command_location,
                cards[shp_id] as BaseGamePlayerUnit,
                comms,
                resources,
                upgrades,
              ),
              sub_faction,
            ],
            [
              cardFromBaseGameCard(
                tch_id,
                hyperspace_deck_command_location,
                cards[tch_id] as BaseGameAbility,
                comms,
                resources,
                upgrades,
              ),
              sub_faction,
            ],
          ] as [PlayerUnit | Ability, Faction][];
        }),
      );
    });
}
