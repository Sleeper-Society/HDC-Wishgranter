import type { Dongle } from "./dongle.ts";
import type { Sprite } from "./sprite.ts";
import type { Animation } from "./gdjs.ts";
import type { Faction } from "./faction.ts";

export class Card {
  name: string;
  damage: number;
  sprites: Sprite[];
  sprite_angle? = 0;
  sprite_rotation? = 0;
  sprite_scale? = 1;
  effects: BaseGameCardEffect[];
  comms?: string[][];
  datacloud?: string;
  datacloud_unlock_condition?: unknown;
  constructor(
    name: string,
    sprites: Sprite[],
    damage: number,
    effects: BaseGameCardEffect[],
    additional?: Partial<Card>,
  ) {
    this.name = name;
    this.sprites = sprites;
    this.damage = damage;
    this.effects = effects;
    Object.assign(this, additional);
  }
  getId(faction: Faction): string {
    return `${faction.short_name}_${this.name.replace(/ /g, "_").toLowerCase()}`;
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
  asBaseGameCard(faction: Faction): BaseGameCard {
    const out: BaseGameCard = {
      name: this.name,
      type: 2,
      data: this.datacloud ?? "0",
      dmg: this.damage,
      faction: faction.short_name,
      por_obj: `obj_unit_${faction.short_name}`,
    };
    return out;
  }
}

export class Unit extends Card {
  hull: number;
  timer: number;
  orbital_size: 1 | 2 | 3;
  deck_group?: "megaship" | "aux" | "construct";
  death_effect_power = 1;
  boss_upgrade?: Dongle;
  constructor(
    name: string,
    sprites: Sprite[],
    damage: number,
    hull: number,
    timer: number,
    orbital_size: 1 | 2 | 3,
    effects: BaseGameCardEffect[],
    additional?: Partial<Unit>,
  ) {
    super(name, sprites, damage, effects, additional);
    this.name = name;
    this.sprites = sprites;
    this.hull = hull;
    this.timer = timer;
    this.orbital_size = orbital_size;
    this.effects = effects;
  }
  asBaseGameCard(faction: Faction) {
    const out = super.asBaseGameCard(faction);
    out.type = 1;
    return out;
  }
}

export class Ability extends Card {}

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
