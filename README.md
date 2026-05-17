# Hyperspace Deck Command: Wishgranter

Wishgranter is a modloader for [Sleeper Games' *Hyperspace Deck Command*](https://store.steampowered.com/app/2711190/Hyperspace_Deck_Command/). It works by loading the base games files with a seperate electron application, adding a number of hooks and changing the way loading resources works to allow definition chaining, then reading some number of mod files to add extra content.

## Installation
[Windows]()
[Linux]()

## Mods
A list of downloadable mods can be found at [our website]()

## Mod Creation

### Mod Formats

Mods can be either a single file or a folder.

Mod files can be either `.js` or `.json` files. 

In `js` files, objects are defined with the `export` keyword. If an `onLoad` function is definied, it will be called before the game starts and should include all [content modifiction calls](#content-modification-functions).

In `json` files, calls to [`add[something]`](#content-modification-functions) functions can be made by defining top level `[something]` array. If the funciton has a `faction` paramater, a [Faction](#faction) object appearing in the array will make every call after them include that faction as a paramater. An empty string will be read as undefined.

For example, this `js` `onLoad` function:
```js
addCards("lt","some_card_id")
addCards("flo","some_other_card_id", {"some_third_card_id": undefined}, ["some_combo_card_id", "lt"])
addCards("flo","lt", "some_other_combo_card_id")
```
is equivalant to this `json` object:
```json
cards:[
  "lt",
  "some_card_id"
  "flo",
  "some_other_card_id",
  {"some_third_card_id": ""},
  ["some_combo_card_id", "lt"],
  ["some_other_combo_card_id", "lt"]
]
```

Mods must define a `metadata` object. If the mod is a folder, all deinitions must be in a file named `index`. If both `index.js` and `index.json` exist and have a metadata object, the one in `index.json` will be used. All other objects from both files will also be used, but `index.json` will apply first.

#### Metadata

- `name` (required): Name of the mod as it will appear in the mod menu
- `version` (required): Version of the mod for dependency checking
- `descr`: Short description of the mod as it will appear below the name in the mod menu
- `description`: Long description of the mod as it will appear when clicked on in the mod menu
- `dependencies`: Dictionary of names and minimum viable versions of mods that should be loaded before this one
- `seealso`: Dictionary of names and minimum viable versions of mods that likely depend on this mod and would pair well with it

### Content Modification Functions

Every content modifiction function paramater will accept any of the following:
- The type specified. If the object does not already exist internally, it will be added.
- The type specified with some paramaters missing. The function will apply to any object that matches the existing fields. If no such object exists, a new object will be generated with reasonable defaults for all missing paramaters.
- A string id or name. If no matching objects exist the function will throw an `ObjectNotFound` exception. 

Every content modification function's content object paramaters ([Cards](#addcards), [Encounters](#addencounters), ect.) will accept any of the following:
- Any of the above mentioned representaitons.
- A js object whose memebers are:
  - A non-plualized object paramater (eg `card` for `addCards`) with a value of the above representations
  - The other non-`faction` paramaters.
- A js object whose keys are ids and whose values are the type spescifed or the type specified with paramaters missing or undefined. For every member: 
  - If the id already exists: 
    - All paramaters in the value will be overide those already present wherever the object appears
    - If the value is undefined, the object will be removed from wherever it appears
  - If the id does not exist:
    - If the value is undefined the function will throw an `ObjectNotFound` exception.
    - Otherwise, a new object will be generated with resonable defaults for all missing paramaters.
  - Additionally, ids can have a `[mod name]:` suffix.
    - If the value is undefined, the object added will be the object with this id as it was after the spesified mod was loaded.
    - If the value is defined, the modifications will apply as if they happened immeditly after the spesified mod was loaded.

For example, while `addCards` signature as listed below is 
```ts
addCards(faction : Faction, additional_faction? : Faction, ...cards : Card[])
```
in reality it is:
```ts
addCards(
  faction : (Faction | Partial<Faction> | string),
  additional_faction? : (Faction | Partial<Faction> | String),
  ...cards : (Card | Partial<Card> | string
    | Record<string, Card | Partial<Card> | undefind>
    | {
        card : (Card | Partial<Card> | string),
        additional_faction : (Faction | Partial<Faction> | string)
      }
    )[]
);
```

If your mod throws an unhandled exception none of the content modification functions will apply, even if they happened before the exception was thrown.
#### `addCards`
`addCards(faction : Faction, additional_faction? : Faction, ...cards : Card[])`

Cards added by `addCards` will appear as rewards before encounters start, and in shops if they have `shop_loc` or `shop_location` set. 

Cards with the `flagship` effect will remove any other previous cards with the `flagship` effect from the faction. These will not appear as rewards or in shops, but as starting cards.

Cards with the `commander` effect will not appear in shops.
#### `addStartingCommanders`
`addStartingCommanders(faction : Faction, commander : Card, cards : Card[], dongles : Dongle[])`

 For clairity, more than one commander can be added at once: `addStartingCommanders(faction : Faction, ...commanders : {commander : Commander, cards : Card[], dongles : Dongle[]})`
#### `addStartingFlagshipDongles`
`addStartingFlagshipDongles(faction?: Faction, ...dongles : Dongle[])`
#### `addStartingAuxiliaries
`addStartingAuxiliaries(faction : Faction, auxiliaries : Card[])`
#### `addEncounters`
`addEncounters(encounter_pool : number, ...encounters : Encounter[])`

Encounters in `encounter_pool` 1 have an equally likely chance to be the first encounter
#### `addCoordinates`
`addCoordinates(...coordianates : Coordinate[])`
#### `addDongles`
`addDongles(faction?: Faction, ...dongles : Dongle[])`

Dongles added by `addDongles` will appear as rewards before encounters start, and in shops.
#### `addFleetUpgrades`
`addFleetUpgrades(faction?: Faction, ...fleet_upgrades : FleetUpgrades[])`
#### `addBossRewardFleetUpgrades`
`addBossRewardFleetUpgrades(...fleet_upgrades : FleetUpgrade[])`
#### `addTextList`
`addTextList(list_name : string, ...elements : string[])`
`addTextList(list_name : string, ...elements : {subkey : string, element : string[])`
Edge case: Since subkeys are not a disticnt type from elements, subkey must be spesified within a js object.
#### `addToTextList`
`addToTextList(list_name : string, ...elements : string[])`
`addToTextList(list_name : string, ...elements : {subkey : string, element : string[])`
Edge case - It's kind of hard to add elements to an existing array with this set up, so theres an extra function to do so. Additionally, here are some helper functions for text lists that exist in the base game:
#### `addToContemperInsultAdjectives`
`addToContemperInsultAdjectives(...insults : string[])`
#### `addToContemperInsultNouns`
`addToContemperInsultNouns(...insults : string[])`
#### `addToStoreLocations`
`addToStoreLocations(store_location : string, ...location_names : string[])`
#### `addToCredits`
`addToCredits(catagory : string, ...credits : string[])`

### Types
#### Faction
#### Card
#### Encounter
#### Dongle
#### FleetUpgrade
#### Coordinate
