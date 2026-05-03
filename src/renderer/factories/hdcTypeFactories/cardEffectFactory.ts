export interface BaseGameCardEffect {
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
