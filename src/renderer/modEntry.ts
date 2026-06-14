const mod_entry_template = document.getElementsByTagName("template")[0];

class ModEntry extends HTMLElement {
  private shadow: ShadowRoot;
  private _mod_directory_path: string | (() => string) = "";
  get mod_directory_path(): string {
    if (typeof this._mod_directory_path == "string") {
      return this._mod_directory_path;
    }
    return this._mod_directory_path();
  }
  set mod_directory_path(new_path: string | (() => string)) {
    this._mod_directory_path = new_path;
    void this.onModDirectoryChanged();
  }
  get enabled(): boolean {
    return (this.shadow.getElementById("enabled") as HTMLInputElement).checked;
  }
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.append(mod_entry_template.content.cloneNode(true));
  }
  static get observedAttributes() {
    return ["mod_directory_path"];
  }

  attributeChangedCallback(
    _name: string,
    _old_value: string,
    new_value: string,
  ) {
    this.mod_directory_path = new_value;
    void this.onModDirectoryChanged();
  }
  async onModDirectoryChanged() {
    this.dispatchEvent(
      new CustomEvent("mod_directory_changed", {
        detail: { new_directory: this.mod_directory_path },
      }),
    );
    const metadata = await window.mod_menu.getModMetadata(
      this.mod_directory_path,
    );
    const name_element = this.shadow.getElementById("name");
    if (name_element) name_element.textContent = metadata.name;
    const description_element = this.shadow.getElementById("description");
    if (description_element)
      description_element.textContent = metadata.description ?? "";
    const icon_element = this.shadow.getElementById("icon") as
      | HTMLImageElement
      | undefined;
    if (icon_element) icon_element.src = metadata.icon_path ?? "";

    this.shadow.getElementById("move_up")?.addEventListener("click", () => {
      this.parentElement?.moveBefore(this, this.previousSibling);
    });
    this.shadow.getElementById("move_down")?.addEventListener("click", () => {
      this.parentElement?.moveBefore(this, this.nextSibling);
    });
  }
}

customElements.define("mod-entry", ModEntry);

export type { ModEntry };
