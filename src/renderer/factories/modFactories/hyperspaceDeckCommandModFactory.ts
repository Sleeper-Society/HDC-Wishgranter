import type { PathLike } from "node:fs";
import type { Mod } from "../../wishgranterTypes/mod.ts";
import { original_data } from "./wishgranterModFactory.ts";
import { applyLootListCardJson } from "../hdcTypeFactories/cardFactory.ts";
import { applyLootListUpJson as applyDongles } from "../hdcTypeFactories/dongleFactory.ts";
import { applyLootListUpJson as applyFleetUpgrades } from "../hdcTypeFactories/fleetUpgradeFactory.ts";
import { applyEncountersJson } from "../hdcTypeFactories/encounterFactory.ts";
import { addFaction, Faction } from "wishgranter";

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
    onLoad: onLoad(hyperspace_path),
  };
}

function onLoad(hyperspace_deck_command_locaiton: PathLike) {
  return () => {
    if (!original_data) throw new Error("No hyperspace data found!");
    getFactions();
    applyLootListCardJson(
      hyperspace_deck_command_locaiton,
      original_data.loot_list_card,
      original_data.cards,
      original_data.comms,
      original_data.project_data.resources.resources,
      original_data.upgrades,
    );
    applyDongles(original_data.loot_list_up, original_data.upgrades);
    applyFleetUpgrades(original_data.loot_list_up, original_data.upgrades);
    applyEncountersJson(
      hyperspace_deck_command_locaiton,
      original_data.encounters,
      original_data.comms,
      original_data.music,
      original_data.cards,
      original_data.project_data.resources.resources,
      original_data.upgrades,
    );
  };
}

function getFactions() {
  const faction_data_map = new Map<
    string,
    Partial<{
      button_appear_delay: number;
      color: `${number};${number};${number}`;
      full_name: string;
    }>
  >();
  original_data?.project_data.layouts[0].variables.forEach((variable) => {
    if (variable.type != "structure") return;
    switch (variable.name) {
      case "faction_frames":
        variable.children.forEach((sub_variable) => {
          if (sub_variable.type != "number") return;
          faction_data_map.getOrInsert(
            sub_variable.name,
            {},
          ).button_appear_delay = sub_variable.value;
        });
        break;
      case "faction_color":
        variable.children.forEach((sub_variable) => {
          if (sub_variable.type != "string") return;
          faction_data_map.getOrInsert(sub_variable.name, {}).color =
            sub_variable.value as `${number};${number};${number}`;
        });
    }
  });
  faction_data_map.keys().forEach((key) => {
    faction_data_map.getOrInsert(key, {}).full_name =
      original_data?.cloud_lables[`txt_${key}`].txt.substring(
        0,
        original_data.cloud_lables[`txt_${key}`].txt.length - 6,
      );
  });
  faction_data_map.keys().forEach((key) => {
    const faction_data = faction_data_map.getOrInsert(key, {});
    addFaction(
      new Faction(
        faction_data.full_name ?? "",
        (faction_data.color
          ?.split(";")
          .map((value) => Number.parseInt(value)) ?? [0, 0, 0]) as [
          number,
          number,
          number,
        ],
        [],
        "",
        "",
        key,
      ),
    );
  });
}
