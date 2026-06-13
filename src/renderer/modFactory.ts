import type { projectData } from "./gdjs.ts";
import type { ModEntry } from "./modEntry.ts";

export async function getFileFromMods<FileContents = object>(
  parser: (
    old_object: Partial<FileContents>,
    file_contents: Response,
    mod_directory_path: string,
    extention: string,
  ) => FileContents | Promise<FileContents>,
  ...files: string[]
): Promise<FileContents> {
  let result: Partial<FileContents> = {};
  for (const mod_entry of Array.from(
    document.getElementById("modlist")?.children ?? [],
  ) as ModEntry[]) {
    for (const file of files) {
      try {
        let response = await fetch(`${mod_entry.mod_directory_path}/${file}`, {
          method: "HEAD",
        });
        if (!response.ok) continue;
        response = await fetch(`${mod_entry.mod_directory_path}/${file}`);
        result = await parser(
          result,
          response,
          mod_entry.mod_directory_path,
          file.split(".")[file.split(".").length - 1],
        );
      } catch (err: unknown) {
        console.warn(`${mod_entry.mod_name} ${file} not loaded:`, err);
      }
    }
  }
  return result as FileContents;
}

export async function parseJson<JsonObject>(
  json: Partial<JsonObject>,
  json_response: Response,
): Promise<JsonObject> {
  return { ...json, ...(await json_response.json()) } as JsonObject;
}

export async function parseData(
  data: Partial<projectData>,
  response: Response,
  mod_directory_path: string,
  extention: string,
): Promise<projectData> {
  if (extention == "js") {
    //No one should ever make data.js in a normal mod, so it should be safe to give data back directly
    return eval(
      await response
        .text()
        .then(
          (data: string) =>
            data
              .replace(/gdjs.projectData\s*=\s*/, "(")
              .replace(/;\s*gdjs.runtimeGameOptions\s*=\s*\{\};/, "") + ")",
        )
        .then((data) =>
          data.replaceAll(
            /(?<="?file"?: ?")[\w.-]*(?=")/g,
            `${mod_directory_path}${window.remote_replace.path.sep()}$&`,
          ),
        ),
    ) as projectData;
  } else if (extention == "json") {
    return parseJson(data, response);
  }
  return data as projectData;
}
