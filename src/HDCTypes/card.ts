import { Dongle } from "./dongle"

export class Card {
    name : string
    sprites : []
    sprite_angle = 0
    sprite_scale = 1
    effects : CardEffect[]
    is_unit : boolean
    deck_group? : 'megaship' | 'aux' | 'construct' 
    faction? : "heg" | "lt" | "tu" | "con" | "flo" | "et" | string
    types : ('commander' | 'container' | 'strike' | string)[] = []
    damage? : number
    hull? : number
    orbital_size? : 1 | 2 | 3
    timer? : number
    death_effect_power = 1
    boss_reward? : Dongle
    comms? : CommsEntry
    datacloud? : DatacloudEntry
    datacloud_unlock_condition? : UnlockCondition
    constructor(name : string, is_unit : boolean, sprites : [], effects : CardEffect[], additional : Partial<Card>){
        this.name = name
        this.is_unit = is_unit
        this.sprites = sprites
        this.effects = effects
        Object.assign(this,additional)
    }
}
export class CardEffect{

}
export class UnlockCondition{

}
export class DatacloudEntry{

}
export class CommsEntry{

}