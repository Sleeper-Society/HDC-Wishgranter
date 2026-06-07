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
    this.onModDirectoryChanged();
  }
  get enabled(): boolean {
    return (this.shadow.getElementById("enabled") as HTMLInputElement).checked;
  }
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.append(mod_entry_template.content.cloneNode(true));
  }
  connectedCallback() {
    this.onModDirectoryChanged();
  }
  onModDirectoryChanged() {
    const name_element = this.shadow.getElementById("name");
    if (name_element) {
      name_element.textContent =
        this.mod_directory_path.split("/")[
          this.mod_directory_path.split("/").length
        ];
    }
    fetch(`file://${this.mod_directory_path}/icon.png`)
      .then(() => {
        (this.shadow.getElementById("icon") as HTMLImageElement).src =
          `${this.mod_directory_path}/icon.png`;
      })
      .catch(() => {
        console.warn(this.mod_directory_path, "has no icon");
      });

    this.shadow.getElementById("move_up")?.addEventListener("click", () => {
      this.parentElement?.moveBefore(this, this.previousSibling);
    });
    this.shadow.getElementById("move_down")?.addEventListener("click", () => {
      this.parentElement?.moveBefore(this, this.nextSibling);
    });
  }
  async *getJsons(
    hyperspace_path: string,
  ): AsyncGenerator<[string, Record<string, unknown>]> {
    for (const possibly_defined_json of await window.wishgranter.getHyperspaceJsonList(
      hyperspace_path,
    )) {
      const json_response = await fetch(
        `file://${this.mod_directory_path}/${possibly_defined_json}.json`,
      );
      if (!json_response.ok) continue;
      yield [possibly_defined_json, await json_response.json()];
    }
  }
}

customElements.define("mod-entry", ModEntry);

export type { ModEntry };
