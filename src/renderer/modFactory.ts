import type { projectData } from "./gdjs.ts";
import type { ModEntry } from "./modEntry.ts";

export async function getJson(json_name: string) {
  let result = {};
  for (const mod_entry of Array.from(
    document.getElementById("modlist")?.children ?? [],
  ) as ModEntry[]) {
    try {
      result = {
        ...result,
        ...(await getJsonFromMod(json_name, mod_entry.mod_directory_path)),
      };
    } catch (err: unknown) {
      console.warn(`${mod_entry.mod_name} ${json_name}.json not loaded:`, err);
    }
  }
  return result;
}
async function getJsonFromMod(
  json_name: string,
  mod_path: string,
): Promise<object> {
  const json_response = await fetch(`${mod_path}/${json_name}.json`);
  if (!json_response.ok) return {};
  return json_response.json() as object;
}
export async function getData(): Promise<projectData> {
  let result = {};
  for (const mod_entry of Array.from(
    document.getElementById("modlist")?.children ?? [],
  ) as ModEntry[]) {
    try {
      result = {
        ...result,
        ...(await getDataFromMod(mod_entry.mod_directory_path)),
      };
    } catch (err: unknown) {
      console.warn(`${mod_entry.mod_name} data not loaded:`, err);
    }
  }
  return result as projectData;
}
async function getDataFromMod(mod_path: string): Promise<Partial<projectData>> {
  const js_response = await fetch(`${mod_path}/data.js`);
  if (js_response.ok)
    return eval(
      await js_response
        .text()
        .then(
          (data: string) =>
            data
              .replace(/gdjs.projectData\s*=\s*/, "(")
              .replace(/;\s*gdjs.runtimeGameOptions\s*=\s*\{\};/, "") + ")",
        )
        .then((data) =>
          data.replaceAll(/(?<=file: ?")[\w.-]*(?=")/g, `${mod_path}$&`),
        ),
    ) as projectData;

  const json_response = await fetch(`${mod_path}/data.json`);
  if (!json_response.ok) return {};
  return json_response.json() as Partial<projectData>;
}
