import { fixDataPaths, get_file_getter, mergeDeep } from "../fileFactory.ts";
import type { Jsons } from "../jsons.d.ts";

import type {
    Cards,
    CloudLabels,
    Comms,
    Credits,
    Encounters,
    LootListCard,
    LootListUp,
    SpUp,
    TextLists,
    Tooltips,
    Tutorials,
    UnlockCond,
    Upgrades,
} from "../hyperspace.jsons.d.ts";
import type { Data, CardAnimations } from "../wishgranter.jsons.d.ts";
import type { LoadSequenceElement } from "../mod_menu/loadingBar.ts";

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
    protected file_getter: (file_path: string) => Promise<string>;
    protected file_map = new Map<string, string>();
    constructor(
        enabled: boolean,
        mod_directory_path: string,
        file_getter?: (file_path: string) => Promise<string>,
    ) {
        this.enabled = enabled;
        this.file_getter = file_getter ?? get_file_getter(mod_directory_path);
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
                        await this.file_getter(file_to_load),
                    );
                },
            };
        });
    }
    protected cached_jsons = new Map<`${string}.json`, Jsons>();
    getJson(json_name: `card_animations.json`): Partial<CardAnimations>;
    getJson(json_name: `cards.json`): Partial<Cards>;
    getJson(json_name: `comms.json`): Partial<Comms>;
    getJson(json_name: `encounters.json`): Partial<Encounters>;
    getJson(json_name: `loot_list_up.json`): Partial<LootListUp>;
    getJson(json_name: `text_lists.json`): Partial<TextLists>;
    getJson(json_name: `tutorials.json`): Partial<Tutorials>;
    getJson(json_name: `upgrades.json`): Partial<Upgrades>;
    getJson(json_name: `cloud_labels.json`): Partial<CloudLabels>;
    getJson(json_name: `credits.json`): Partial<Credits>;
    getJson(json_name: `loot_list_card.json`): Partial<LootListCard>;
    getJson(json_name: `sp_up.json`): Partial<SpUp>;
    getJson(json_name: `tooltips.json`): Partial<Tooltips>;
    getJson(json_name: `unlock_cond.json`): Partial<UnlockCond>;
    getJson(json_name: `data.json`): Partial<Data>;
    getJson(json_name: `${string}.json`): Partial<Jsons>;
    getJson(json_name: `${string}.json`): Partial<Jsons> {
        return this.cached_jsons.getOrInsertComputed(json_name, (json_name) => {
            const file = this.file_map.get(json_name);
            if (!file) return {};
            return JSON.parse(file) as Jsons;
        });
    }
    protected cached_data: Partial<Data> | undefined = undefined;
    getData(): Partial<Data> {
        if (this.cached_data) return this.cached_data;
        let data = {};
        const file = this.file_map.get("data.json");
        if (file) data = mergeDeep(data, JSON.parse(file) as Partial<Data>);

        return (this.cached_data = fixDataPaths(data, this.mod_directory_path));
    }
    getCardAnimations(): Partial<Data> {
        return {};
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
        if (!file) return (out) => out;
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
