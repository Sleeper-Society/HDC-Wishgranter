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
  get mod_name(): string {
    return this.mod_directory_path.split("/")[
      this.mod_directory_path.split("/").length - 1
    ];
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
    this.onModDirectoryChanged();
  }
  onModDirectoryChanged() {
    const name_element = this.shadow.getElementById("name");
    if (name_element) name_element.textContent = this.mod_name;
    fetch(`${this.mod_directory_path}/icon.png`, {
      method: "HEAD",
    })
      .then((result) => {
        if (result.ok)
          (this.shadow.getElementById("icon") as HTMLImageElement).src =
            `${this.mod_directory_path}/icon.png`;
      })
      .catch((err: unknown) => {
        console.warn(err);
      });

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
