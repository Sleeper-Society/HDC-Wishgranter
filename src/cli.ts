#!/usr/bin/env node

import { findSteamApp } from "steam-locate";
import {
  getFromPath as getHyperspaceDeckCommandGUIFromPath,
  type HyperspaceDeckCommandGUI as HyperspaceDeckCommand,
} from "./hyperspaceDeckCommandGUI.ts";
import { readdirSync } from "node:fs";
import path from "path";
import { pathToMod } from "./modFactory.ts";

const hyperspace_id = "2711190";

main().catch((err: unknown) => {
  console.error(err);
  displayHelp();
});

async function main() {
  if (["-h", "--help"].includes(process.argv[2])) {
    displayHelp();
    return;
  }
  const hyperspace_path = process.argv.includes("-p")
    ? process.argv[process.argv.indexOf("-p") + 1]
    : (await findSteamApp(hyperspace_id)).installDir;
  if (!hyperspace_path) {
    displayHelp();
    return;
  }
  doArguments(await getHyperspaceDeckCommandGUIFromPath(hyperspace_path));
}

function displayHelp() {
  console.log(
    "Hyperspace Deck Command: Wishgranter\n",
    "Usage:\n",
    "\t-h --help: Display this message\n",
    "\t-p [PATH]: Sets path to Hyperspace Deck Command\n",
    "\t-m --add-mod [PATH]: Loads mod at path\n",
    "\t-M --add-mods [PATH]: Loads mods in a directory\n",
    "\t-n --no-base-mod: Sets the base game mod as disabled\n",
  );
}

function doArguments(hyperspace: HyperspaceDeckCommand) {
  const flag_iterator = process.argv[Symbol.iterator]().drop(2);
  for (
    let flag = flag_iterator.next();
    !flag.done;
    flag = flag_iterator.next()
  ) {
    switch (flag.value) {
      case "-m":
      case "--add-mod":
        flag = flag_iterator.next();
        if (!flag.value) {
          throw new Error("Incorrect Arguments!");
        }
        hyperspace.addMod(pathToMod(flag.value));
        break;
      case "-M":
      case "--add-mods":
        flag = flag_iterator.next();
        if (!flag.value) {
          throw new Error("Incorrect Arguments!");
        }
        for (const mod_file of readdirSync(flag.value, "utf8")) {
          hyperspace.addMod(pathToMod(path.join(flag.value, mod_file)));
        }
        break;
      case "-n":
      case "--no-base-mod":
        hyperspace.mods[0].setDisabled(true);
    }
  }
  if (
    (process.argv.includes("-p") && process.argv.length == 4) ||
    process.argv.length == 2
  ) {
    hyperspace.loadModMenu();
  } else {
    hyperspace.load();
  }
}
