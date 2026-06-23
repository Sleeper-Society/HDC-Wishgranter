import { fixDataPaths, get_file, mergeDeep } from "./fileFactory.ts";
import type { projectData } from "./gdjs.ts";
import type { LoadSequenceElement } from "./mod_menu/loadingBar.ts";

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
    protected cached_jsons = new Map<`${string}.json`, object>();
    getJson(json_name: `${string}.json`): object {
        return this.cached_jsons.getOrInsertComputed(json_name, (json_name) => {
            const file = this.file_map.get(json_name);
            if (file == undefined) return {};
            return JSON.parse(file) as object;
        });
    }
    protected cached_data: Partial<projectData> | undefined = undefined;
    getData(): Partial<projectData> {
        if (this.cached_data) return this.cached_data;
        let data = {} as Partial<projectData>;
        const file = this.file_map.get("data.json");
        if (file)
            data = mergeDeep(data, JSON.parse(file) as Partial<projectData>);

        return (this.cached_data = fixDataPaths(data, this.mod_directory_path));
    }
    protected cached_metadata: ModMetadata | undefined = undefined;
    getMetadata(): ModMetadata {
        if (this.cached_metadata) return this.cached_metadata;
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
        return (this.cached_metadata = metadata);
    }
    protected cached_code_0_adjustment:
        | ((code0: string) => string)
        | undefined = undefined;
    getCode0Adjustments(): (code0: string) => string {
        if (this.cached_code_0_adjustment) return this.cached_code_0_adjustment;
        const file = this.file_map.get("code0adjustments.js");
        if (file == undefined) return (out) => out;
        try {
            const adjustment = eval(file) as unknown;
            if (
                typeof adjustment != "function" ||
                adjustment.length != 1 ||
                typeof (adjustment as (a: unknown) => unknown)("a") != "string"
            )
                return (out) => out;
            return (this.cached_code_0_adjustment = adjustment as (
                code0: string,
            ) => string);
        } catch {
            return (out) => out;
        }
    }
    hasModPath(mod_path: string) {
        return mod_path == this.mod_directory_path;
    }
}
