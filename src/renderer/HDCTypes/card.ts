import type { Dongle } from "./dongle.ts";
import type { Sprite } from "./sprite.ts";
import type { Animation } from "./gdjs.ts";
import type { Faction } from "./faction.ts";
import type { BaseGameCardEffect } from "../factories/jsonResultFactory.ts"; //TODO Custom card effects

export abstract class Card {
  name: string;
  damage: number;
  sprites: Sprite[];
  background_sprite: Sprite;
  sprite_angle? = 0;
  sprite_rotation? = 0;
  sprite_scale = 1;
  sprite_repos_rate?: number;
  sprite_repos_range?: number;
  effects: BaseGameCardEffect[];
  multistrike?: true;
  comms?: string[][];
  datacloud_entry_text?: string;
  datacloud_unlock_condition?: unknown;
  endless_mode_upgrade?: Dongle;
  endless_mode_name?: string;
  srm_drop?: number;

  constructor(
    name: string,
    sprites: Sprite[],
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
  abstract getType(): "structure" | "tech" | "useable" | "ship";
}

export class Unit extends Card {
  hull: number;
  timer: number;
  orbital_size: 1 | 2 | 3;
  deck_group?: "megaship" | "aux" | "construct";
  death_effect_power = 1;
  boss_upgrade?: Dongle;
  jump_fx?: 1 | 2 | 3 | 4;
  gun_mounts?: number;
  death_fx_power?: 1 | 2 | 3 | 4 | 5;
  death_time_max?: number;
  constructor(
    name: string,
    sprites: Sprite[],
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
  getType() {
    return this.damage != -1 ? "ship" : "structure";
  }
}

export class Ability extends Card {
  delayed_effect_time?: number;
  target_update_delay?: number;
  attach_mount_type?: number;
  attach_animation?: string;
  type?: number;
  target?: number;
  comms_player?: string[][];
  comms_ally?: string[][];
  getType() {
    return this.damage != -1 ? "useable" : "tech";
  }
}
