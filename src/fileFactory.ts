import type { Jsons } from "./jsons.d.ts";
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
} from "./hyperspace.jsons.d.ts";
import type { AnimationFrame } from "./wishgranter.jsons.d.ts";
import type { Data } from "./wishgranter.jsons.d.ts";
import type { CardAnimations } from "./wishgranter.jsons.d.ts";
import type { ModEntry } from "./mod_menu/modEntry.ts";

const cachedJsons = new Map<`${string}.json`, Jsons>();
export function getJsonFromMods(
    json_name: `card_animations.json`,
): CardAnimations;
export function getJsonFromMods(json_name: `cards.json`): Cards;
export function getJsonFromMods(json_name: `comms.json`): Comms;
export function getJsonFromMods(json_name: `encounters.json`): Encounters;
export function getJsonFromMods(json_name: `loot_list_up.json`): LootListUp;
export function getJsonFromMods(json_name: `text_lists.json`): TextLists;
export function getJsonFromMods(json_name: `tutorials.json`): Tutorials;
export function getJsonFromMods(json_name: `upgrades.json`): Upgrades;
export function getJsonFromMods(json_name: `cloud_labels.json`): CloudLabels;
export function getJsonFromMods(json_name: `credits.json`): Credits;
export function getJsonFromMods(json_name: `loot_list_card.json`): LootListCard;
export function getJsonFromMods(json_name: `sp_up.json`): SpUp;
export function getJsonFromMods(json_name: `tooltips.json`): Tooltips;
export function getJsonFromMods(json_name: `unlock_cond.json`): UnlockCond;
export function getJsonFromMods(json_name: `data.json`): Data;
export function getJsonFromMods(json_name: `${string}.json`): Jsons;
export function getJsonFromMods(json_name: `${string}.json`): Jsons {
    return cachedJsons.getOrInsertComputed(
        json_name,
        (json_name) =>
            (
                Array.from(
                    document.getElementById("modlist")?.children ?? [],
                ) as ModEntry[]
            )
                .filter((mod_entry) => mod_entry.enabled)
                .map((mod_entry) => mod_entry.getJson(json_name))
                .reduce((file_contents: object, new_file_contents: object) =>
                    mergeDeep(file_contents, new_file_contents),
                ) as Jsons,
    );
}
let cachedData: Data | undefined = undefined;
export function getDataFromMods(): Data {
    return (cachedData ??= mergeDeep(
        (
            Array.from(
                document.getElementById("modlist")?.children ?? [],
            ) as ModEntry[]
        )
            .filter((mod_entry) => mod_entry.enabled)
            .map((mod_entry) => mod_entry.getData())
            .reduce(
                (
                    file_contents: Partial<Data>,
                    new_file_contents: Partial<Data>,
                ) => mergeDeep(file_contents, new_file_contents),
            ),
        getDataFromCardAnimations(
            getCardAnimationsFromMods(),
            getJsonFromMods("cards.json"),
        ),
    ) as Data);
}
let cachedCardAnimations: CardAnimations | undefined = undefined;
function getCardAnimationsFromMods(): CardAnimations {
    return (cachedCardAnimations ??= (
        Array.from(
            document.getElementById("modlist")?.children ?? [],
        ) as ModEntry[]
    )
        .filter((mod_entry) => mod_entry.enabled)
        .map((mod_entry) => mod_entry.getCardAnimations())
        .reduce(
            (
                file_contents: Partial<CardAnimations>,
                new_file_contents: Partial<CardAnimations>,
            ) => mergeDeep(file_contents, new_file_contents),
        ) as CardAnimations);
}
export function getDataFromCardAnimations(
    animations: CardAnimations,
    cards: Record<
        keyof CardAnimations,
        { por_obj: `obj_${"unit" | "ab"}_${string}` }
    >,
): Partial<Data> {
    if (
        Object.getOwnPropertyNames(animations).length <= 0 ||
        Object.getOwnPropertyNames(cards).length <= 0
    )
        return {};
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
                        .map(getAnimationsOfPorObj(animations, cards)),
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
let cachedCode0: string | undefined = undefined;
function getAnimationsOfPorObj(
    animations: CardAnimations,
    cards: Record<
        keyof CardAnimations,
        { por_obj: `obj_${"unit" | "ab"}_${string}` }
    >,
): (
    value: string,
    index: number,
) => {
    name: string;
    variables: never[];
    animations: {
        name: string;
        useMultipleDirections: false;
        directions: {
            looping: true;
            timeBetweenFrames: number;
            sprites: AnimationFrame[];
        }[];
    }[];
} {
    return function (por_obj_name) {
        return {
            name: por_obj_name,
            variables: [],
            animations: [
                ...Object.getOwnPropertyNames(animations)
                    .filter((card_id) => cards[card_id].por_obj == por_obj_name)
                    .map(getCardsAnimation(animations)),
            ],
        };
    };
}

function getCardsAnimation(animations: CardAnimations): (
    value: string,
    index: number,
    array: string[],
) => {
    name: string;
    useMultipleDirections: false;
    directions: {
        looping: true;
        timeBetweenFrames: number;
        sprites: AnimationFrame[];
    }[];
} {
    return function (card_id) {
        return {
            name: card_id,
            useMultipleDirections: false,
            directions: [
                {
                    looping: true,
                    timeBetweenFrames: 0.068,
                    sprites: [
                        ...(
                            animations[card_id].sprites
                                .map(wrapSpriteFilePath)
                                .map((animation_frame) => {
                                    return {
                                        ...animation_frame,
                                        customCollisionMask:
                                            animations[card_id]
                                                .collison_polygon,
                                    };
                                })
                                .reduce(
                                    orderAnimationFrames(animations, card_id),
                                    animations[card_id].frame_order ?? [],
                                ) as {
                                image: string;
                                hasCustomCollisionMask: true;
                                customCollisionMask: {
                                    x: number;
                                    y: number;
                                }[][];
                            }[]
                        ).map(
                            populateAnimationFramePoints(animations, card_id),
                        ),
                    ],
                },
            ],
        };
    };
}

function wrapSpriteFilePath(sprite_file_path: string) {
    return {
        image: sprite_file_path,
        hasCustomCollisionMask: true as const,
    };
}

function orderAnimationFrames(animations: CardAnimations, card_id: string) {
    return function (
        out: (
            | number
            | {
                  image: string;
              }
        )[],
        sprite: {
            image: string;
        },
        index: number,
        array: (
            | number
            | {
                  image: string;
              }
        )[],
    ): (
        | number
        | {
              image: string;
          }
    )[] {
        if (animations[card_id].frame_order)
            return out.map((frame_index) =>
                frame_index == index ? sprite : frame_index,
            );
        return [...out, ...array.slice(index), ...array.slice(0, index)];
    };
}

function populateAnimationFramePoints(
    animations: CardAnimations,
    card_id: string,
): (
    value: {
        image: string;
        hasCustomCollisionMask: true;
        customCollisionMask: { x: number; y: number }[][];
    },
    index: number,
    array: {
        image: string;
        hasCustomCollisionMask: true;
        customCollisionMask: { x: number; y: number }[][];
    }[],
) => AnimationFrame {
    return (frame_data) => {
        return {
            ...frame_data,
            centerPoint: {
                ...animations[card_id].points.center,
                automatic: true,
                name: "centre",
            },
            originPoint: {
                ...animations[card_id].points.origin,
                name: "origine",
            },
            points: Object.getOwnPropertyNames(animations[card_id].points).map(
                (name) => {
                    return { ...animations[card_id].points[name], name: name };
                },
            ),
        };
    };
}

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
export function fixDataPaths(
    data: Partial<Data>,
    mod_path: string,
): Partial<Data> {
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
