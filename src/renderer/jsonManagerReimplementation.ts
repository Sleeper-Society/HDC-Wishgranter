import type { Resource } from "./gdjs.ts";
import { getJson } from "./modFactory.ts";

const logger = new gdjs.Logger("JSON Manager");

/**
 * The callback called when a json that was requested is loaded (or an error occurred).
 * @category Resources > JSON
 */
type JsonManagerRequestCallback = (
  error: Error | null,
  content: object | null,
) => void;

/**
 * JsonManager loads json files (using `XMLHttpRequest`), using the "json" resources
 * registered in the game resources.
 *
 * Contrary to audio/fonts, json files are loaded asynchronously, when requested.
 * You should properly handle errors, and give the developer/player a way to know
 * that loading failed.
 * @category Resources > JSON
 */
gdjs.JsonManager = class JsonManager {
  _resourceLoader: (typeof gdjs)["ResourceLoader"];

  _loadedJsons = new gdjs.ResourceCache<object>();
  _callbacks = new gdjs.ResourceCache<JsonManagerRequestCallback[]>();

  /**
   * @param resourceLoader The resources loader of the game.
   */
  constructor(resourceLoader: (typeof gdjs)["ResourceLoader"]) {
    this._resourceLoader = resourceLoader;
  }

  getResourceKinds() {
    return ["json", "tilemap", "tileset"];
  }

  /**
   * Request all the json resources to be preloaded (unless they are marked as not preloaded).
   *
   * Note that even if a JSON is already loaded, it will be reloaded (useful for hot-reloading,
   * as JSON files can have been modified without the editor knowing).
   */
  async loadResource(resourceName: string): Promise<void> {
    const resource = this._resourceLoader.getResource(resourceName);
    if (!resource) {
      logger.warn('Unable to find json for resource "' + resourceName + '".');
      return;
    }
    if (resource.disablePreload) {
      return;
    }

    try {
      await this.loadJson(resourceName);
    } catch (error) {
      logger.error(
        `Error while preloading json resource ${resource.name}:`,
        error,
      );
      throw error;
    }
  }

  private _getJsonResource = (resourceName: string): Resource | null => {
    const resource = this._resourceLoader.getResource(resourceName);
    return resource && this.getResourceKinds().includes(resource.kind)
      ? resource
      : null;
  };
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  async processResource(_resourceName: string): Promise<void> {
    // Do nothing because json are light enough to be parsed in background.
  }

  /**
   * Request the json file from the given resource name.
   * This method is asynchronous. When loaded, the `callback` is called with the error
   * (null if none) and the loaded json (a JS Object).
   *
   * @param resourceName The resource pointing to the json file to load.
   * @param callback The callback function called when json is loaded (or an error occurred).
   */
  async loadJson(resourceName: string): Promise<void> {
    const resource = this._getJsonResource(resourceName);
    if (!resource) {
      throw new Error(
        "Can't find resource with name: \"" +
          resourceName +
          '" (or is not a json resource).',
      );
    }

    // Don't fetch again an object that is already in memory
    if (this._loadedJsons.get(resource)) {
      return;
    }

    const json_file_name = resource.file.split(
      window.remote_replace.path.sep(),
    )[resource.file.split(window.remote_replace.path.sep()).length - 1];
    const json_name = json_file_name.substring(
      0,
      json_file_name.length - ".json".length,
    );

    // Cache the result
    this._loadedJsons.set(resource, await getJson(json_name));
  }

  /**
   * Check if the given json resource was loaded (preloaded or loaded with `loadJson`).
   * @param resourceName The name of the json resource.
   * @returns true if the content of the json resource is loaded. false otherwise.
   */
  isJsonLoaded(resourceName: string): boolean {
    return !!this._loadedJsons.getFromName(resourceName);
  }

  /**
   * Get the object for the given resource that is already loaded (preloaded or loaded with `loadJson`).
   * If the resource is not loaded, `null` will be returned.
   *
   * @param resourceName The name of the json resource.
   * @returns the content of the json resource, if loaded. `null` otherwise.
   */
  getLoadedJson(resourceName: string): object | null {
    return this._loadedJsons.getFromName(resourceName) ?? null;
  }

  /**
   * To be called when the game is disposed.
   * Clear the JSONs loaded in this manager.
   */
  dispose(): void {
    this._loadedJsons.clear();
    this._callbacks.clear();
  }

  unloadResource(resourceData: Resource): void {
    const loadedJson = this._loadedJsons.getFromName(resourceData.name);
    if (loadedJson) {
      this._loadedJsons.delete(resourceData);
    }

    const callback = this._callbacks.getFromName(resourceData.name);
    if (callback) {
      this._callbacks.delete(resourceData);
    }
  }
};
