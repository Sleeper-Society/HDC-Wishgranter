import { Mod } from "./Mod";
import { AddCard, AddEncounter, AddStartingDeck, AddKeyword, AddDongle } from './parseCode0.ts';

export class Game {
  public modlist: Mod[] = [];
  public AddCard = AddCard
  public AddEncounter = AddEncounter
  public AddStartingDeck = AddStartingDeck
  public AddKeyword = AddKeyword
  public AddDongle = AddDongle
}

