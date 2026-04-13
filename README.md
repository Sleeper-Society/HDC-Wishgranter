# Hyperspace Wishgranter

A Modloader for Hyperspace Deck Command by Sleeper Games. A separate electron app that loads base game files at runtime and modifies them with external js files

## Use

### Players

Wishgranter is packaged the same way as Hyperspace Deck Command. You can download the latest build from the realeases tab to the right.

### Developers

Wishgranter is included in NPM for use in typescript projects. It is installable by running `npm i -D hyperspace-wishgranter`.
<sub>todo</sub>

## Table of contents

- [Code Of Conduct](#code-of-conduct)
- [Contributions](#contributions)
- [Creating your first Mod](#creating-your-first-mod)
<sub>todo</sub>
- [Available Mod Formats](#mod-formats)
- [API](#content-modifiers)
- [Development](#limitations)
## Code of Conduct

As per an official statement by Sleeper Games, modding must not:

- Distribute or allow the distribution of copies of HDC
  - It's a very cheap game by a very small developer. Piracy is not justifiable or desirable here.
- Publicly upload game assets or code
  - See above.
- Violate the Sleeper Games Code of Conduct
  - i.e. promote hate speech or discrimination, include adult material, or distribute personal information
- Bother Sleeper Games directly.
  - This is a fan project and should be kept among fans. Sleeper Games is busy and is not expected to help.

## Contributions

As we are modifying existing code, a [wiki](https://github.com/Hederarch/HDC-Modloader/wiki) is being generated to keep track of new breakthroughs.

Folder structure follows [this](https://2ality.com/2025/02/typescript-esm-packages.html) tutorial.

## Mod Formats

A mod will show up in the modlist if it has one of any of the following:
* Only one top level `.js` file, which exports a `metadata` object <sub>todo file search</sub>
* An `index.js` or `[parent_folder_name].js` file, which exports a `metadata` object <sub>todo named index</sub>
* A `index.json` or `[parent_folder_name].json` file, which describes a `metadata` object <sub>todo json importing</sub>
* A `index.json` or `[parent_folder_name].json` file, with a top level member being a `metadata` object <sub>todo json to js file to functions</sub>

If mod callbacks are not defined in the same file as `metadata`, wishgranter will instead attempt to call `[callback_name].js` with a default/`[callback_name]` export of the callback function

### Metadata Object

- `name` (required): Name of the mod as it will appear in the mod menu
- `version` (required): Version of the mod for dependency checking
- `descr`: Short description of the mod as it will appear below the name in the mod menu
- `description`: Long description of the mod as it will appear when clicked on in the mod menu
- `dependencies`: Dictionary of names and minimum viable versions of mods that should be loaded before this one
- `peer_dependencies`: Dictionary of names and minimum viable versions of mods
- `seealso`: Dictionary of names and minimum viable versions of mods that likely depend on this mod and would pair well with it

### Callbacks

These methods will be called by wishgranter at specific times

- `onLoad`: A function for inserting new data into the game. This is where calls to [content modifying functions](### Content Modifiers) should occur. Return void, a promise which returns void, or an array of objects with a `status_text` label and `function` callable or a promise that returns such. By returning a callback array, the loading bar will be able to show mod loading progress.
- `onGameStart`: A function called after the game is done loading (When the logo appears). This is where any UI changes should occur, since `load` is called before the canvas is created. 

### Content Modifiers

Wishgranter provides a number of functions in the global scope to aid in adding, removing, or modifying game content <sub>todo literally all of it none of these functions are there yet</sub>

#### Adding Content

- `addFaction(faction name) : faction`
- `addCardToStores(faction, card, [additional faction])`
- `addDongleToStores(faction, dongle, [additional faction])`
- `addCardToEncounterRewards(faction, card)`
- `addDongleToEncounterRewards(faction, dongle)`
- `addEncounter(faction, encounter)`
- `addCardToStartingDecks(faction, card)`

#### Modifying Content
In order to override existing content, modify the results of these functions and call the appropriate add function
- `getFaction(faction name) : faction`
- `getCard(card name) : card`
- `getDongle(dongle name) : dongle`
- `getEncounters(faction) : readonly encounter[]`

#### Removing content
Included for use in overhaul mods. We recommend not using these
- `removeFaction(faction)`
- `removeCard(card)`
- `removeDongle(dongle)`
- `removeEncounter(encounter)`

### Helper Classes
While you *can* use cards as if they were being added to the jsons directly, we provide a more human readable api as well <sub>todo backwards compatability</sub>
#### The Card Class
-  `name: string`
-  `sprites: []`
-  `sprite_angle = 0`
-  `sprite_scale = 1`
-  `effects: unknown[]`
-  `is_unit: boolean`
-  `deck_group?: "megaship" | "aux" | "construct"`
-  `faction?: string`
-  `types: string[] = []`
-  `damage?: number`
-  `hull?: number`
-  `orbital_size?: 1 | 2 | 3`
-  `timer?: number`
-  `death_effect_power = 1`
-  `boss_upgrade?: Dongle`
-  `comms?: string[][]`
-  `datacloud?: unknown`
-  `datacloud_unlock_condition?: unknown`
#### The Dongle Class
- `header: string`
- `text: string`
- `text_on_equip: string`
- `apply: (card: Card) => Card`
#### The Encounter Class
- `name: string`
- `waves: Wave[] = []`
Waves are defined as
- `variants: [orbit_3: Card[], orbit_2: Card[], orbit_1: Card[]][] = []`
- `music?: string`
- `screen_text: string`

## Limitations
As of writing, almost none of this is actually true! We're working on it! 
As it currently stands, it looks like *custom keywords* will take longer than simple content additions
Still, this should be enough to have fun with, soon
