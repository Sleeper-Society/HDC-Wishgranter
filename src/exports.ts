import type { Mod, ModMetaData } from "./renderer/wishgranterTypes/mod.ts";
type onLoad = Required<Mod>["onLoad"];
type onGameStart = Required<Mod>["onGameStart"];
export type { onLoad, onGameStart, ModMetaData };
export type {
  LoadSequenceElement,
  LoadSequenceFunction,
} from "./renderer/modMenu/loadingBar.ts";
export {
  addFaction,
  getFaction,
  removeFaction,
  getFactions,
  addInsultAdjectives,
  addInsultNouns,
  addCredit,
  addStoreLocation,
  getStoreLocation,
} from "./renderer/factories/contentFactory.ts";
export { Faction } from "./renderer/wishgranterTypes/faction.ts";
import type {
  Ability,
  PlayerUnit,
  EnemyUnit,
} from "./renderer/factories/hdcTypeFactories/cardFactory.ts";
export type Card = Ability | PlayerUnit | EnemyUnit;
export type Unit = PlayerUnit | EnemyUnit;
export type PlayerCard = Ability | PlayerUnit;
export {
  Ability,
  PlayerUnit,
  EnemyUnit,
  type Commander,
  type Megaship,
  type Construct,
  type Depletable,
  getCard,
  removeCard,
  type StartingCardTag,
} from "./renderer/factories/hdcTypeFactories/cardFactory.ts";
export { AnimatedSprite, Sprite } from "./renderer/factories/spriteFactory.ts";
export {
  Dongle,
  addGlobalDongle,
  getDongle,
  removeDongle,
} from "./renderer/factories/hdcTypeFactories/dongleFactory.ts";
export {
  FleetUpgrade,
  addBossRewardFleetUpgrade,
  addGlobalFleetUpgrade,
  getFleetUpgrade,
  removeFleetUpgrade,
} from "./renderer/factories/hdcTypeFactories/fleetUpgradeFactory.ts";
export {
  Encounter,
  Wave,
  addGlobalEncounter,
  getEncounter,
  removeEncounter,
} from "./renderer/factories/hdcTypeFactories/encounterFactory.ts";
export type { BaseGameCardEffect } from "./renderer/factories/hdcTypeFactories/cardEffectFactory.ts";
