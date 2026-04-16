import type { ModMetaData } from "../HDCTypes/mod.ts";

const mod_entry_template = document.getElementsByTagName("template")[0];

export class ModEntry extends HTMLElement {
  mod?: ModMetaData;
  enabled = true;
  connectedCallback() {
    if (!this.mod) {
      this.remove();
      return;
    }
    this.append(mod_entry_template.content.cloneNode(true));
    if (this.mod.icon) {
      (this.getElementsByClassName("icon")[0] as HTMLImageElement).src =
        this.mod.icon;
    }
    this.getElementsByClassName("name")[0].textContent = this.mod.name;
    this.getElementsByClassName("version")[0].textContent = this.mod.version;
    if (this.mod.description) {
      this.getElementsByClassName("description")[0].textContent =
        this.mod.description;
    }

    this.getElementsByClassName("move_up")[0].addEventListener("click", () => {
      this.parentElement?.moveBefore(this, this.previousSibling);
    });
    this.getElementsByClassName("move_down")[0].addEventListener(
      "click",
      () => {
        this.parentElement?.moveBefore(this, this.nextSibling);
      },
    );
  }
}
customElements.define("mod-entry", ModEntry);
