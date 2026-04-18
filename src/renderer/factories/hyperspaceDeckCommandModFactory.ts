import type { PathLike } from "node:fs";
import type { Mod } from "../HDCTypes/mod.ts";
import {
  Card,
  Unit,
  type BaseGameCard,
  type BaseGameCardEffect,
} from "../HDCTypes/card.ts";

export function getHyperspaceDeckCommandAsMod(hyperspace_path: PathLike): Mod {
  return {
    metadata: {
      name: gdjs.projectData.properties.name,
      version: gdjs.projectData.properties.version,
      description: gdjs.projectData.properties.description,
      icon:
        hyperspace_path.toString() +
        window.remote_replace.path.sep() +
        "resources" +
        window.remote_replace.path.sep() +
        "app.asar" +
        window.remote_replace.path.sep() +
        "app" +
        window.remote_replace.path.sep() +
        gdjs.projectData.properties.platformSpecificAssets[
          "desktop-icon-512"
        ].split("/")[
          gdjs.projectData.properties.platformSpecificAssets[
            "desktop-icon-512"
          ].split("/").length - 1
        ],
    },
    onLoad: () => {
      return;
    },
  };
}

function baseGameCardToCard(base_game_card: BaseGameCard): Card {
  const effects: BaseGameCardEffect[] = (
    Object.getOwnPropertyNames(base_game_card).filter((key) =>
      /^effect_\d+/.exec(key),
    ) as `effect_${number}`[]
  ).map((key: `effect_${number}`) => base_game_card[key]);
  return base_game_card.type == 2
    ? new Unit(
        base_game_card.name,
        [],
        base_game_card.dmg,
        base_game_card.hp ?? 0,
        base_game_card.timer ?? 10,
        base_game_card.size ?? 1,
        effects,
      )
    : new Card(base_game_card.name, [], base_game_card.dmg, effects);
}
