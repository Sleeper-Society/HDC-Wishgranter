import type { Resource } from "./gdjs.ts";

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
      await new Promise((resolve, reject) => {
        this.loadJson(resourceName, (error, content) => {
          if (error) {
            reject(error);
          }
          resolve(content);
        });
      });
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
  loadJson(resourceName: string, callback: JsonManagerRequestCallback): void {
    const resource = this._getJsonResource(resourceName);
    if (!resource) {
      callback(
        new Error(
          "Can't find resource with name: \"" +
            resourceName +
            '" (or is not a json resource).',
        ),
        null,
      );
      return;
    }

    // Don't fetch again an object that is already in memory
    if (this._loadedJsons.get(resource)) {
      callback(null, this._loadedJsons.get(resource));
      return;
    }
    // Don't fetch again an object that is already being fetched.
    {
      const callbacks = this._callbacks.get(resource);
      if (callbacks) {
        callbacks.push(callback);
        return;
      } else {
        this._callbacks.set(resource, [callback]);
      }
    }

    //eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    const xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.withCredentials = this._resourceLoader.checkIfCredentialsRequired(
      resource.file,
    );
    xhr.open("GET", this._resourceLoader.getFullUrl(resource.file));
    xhr.onload = function () {
      const callbacks = that._callbacks.get(resource);
      if (!callbacks) {
        return;
      }
      if (xhr.status !== 200) {
        for (const callback of callbacks) {
          callback(
            new Error(
              `HTTP error: ${xhr.status.toString()}(" + xhr.statusText + ")`,
            ),
            null,
          );
        }
        that._callbacks.delete(resource);
        return;
      }

      // Cache the result
      that._loadedJsons.set(resource, xhr.response as object);
      for (const callback of callbacks) {
        callback(null, xhr.response as object);
      }
      that._callbacks.delete(resource);
    };
    xhr.onerror = function () {
      const callbacks = that._callbacks.get(resource);
      if (!callbacks) {
        return;
      }
      for (const callback of callbacks) {
        callback(new Error("Network error"), null);
      }
      that._callbacks.delete(resource);
    };
    xhr.onabort = function () {
      const callbacks = that._callbacks.get(resource);
      if (!callbacks) {
        return;
      }
      for (const callback of callbacks) {
        callback(new Error("Request aborted"), null);
      }
      that._callbacks.delete(resource);
    };
    xhr.send();
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
