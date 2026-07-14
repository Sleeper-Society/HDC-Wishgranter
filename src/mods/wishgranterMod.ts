import { getDataFromMods } from "../fileFactory.ts";
import { Mod, type ModMetadata } from "./mod.ts";
import { commentCode0 } from "../reimplementations/code0Commenter.ts";

export class WishgranterMod extends Mod {
    constructor(enabled = true, mod_directory_path = ".") {
        super(enabled, mod_directory_path);
        this.getJson = () => {
            return {};
        };
        this.getData = () => {
            return {};
        };
        this.load = () =>
            new Promise((resolve) => {
                resolve([]);
            });
    }

    getCode0Adjustments(): (code0: string) => string {
        return (code0) => {
            if (window.remote_replace.app.isPackaged())
                code0 = commentCode0(code0, getDataFromMods());
            code0 = code0.replace(
                /(?<=gdjs\s*\.evtsExt__GetPropertiesData__ReturnGameVersion\.func\(\s*runtimeScene,\s*null,?\s*\)\s*\+\s*")[\w()\s-]*(?="?)/g,
                ` (${(document.getElementById("modlist")?.children.length ?? 2) > 2 ? `${((document.getElementById("modlist")?.children.length ?? 2) - 2).toString()} Mods Loaded` : "Modded"} - Wishgranter)`,
            );
            return code0;
        };
    }
    getMetadata(): ModMetadata {
        return {
            name: "Wishgranter Utilities",
            version: "0.0.3",
            description: "Modloader for Sleeper Game's Hyperspace Deck Command",
            icon_path: "Wishgranter_Icon.png",
        };
    }
}
