import type { Dongle } from "./dongle.ts";
import type { Sprite } from "./sprite.ts";
import type { Animation } from "./gdjs.ts";

export class Card {
  name: string;
  sprites: Sprite[];
  sprite_angle = 0;
  sprite_scale = 1;
  effects: unknown[];
  is_unit: boolean;
  deck_group?: "megaship" | "aux" | "construct";
  faction?: string;
  types: string[] = [];
  damage?: number;
  hull?: number;
  orbital_size?: 1 | 2 | 3;
  timer?: number;
  death_effect_power = 1;
  boss_upgrade?: Dongle;
  comms?: string[][];
  datacloud?: unknown;
  datacloud_unlock_condition?: unknown;
  constructor(
    name: string,
    is_unit: boolean,
    sprites: Sprite[],
    effects: unknown[],
    additional: Partial<Card>,
  ) {
    this.name = name;
    this.is_unit = is_unit;
    this.sprites = sprites;
    this.effects = effects;
    Object.assign(this, additional);
  }
  getId(): string {
    return this.name;
  }
  getAnimation(): Animation {
    return {
      name: this.getId(),
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
            .map((index) => this.sprites[index].getAnimationFrame(this, index)),
        },
      ],
    };
  }
}
