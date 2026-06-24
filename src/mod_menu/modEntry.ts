import { WishgranterMod } from "../wishgranterMod.ts";
import { BaseGameMod } from "../baseGameMod.ts";
import { Mod } from "../mod.ts";
import type Jsons from "../jsons.js";
import type {
    CardAnimations,
    Cards,
    CloudLabels,
    Comms,
    Credits,
    Data,
    Encounters,
    LootListCard,
    LootListUp,
    SpUp,
    TextLists,
    Tooltips,
    Tutorials,
    UnlockCond,
    Upgrades,
} from "../jsons.js";
import type { LoadingBarElement } from "./loadingBar.ts";

const mod_entry_template = document.getElementsByTagName("template")[0];

class ModEntry extends HTMLElement {
    private shadow: ShadowRoot;
    private mod?: Mod = undefined;
    set enabled(enabled: boolean) {
        if (!this.mod) throw new Error("Enabled set too early");
        this.mod.enabled = enabled;
        (this.shadow.getElementById("enabled") as HTMLInputElement).checked =
            enabled;
    }
    get enabled(): boolean {
        if (!this.mod) throw new Error("Enabled got too early");
        return this.mod.enabled;
    }
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.append(mod_entry_template.content.cloneNode(true));
    }
    static get observedAttributes() {
        return ["disabled"];
    }
    attributeChangedCallback(
        _name: "disabled",
        _old_value: boolean,
        new_value: boolean,
    ) {
        this.enabled = new_value;
    }
    move_up_listener?: () => void = undefined;
    move_down_listener?: () => void = undefined;
    connectedCallback(): void {
        this.mod =
            this.getAttribute("mod_type") == "wishgranter" ?
                new WishgranterMod()
            : this.getAttribute("mod_type") == "basegame" ?
                new BaseGameMod(!this.hasAttribute("disabled"))
            :   new Mod(
                    !this.hasAttribute("disabled"),
                    this.getAttribute("mod_directory_path") ?? "",
                );
        (this.shadow.getElementById("enabled") as HTMLInputElement).checked =
            this.enabled;
        (
            this.shadow.getElementById("enabled") as HTMLInputElement
        ).addEventListener("change", () => {
            this.enabled = (
                this.shadow.getElementById("enabled") as HTMLInputElement
            ).checked;
        });
        if (
            !this.hasAttribute("mod_type") &&
            this.previousElementSibling &&
            !this.previousElementSibling.hasAttribute("mod_type")
        ) {
            this.move_up_listener = () => {
                this.parentElement?.moveBefore(this, this.previousSibling);
            };
            this.shadow
                .getElementById("move-up")
                ?.addEventListener("click", this.move_up_listener);
        }
        if (!this.hasAttribute("mod_type") && this.nextSibling) {
            this.move_down_listener = () => {
                this.parentElement?.moveBefore(this, this.nextSibling);
            };
            this.shadow
                .getElementById("move-down")
                ?.addEventListener("click", this.move_down_listener);
        }
        if (
            this.getAttribute("mod_type") != "basegame" ||
            document
                .getElementById("hyperspace-file-location-input")
                ?.getAttribute("value")
        )
            this.onModChanged().catch((err: unknown) => {
                console.error(err);
            });
    }
    disconnectedCallback() {
        if (this.move_up_listener)
            this.shadow
                .getElementById("move-up")
                ?.removeEventListener("click", this.move_up_listener);
        if (this.move_down_listener)
            this.shadow
                .getElementById("move-down")
                ?.removeEventListener("click", this.move_down_listener);
    }
    async onModChanged() {
        if (!this.mod) return;

        const loadingBar = this.shadow.getElementById(
            "mod-loading-bar",
        ) as LoadingBarElement | null;
        if (!loadingBar?.runThroughLoadingSequence) return;
        loadingBar.style.display = "inherit";
        await loadingBar.runThroughLoadingSequence(await this.mod.load());
        loadingBar.style.display = "none";

        const metadata = this.mod.getMetadata();
        const name_element = this.shadow.getElementById("name");
        if (name_element) name_element.textContent = metadata.name;
        const description_element = this.shadow.getElementById("description");
        if (description_element)
            description_element.textContent = metadata.description ?? "";
        const version_element = this.shadow.getElementById("version");
        if (version_element)
            version_element.textContent = metadata.version ?? "";
        const icon_element = this.shadow.getElementById(
            "icon",
        ) as HTMLImageElement | null;
        if (icon_element) icon_element.src = metadata.icon_path ?? "";
    }
    getJson(json_name: `card_animations.json`): Partial<CardAnimations>;
    getJson(json_name: `cards.json`): Partial<Cards>;
    getJson(json_name: `comms.json`): Partial<Comms>;
    getJson(json_name: `encounters.json`): Partial<Encounters>;
    getJson(json_name: `loot_list_up.json`): Partial<LootListUp>;
    getJson(json_name: `text_lists.json`): Partial<TextLists>;
    getJson(json_name: `tutorials.json`): Partial<Tutorials>;
    getJson(json_name: `upgrades.json`): Partial<Upgrades>;
    getJson(json_name: `cloud_labels.json`): Partial<CloudLabels>;
    getJson(json_name: `credits.json`): Partial<Credits>;
    getJson(json_name: `loot_list_card.json`): Partial<LootListCard>;
    getJson(json_name: `sp_up.json`): Partial<SpUp>;
    getJson(json_name: `tooltips.json`): Partial<Tooltips>;
    getJson(json_name: `unlock_cond.json`): Partial<UnlockCond>;
    getJson(json_name: `data.json`): Partial<Data>;
    getJson(josn_name: `${string}.json`): Partial<Jsons>;
    getJson(josn_name: `${string}.json`): Partial<Jsons> {
        return this.mod?.getJson(josn_name) ?? {};
    }
    getData() {
        return this.mod?.getData() ?? {};
    }
    getCode0Adjustments() {
        return (
            this.mod?.getCode0Adjustments() ??
            function (out: string) {
                return out;
            }
        );
    }
    hasMod(comparison_mod_path: string) {
        return this.mod?.hasModPath(comparison_mod_path) ?? false;
    }
}

customElements.define("mod-entry", ModEntry);

export type { ModEntry };
