declare namespace gdjs {
    type PromiseError<T> = {
        item: T;
        error: Error;
    };
    type PromisePoolOutput<T, U> = {
        results: Array<U>;
        errors: Array<PromiseError<T>>;
    };
    /**
     * Pre-load resources of any kind needed for a game or a scene.
     * @category Resources
     */
    export class ResourceLoader {
        static maxForegroundConcurrency: number;
        static maxBackgroundConcurrency: number;
        static maxAttempt: number;
        _runtimeGame: RuntimeGame;
        /**
         * All the resource of a game by resource name.
         */
        private _resources;
        /**
         * Resources needed for any scene. Typically, they are resources from
         * global objects.
         */
        private _globalResources;
        /**
         * Resources and the loading state of each scene, indexed by scene name.
         */
        private _sceneLoadingStates;
        /**
         * A queue of scenes whose resources are still to be pre-loaded.
         */
        private _sceneToLoadQueue;
        /**
         * The resource managers that actually download and remember downloaded
         * content.
         */
        _resourceManagersMap: Map<ResourceKind, ResourceManager>;
        private _imageManager;
        private _soundManager;
        private _fontManager;
        private _jsonManager;
        private _model3DManager;
        private _bitmapFontManager;
        private _spineAtlasManager;
        private _spineManager;
        private _svgManager;
        /**
         * The name of the scene for which resources are currently being loaded.
         */
        private currentLoadingSceneName;
        /**
         * The progress, between 0 and 1, of the loading of the resource, for the
         * scene that is being loaded (see `currentLoadingSceneName`).
         */
        private currentSceneLoadingProgress;
        /**
         * It's set to `true` during intermediary loading screen to use a greater
         * concurrency as the game is paused and doesn't need bandwidth (for video
         * or music streaming or online multiplayer).
         */
        private _isLoadingInForeground;
        /**
         * @param runtimeGame The game.
         * @param resourceDataArray The resources data of the game.
         * @param globalResources The resources needed for any scene.
         * @param layoutDataArray The resources used by each scene.
         */
        constructor(runtimeGame: RuntimeGame, resourceDataArray: ResourceData[], globalResources: Array<string>, layoutDataArray: Array<LayoutData>);
        /**
         * @returns the runtime game instance.
         */
        getRuntimeGame(): RuntimeGame;
        /**
         * Update the resources data of the game. Useful for hot-reloading, should
         * not be used otherwise.
         */
        setResources(resourceDataArray: ResourceData[], globalResources: Array<string>, layoutDataArray: Array<LayoutData>): void;
        loadAllResources(onProgress: (loadingCount: integer, totalCount: integer) => void): Promise<void>;
        loadResources(resourceNames: Array<string>, onProgress: (loadingCount: integer, totalCount: integer) => void): Promise<void>;
        /**
         * Load the resources that are needed to launch the first scene.
         */
        loadGlobalAndFirstSceneResources(firstSceneName: string, onProgress: (count: number, total: number) => void): Promise<void>;
        /**
         * Load each scene in order.
         *
         * This is done in background to try to avoid loading screens when changing
         * scenes.
         */
        loadAllSceneInBackground(): Promise<void>;
        private _doLoadSceneResources;
        private _loadResource;
        /**
         * Load and process a scene that is needed right away.
         *
         * The renderer will show a loading screen while its done.
         */
        loadAndProcessSceneResources(sceneName: string, onProgress?: (count: number, total: number) => Promise<void>): Promise<void>;
        /**
         * Load a scene resources without parsing them.
         *
         * When another scene resources are loading in background, it waits for
         * all its resources to be loaded before loading resources of the given
         * scene.
         */
        loadSceneResources(sceneName: string, onProgress?: (count: number, total: number) => void): Promise<void>;
        /**
         * To be called when the game is disposed.
         * Dispose all the resource managers.
         */
        dispose(): void;
        /**
         * To be called when a scene is unloaded.
         */
        unloadSceneResources({ unloadedSceneName, newSceneName, }: {
            unloadedSceneName: string;
            newSceneName: string | null;
        }): void;
        /**
         * To be called when hot-reloading resources.
         */
        unloadAllResources(): void;
        /**
         * Put a given scene at the end of the queue.
         *
         * When the scene that is currently loading in background is done,
         * this scene will be the next to be loaded.
         */
        private _prioritizeScene;
        private _processResource;
        getSceneLoadingProgress(sceneName: string): float;
        /**
         * @returns true when all the resources of the given scene are loaded
         * (but maybe not parsed).
         */
        areSceneAssetsLoaded(sceneName: string): boolean;
        /**
         * @returns true when all the resources of the given scene are loaded and
         * parsed.
         */
        areSceneAssetsReady(sceneName: string): boolean;
        getResource(resourceName: string): ResourceData | null;
        /**
         * Complete the given URL with any specific parameter required to access
         * the resource (this can be for example a token needed to access the resource).
         */
        getFullUrl(url: string): string;
        /**
         * Return true if the specified URL must be loaded with cookies ("credentials")
         * sent to grant access to them.
         */
        checkIfCredentialsRequired(url: string): boolean;
        /**
         * Get the gdjs.SoundManager of the RuntimeGame.
         * @return The sound manager.
         */
        getSoundManager(): gdjs.HowlerSoundManager;
        /**
         * Get the gdjs.ImageManager of the RuntimeGame.
         * @return The image manager.
         */
        getImageManager(): gdjs.PixiImageManager;
        /**
         * Get the gdjs.FontManager of the RuntimeGame.
         * @return The font manager.
         */
        getFontManager(): gdjs.FontFaceObserverFontManager;
        /**
         * Get the gdjs.BitmapFontManager of the RuntimeGame.
         * @return The bitmap font manager.
         */
        getBitmapFontManager(): gdjs.BitmapFontManager;
        /**
         * Get the JSON manager of the game, used to load JSON from game
         * resources.
         * @return The json manager for the game
         */
        getJsonManager(): gdjs.JsonManager;
        /**
         * Get the 3D model manager of the game, used to load 3D model from game
         * resources.
         * @return The 3D model manager for the game
         */
        getModel3DManager(): gdjs.Model3DManager;
        /**
         * Get the Spine manager of the game, used to load and construct spine skeletons from game
         * resources.
         * @return The Spine manager for the game
         */
        getSpineManager(): gdjs.SpineManager | null;
        /**
         * Get the Spine Atlas manager of the game, used to load atlases from game
         * resources.
         * @return The Spine Atlas manager for the game
         */
        getSpineAtlasManager(): gdjs.SpineAtlasManager | null;
        injectMockResourceManagerForTesting(resourceKind: ResourceKind, resourceManager: ResourceManager): void;
        /**
         * Get the map of resources that are only used in the scene that is being unloaded,
         * and that are not used in any other loaded scene (or the scene that is coming next).
         */
        private _getResourcesByKindOnlyUsedInUnloadedScene;
        static processWithPromisePool<T, U>(items: Array<T>, maxConcurrency: number, asyncFunction: (item: T) => Promise<U>): Promise<PromisePoolOutput<T, U>>;
        static processAndRetryIfNeededWithPromisePool<T, U>(items: Array<T>, maxConcurrency: number, maxAttempt: number, asyncFunction: (item: T) => Promise<U>): Promise<PromisePoolOutput<T, U>>;
    }
    export {};
}
