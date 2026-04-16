import type { Card } from "./card.ts";

export class Encounter {
  name: string;
  waves: Wave[] = [];
  constructor(name: string, ...waves: Wave[]) {
    this.name = name;
    this.waves = waves;
  }
}
export class Wave {
  varaiants: [orbit_3: Card[], orbit_2: Card[], orbit_1: Card[]][] = [];
  music?: string;
  screen_text: string;
  constructor(
    title: string,
    ...enemies: Card[] | [orbit_3: Card[], orbit_2: Card[], orbit_1: Card[]][]
  ) {
    this.screen_text = title;
    if (enemies.length <= 0) return;
    if (Array.isArray(enemies[0])) {
      this.varaiants = enemies as [
        orbit_3: Card[],
        orbit_2: Card[],
        orbit_1: Card[],
      ][];
      return;
    }
    this.varaiants = [[enemies as Card[], [], []]];
  }
}
