declare namespace gdjs {
    /**
     * Represents the data of a {@link gdjs.SpriteRuntimeObject}.
     * @category Objects > Sprite
     */
    type SpriteObjectDataType = {
        /** Update the object even if he is not visible?. */
        updateIfNotVisible: boolean;
        /** The scale applied to object to evaluate the default dimensions */
        preScale?: float;
        /** The list of {@link SpriteAnimationData} representing {@link gdjs.SpriteAnimation} instances. */
        animations: Array<SpriteAnimationData>;
    };
    /**
     * @category Objects > Sprite
     */
    type SpriteObjectData = ObjectData & SpriteObjectDataType;
    /**
     * @category Objects > Sprite
     */
    type SpriteNetworkSyncDataType = {
        anim: SpriteAnimatorNetworkSyncData;
        ifx: boolean;
        ify: boolean;
        sx: float;
        sy: float;
        op: float;
        color: string;
    };
    /**
     * @category Objects > Sprite
     */
    type SpriteNetworkSyncData = ObjectNetworkSyncData & SpriteNetworkSyncDataType;
    /**
     * The SpriteRuntimeObject represents an object that can display images.
     * @category Objects > Sprite
     */
    class SpriteRuntimeObject extends gdjs.RuntimeObject implements gdjs.Resizable, gdjs.Scalable, gdjs.Flippable, gdjs.Animatable, gdjs.OpacityHandler {
        _animator: gdjs.SpriteAnimator<any>;
        _scaleX: float;
        _scaleY: float;
        _blendMode: integer;
        _flippedX: boolean;
        _flippedY: boolean;
        opacity: float;
        _updateIfNotVisible: boolean;
        _preScale: float;
        _renderer: gdjs.SpriteRuntimeObjectRenderer;
        _animationFrameDirty: boolean;
        /**
         * @param instanceContainer The container the object belongs to
         * @param spriteObjectData The object data used to initialize the object
         */
        constructor(instanceContainer: gdjs.RuntimeInstanceContainer, spriteObjectData: ObjectData & SpriteObjectDataType, instanceData?: InstanceData);
        reinitialize(spriteObjectData: SpriteObjectData): void;
        updateFromObjectData(oldObjectData: SpriteObjectData, newObjectData: SpriteObjectData): boolean;
        getNetworkSyncData(syncOptions: GetNetworkSyncDataOptions): SpriteNetworkSyncData;
        updateFromNetworkSyncData(newNetworkSyncData: SpriteNetworkSyncData, options: UpdateFromNetworkSyncDataOptions): void;
        /**
         * Initialize the extra parameters that could be set for an instance.
         * @param initialInstanceData The extra parameters
         */
        extraInitializationFromInitialInstance(initialInstanceData: InstanceData): void;
        /**
         * Update the current frame of the object according to the elapsed time on the scene.
         */
        update(instanceContainer: gdjs.RuntimeInstanceContainer): void;
        /**
         * Ensure the sprite is ready to be displayed: the proper animation frame
         * is set and the renderer is up to date (position, angle, alpha, flip, blend mode...).
         */
        updatePreRender(instanceContainer: gdjs.RuntimeInstanceContainer): void;
        /**
         * Update `this._animationFrame` according to the current animation/direction/frame values
         * (`this._currentAnimation`, `this._currentDirection`, `this._currentFrame`) and set
         * `this._animationFrameDirty` back to false.
         *
         * Trigger a call to the renderer to change the texture being shown (if the animation/direction/frame
         * is valid).
         * If invalid, `this._animationFrame` will be `null` after calling this function.
         */
        _updateAnimationFrame(): void;
        getRendererObject(): import("pixi.js").Sprite;
        /**
         * Update the hit boxes for the object.
         * Fallback to the default implementation (rotated bounding box) if there is no custom
         * hitboxes defined for the current animation frame.
         */
        updateHitBoxes(): void;
        /**
         * Change the animation being played.
         * @param newAnimation The index of the new animation to be played
         * @deprecated Use `setAnimationIndex` instead
         */
        setAnimation(newAnimation: integer): void;
        setAnimationIndex(newAnimation: integer): void;
        setAnimationName(newAnimationName: string): void;
        /**
         * Get the index of the animation being played.
         * @return The index of the new animation being played
         * @deprecated Use `getAnimationIndex` instead
         */
        getAnimation(): integer;
        getAnimationIndex(): integer;
        getAnimationName(): string;
        isCurrentAnimationName(name: string): boolean;
        /**
         * Change the angle (or direction index) of the object
         * @param newValue The new angle (or direction index) to be applied
         */
        setDirectionOrAngle(newValue: float): void;
        getDirectionOrAngle(): float;
        /**
         * Change the current frame displayed by the animation
         * @param newFrame The index of the frame to be displayed
         */
        setAnimationFrame(newFrame: integer): void;
        /**
         * Get the index of the current frame displayed by the animation
         * @return newFrame The index of the frame being displayed
         */
        getAnimationFrame(): integer;
        getAnimationElapsedTime(): float;
        setAnimationElapsedTime(time: float): void;
        getAnimationDuration(): float;
        getAnimationFrameCount(): integer;
        /**
         * @deprecated
         * Return true if animation has ended.
         * Prefer using `hasAnimationEnded2`. This method returns true as soon as
         * the animation enters the last frame, not at the end of the last frame.
         */
        hasAnimationEndedLegacy(): boolean;
        /**
         * Return true if animation has ended.
         * The animation had ended if:
         * - it's not configured as a loop;
         * - the current frame is the last frame;
         * - the last frame has been displayed long enough.
         *
         * @deprecated Use `hasAnimationEnded` instead.
         */
        hasAnimationEnded2(): boolean;
        hasAnimationEnded(): boolean;
        /**
         * @deprecated Use `isAnimationPaused` instead.
         */
        animationPaused(): boolean;
        isAnimationPaused(): boolean;
        pauseAnimation(): void;
        /**
         * @deprecated Use `resumeAnimation` instead.
         */
        playAnimation(): void;
        resumeAnimation(): void;
        getAnimationSpeedScale(): float;
        setAnimationSpeedScale(ratio: float): void;
        /**
         * Get the position on X axis on the scene of the given point.
         * @param name The point name
         * @return the position on X axis on the scene of the given point.
         */
        getPointX(name: string): float;
        /**
         * Get the position on Y axis on the scene of the given point.
         * @param name The point name
         * @return the position on Y axis on the scene of the given point.
         */
        getPointY(name: string): float;
        /**
         * Get the positions on X and Y axis on the scene of the given point.
         * @param name The point name
         * @return An array of the position on X and Y axis on the scene of the given point.
         */
        getPointPosition(name: string): [x: float, y: float];
        /**
         * Return an array containing the coordinates of the point passed as parameter
         * in world coordinates (as opposed to the object local coordinates).
         *
         * Beware: this._animationFrame and this._sprite must *not* be null!
         *
         * All transformations (flipping, scale, rotation) are supported.
         *
         * @param x The X position of the point, in object coordinates.
         * @param y The Y position of the point, in object coordinates.
         * @param result Array that will be updated with the result
         * (x and y position of the point in global coordinates).
         */
        private _transformToGlobal;
        /**
         * Get the X position, on the scene, of the origin of the texture of the object.
         * @return the X position, on the scene, of the origin of the texture of the object.
         */
        getDrawableX(): float;
        /**
         * Get the Y position, on the scene, of the origin of the texture of the object.
         * @return the Y position, on the scene, of the origin of the texture of the object.
         */
        getDrawableY(): float;
        /**
         * Get the X position of the center of the object, relative to top-left of the texture of the object (`getDrawableX`).
         * @return X position of the center of the object, relative to `getDrawableX()`.
         */
        getCenterX(): float;
        /**
         * Get the Y position of the center of the object, relative to top-left of the texture of the object (`getDrawableY`).
         * @return Y position of the center of the object, relative to `getDrawableY()`.
         */
        getCenterY(): float;
        /**
         * Set the X position of the (origin of the) object.
         * @param x The new X position.
         */
        setX(x: float): void;
        /**
         * Set the Y position of the (origin of the) object.
         * @param y The new Y position.
         */
        setY(y: float): void;
        /**
         * Set the angle of the object.
         * @param angle The new angle, in degrees.
         */
        setAngle(angle: float): void;
        /**
         * Get the angle of the object.
         * @return The angle, in degrees.
         */
        getAngle(): float;
        setBlendMode(newMode: any): void;
        getBlendMode(): number;
        setOpacity(opacity: float): void;
        getOpacity(): float;
        /**
         * Hide (or show) the object
         * @param enable true to hide the object, false to show it again.
         */
        hide(enable: boolean): void;
        /**
         * Change the tint of the sprite object.
         *
         * @param rgbOrHexColor The color as a string, in RGB format ("128;200;255") or Hex format.
         */
        setColor(rgbOrHexColor: string): void;
        /**
         * Get the tint of the sprite object.
         *
         * @returns The color, in RGB format ("128;200;255").
         */
        getColor(): string;
        flipX(enable: boolean): void;
        flipY(enable: boolean): void;
        isFlippedX(): boolean;
        isFlippedY(): boolean;
        /**
         * Get the width of the object.
         *
         * @return The width of the object, in pixels.
         */
        getWidth(): float;
        /**
         * Get the height of the object.
         *
         * @return The height of the object, in pixels.
         */
        getHeight(): float;
        setWidth(newWidth: float): void;
        setHeight(newHeight: float): void;
        setSize(newWidth: float, newHeight: float): void;
        getOriginalWidth(): float;
        getOriginalHeight(): float;
        private getCurrentFrameWidth;
        private getCurrentFrameHeight;
        /**
         * Change the scale on X and Y axis of the object.
         *
         * @param newScale The new scale (must be greater than 0).
         */
        setScale(newScale: float): void;
        /**
         * Change the scale on X axis of the object (changing its width).
         *
         * @param newScale The new scale (must be greater than 0).
         */
        setScaleX(newScale: float): void;
        /**
         * Change the scale on Y axis of the object (changing its height).
         *
         * @param newScale The new scale (must be greater than 0).
         */
        setScaleY(newScale: float): void;
        /**
         * Get the scale of the object (or the arithmetic mean of the X and Y scale in case they are different).
         *
         * @return the scale of the object (or the arithmetic mean of the X and Y scale in case they are different).
         * @deprecated Use `getScale` instead.
         */
        getScaleMean(): float;
        /**
         * Get the scale of the object (or the geometric mean of the X and Y scale in case they are different).
         *
         * @return the scale of the object (or the geometric mean of the X and Y scale in case they are different).
         */
        getScale(): float;
        /**
         * Get the scale of the object on Y axis.
         *
         * @return the scale of the object on Y axis
         */
        getScaleY(): float;
        /**
         * Get the scale of the object on X axis.
         *
         * @return the scale of the object on X axis
         */
        getScaleX(): float;
        /**
         * @param obj The target object
         * @deprecated
         */
        turnTowardObject(obj: gdjs.RuntimeObject | null): void;
    }
}
