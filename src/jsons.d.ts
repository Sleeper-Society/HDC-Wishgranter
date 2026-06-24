export default Jsons;
export type Jsons = BaseGameJsons | WishgranterJsons;
export type BaseGameJsons =
    | Cards
    | Comms
    | Encounters
    | LootListUp
    | TextLists
    | Tutorials
    | Upgrades
    | CloudLabels
    | Credits
    | LootListCard
    | SpUp
    | Tooltips
    | UnlockCond;
export type WishgranterJsons = CardAnimations | Data;
export interface Data {
    properties: {
        name: string;
        version: string;
        description: string;
        platformSpecificAssets: Record<string, string>;
    };
    resources: {
        resources: Resource[];
    };
    usedResources: { name: string }[];
    layouts: {
        name: "Command";
        objects: {
            variables: UnloadedVariable[];
            name: string;
            animations: Animation[];
        }[];
        variables: UnloadedVariable[];
        usedResources: { name: string }[];
    }[];
}

export interface Resource {
    disablePreload?: boolean;
    file: string;
    kind: string;
    metadata?: string;
    name: string;
    smoothed: boolean;
    userAdded: boolean;
}

export type UnloadedVariable =
    | { folded?: true; name: string; type: "number"; value: number }
    | { folded?: true; name: string; type: "string"; value: string }
    | {
          folded?: true;
          name: string;
          type: "array";
          children: (
              | { type: "number"; value: number }
              | { type: "string"; value: string }
          )[];
      }
    | {
          folded?: true;
          name: string;
          type: "structure";
          children: UnloadedVariable[];
      };

export interface Animation {
    name: string;
    useMultipleDirections: boolean;
    directions: {
        looping: boolean;
        timeBetweenFrames: number;
        sprites: AnimationFrame[];
    }[];
}

export type AnimationFrame = {
    image: string;
    points: {
        name: string;
        x: number;
        y: number;
    }[];
    originPoint: {
        name: string;
        x: number;
        y: number;
    };
    centerPoint: {
        automatic: boolean;
        name: string;
        x: number;
        y: number;
    };
} & (
    | {
          hasCustomCollisionMask: true;
          customCollisionMask: { x: number; y: number }[][];
      }
    | { hasCustomCollisionMask: false }
);
export type CardAnimations = Record<
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
export type Cards = Record<string, Card>;
export interface CardEffect {
    effect_type: number;
    effect_status?: number;
    effect_variant?: number;
    effect_power?: number;
    effect_anim?: string;
    effect_force_anim?: number;
    effect_cmd_id?: string;
    effect_cmd_comms?: string;
    effect_cmd_tier?: number;
    effect_cmd_ability?: number;
    effect_card_id?: string;
    effect_card_convert?: string;
    effect_card_list?: string;
    effect_card_text?: string;
    effect_up_list?: string;
    effect_status_target?: number;
}
export interface Card
    extends Record<`effect_${number}`, CardEffect>, CardAnimations {
    name: string;
    data: string;
    dmg: number;
    faction: string;
    por_obj: `obj_${"unit" | "ab"}_${string}`;
    por_back: `cp_${string}`;
    por_angle?: number;
    por_scale?: number;
    por_repos_rate?: number;
    por_repos_range?: number;
    attacks?: number;
    effect_count?: number;
    dc_cond?: string;
    delayed_effect_time?: number;
    target_update_delay?: number;
}
export interface PlayerCard extends Card {
    store_loc: string;
    deck_group?: number;
}
export interface Unit extends Card {
    type: 1;
    hp: number;
    size: 1 | 2 | 3;
    timer: number;
    por_obj: `obj_unit_${string}`;
    srm_drop?: number;
    jump_fx?: 1 | 2 | 3 | 4;
    gun_mounts?: number;
    death_fx_power?: 1 | 2 | 3 | 4 | 5;
    death_total?: 1;
    death_time_max?: number;
    comms?: string;
}
export interface EnemeyUnit extends Unit {
    por_obj: `obj_unit_hos`;
    boss_up?: string;
    name_gp?: string;
    up_gp?: string;
}
export interface PlayerUnit extends PlayerCard, Unit {}
export interface Ability extends PlayerCard {
    type: 2;
    por_obj: `obj_ab_${string}`;
    ab_target: number;
    ab_type?: number;
    ab_attach_mount_type?: number;
    ab_attach_anim?: string;
    ab_comms_hos?: `ab_${string}_hos`;
    ab_comms_ally?: `ab_${string}_ally`;
    ab_comms_pl?: `ab_${string}_pl`;
    speaker?: string;
}
export type Comms = Record<string, Record<`text_${number}`, string[]> | string>;
export type Encounters = Record<`enc_${string}_${string}`, Encounter>;
export interface Encounter extends Record<`wave${number}`, Wave> {
    comment_wave_enemies: string;
}
export interface Wave extends Record<
    `variant${number}`,
    Record<`o${3 | 2 | 1 | 0}_unit${number}`, `${string}_${string}`>
