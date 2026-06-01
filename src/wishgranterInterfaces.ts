import * as Hyperspace from "./hyperspaceInterfaces.ts";
export interface Sprite {}
export interface Faction {
  name: string;
  short_name: string;
  color: [number, number, number];
  default_portrait: Sprite[];
  commander_background: Sprite;
  holo_unit_border: Sprite;
  holo_ability_border: Sprite;
}
export interface CardEffect extends Hyperspace.CardEffect {}
export interface Card extends Hyperspace.Card {
  name: string;
  damage: number;
  dmg: number;
  faction: Faction;
  attacks: number;
  por_obj: string;
  sprites: Sprite[];
  background_sprite: Sprite;
  por_back: `cp_${string}`;
  sprite_rotation: number;
  por_angle: number;
  sprite_scale: number;
  por_scale: number;
  sprite_shake_rate: number;
  por_repos_rate: number;
  sprite_shake_range: number;
  por_repos_range: number;
  delayed_effect_time: number;
  target_update_delay: number;
  datacloud_entry_text?: string;
  data: string;
  datacloud_unlock_condition?: UnlockCondition;
  dc_cond?: UnlockCondition;
  effect_count: number;
  effects: CardEffect[];
}
export interface StoreLocation extends Array<string> {}
export interface Comms extends Array<string[]> {}
export interface PlayerCard extends Card, Hyperspace.PlayerCard {
  store_location: StoreLocation;
  store_loc: StoreLocation;
  deck_priority: number;
  deck_group: number;
}
export interface Ability extends PlayerCard, Hyperspace.Ability {
  attach_mount_type?: number;
  ab_attach_mount_type?: number; //TODO Switch from id to object
  attach_animation?: string;
  ab_attach_anim?: string; //TODO Switch from id to object
  type?: number;
  ab_type?: number;
  target: number;
  ab_target?: number;
  player_comms?: Comms;
  ab_comms_pl?: Comms;
  ally_comms?: Comms;
  ab_comms_ally?: Comms;
  hostile_comms?: Comms;
  ab_comms_hos?: Comms;
  speaker?: string;
}
export interface Unit extends Card, Hyperspace.Unit {}
export interface PlayerUnit extends Unit, PlayerCard, Hyperspace.PlayerUnit {}
export interface EndlessUnit extends Unit {}
export interface Dongle {}
export interface Boss extends Unit {}
export interface Encounter {}

export interface FleetUpgrade {}
export interface Coordinate {}
export interface UnlockCondition {}
