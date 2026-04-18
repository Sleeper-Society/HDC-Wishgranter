import type { Dongle } from "./dongle.ts";
import type { Sprite } from "./sprite.ts";
import type { Animation } from "./gdjs.ts";
import type { Faction } from "./faction.ts";
import type { BaseGameCardEffect } from "../factories/jsonResultFactory.ts"; //TODO Custom card effects

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
}
