import type { Mod } from "../HDCTypes/mod.ts";
import type { RuntimeGame } from "../HDCTypes/gdjs.ts";
import type { PathLike } from "fs";
import { hasOnlyDefaultMods, getModCount } from "../startGame/loadMods.ts";
import * as JsonFactory from "./getJsons.ts";
import { getFactions } from "../factories/content_helpers.ts";

type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;
/** Name of every json there is a converter for*/
type JsonListElement = {
  [P in keyof typeof JsonFactory]: P extends `get${infer K}JSON`
    ? CamelToSnakeCase<Uncapitalize<K>>
    : never;
}[keyof typeof JsonFactory];

/**Base game data for later reformating by hyperspaceDeckCommandModFactory*/
export let original_data:
  | ({ project_data: typeof gdjs.projectData } & Record<
      JsonListElement,
      ReturnType<(typeof JsonFactory)[keyof typeof JsonFactory]>
    >)
  | undefined;

/**@returns Mod that creates content helper functions. Should not be disableable. */
export async function getWishgranterMod(
  hyperspace_location: PathLike,
): Promise<Mod> {
  original_data = {
    project_data: gdjs.projectData,
    ...(Object.fromEntries(
      await Promise.all(
        Object.getOwnPropertyNames(JsonFactory)
          .map(
            (name) =>
              name
                .substring("get".length, name.length - "JSON".length)
                .replace(
                  /[A-Z]/g,
                  (letter) => `_${letter.toLowerCase()}`,
                ) as JsonListElement,
          )
          .map(async (json) => [
            json,
            await window.wishgranter.readHyperspaceFile(
              hyperspace_location,
              json + ".json",
            ),
          ]),
      ).then((json_list) =>
        json_list.map((key_value_pair) => [
          key_value_pair[0],
          JSON.parse(key_value_pair[1]),
        ]),
      ),
    ) as Record<JsonListElement, object>),
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
      status_text: "Add Version Text",
      function: addVersionText,
    },
    {
      status_text: "Replace Content Injection Sites",
      function: replaceContentInjectionSites,
    },
  ];
}

function addVersionText() {
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

function replaceContentInjectionSites() {
  return [
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
}
function replaceResources() {
  gdjs.projectData.resources = {
    get resources() {
      return getFactions()
        .map((faction) =>
          faction
            .getCards()
            .map((card) =>
              card.sprites.map((sprite, index) =>
                sprite.getResource(card, index),
              ),
            )
            .flat(),
        )
        .flat()
        .concat(
          original_data?.project_data.resources.resources.filter((resource) =>
            Object.keys(original_data?.cards ?? {}).includes(
              resource.file.substring(
                0,
                resource.file.length - "_0_0.png".length,
              ),
            ),
          ) ?? [],
        );
    },
  };
}
function replaceAnimations() {
  gdjs.projectData.layouts[0].objects[0] = {
    ...gdjs.projectData.layouts[0].objects[0],
    get animations() {
      return getFactions()
        .map((faction) => faction.getCards().map((card) => card.getAnimation()))
        .flat();
    },
  };
}
