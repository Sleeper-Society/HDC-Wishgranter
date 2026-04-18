import type { Card } from "./card.ts";

export class Dongle {
  id: string;
  header: string;
  text: string;
  text_on_equip: string;
  apply?: (card: Card) => Card;
  constructor(
    id: string,
    header: string,
    text: string,
    text_on_equip: string,
    applicator?: (card: Card) => Card,
  ) {
    this.id = id;
    this.header = header;
    this.text = text;
    this.text_on_equip = text_on_equip;
    this.apply = applicator;
  }
}
