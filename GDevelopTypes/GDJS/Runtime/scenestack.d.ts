declare namespace gdjs {
    interface PushSceneOptions {
        sceneName: string;
        externalLayoutName?: string;
        skipCreatingInstances?: boolean;
        getExcludedObjectNames?: (runtimeScene: RuntimeScene) => Set<string>;
        skipStoppingSoundsOnStartup?: boolean;
    }
    interface ReplaceSceneOptions extends PushSceneOptions {
        clear: boolean;
    }
    /**
     * Hold the stack of scenes ({@link gdjs.RuntimeScene}) being played.
     * @category Core Engine > Scene Stack
     */
    export class SceneStack {
        _runtimeGame: gdjs.RuntimeGame;
        _stack: gdjs.RuntimeScene[];
        _wasFirstSceneLoaded: boolean;
        _isNextLayoutLoading: boolean;
        _sceneStackSyncDataToApply: SceneStackNetworkSyncData | null;
        _wasDisposed: boolean;
        /**
         * @param runtimeGame The runtime game that is using the scene stack
         */
        constructor(runtimeGame: gdjs.RuntimeGame);
        /**
         * Called by the RuntimeGame when the game resolution is changed.
         * Useful to notify scene and layers that resolution is changed, as they
         * might be caching it.
         */
        onGameResolutionResized(): void;
        step(elapsedTime: float): boolean;
        renderWithoutStep(): boolean;
        pop(popCount?: number): void;
        /**
         * Pause the scene currently being played and start the new scene that is specified in `options.sceneName`.
         * If `options.externalLayoutName` is set, also instantiate the objects from this external layout.
         *
         * @param options Contains the scene name and optional external layout name to instantiate.
         * @param deprecatedExternalLayoutName Deprecated, use `options.externalLayoutName` instead.
         */
        push(options: PushSceneOptions | string, deprecatedExternalLayoutName?: string): gdjs.RuntimeScene | null;
        private _loadNewScene;
        /**
         * Start the scene in `options.sceneName`, replacing the one currently being played.
         * If `options.clear` is set to true, all running scenes are also removed from the stack of scenes.
         *
         * @param options Contains the scene name and optional external layout name to instantiate.
         * @param deprecatedClear Deprecated, use `options.clear` instead.
         */
        replace(options: ReplaceSceneOptions | string, deprecatedClear?: boolean): gdjs.RuntimeScene | null;
        /**
         * Return the current gdjs.RuntimeScene being played, or null if none is run.
         */
        getCurrentScene(): gdjs.RuntimeScene | null;
        /**
         * Return true if a scene was loaded, false otherwise (i.e: game not yet started).
         */
        wasFirstSceneLoaded(): boolean;
        getAllScenes(): Array<gdjs.RuntimeScene>;
        getAllSceneNames(): Array<string>;
        getNetworkSyncData(syncOptions: GetNetworkSyncDataOptions): SceneStackNetworkSyncData | null;
        updateFromNetworkSyncData(sceneStackSyncData: SceneStackNetworkSyncData): void;
        applyUpdateFromNetworkSyncDataIfAny(options?: UpdateFromNetworkSyncDataOptions): boolean;
        /**
         * Unload all the scenes and clear the stack.
         */
        dispose(): void;
        private _unloadSceneAndPossiblyResources;
        private _throwIfDisposed;
    }
    export {};
}
