# Hyperspace Wishgranter
Hyperspace Deck Command deserves a modloader, and this is it.

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
As we are modifying existing code, a [wiki](https://github.com/Hederarch/HDC-Modloader/wiki) is being generated to keep track of new breakthroughs
## Making a Mod
### Structure of a Mod
Every mod is a folder/zip file within the mods folder with an `index.js` file. This js file will be treated as a module and is expected to `export default` a function that returns an object with the following properties
#### Metadata
* `name` (required): Name of the mod as it will appear in the mod menu
* `descr`: Short description of the mod as it will appear below the name in the mod menu
* `description`: Long description of the mod as it will appear when clicked on in the mod menu
* `version` (required): Version of the mod for dependancy checking
* `dependencies`: Dictionary of names and minimum viable versions of mods that should be loaded before this one
* `seealso`: Dictionary of names and minimum viable versions of mods that likely depend on this mod and would pair well with it

#### Loading the mod
* `Load` (required): A function for inserting new data into the game. This is where calls to `AddCard`,,`AddEncounter`,`AddStartingDeck`, `AddKeyword`, and any ui changes should occur. Returns either void or `load_sequence_element`, where `load_sequence_element` is 
```ts
type load_sequence_returns = void | Promise<void> | load_sequence_element[] | Promise<load_sequence_element[]>
type load_sequence_element = {
    status_text : string, 
    function : ((hyperspace_path : string, mods_path : string) => load_sequence_returns) | (() => load_sequence_returns)}
```

### Additional Tools
:P