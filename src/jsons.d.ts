import type { Cards, BaseGameJsons } from "./hyperspace.jsons.js";
import type { CardAnimations, WishgranterJsons } from "./wishgranter.jsons.js";

export type Jsons = BaseGameJsons | WishgranterJsons;
export type {
    Comms,
    Encounters,
    LootListUp,
    TextLists,
    Tutorials,
    Upgrades,
    CloudLabels,
    Credits,
    LootListCard,
    SpUp,
    Tooltips,
    UnlockCond,
} from "./hyperspace.jsons.js";
export type { CardAnimations, Data } from "./wishgranter.jsons.js";
export type Cards = Cards & Partial<CardAnimations>;
