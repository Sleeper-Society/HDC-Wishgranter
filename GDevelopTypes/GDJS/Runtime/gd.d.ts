/**
 * The `gdjs` namespace contains all classes and objects of the game engine.
 * @namespace gdjs
 */
declare namespace gdjs {
    /**
     * Contains functions used by events (this is a convention only, functions can actually
     * be anywhere).
     * @memberOf gdjs
     * @category Core Engine > Events interfacing
     */
    export namespace evtTools {
    }
    /** @internal */
    export const objectsTypes: Hashtable<typeof RuntimeObject>;
    /** @internal */
    export const behaviorsTypes: Hashtable<typeof RuntimeBehavior>;
    type RuntimeSceneCallback = (runtimeScene: gdjs.RuntimeScene) => void;
    type RuntimeSceneRuntimeObjectCallback = (instanceContainer: gdjs.RuntimeInstanceContainer, runtimeObject: gdjs.RuntimeObject) => void;
    type RuntimeSceneGetSyncDataCallback = (runtimeScene: gdjs.RuntimeScene, currentSyncData: LayoutNetworkSyncData, syncOptions: GetNetworkSyncDataOptions) => void;
    type RuntimeSceneUpdateFromSyncData = (runtimeScene: gdjs.RuntimeScene, receivedSyncData: LayoutNetworkSyncData, options: UpdateFromNetworkSyncDataOptions) => void;
    /** @internal */
    export const callbacksFirstRuntimeSceneLoaded: Array<RuntimeSceneCallback>;
    /** @internal */
    export const callbacksRuntimeSceneLoaded: Array<RuntimeSceneCallback>;
    /** @internal */
    export const callbacksRuntimeScenePreEvents: Array<RuntimeSceneCallback>;
    /** @internal */
    export const callbacksRuntimeScenePostEvents: Array<RuntimeSceneCallback>;
    /** @internal */
    export const callbacksRuntimeScenePaused: Array<RuntimeSceneCallback>;
    /** @internal */
    export const callbacksRuntimeSceneResumed: Array<RuntimeSceneCallback>;
    /** @internal */
    export const callbacksRuntimeSceneUnloading: Array<RuntimeSceneCallback>;
    /** @internal */
    export const callbacksRuntimeSceneUnloaded: Array<RuntimeSceneCallback>;
    /** @internal */
    export const callbacksObjectDeletedFromScene: Array<RuntimeSceneRuntimeObjectCallback>;
    /** @internal */
    export const callbacksRuntimeSceneGetSyncData: Array<RuntimeSceneGetSyncDataCallback>;
    /** @internal */
    export const callbacksRuntimeSceneUpdateFromSyncData: Array<RuntimeSceneUpdateFromSyncData>;
    /**
     * Base64 encoded logo of GDevelop for the splash screen.
     * @internal
     */
    export let gdevelopLogo: string;
    /**
     * Convert a RGB object to a Hex string.
     *
     * No "#" or "0x" are added.
     * @param r Red
     * @param g Green
     * @param b Blue
     * @category Utils > Color
     */
    export const rgbToHex: (r: integer, g: integer, b: integer) => string;
    /**
     * Convert a Hex string (#124FE4) to an RGB color array [r, g, b], where each component is in the range [0, 255].
     *
     * @param {string} hex Color hexadecimal
     * @category Utils > Color
     */
    export const hexToRGBColor: (hexString: string) => [number, number, number];
    /**
     * Convert a shorthand Hex string (#1F4) to an RGB color array [r, g, b], where each component is in the range [0, 255].
     *
     * @param {string} hex Color hexadecimal
     * @category Utils > Color
     */
    export const shorthandHexToRGBColor: (hexString: string) => [number, number, number];
    /**
     * Convert a RGB string ("rrr;ggg;bbb") or a Hex string ("#rrggbb") to a RGB color array ([r,g,b] with each component going from 0 to 255).
     * @param value The color as a RGB string or Hex string
     * @category Utils > Color
     */
    export const rgbOrHexToRGBColor: (value: string) => [number, number, number];
    /**
     * Convert a RGB string ("rrr;ggg;bbb") or a Hex string ("#rrggbb") to a RGB color number.
     * @param rgbOrHexString The color as a RGB string or Hex string
     * @category Utils > Color
     */
    export const rgbOrHexStringToNumber: (rgbOrHexString: string) => integer;
    /**
     * Convert a RGB object to a Hex number.
     * @param r Red
     * @param g Green
     * @param b Blue
     * @category Utils > Color
     */
    export const rgbToHexNumber: (r: float, g: float, b: float) => integer;
    /**
     * Convert a Hex number to a RGB color object ({r,g,b,a} with each component going from 0 to 255 and alpha set to 255).
     * @param hex Hex color
     * @category Utils > Color
     */
    export const hexNumberToRGB: (hexNumber: number) => {
        r: integer;
        g: integer;
        b: integer;
        a: integer;
    };
    /**
     * Convert a Hex number to a RGB color array([r,g,b] with each component going from 0 to 255).
     * @param hex Hex color
     * @category Utils > Color
     */
    export const hexNumberToRGBArray: (hexNumber: number) => [integer, integer, integer];
    /** @internal */
    export const extractHexString: (str: string) => string | null;
    /** @internal */
    export const extractShorthandHexString: (str: string) => string | null;
    /**
     * Get a random integer between 0 and max.
     * @param max The maximum value (inclusive).
     * @category Utils > Math
     */
    export const random: (max: float) => float;
    /**
     * Get a random integer between min and max.
     * @param min The minimum value (inclusive).
     * @param max The maximum value (inclusive).
     * @category Utils > Math
     */
    export const randomInRange: (min: float, max: float) => float;
    /**
     * Get a random float in the range 0 to less than max (inclusive of 0, but not max).
     * @param max The maximum value (exclusive).
     * @category Utils > Math
     */
    export const randomFloat: (max: float) => float;
    /**
     * Get a random float between min and max
     * @param min The minimum value (inclusive).
     * @param max The maximum value (exclusive).
     * @returns {number}
     * @category Utils > Math
     */
    export const randomFloatInRange: (min: float, max: float) => float;
    /**
     * Get a random number between min and max in steps
     * @param min The minimum value (inclusive).
     * @param max The maximum value (inclusive).
     * @param step The interval between each value.
     * @returns {number}
     * @category Utils > Math
     */
    export const randomWithStep: (min: float, max: float, step: float) => float;
    /**
     * Convert an angle in degrees to radians.
     * @param angleInDegrees The angle in degrees.
     * @category Utils > Math
     */
    export const toRad: (angleInDegrees: float) => float;
    /**
     * Convert an angle in radians to degrees.
     * @param angleInRadians The angle in radians.
     * @category Utils > Math
     */
    export const toDegrees: (angleInRadians: float) => float;
    /**
     * Register a runtime object (class extending {@link gdjs.RuntimeObject}) that can be used in a scene.
     *
     * The name of the type of the object must be complete, with the namespace if any. For
     * example, if you are providing a Text object in the TextObject extension, the full name
     * of the type of the object is "TextObject::Text".
     *
     * @param objectTypeName The name of the type of the Object.
     * @param Ctor The constructor of the Object.
     * @category Core Engine > Object
     */
    export const registerObject: (objectTypeName: string, Ctor: typeof gdjs.RuntimeObject) => void;
    /**
     * Register a runtime behavior (class extending {@link gdjs.RuntimeBehavior}) that can be used by a
     * {@link gdjs.RuntimeObject}.
     *
     * The type of the behavior must be complete, with the namespace of the extension. For
     * example, if you are providing a Draggable behavior in the DraggableBehavior extension,
     * the full name of the type of the behavior is "DraggableBehavior::Draggable".
     *
     * @param behaviorTypeName The name of the type of the behavior.
     * @param Ctor The constructor of the Object.
     * @category Core Engine > Behavior
     */
    export const registerBehavior: (behaviorTypeName: string, Ctor: typeof gdjs.RuntimeBehavior) => void;
    /**
     * Register a function to be called when the first {@link gdjs.RuntimeScene} is loaded, after
     * resources loading is done. This can be considered as the "start of the game".
     *
     * @param callback The function to be called.
     * @category Core Engine > Scene
     */
    export const registerFirstRuntimeSceneLoadedCallback: (callback: RuntimeSceneCallback) => void;
    /**
     * Register a function to be called when a scene is loaded.
     * @param callback The function to be called.
     * @category Core Engine > Scene
     */
    export const registerRuntimeSceneLoadedCallback: (callback: RuntimeSceneCallback) => void;
    /**
     * Register a function to be called each time a scene is stepped (i.e: at every frame),
     * before events are run.
     *
     * @see {@link gdjs.registerRuntimeScenePostEventsCallback}
     * @param callback The function to be called.
     * @category Core Engine > Scene
     */
    export const registerRuntimeScenePreEventsCallback: (callback: RuntimeSceneCallback) => void;
    /**
     * Register a function to be called each time a scene is stepped (i.e: at every frame),
     * after events are run and before rendering.
     *
     * This is the recommended way to synchronize state changes with GDevelop's game loop,
     * rather than using browser APIs like `requestAnimationFrame`. The game engine owns
     * the game loop and controls the order of execution, so browser APIs may not sync
     * reliably with frame timing.
     *
     * ## Use case: Implementing trigger-like conditions
     *
     * When creating conditions that should act as "triggers" (true for one frame, then
     * automatically false), use this callback to reset flags at frame end. This ensures
     * the flag will:
     * 1. Remain true throughout the current frame (so conditions can detect it)
     * 2. Be reset to false before the next frame begins
     *
     * ### Why this works reliably
     *
     * JavaScript is single-threaded, and asynchronous operations (promises, setTimeout,
     * etc.) only execute between frames, never during frame execution. This means:
     * - A frame runs completely (behaviors update → events run → this callback → render)
     * - Async operations (like Promise resolutions) run after the frame completes
     * - If an async operation sets a flag to true, it stays true until this callback
     *   resets it at the end of the next frame
     *
     * ### Example usage
     * ```js
     * // In your extension initialization. Only do this once.
     * gdjs.registerRuntimeScenePostEventsCallback((runtimeScene) => {
     *   // Reset trigger flags after events have been processed
     *   myExtension._dataRequestCompleted = false;
     * });
     *
     * // When some async operation completes (probably in an action or somewhere else):
     * doSomething().then((data) => {
     *   myExtension._dataRequestCompleted = true; // Will be true for one frame
     * });
     *
     * // or using await:
     * const data = await doSomething();
     * myExtension._dataRequestCompleted = true; // Will be true for one frame
     * ```
     *
     * @param callback The function to be called after events and before rendering each frame.
     *                 Receives the RuntimeScene as parameter.
     * @category Core Engine > Scene
     */
    export const registerRuntimeScenePostEventsCallback: (callback: RuntimeSceneCallback) => void;
    /**
     * Register a function to be called when a scene is paused.
     * @param callback The function to be called.
     * @category Core Engine > Scene
     */
    export const registerRuntimeScenePausedCallback: (callback: RuntimeSceneCallback) => void;
    /**
     * Register a function to be called when a scene is resumed.
     * @param callback The function to be called.
     * @category Core Engine > Scene
     */
    export const registerRuntimeSceneResumedCallback: (callback: RuntimeSceneCallback) => void;
    /**
     * Register a function to be called when a scene unload started. This is
     * before the object deletion and renderer destruction. It is safe to
     * manipulate these. It is **not** safe to release resources as other
     * callbacks might do operations on objects or the scene.
     *
     * @param callback The function to be called.
     * @category Core Engine > Scene
     */
    export const registerRuntimeSceneUnloadingCallback: (callback: RuntimeSceneCallback) => void;
    /**
     * Register a function to be called when a scene is unloaded. The objects
     * and renderer are now destroyed - it is **not** safe to do anything apart
     * from releasing resources.
     *
     * @param callback The function to be called.
     * @category Core Engine > Scene
     */
    export const registerRuntimeSceneUnloadedCallback: (callback: RuntimeSceneCallback) => void;
    /**
     * Register a function to be called when an object is deleted from a scene.
     * @param callback The function to be called.
     * @category Core Engine > Object
     */
    export const registerObjectDeletedFromSceneCallback: (callback: RuntimeSceneRuntimeObjectCallback) => void;
    /**
     * Register a function to be called each time a scene is getting its sync
     * data retrieved (via getNetworkSyncData).
     * @param callback The function to be called.
     * @category Core Engine > Scene
     */
    export const registerRuntimeSceneGetSyncDataCallback: (callback: RuntimeSceneGetSyncDataCallback) => void;
    /**
     * Register a function to be called each time a scene is getting its sync
     * data updated (via updateFromNetworkSyncData).
     * @param callback The function to be called.
     * @category Core Engine > Scene
     */
    export const registerRuntimeSceneUpdateFromSyncDataCallback: (callback: RuntimeSceneUpdateFromSyncData) => void;
    /**
     * Unregister a callback.
     * This should not be used apart from the code generated from extensions
     * events functions, to handle hot-reloading.
     * In any other case, a callback should be registered once, and only once.
     *
     * @internal
     */
    export const _unregisterCallback: (callback: unknown) => void;
    /**
     * Keep this function until we're sure now client is using it anymore.
     * @deprecated
     * @private
     */
    export const registerGlobalCallbacks: () => void;
    /**
     * Get the constructor of an object.
     *
     * @param name The name of the type of the object.
     * @category Core Engine > Object
     */
    export const getObjectConstructor: (name: string) => typeof gdjs.RuntimeObject;
    /**
     * Get the constructor of a behavior.
     *
     * @param name The name of the type of the behavior.
     * @category Core Engine > Behavior
     */
    export const getBehaviorConstructor: (name: string) => typeof gdjs.RuntimeBehavior;
    /**
     * Create a static array that won't need a new allocation each time it's used.
     * @param owner The owner of the Array.
     * @category Utils > JavaScript
     */
    export const staticArray: (owner: any) => Array<any>;
    /**
     * Create a second static array that won't need a new allocation each time it's used.
     * @param owner The owner of the Array.
     * @category Utils > JavaScript
     */
    export const staticArray2: (owner: any) => Array<any>;
    /**
     * Create a static object that won't need a new allocation each time it's used.
     * @param owner The owner of the Array.
     * @category Utils > JavaScript
     */
    export const staticObject: (owner: any) => Object;
    /**
     * Return a new array of objects that is the concatenation of all the objects passed
     * as parameters.
     * @param objectsLists
     * @returns {Array}
     * @category Utils > JavaScript
     */
    export const objectsListsToArray: (objectsLists: Hashtable<RuntimeObject>) => Array<RuntimeObject>;
    /**
     * Copy the element for the first array into the second array, so that
     * both array contains the same elements.
     * @param src The source array
     * @param dst The destination array
     * @category Utils > JavaScript
     */
    export const copyArray: <T>(src: Array<T>, dst: Array<T>) => void;
    interface MakeUUID {
        (): string;
        hex?: string[];
    }
    /**
     * Generate a UUID v4.
     * @returns The generated UUID.
     * @category Utils > JavaScript
     */
    export const makeUuid: MakeUUID;
    /**
     * See https://floating-point-gui.de/errors/comparison/
     * @param a
     * @param b
     * @param epsilon the relative margin error
     * @returns true when a and b are within a relative margin error.
     * @category Utils > JavaScript
     */
    export const nearlyEqual: (a: float, b: float, epsilon: float) => boolean;
    /**
     * Register a promise which will be resolved when a third party library has
     * finished loading (and is required to load before launching the game).
     *
     * This method must be called by any library that loads asynchronously.
     * @category Core Engine > Game
     */
    export const registerAsynchronouslyLoadingLibraryPromise: (promise: Promise<any>) => void;
    /**
     * @returns a promise resolved when all all third party libraries, which need
     * to be loaded before the game startup, are loaded. If a library fails
     * loading, this will be rejected.
     * @internal
     */
    export const getAllAsynchronouslyLoadingLibraryPromise: () => Promise<any[]>;
    export {};
}
