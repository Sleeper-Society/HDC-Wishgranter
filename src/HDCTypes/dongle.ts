import { Card } from "./card";

export class Dongle{
    apply : (card : Card) => Card 
    constructor(apllicator : (card : Card) => Card){
        this.apply = apllicator
    }
}