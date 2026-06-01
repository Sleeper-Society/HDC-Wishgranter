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
export interface Card extends Record<`effect_${number}`, CardEffect> {
  name: string;
  data: string;
  dmg: number;
  faction: string;
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
