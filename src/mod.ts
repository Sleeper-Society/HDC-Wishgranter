import type { projectData } from "./gdjs.ts";
import type { LoadSequenceElement } from "./mod_menu/loadingBar.ts";
import type { ModEntry } from "./mod_menu/modEntry.ts";
import { commentCode0 } from "./reimplementations/code0Commenter.ts";

const cachedJsons = new Map<`${string}.json`, object>();
export function getJsonFromMods(json_name: `${string}.json`): object {
    return cachedJsons.getOrInsertComputed(json_name, (json_name) =>
        (
            Array.from(
                document.getElementById("modlist")?.children ?? [],
            ) as ModEntry[]
        )
            .filter((mod_entry) => mod_entry.enabled)
            .map((mod_entry) => mod_entry.getJson(json_name))
            .reduce((file_contents: object, new_file_contents: object) =>
                mergeDeep(file_contents, new_file_contents),
            ),
    );
}
let cachedData: projectData | undefined = undefined;
export function getDataFromMods(): projectData {
    return (cachedData ??= (
        Array.from(
            document.getElementById("modlist")?.children ?? [],
        ) as ModEntry[]
    )
        .filter((mod_entry) => mod_entry.enabled)
        .map((mod_entry) => mod_entry.getData())
        .reduce(
            (
                file_contents: Partial<projectData>,
                new_file_contents: Partial<projectData>,
            ) => mergeDeep(file_contents, new_file_contents),
        ) as projectData);
}
let cachedCode0: string | undefined = undefined;
export function getCode0FromMods(): string {
    return (cachedCode0 ??= (
        Array.from(
            document.getElementById("modlist")?.children ?? [],
        ) as ModEntry[]
    )
        .filter((mod_entry) => mod_entry.enabled)
        .map((mod_entry) => mod_entry.getCode0Adjustments())
        .reduce(
            (code0: string, adjustments: (code0: string) => string) =>
                adjustments(code0),
            "",
        ));
}

function mergeDeep<MergeTarget = object>(
    target: MergeTarget,
    addition?: Partial<MergeTarget>,
): MergeTarget {
    if (addition == undefined) return target;
    if (Array.isArray(target))
        return target
            .map((target_element: { name?: string }) => {
                if (target_element.name == undefined) return target_element;
                return mergeDeep(
                    target_element,
                    (
                        addition as Partial<MergeTarget> & { name?: string }[]
                    ).find((additional_element) => {
                        if (additional_element.name == undefined) return false;
                        return additional_element.name == target_element.name;
                    }),
                );
            })
            .concat(
                (addition as Partial<MergeTarget> & { name?: string }[]).filter(
                    (additional_element) => {
                        if (additional_element.name == undefined) return true;
                        return (
                            target.find((target_element: { name?: string }) => {
                                if (target_element.name == undefined)
                                    return false;
                                return (
                                    target_element.name ==
                                    additional_element.name
                                );
                            }) == undefined
                        );
                    },
                ),
            ) as MergeTarget;
    if (["number", "string", "boolean"].includes(typeof target))
        return addition as MergeTarget;
    const out: Partial<MergeTarget> = {};
    for (const property in target) {
        if (!(property in (addition as object)))
            out[property] = target[property];
        else out[property] = mergeDeep(target[property], addition[property]);
    }

    for (const property in addition) {
        if (property in (target as object)) continue;
        out[property] = addition[property];
    }

    return out as MergeTarget;
}

function get_file(mod_path: string, file_name: string) {
    return window.remote_replace.fsPromise.readFile(
        window.remote_replace.path.join(mod_path, file_name),
    );
}
function fixDataPaths(
    data: Partial<projectData>,
    mod_path: string,
): Partial<projectData> {
    if (data.resources)
        data.resources.resources = data.resources.resources.map((resource) => {
            resource.file = window.remote_replace.path.join(
                mod_path,
                resource.file,
            );
            return resource;
        });
    return data;
}

export interface ModMetadata {
    name: string;
    description?: string;
    icon_path?: string;
    version?: string;
}