> {
    wave_rand: number;
    wave_music?: number;
    wave_screen_text?: string;
}
export interface LootListUp {
    fleet: { boss: string[]; glo: string[]; [key: string]: string[] };
    up: { glo: string[]; [key: string]: string[] };
    start: Record<string, { gen: string[]; stat: string[] }>;
}
export interface TextLists {
    shop_loc: Record<string, string[]>;
    con_insult: { adj: string[]; noun: string[] };
    gp: {
        corp_1: Uppercase<string>[];
        corp_2: Uppercase<string>[];
        leg: Uppercase<string>[];
    };
}
export type Tutorials = Record<`tut_${string}`, { txt: string }>;
export type Upgrades = Record<
    `fl_boss_${string}` | `fl_glo_${string}` | `fl_${string}_${string}`,
    FleetUpgrade
> &
    Record<`up_${string}`, Dongle> &
    Record<`up_start_${string}`, StartingUpgrade>;
export interface FleetUpgrade {
    header: string;
    txt: string;
    txt_equip: string;
}
export interface Dongle {
    header: string;
    txt: string;
}
export interface StartingUpgrade {
    icon: string;
    icon_prio: number;
}
export type CloudLabels = Record<string, { txt: string; size: number }>;
export type Credits = Record<number, { txt: string[]; size: number }>;
export type LootListCard = Record<string, FactionLoot | RandomStart> & {
    start: RandomStart;
};
export interface FactionLoot {
    shp: `pl_${string}_${string}`[];
    shp_combo: Record<string, `pl_${string}_${string}`>;
    tch: `ab_${string}`[];
    tch_combo: Record<string, `ab_${string}`>;
    str: `pl_${string}_${string}`[];
    use: `ab_${string}`[];
}
export interface RandomStart {
    defense: `ab_${string}`[];
    damage: `ab_${string}`[];
    buff: `ab_${string}`[];
    control: `ab_${string}`[];
    const: `pl_${string}_${string}`[];
}
export type SpUp = Record<
    `pl_${string}_${string}` | `ab_${string}`,
    | Record<SpUpKeys, number>
    | (Record<SpUpKeys, number> & { apply_status: number; power: number })
    | (Record<SpUpKeys, number> & { gain_status: number; gain_power: number })
    | (Record<SpUpKeys, number> & {
          target_debuff: number;
          debuff_power: number;
      })
>;
export type SpUpKeys =
    | "ep"
    | "dmg"
    | "hp"
    | "scatter"
    | "pierce"
    | "start_status"
    | "timer"
    | "self_attack"
    | "decay_amp"
    | "rapid"
    | "amp_am"
    | "deploy_cost"
    | "range"
    | "spawn_sp_up"
    | "phoenix"
    | "up_slot"
    | "crit_mul"
    | "drive_power"
    | "ready"
    | "eliminate"
    | "heavy_armor"
    | "final_stand"
    | "replay"
    | "mass_produced"
    | "hack_bonus"
    | "multi"
    | "primed"
    | "interdict"
    | "mega_boost"
    | "mirror"
    | "fast_draw"
    | "ab_target"
    | "consume"
    | "dmg_vs_emp"
    | "priority"
    | "megaship_boost"
    | "unload"
    | "scatter_overwrite"
    | "multi_tmp"
    | "intercept"
    | "repair"
    | "add_replay";
export type Tooltips = Record<
    string,
    { header?: string; txt: string; suf?: number }
>;
export type UnlockCond = Record<string, { cond: string; unlock: string }>;
