#!/usr/bin/env node

import { findSteamApp, type SteamApp } from "steam-locate";
import {
  getFromPath as getHyperspaceDeckCommandFromPath,
  type HyperspaceDeckCommand,
} from "./hyperspaceDeckCommand.ts";
import { getFromPath as getHyperspaceDeckCommandGUIFromPath } from "./renderer/hyperspaceDeckCommandGUI.ts";

const hyperspace_id = "2711190";

findSteamApp(hyperspace_id)
  .then((steam_app: SteamApp) => steam_app.installDir)
  .catch(() => process.argv[process.argv.indexOf("-p") + 1])
  .then((path?: string) => {
    if (path) {
      return path;
    }
    throw new Error(
      "Hyperspace Deck Command not found. Please provide a path to your installation with the -p flag.",
    );
  })
  .then((hyperspace_path) =>
    process.argv.find((a: string) => a == "--GUI")
      ? getHyperspaceDeckCommandGUIFromPath(hyperspace_path)
      : getHyperspaceDeckCommandFromPath(hyperspace_path),
  )
  .then(doArguments)
  .catch((err: unknown) => {
    console.error(err);
  });

function doArguments(hyperspace: HyperspaceDeckCommand) {}