export class Mod {
    enabled = true;
    has_loaded = false;
    private _mod_directory_path = "";
    protected get mod_directory_path() {
        return this._mod_directory_path;
    }
    protected set mod_directory_path(new_path: string) {
        this._mod_directory_path = new_path;
    }
    protected file_map = new Map<string, string>();
    constructor(enabled: boolean, mod_directory_path: string) {
        this.enabled = enabled;
        this.mod_directory_path = mod_directory_path;
    }
    async load(
        ...files_to_load: string[]
    ): Promise<Iterable<LoadSequenceElement>> {
        if (files_to_load.length <= 0) {
            files_to_load = (
                await window.wishgranter.getAllFilesToLoadFromMod(
                    this.mod_directory_path,
                )
            ).filter((file_to_load) => !this.file_map.has(file_to_load));
        }
        return files_to_load.map((file_to_load) => {
            return {
                status_text: `Loading ${file_to_load}`,
                function: async () => {
                    this.file_map.set(
                        file_to_load,
                        await get_file(this.mod_directory_path, file_to_load),
                    );
                },
            };
        });
    }
    getJson(json_name: `${string}.json`): object {
        const file = this.file_map.get(json_name);
        if (file == undefined) return {};
        return JSON.parse(file) as object;
    }
    getData(): Partial<projectData> {
        let data = {} as Partial<projectData>;
        const file = this.file_map.get("data.json");
        if (file)
            data = mergeDeep(data, JSON.parse(file) as Partial<projectData>);

        return fixDataPaths(data, this.mod_directory_path);
    }
    getMetadata(): ModMetadata {
        const file = this.file_map.get("metadata.json");
        if (file == undefined)
            return {
                name: this.mod_directory_path.split(
                    window.remote_replace.path.sep(),
                )[
                    this.mod_directory_path.split(
                        window.remote_replace.path.sep(),
                    ).length - 1
                ],
                icon_path: window.remote_replace.path.join(
                    this.mod_directory_path,
                    "icon.png",
                ),
            };
        const metadata = JSON.parse(file) as ModMetadata;
        metadata.icon_path = window.remote_replace.path.join(
            this.mod_directory_path,
            metadata.icon_path ?? "icon.png",
        );
        return metadata;
    }
    getCode0Adjustments(): (code0: string) => string {
        const file = this.file_map.get("code0adjustments.js");
        if (file == undefined) return (out) => out;
        const adjustment = eval(file) as unknown;
        try {
            if (
                typeof adjustment != "function" ||
                adjustment.length != 1 ||
                typeof (adjustment as (a: unknown) => unknown)("a") != "string"
            )
                return (out) => out;
            return adjustment as (code0: string) => string;
        } catch {
            return (out) => out;
        }
    }
    hasModPath(mod_path: string) {
        return mod_path == this.mod_directory_path;
    }
}
export class BaseGameMod extends Mod {
    protected get mod_directory_path(): string {
        return window.remote_replace.path.join(
            document
                .getElementById("hyperspace-file-location-input")
                ?.getAttribute("value") ?? "",
            "resources",
            "app.asar",
            "app",
        );
    }
    protected set mod_directory_path(_who_cares: string) {
        return;
    }
    constructor(enabled: boolean, mod_directory_path = "") {
        super(enabled, mod_directory_path);
    }
    async load(
        ...files_to_load: string[]
    ): Promise<Iterable<LoadSequenceElement>> {
        if (files_to_load.length <= 0) {
            files_to_load = await window.wishgranter.getAllFilesToLoadFromMod(
                this.mod_directory_path,
            );
            files_to_load = files_to_load.filter(
                (file_to_load) =>
                    !this.file_map.has(file_to_load) &&
                    (file_to_load.endsWith(".json") ||
                        ["data.js", "code0.js"].includes(file_to_load)),
            );
        }
        return files_to_load.map((file_to_load) => {
            return {
                status_text: `Loading ${file_to_load}`,
                function: async () => {
                    this.file_map.set(
                        file_to_load,
                        await get_file(this.mod_directory_path, file_to_load),
                    );
                },
            };
        });
    }
    getData(): projectData {
        const file = this.file_map.get("data.js");
        if (!file) throw new Error("Base game data not found.");
        return fixDataPaths(
            eval(
                file
                    .replace(/gdjs.projectData\s*=\s*/, "(")
                    .replace(/;\s*gdjs.runtimeGameOptions\s*=\s*\{\};/, "") +
                    ")",
            ) as projectData,
            this.mod_directory_path,
        ) as projectData;
    }
    getCode0Adjustments(): (code0: string) => string {
        return () => this.file_map.get("code0.js") ?? "";
    }
    getMetadata(): ModMetadata {
        const data = this.getData();
        return {
            name: data.properties.name,
            description: data.properties.description,
            version: data.properties.version,
            icon_path: data.resources.resources.find(
                (resource) =>
                    resource.name ==
                    data.properties.platformSpecificAssets["desktop-icon-512"],
            )?.file,
        };
    }
}
export class WishgranterMod extends Mod {
    constructor(enabled = true, mod_directory_path = ".") {
        super(enabled, mod_directory_path);
    }
    load(): Promise<Iterable<LoadSequenceElement>> {
        return new Promise((resolve) => {
            resolve([]);
        });
    }
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    getJson(_json_name: string): object {
        return {};
    }
    getData(): Partial<projectData> {
        return {};
    }
    getCode0Adjustments(): (code0: string) => string {
        return (code0) => {
            if (window.remote_replace.app.isPackaged())
                code0 = commentCode0(code0, getDataFromMods());
            code0 = code0.replace(
                /(?<=gdjs\s*\.evtsExt__GetPropertiesData__ReturnGameVersion\.func\(\s*runtimeScene,\s*null,?\s*\)\s*\+\s*")[\w()\s-]*(?="?)/g,
                ` (${(document.getElementById("modlist")?.children.length ?? 2) > 2 ? `${((document.getElementById("modlist")?.children.length ?? 2) - 2).toString()} Mods Loaded` : "Modded"} - Wishgranter)`,
            );
            return code0;
        };
    }
    getMetadata(): ModMetadata {
        return {
            name: "Wishgranter Utilities",
            version: "0.0.3",
            description: "Modloader for Sleeper Game's Hyperspace Deck Command",
            icon_path: "favicon.svg",
        };
    }
}
