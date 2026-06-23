import type { projectData } from "./gdjs.ts";
import type { ModEntry } from "./mod_menu/modEntry.ts";

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

export function mergeDeep<MergeTarget = object>(
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
export function get_file(mod_path: string, file_name: string) {
    return window.remote_replace.fsPromise.readFile(
        window.remote_replace.path.join(mod_path, file_name),
    );
}
export function fixDataPaths(
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
