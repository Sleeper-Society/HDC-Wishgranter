import type { Mod } from "../mod.ts";
import type { gdjs, RuntimeGame } from "../gdjs.ts";
import { hasOnlyDefaultMods, getModCount } from "./loadMods.ts";

export function getWishgranterMod(): Mod {
  return {
    metadata: {
      name: "Wishgranter",
      version: "0.0.2",
    },
    onLoad: onLoad,
  };
}

function onLoad() {
  return [
    {
      status_text: "Add Version Text",
      function: addVersionText(),
    },
  ];
}

function addVersionText() {
  return () => {
    for (const code in gdjs.CommandCode) {
      if (typeof gdjs.CommandCode[code] != "function") continue;
      const match =
        /(?<=(?:gdjs\.copyArray\(gdjs\.CommandCode\.(\w+),\s*gdjs\.CommandCode\.)[\s\S]*?)(?<=gdjs\.CommandCode\.([\w]+?)\[\w+\]\.setString\([\s\S]*?)gdjs\s*\.evtsExt__GetPropertiesData__ReturnGameVersion\.func\(runtimeScene, null\)(?: \+\s*".*")?/.exec(
          gdjs.CommandCode[code].toString(),
        );
      if (match == null) continue;
      gdjs.CommandCode[code] = (runtime: RuntimeGame) => {
        gdjs.copyArray(
          gdjs.CommandCode[match[1]] as unknown[],
          gdjs.CommandCode[match[2]] as unknown[],
        );
        for (const obj of gdjs.CommandCode[match[1]] as {
          //GDtxt_9595uiObjects3
          setString: (str: string) => void;
        }[]) {
          obj.setString(
            gdjs.evtsExt__GetPropertiesData__ReturnGameVersion.func(
              runtime,
              null,
            ) +
              "(" +
              (hasOnlyDefaultMods()
                ? ""
                : getModCount().toString() + " Mods - ") +
              "Wishgranter)",
          );
        }
      };
      return;
    }
  };
}
