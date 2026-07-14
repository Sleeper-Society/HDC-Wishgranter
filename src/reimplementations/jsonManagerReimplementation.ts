import type { Resource } from "../wishgranter.jsons.js";
import { getJsonFromMods } from "../fileFactory.ts";

const logger = new gdjs.Logger("JSON Manager");

type JsonManagerRequestCallback = (
    error: Error | null,
    content: object | null,
) => void;

gdjs.JsonManager = class JsonManager {
    _resourceLoader: (typeof gdjs)["ResourceLoader"];

    _loadedJsons = new gdjs.ResourceCache<object>();
    _callbacks = new gdjs.ResourceCache<JsonManagerRequestCallback[]>();

    constructor(resourceLoader: (typeof gdjs)["ResourceLoader"]) {
        this._resourceLoader = resourceLoader;
    }

    getResourceKinds() {
        return ["json", "tilemap", "tileset"];
    }

    loadResource(resourceName: string) {
        const resource = this._resourceLoader.getResource(resourceName);
        if (!resource) {
            logger.warn(
                'Unable to find json for resource "' + resourceName + '".',
            );
            return;
        }
        if (resource.disablePreload) {
            return;
        }

        try {
            this.loadJson(resourceName);
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
        return resource && this.getResourceKinds().includes(resource.kind) ?
                resource
            :   null;
    };
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    async processResource(_resourceName: string): Promise<void> {
        // Do nothing because json are light enough to be parsed in background.
    }

    loadJson(resourceName: string) {
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
        )[
            resource.file.split(window.remote_replace.path.sep()).length - 1
        ] as `${string}.json`;

        // Cache the result
        this._loadedJsons.set(resource, getJsonFromMods(json_file_name));
    }

    isJsonLoaded(resourceName: string): boolean {
        return !!this._loadedJsons.getFromName(resourceName);
    }

    getLoadedJson(resourceName: string): object | null {
        return this._loadedJsons.getFromName(resourceName) ?? null;
    }

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
