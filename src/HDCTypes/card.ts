import { Faction } from "../game"
import { Dongle } from "./dongle"

export class Card {
    name : string
    sprites : []
    sprite_angle = 0
    sprite_scale = 1
    effects : CardEffect[]
    is_unit : boolean
    deck_group? : 'megaship' | 'aux' | 'construct' 
    faction? : Faction
    types : ('commander' | 'container' | 'strike' | string)[] = []
    damage? : number
    hull? : number
    orbital_size? : 1 | 2 | 3
    timer? : number
    death_effect_power = 1
    boss_reward? : Dongle
    comms? : string[][]
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

export class CardLootTable {
    ships: Card[] = [];
    ship_combos: Map<Faction, Card> = new Map();
    structures: Card[] = [];
    techs: Card[] = [];
    tech_combos: Map<Faction, Card> = new Map();
    useables: Card[] = [];
}
export class Encounter {
    name : string
    waves: Wave[] = [];
    constructor(name : string, ...waves : Wave[]){
        this.name = name
        this.waves = waves
    }
}
export class Wave {
    varaiants: [orbit_3: Card[], orbit_2: Card[], orbit_1: Card[]][] = [];
    music?: string
    screen_text: string
    constructor(title: string, ...enemies: Card[] | [orbit_3: Card[], orbit_2: Card[], orbit_1: Card[]][]) {
        this.screen_text = title
        if (enemies.length <= 0) return
        if (Array.isArray(enemies[0])) { this.varaiants = enemies as [orbit_3: Card[], orbit_2: Card[], orbit_1: Card[]][]; return} 
        this.varaiants = [[enemies as Card[], [], []]]
    }
}

export class StartingDeck {
}

