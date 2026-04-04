declare namespace gdjs {
    /**
     * Load GLB files (using `Three.js`), using the "model3D" resources
     * registered in the game resources.
     * @category Resources > 3D Models
     */
    class Model3DManager implements gdjs.ResourceManager {
        /**
         * Map associating a resource name to the loaded Three.js model.
         */
        private _loadedThreeModels;
        private _downloadedArrayBuffers;
        _resourceLoader: gdjs.ResourceLoader;
        _loader: THREE_ADDONS.GLTFLoader | null;
        _dracoLoader: THREE_ADDONS.DRACOLoader | null;
        _invalidModel: THREE_ADDONS.GLTF;
        /**
         * @param resourceLoader The resources loader of the game.
         */
        constructor(resourceLoader: gdjs.ResourceLoader);
        getResourceKinds(): ResourceKind[];
        processResource(resourceName: string): Promise<void>;
        loadResource(resourceName: string): Promise<void>;
        /**
         * Return a 3D model.
         *
         * Caller should not modify the object but clone it.
         *
         * @param resourceName The name of the json resource.
         * @returns a 3D model if it exists.
         */
        getModel(resourceName: string): THREE_ADDONS.GLTF;
        /**
         * To be called when the game is disposed.
         * Clear the models, resources loaded and destroy 3D models loaders in this manager.
         */
        dispose(): void;
        unloadResource(resourceData: ResourceData): void;
    }
}
