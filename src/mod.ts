import { fixDataPaths, get_file_getter, mergeDeep } from "./fileFactory.ts";
import type { AnimationFrame, projectData } from "./gdjs.ts";
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
    protected cached_jsons = new Map<`${string}.json`, object>();
    getJson(json_name: `${string}.json`): object {
        return this.cached_jsons.getOrInsertComputed(json_name, (json_name) => {
            const file = this.file_map.get(json_name);
            if (!file) return {};
            return JSON.parse(file) as object;
        });
    }
    protected cached_data: Partial<projectData> | undefined = undefined;
    getData(): Partial<projectData> {
        if (this.cached_data) return this.cached_data;
        let data = this.getDataFromCardAnimations();
        const file = this.file_map.get("data.json");
        if (file)
            data = mergeDeep(data, JSON.parse(file) as Partial<projectData>);

        return (this.cached_data = fixDataPaths(data, this.mod_directory_path));
    }
    getDataFromCardAnimations(): Partial<projectData> {
        const file = this.file_map.get("card_animations.json");
        if (!file) return {};
        const animations = JSON.parse(file) as Record<
            string,
            {
                sprites: string[];
                points: Record<string, { x: number; y: number }> & {
                    origin: { x: number; y: number };
                    center: { x: number; y: number };
                };
                frame_order?: number[];
            }
        >;
        const cards = this.getJson("cards.json") as Record<
            string,
            { por_obj: `por_obj_${string}` }
        >;
        return {
            resources: {
                resources: [
                    ...Object.getOwnPropertyNames(animations)
                        .flatMap((card_id) => animations[card_id].sprites)
                        .map((sprite_file_path) => {
                            return {
                                file: sprite_file_path,
                                name: sprite_file_path,
                                kind: "image",
                                smoothed: false,
                                userAdded: true,
                            };
                        }),
                ],
            },
            layouts: [
                {
                    name: "Command",
                    objects: [
                        ...Object.getOwnPropertyNames(animations)
                            .reduce(
                                (obj_set, card_id) =>
                                    obj_set.add(cards[card_id].por_obj),
                                new Set<string>(),
                            )
                            .keys()
                            .map((por_obj_name) => {
                                return {
                                    name: por_obj_name,
                                    variables: [],
                                    animations: [
                                        ...Object.getOwnPropertyNames(
                                            animations,
                                        )
                                            .filter(
                                                (card_id) =>
                                                    cards[card_id].por_obj ==
                                                    por_obj_name,
                                            )
                                            .map((card_id) => {
                                                return {
                                                    name: card_id,
                                                    useMultipleDirections: false,
                                                    directions: [
                                                        {
                                                            looping: true,
                                                            timeBetweenFrames: 0.068,
                                                            sprites: [
                                                                ...(animations[
                                                                    card_id
                                                                ].sprites
                                                                    .map(
                                                                        (
                                                                            sprite_file_path,
                                                                        ): AnimationFrame => {
                                                                            return {
                                                                                image: sprite_file_path,
                                                                                hasCustomCollisionMask:
                                                                                    false as const,
                                                                                points: [],
                                                                                originPoint:
                                                                                    {
                                                                                        ...animations[
                                                                                            card_id
                                                                                        ]
                                                                                            .points
                                                                                            .origin,
                                                                                        name: "origine",
                                                                                    },
                                                                                centerPoint:
                                                                                    {
                                                                                        ...animations[
                                                                                            card_id
                                                                                        ]
                                                                                            .points
                                                                                            .center,
                                                                                        name: "centre",
                                                                                        automatic: true,
                                                                                    },
                                                                            };
                                                                        },
                                                                    )
                                                                    .reduce(
                                                                        (
                                                                            out: (
                                                                                | number
                                                                                | AnimationFrame
                                                                            )[],
                                                                            sprite: AnimationFrame,
                                                                            index: number,
                                                                            array: AnimationFrame[],
                                                                        ): (
                                                                            | number
                                                                            | AnimationFrame
                                                                        )[] => {
                                                                            if (
                                                                                animations[
                                                                                    card_id
                                                                                ]
                                                                                    .frame_order
                                                                            )
                                                                                return out.map(
                                                                                    (
                                                                                        frame_index,
                                                                                    ) =>
                                                                                        (
                                                                                            frame_index ==
                                                                                            index
                                                                                        ) ?
                                                                                            sprite
                                                                                        :   frame_index,
                                                                                );
                                                                            const new_out =
                                                                                [
                                                                                    ...out,
                                                                                    ...array.slice(
                                                                                        index,
                                                                                    ),
                                                                                    ...array.slice(
                                                                                        0,
                                                                                        index,
                                                                                    ),
                                                                                ];
                                                                            console.log(
                                                                                new_out,
                                                                            );
                                                                            return new_out;
                                                                        },
                                                                        animations[
                                                                            card_id
                                                                        ]
                                                                            .frame_order ??
                                                                            [],
                                                                    ) as AnimationFrame[]),
                                                            ],
                                                        },
                                                    ],
                                                };
                                            }),
                                    ],
                                };
                            }),
                    ],
                    variables: [],
                    usedResources: [
                        ...Object.getOwnPropertyNames(animations)
                            .flatMap((card_id) => animations[card_id].sprites)
                            .map((sprite_file_path) => {
                                return {
                                    name: sprite_file_path,
                                };
                            }),
                    ],
                },
            ],
            usedResources: [
                ...Object.getOwnPropertyNames(animations)
                    .flatMap((card_id) => animations[card_id].sprites)
                    .map((sprite_file_path) => {
                        return {
                            name: sprite_file_path,
                        };
                    }),
            ],
        };
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
