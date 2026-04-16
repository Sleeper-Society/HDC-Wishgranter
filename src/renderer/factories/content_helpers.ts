import type { Card } from "../HDCTypes/card.ts";
import type { Dongle } from "../HDCTypes/dongle.ts";
import type { Encounter } from "../HDCTypes/encounter.ts";
import type { Faction } from "../HDCTypes/faction.ts";

export function addFaction(faction_name: string): Faction {}

export function getFaction(faction: string): Faction {}
export function getFactions(): Faction[] {}
export function getCard(card: string): Card {}
export function getDongle(dongle: string): Dongle {}
export function getEncounter(encounter: string): Encounter {}

export function removeFaction(faction: Faction) {}
export function removeCard(card: Card) {}
export function removeDongle(dongle: Dongle) {}
export function removeEncounter(encounter: Encounter) {}

export function addCredit(catagory: string, credit: string) {}
