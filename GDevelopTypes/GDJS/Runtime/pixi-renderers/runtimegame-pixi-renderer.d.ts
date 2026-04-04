declare namespace gdjs {
    /**
     * The renderer for a gdjs.RuntimeGame using Pixi.js.
     * @category Renderers > Game
     */
    class RuntimeGamePixiRenderer {
        _game: gdjs.RuntimeGame;
        _isFullPage: boolean;
        _isFullscreen: boolean;
        _forceFullscreen: any;
        private _pointerLockReasons;
        _pixiRenderer: PIXI.Renderer | null;
        private _threeRenderer;
        private _gameCanvas;
        private _domElementsContainer;
        _canvasWidth: float;
        _canvasHeight: float;
        _keepRatio: boolean;
        _marginLeft: any;
        _marginTop: any;
        _marginRight: any;
        _marginBottom: any;
        _nextFrameId: integer;
        _wasDisposed: boolean;
        /**
         * @param game The game that is being rendered
         * @param forceFullscreen If fullscreen should be always activated
         */
        constructor(game: gdjs.RuntimeGame, forceFullscreen: boolean);
        /**
         * Create the canvas on which the game will be rendered, inside the specified DOM element, and
         * setup the rendering of the game.
         * If you want to use your own canvas, use `initializeRenderers` and `initializeCanvas` instead.
         *
         * @param parentElement The parent element to which the canvas will be added.
         */
        createStandardCanvas(parentElement: HTMLElement): void;
        /**
         * Set up the rendering of the game for the given canvas.
         *
         * In most cases, you can use `createStandardCanvas` instead to initialize the game.
         */
        initializeRenderers(gameCanvas: HTMLCanvasElement): void;
        /**
         * Set up the game canvas so that it covers the size required by the game
         * and has a container for DOM elements required by the game.
         */
        initializeCanvas(gameCanvas: HTMLCanvasElement): void;
        static getWindowInnerWidth(): number;
        static getWindowInnerHeight(): number;
        /**
         * Update the game renderer size according to the "game resolution".
         * Called when game resolution changes.
         *
         * Note that if the canvas is fullscreen, it won't be resized, but when going back to
         * non fullscreen mode, the requested size will be used.
         */
        updateRendererSize(): void;
        /**
         * Set the proper screen orientation from the project properties.
         */
        private _setupOrientation;
        /**
         * Resize the renderer (the "game resolution") and the canvas (which can be larger
         * or smaller to fill the page, with optional margins).
         *
         */
        private _resizeCanvas;
        /**
         * Set if the aspect ratio must be kept when the game canvas is resized to fill
         * the page.
         */
        keepAspectRatio(enable: any): void;
        /**
         * Change the margin that must be preserved around the game canvas.
         */
        setMargins(top: any, right: any, bottom: any, left: any): void;
        /**
         * Update the window size, if possible.
         * @param width The new width, in pixels.
         * @param height The new height, in pixels.
         */
        setWindowSize(width: float, height: float): void;
        /**
         * Center the window on screen.
         */
        centerWindow(): void;
        /**
         * De/activate fullscreen for the game.
         */
        setFullScreen(enable: any): void;
        /**
         * Checks if the game is in full screen.
         */
        isFullScreen(): boolean;
        /**
         * Request pointer lock for the game.
         * Mouse cursor will disappear and its movement will be captured by the game,
         * and can be read with the input manager of the game.
         *
         * @param reason The reason (arbitrary string) for the pointer lock request.
         * This allows multiple parts of the game to request pointer lock for different reasons.
         * @returns true if the request was initiated, false otherwise.
         */
        requestPointerLock(reason: string): boolean;
        /**
         * Exit pointer lock.
         * Pointer lock will be dismissed if no other part of the game is requesting it.
         *
         * @param reason The reason (arbitrary string) to dismiss.
         */
        exitPointerLock(reason: string): void;
        /**
         * Check if pointer is currently locked.
         *
         * @returns true if pointer is locked, false otherwise.
         */
        isPointerLocked(): boolean;
        /**
         * Convert a point from the canvas coordinates to the dom element container coordinates.
         *
         * @param canvasCoords The point in the canvas coordinates.
         * @param result The point to return.
         * @returns The point in the dom element container coordinates.
         */
        convertCanvasToDomElementContainerCoords(canvasCoords: FloatPoint, result: FloatPoint): FloatPoint;
        /**
         * Return the scale factor between the renderer height and the actual canvas height,
         * which is also the height of the container for DOM elements to be superimposed on top of it.
         *
         * Useful to scale font sizes of DOM elements so that they follow the size of the game.
         */
        getCanvasToDomElementContainerHeightScale(): float;
        /**
         * Translate an event position (mouse or touch) made on the canvas
         * on the page (or even outside the canvas) to game coordinates.
         */
        convertPageToGameCoords(pageX: float, pageY: float): number[];
        /**
         * Add the standard events handler.
         *
         * The game canvas must have been initialized before calling this.
         */
        bindStandardEvents(manager: gdjs.InputManager, window: Window, document: Document): void;
        setWindowTitle(title: any): void;
        getWindowTitle(): string;
        startGameLoop(fn: any): void;
        stopGameLoop(): void;
        getPIXIRenderer(): import("pixi.js").Renderer | null;
        /**
         * Get the Three.js renderer for the game - if any.
         */
        getThreeRenderer(): THREE.WebGLRenderer | null;
        /**
         * Get the DOM element used as a container for HTML elements to display
         * on top of the game.
         */
        getDomElementContainer(): HTMLDivElement | null;
        /**
         * Open the given URL in the system browser (or a new tab)
         */
        openURL(url: string): void;
        /**
         * Close the game, if applicable.
         */
        stopGame(): void;
        /**
         * Dispose the renderers (PixiJS and/or Three.js) as well as DOM elements
         * used for the game (the canvas, if specified, and the additional DOM container
         * created on top of it to allow display HTML elements, for example for text inputs).
         *
         * @param removeCanvas If true, the canvas will be removed from the DOM.
         */
        dispose(removeCanvas?: boolean): void;
        /**
         * Get the canvas DOM element.
         */
        getCanvas(): HTMLCanvasElement | null;
        /**
         * Check if the device supports WebGL.
         * @returns true if WebGL is supported
         */
        isWebGLSupported(): boolean;
        /**
         * Get the electron module, if running as a electron renderer process.
         */
        getElectron(): any;
        /**
         * Helper to get the electron remote module, if running on Electron.
         * Note that is not guaranteed to be supported in the future - avoid if possible.
         */
        getElectronRemote: () => any;
        getGame(): RuntimeGame;
        private _throwIfDisposed;
    }
    /** @category Renderers > Game */
    type RuntimeGameRenderer = RuntimeGamePixiRenderer;
    /** @category Renderers > Game */
    const RuntimeGameRenderer: typeof RuntimeGamePixiRenderer;
}
