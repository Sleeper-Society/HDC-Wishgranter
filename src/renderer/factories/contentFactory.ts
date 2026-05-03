import type { Faction } from "wishgranter";

const factions: Faction[] = [];

const store_locations = new Map<string, string[]>();
const insult_adjcetives: string[] = [];
const insult_nouns: string[] = [];
const credits: Record<string, string[]> = {
  "": ["Hyperspace Deck Command", "by Sleeper Games"],
};

export function addFaction(faction: Faction) {
  factions.push(faction);
}
export function addStoreLocation(name: string, ...locations: string[]) {
  store_locations.set(name, locations);
}
export function addInsultAdjectives(...insults: string[]) {
  insult_adjcetives.push(...insults);
}
export function addInsultNouns(...insults: string[]) {
  insult_nouns.push(...insults);
}
export function addCredit(catagory: string, credit: string) {
  if (!Object.keys(credits).includes(catagory)) credits[catagory] = [];
  credits[catagory].push(credit);
}

export function getFaction(faction_name: string): Faction | undefined {
  return factions.find(
    (faction) =>
      faction.name == faction_name || faction.short_name == faction_name,
  );
}
export function getStoreLocation(name: string) {
  return store_locations.get(name);
}
export function getStoreLocationId(store_location: string[] | undefined) {
  return (store_locations
    .entries()
    .find((location) => location[1] == store_location) ?? [undefined])[0];
}

export function getFactions(): Iterable<Faction> {
  return factions;
}
export function getStoreLocations(): Iterable<[string, string[]]> {
  return { [Symbol.iterator]: store_locations.entries.bind(store_locations) };
}
export function getInsults(): [
  adjs: Iterable<string>,
  nouns: Iterable<string>,
] {
  return [insult_adjcetives, insult_nouns];
}
export function getCredits() {
  return credits;
}

export function removeFaction(faction: Faction) {
  if (factions.includes(faction)) factions.splice(factions.indexOf(faction), 1);
}
