declare namespace gdjs {
    /**
     * Store input made on a canvas: mouse position, key pressed
     * and touches states.
     * @category Core Engine > Input
     */
    class InputManager {
        static MOUSE_LEFT_BUTTON: integer;
        static MOUSE_RIGHT_BUTTON: integer;
        static MOUSE_MIDDLE_BUTTON: integer;
        static MOUSE_BACK_BUTTON: integer;
        static MOUSE_FORWARD_BUTTON: integer;
        static MOUSE_TOUCH_ID: integer;
        /**
         * Holds the raw keyCodes of the keys which only have left/right
         * variants and should default to their left variant values
         * if location is not specified.
         */
        private static _DEFAULT_LEFT_VARIANT_KEYS;
        private _pressedKeys;
        private _justPressedKeys;
        private _releasedKeys;
        private _lastPressedKey;
        private _pressedMouseButtons;
        private _releasedMouseButtons;
        /**
         * The cursor X position (moved by mouse and touch events).
         */
        private _cursorX;
        /**
         * The cursor Y position (moved by mouse and touch events).
         */
        private _cursorY;
        /**
         * The mouse X position (only moved by mouse events).
         */
        private _mouseX;
        /**
         * The mouse Y position (only moved by mouse events).
         */
        private _mouseY;
        private _isMouseInsideCanvas;
        private _wheelDeltaX;
        private _wheelDeltaY;
        private _wheelDeltaZ;
        /**
         * The mouse movement X (only moved by mouse events).
         */
        private _mouseMovementX;
        /**
         * The mouse movement Y (only moved by mouse events).
         */
        private _mouseMovementY;
        private _touches;
        private _mouseOrTouches;
        private _startedTouches;
        private _endedTouches;
        private _touchSimulateMouse;
        /**
         * @deprecated
         */
        private _lastStartedTouchIndex;
        /**
         * @deprecated
         */
        private _lastEndedTouchIndex;
        constructor();
        /**
         * Returns the "location-aware" keyCode, given a raw keyCode
         * and location. The location corresponds to KeyboardEvent.location,
         * which should be 0 for standard keys, 1 for left keys,
         * 2 for right keys, and 3 for numpad keys.
         *
         * @param keyCode The raw key code
         * @param location The location
         */
        static getLocationAwareKeyCode(keyCode: number, location: number | null | undefined): integer;
        /**
         * Should be called whenever a key is pressed. The location corresponds to
         * KeyboardEvent.location, which should be 0 for standard keys, 1 for left keys,
         * 2 for right keys, and 3 for numpad keys.
         * @param keyCode The raw key code associated to the key press.
         * @param location The location of the event.
         */
        onKeyPressed(keyCode: number, location?: number): void;
        /**
         * Should be called whenever a key is released. The location corresponds to
         * KeyboardEvent.location, which should be 0 for standard keys, 1 for left keys,
         * 2 for right keys, and 3 for numpad keys.
         * @param keyCode The raw key code associated to the key release.
         * @param location The location of the event.
         */
        onKeyReleased(keyCode: number, location?: number): void;
        /**
         * Release all keys that are currently pressed.
         * Note: if you want to discard pressed keys without considering them as
         * released, check `clearAllPressedKeys` instead.
         */
        releaseAllPressedKeys(): void;
        /**
         * Clears all stored pressed keys without making the keys go through
         * the release state.
         * Note: prefer to use `releaseAllPressedKeys` instead, as it corresponds
         * to a normal key release.
         */
        clearAllPressedKeys(): void;
        /**
         * Return the location-aware code of the last key that was pressed.
         * @return The location-aware code of the last key pressed.
         */
        getLastPressedKey(): number;
        /**
         * Return true if the key corresponding to the location-aware keyCode is pressed
         * (either it was just pressed or is still held down).
         * @param locationAwareKeyCode The location-aware key code to be tested.
         */
        isKeyPressed(locationAwareKeyCode: number): boolean;
        /**
         * Return true if the key corresponding to the location-aware keyCode
         * was just pressed during the last frame.
         * @param locationAwareKeyCode The location-aware key code to be tested.
         */
        wasKeyJustPressed(locationAwareKeyCode: number): boolean;
        /**
         * Return true if the key corresponding to the location-aware keyCode was released during the last frame.
         * @param locationAwareKeyCode The location-aware key code to be tested.
         */
        wasKeyReleased(locationAwareKeyCode: number): boolean;
        /**
         * Return true if any key is pressed.
         * @return true if any key is pressed.
         */
        anyKeyPressed(): boolean;
        /**
         * Return true if any key is released.
         * @return true if any key is released.
         */
        anyKeyReleased(): boolean;
        exceptionallyGetAllJustPressedKeys(): number[];
        /**
         * Should be called when the mouse is moved.
         * Some browsers or environments may call this function multiple times during a single frame.
         *
         * Please note that the coordinates must be expressed relative to the view position.
         *
         * @param x The mouse new X position
         * @param y The mouse new Y position
         * @param options An object containing the mouse movement X and Y if available.
         */
        onMouseMove(x: float, y: float, options?: {
            movementX: float;
            movementY: float;
        }): void;
        _setCursorPosition(x: float, y: float): void;
        /**
         * Get the cursor X position.
         * The cursor is moved by mouse and touch events.
         *
         * @return the cursor X position, relative to the game view.
         */
        getCursorX(): float;
        /**
         * Get the cursor Y position.
         * The cursor is moved by mouse and touch events.
         *
         * @return the cursor Y position, relative to the game view.
         */
        getCursorY(): float;
        /**
         * Get the mouse X position.
         *
         * @return the mouse X position, relative to the game view.
         */
        getMouseX(): float;
        /**
         * Get the mouse Y position.
         *
         * @return the mouse Y position, relative to the game view.
         */
        getMouseY(): float;
        /**
         * Get the mouse movement on X axis.
         *
         * @return the mouse movement X.
         */
        getMouseMovementX(): float;
        /**
         * Get the mouse movement on Y axis.
         *
         * @return the mouse movement Y.
         */
        getMouseMovementY(): float;
        /**
         * Should be called when the mouse leave the canvas.
         */
        onMouseLeave(): void;
        /**
         * Should be called when the mouse enter the canvas.
         */
        onMouseEnter(): void;
        /**
         * @return true when the mouse is inside the canvas.
         */
        isMouseInsideCanvas(): boolean;
        /**
         * Should be called whenever a mouse button is pressed.
         * @param buttonCode The mouse button code associated to the event.
         * See InputManager.MOUSE_LEFT_BUTTON, InputManager.MOUSE_RIGHT_BUTTON, InputManager.MOUSE_MIDDLE_BUTTON
         */
        onMouseButtonPressed(buttonCode: number): void;
        /**
         * Return true if any mouse button is pressed.
         * @return true if any mouse button is pressed.
         */
        anyMouseButtonPressed(): boolean;
        _setMouseButtonPressed(buttonCode: number): void;
        /**
         * Should be called whenever a mouse button is released.
         * @param buttonCode The mouse button code associated to the event. (see onMouseButtonPressed)
         */
        onMouseButtonReleased(buttonCode: number): void;
        _setMouseButtonReleased(buttonCode: number): void;
        /**
         * Return true if the mouse button corresponding to buttonCode is pressed.
         * @param buttonCode The mouse button code (0: Left button, 1: Right button).
         */
        isMouseButtonPressed(buttonCode: number): boolean;
        /**
         * Return true if the mouse button corresponding to buttonCode was just released.
         * @param buttonCode The mouse button code (0: Left button, 1: Right button).
         */
        isMouseButtonReleased(buttonCode: number): boolean;
        /**
         * Should be called whenever the mouse wheel is used
         * @param wheelDeltaY The mouse wheel delta
         */
        onMouseWheel(wheelDeltaY: number, wheelDeltaX: number, wheelDeltaZ: number): void;
        /**
         * Return the mouse wheel delta on Y axis.
         */
        getMouseWheelDelta(): float;
        /**
         * Return the mouse wheel delta on X axis.
         */
        getMouseWheelDeltaX(): float;
        /**
         * Return the mouse wheel delta on Z axis.
         */
        getMouseWheelDeltaZ(): float;
        /**
         * Get a touch X position.
         *
         * @return the touch X position, relative to the game view.
         */
        getTouchX(publicIdentifier: integer): float;
        /**
         * Get a touch Y position.
         *
         * @return the touch Y position, relative to the game view.
         */
        getTouchY(publicIdentifier: integer): float;
        /**
         * @param publicIdentifier the touch identifier
         * @returns true if the touch has just ended.
         */
        hasTouchEnded(publicIdentifier: integer): boolean;
        /**
         * Update and return the array containing the identifiers of all touches.
         */
        getAllTouchIdentifiers(): Array<integer>;
        onTouchStart(rawIdentifier: integer, x: float, y: float): void;
        _addTouch(publicIdentifier: integer, x: float, y: float): void;
        onTouchMove(rawIdentifier: integer, x: float, y: float): void;
        _moveTouch(publicIdentifier: integer, x: float, y: float): void;
        onTouchEnd(rawIdentifier: number): void;
        onTouchCancel(rawIdentifier: number): void;
        _removeTouch(publicIdentifier: number): void;
        /**
         * Add 2 to the identifier to avoid identifiers taking the GDevelop default
         * variable value which is 0 and reserve 1 for the mouse.
         * @param rawIdentifier The identifier given by the browser.
         * @returns The identifier used in events.
         */
        private getPublicTouchIdentifier;
        getStartedTouchIdentifiers(): integer[];
        /**
         * @deprecated
         */
        popStartedTouch(): integer | undefined;
        /**
         * @deprecated
         */
        popEndedTouch(): integer | undefined;
        /**
         * Set if touch events should simulate mouse events.
         *
         * If true, any touch will move the mouse position and set mouse buttons
         * as pressed/released.
         * @param enable true to simulate mouse events, false to disable it.
         */
        touchSimulateMouse(enable: boolean): void;
        /**
         * @returns true if the touch events are used to simulate mouse events.
         */
        isSimulatingMouseWithTouch(): boolean;
        /**
         * Notify the input manager that the frame ended, so anything that last
         * only for one frame (started/ended touches) should be reset.
         *
         * This method should be called in the game loop (see `gdjs.RuntimeGame.startGameLoop`).
         * You don't need to call it otherwise.
         */
        onFrameEnded(): void;
        /**
         * Return true if the mouse wheel scroll to up
         */
        isScrollingUp(): boolean;
        /**
         * Return true if the mouse wheel scroll to down
         */
        isScrollingDown(): boolean;
        static _allTouchIds: Array<integer>;
    }
}
