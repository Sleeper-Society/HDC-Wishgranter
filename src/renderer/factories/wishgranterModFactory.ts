import type { Mod } from "../HDCTypes/mod.ts";
import type { RuntimeGame } from "../HDCTypes/gdjs.ts";
import type { PathLike } from "fs";
import { hasOnlyDefaultMods, getModCount } from "../startGame/loadMods.ts";
import * as JsonFactory from "./jsonResultFactory.ts";
import { addCredit, getFactions } from "./contentFactory.ts";
import { Sprite } from "../HDCTypes/sprite.ts";

type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;
type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${Capitalize<T>}${SnakeToCamelCase<U>}`
  : Capitalize<S>;
type JsonListElementRecord = {
  [P in keyof typeof JsonFactory extends `get${infer K}JSON`
    ? CamelToSnakeCase<Uncapitalize<K>>
    : never]: `get${Capitalize<SnakeToCamelCase<P>>}JSON` extends keyof typeof JsonFactory
    ? ReturnType<
        (typeof JsonFactory)[`get${Capitalize<SnakeToCamelCase<P>>}JSON`]
      >
    : never;
};

/**Base game data for later reformating by hyperspaceDeckCommandModFactory*/
export let original_data:
  | ({ project_data: typeof gdjs.projectData } & JsonListElementRecord)
  | undefined;

/**@returns Mod that creates content helper functions. Should not be disableable. */
export async function getWishgranterMod(
  hyperspace_location: PathLike,
): Promise<Mod> {
  original_data = {
    project_data: structuredClone(gdjs.projectData),
    ...(Object.fromEntries(
      await Promise.all(
        Object.getOwnPropertyNames(JsonFactory).map(async (name) => {
          const json = name
            .substring("get".length, name.length - "JSON".length)
            .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
          return [
            json,
            JSON.parse(
              await window.wishgranter.readHyperspaceFile(
                hyperspace_location,
                json + ".json",
              ),
            ),
          ] as [
            keyof JsonListElementRecord,
            JsonListElementRecord[keyof JsonListElementRecord],
          ];
        }),
      ),
    ) as JsonListElementRecord),
  };
  return {
    metadata: {
      name: "Wishgranter",
      version: "0.0.2",
      descr: "Wishgranter utilities",
    },
    onLoad: onLoad,
  };
}

function onLoad() {
  return [
    {
      status_text: "Replace Version Text",
      function: replaceVersionText,
    },
    {
      status_text: "Replace Jsons",
      function: replaceJsons,
    },
    {
      status_text: "Replace Resources",
      function: replaceResources,
    },
    {
      status_text: "Replace Animations",
      function: replaceAnimations,
    },
  ];
}

function replaceVersionText() {
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
}
function replaceJsons() {
  gdjs.evtsExt__JSONResourceLoader__LoadJSONToScene.func = (
    runtime,
    resource_name,
    variable,
    other,
  ) => {
    let json_name =
      resource_name.split("/")[resource_name.split("/").length - 1];
    json_name = json_name.substring(0, json_name.length - ".json".length);
    const json_func_name = ("get" +
      json_name
        .split("_")
        .reduce(
          (prev, current) =>
            prev + current[0].toUpperCase() + current.substring(1),
          "",
        ) +
      "JSON") as keyof typeof JsonFactory;
    if (Object.hasOwn(JsonFactory, json_func_name))
      variable.fromJSObject(JsonFactory[json_func_name]());
    else
      gdjs.evtsExt__JSONResourceLoader__LoadJSONToScene.func(
        runtime,
        resource_name,
        variable,
        other,
      );
  };
  const original_credits = Object.keys(original_data?.credits ?? {}).map(
    (key) => original_data?.credits[key as unknown as number],
  );
  for (let index = 2; index < original_credits.length; index += 2) {
    for (const credit of original_credits[index]?.txt ?? []) {
      addCredit(original_credits[index - 1]?.txt[0] ?? "*error*", credit);
    }
  }
}
function replaceResources(hyperspace_path: PathLike) {
  gdjs.projectData.resources = {
    get resources() {
      return Array.from(getFactions())
        .map((faction) =>
          Array.from(faction.getCards())
            .map((card) =>
              card.sprites.map((sprite, index) =>
                sprite.getResource(faction, card, index),
              ),
            )
            .flat(),
        )
        .flat()
        .concat(
          original_data?.project_data.resources.resources
            .filter((resource) =>
              Object.keys(original_data?.cards ?? {}).includes(
                resource.file.substring(
                  0,
                  resource.file.length - "_0_0.png".length,
                ),
              ),
            )
            .map((resource) => {
              return {
                ...resource,
                file:
                  hyperspace_path.toString() +
                  window.remote_replace.path.sep() +
                  "resources" +
                  window.remote_replace.path.sep() +
                  "app.asar" +
                  window.remote_replace.path.sep() +
                  "app" +
                  window.remote_replace.path.sep() +
                  resource.file,
              };
            }) ?? [],
        );
    },
  };
  gdjs.projectData.layouts[0] = {
    ...gdjs.projectData.layouts[0],
    get usedResources() {
      return Array.from(getFactions())
        .map((faction) =>
          Array.from(faction.getCards())
            .map((card) =>
              card.sprites.map((_sprite, index) => {
                return { name: Sprite.getId(faction, card, index) };
              }),
            )
            .flat(),
        )
        .flat()
        .concat(
          original_data?.project_data.layouts[0].usedResources.filter(
            (resource) =>
              Object.keys(original_data?.cards ?? {}).includes(
                resource.name.substring(
                  "pixels/units/".length,
                  resource.name.length - "_0_0.png".length,
                ),
              ),
          ) ?? [],
        );
    },
  };
}
function replaceAnimations() {
  const base_unit_object: (typeof gdjs)["projectData"]["layouts"][0]["objects"][0] =
    gdjs.projectData.layouts[0].objects.find((value) =>
      value.name.startsWith("obj_unit_"),
    ) ?? { name: "error", animations: [] };
  gdjs.projectData.layouts[0] = {
    ...gdjs.projectData.layouts[0],
    get objects() {
      return Array.from(getFactions())
        .map((faction) => faction.getUnitObject(base_unit_object))
        .concat(
          gdjs.projectData.layouts[0].objects.filter(
            (value) => !value.name.startsWith("obj_unit_"),
          ),
        );
    },
  };
}
