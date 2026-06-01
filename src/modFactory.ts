import type { LoadSequenceFunction } from "wishgranter";
import type { RuntimeGame } from "./gdjs.ts";
import { lstat, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import * as ContentAddingFunctions from "wishgranter";
import { join } from "node:path";

export interface Mod {
  metadata: MetaData;
  onLoad?: () => ReturnType<LoadSequenceFunction>;
  onGameStart?: (runtime_game: RuntimeGame) => void;
}
type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;
type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${Capitalize<T>}${SnakeToCamelCase<U>}`
  : Capitalize<S>;
type JSONModFile = {
  [ContentKey in Extract<
    keyof typeof ContentAddingFunctions,
    `add${string}`
  > extends `add${infer ContentName}`
    ? CamelToSnakeCase<Uncapitalize<ContentName>>
    : never]: Parameters<
    (typeof ContentAddingFunctions)[`add${SnakeToCamelCase<ContentKey>}` extends keyof typeof ContentAddingFunctions
      ? `add${SnakeToCamelCase<ContentKey>}`
      : never]
  >;
};
export interface MetaData {
  name: string;
  version: string;
  descr?: string;
  description?: string;
  icon?: string;
  dependencies?: [string, string][];
  seealso?: [string, string][];
}
interface JSONMod extends JSONModFile {
  metadata: MetaData;
}

export async function pathToMod(mod_path: string): Promise<Mod> {
  if (!existsSync(mod_path)) {
    throw new Error("File " + mod_path + " not found");
  }
  const mod_path_data = await lstat(mod_path);
  if (!mod_path_data.isDirectory()) {
    const suffix = mod_path.substring(mod_path.lastIndexOf(".") + 1).trim();
    if (suffix == "json") {
      const mod_data = JSON.parse(await readFile(mod_path, "utf8")) as JSONMod;
      return {
        metadata: mod_data.metadata,
        onLoad: jsonToOnLoadFunction(mod_data),
      } as Mod;
    } else if (suffix == "js") {
      return (await import(mod_path)) as Mod;
    } else {
      throw new Error("Invalid mod path " + mod_path);
    }
  }
  const output = {
    metadata: existsSync(join(mod_path, "index.json"))
      ? (
          JSON.parse(
            await readFile(join(mod_path, "index.json"), "utf8"),
          ) as JSONMod
        ).metadata
      : existsSync(join(mod_path, "index.js"))
        ? ((await import(join(mod_path, "index.js"))) as Mod).metadata
        : undefined,
    onLoad: async () => {
      const loading_functions: Mod["onLoad"][] = [];
      if (existsSync(join(mod_path, "index.json"))) {
        loading_functions.push(
          jsonToOnLoadFunction(
            JSON.parse(
              await readFile(join(mod_path, "index.json"), "utf8"),
            ) as JSONMod,
          ),
        );
      }
      if (existsSync(join(mod_path, "index.js"))) {
        loading_functions.push(
          ((await import(join(mod_path, "index.js"))) as Mod).onLoad,
        );
      }
      return loading_functions;
    },
    onGameStart: existsSync(join(mod_path, "index.js"))
      ? ((await import(join(mod_path, "index.js"))) as Mod).onGameStart
      : undefined,
  };
  if (!output.metadata) {
    throw new Error(`Metadata not found in mod directory ${mod_path}`);
  }
  return output as Mod;
}

function jsonToOnLoadFunction(json: JSONModFile): Mod["onLoad"] {
  return () => {
    for (const content_adding_memeber in json) {
      const content_adding_function_name = `add${content_adding_memeber.substring(0, 1).toUpperCase()}${content_adding_memeber.substring(1).replace(/_(\w)?/, (_substring: string, ...groups: string[]) => (groups[0] ?? "").toUpperCase())}`;
      const content_adding_function = ContentAddingFunctions[
        content_adding_function_name as keyof typeof ContentAddingFunctions &
          `add${string}`
      ] as
        | (typeof ContentAddingFunctions)[keyof typeof ContentAddingFunctions &
            `add${string}`]
        | undefined;
      if (content_adding_function) {
        const paramaters: Parameters<typeof content_adding_function> =
          json[content_adding_memeber as keyof JSONModFile];
        content_adding_function(...paramaters);
      }
    }
  };
}
