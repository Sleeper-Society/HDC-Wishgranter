import { fixDataPaths, get_file } from "./fileFactory.ts";
import type { projectData } from "./gdjs.ts";
import { Mod, type ModMetadata } from "./mod.ts";
import type { LoadSequenceElement } from "./mod_menu/loadingBar.ts";

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
        if (this.cached_data) return this.cached_data as projectData;
        const file = this.file_map.get("data.js");
        if (!file) throw new Error("Base game data not found.");
        return (this.cached_data = fixDataPaths(
            eval(
                file
                    .replace(/gdjs.projectData\s*=\s*/, "(")
                    .replace(/;\s*gdjs.runtimeGameOptions\s*=\s*\{\};/, "") +
                    ")",
            ) as projectData,
            this.mod_directory_path,
        ) as projectData);
    }
    getCode0Adjustments(): (code0: string) => string {
        return () => this.file_map.get("code0.js") ?? "";
    }
    getMetadata(): ModMetadata {
        if (this.cached_metadata) return this.cached_metadata;
        const data = this.getData();
        return (this.cached_metadata = {
            name: data.properties.name,
            description: data.properties.description,
            version: data.properties.version,
            icon_path: data.resources.resources.find(
                (resource) =>
                    resource.name ==
                    data.properties.platformSpecificAssets["desktop-icon-512"],
            )?.file,
        });
    }
}
