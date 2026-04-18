import type { BaseGameCard } from "../HDCTypes/card.ts";
import { getFactions } from "./contentFactory.ts";

export function getCardsJSON() {
  return Object.fromEntries(
    getFactions()
      .map((faction) =>
        faction
          .getCards()
          .map(
            (card) =>
              [card.getId(faction), card.asBaseGameCard(faction)] as [
                string,
                BaseGameCard,
              ],
          ),
      )
      .flat(),
  );
}
