declare namespace gdjs {
    /**
     * Represents a point in a coordinate system.
     * @category Objects > Animations
     */
    type SpritePoint = {
        /** X position of the point. */
        x: float;
        /** Y position of the point. */
        y: float;
    };
    /**
     * Represents a custom point in a frame.
     * @category Objects > Animations
     */
    type SpriteCustomPointData = {
        /** Name of the point. */
        name: string;
        /** X position of the point. */
        x: float;
        /** Y position of the point. */
        y: float;
    };
    /**
     * Represents the center point in a frame.
     * @category Objects > Animations
     */
    type SpriteCenterPointData = {
        /** Name of the point. */
        name: string;
        /** Is the center automatically computed? */
        automatic: boolean;
        /** X position of the point. */
        x: float;
        /** Y position of the point. */
        y: float;
    };
    /**
     * Represents a {@link gdjs.SpriteAnimationFrame}.
     * @category Objects > Animations
     */
    type SpriteFrameData = {
        /** The resource name of the image used in this frame. */
        image: string;
        /** The points of the frame. */
        points: Array<SpriteCustomPointData>;
        /** The origin point. */
        originPoint: SpriteCustomPointData;
        /** The center of the frame. */
        centerPoint: SpriteCenterPointData;
        /** Is The collision mask custom? */
        hasCustomCollisionMask: boolean;
        /** The collision mask if it is custom. */
        customCollisionMask: Array<Array<SpritePoint>>;
    };
    /**
     * Represents the data of a {@link gdjs.SpriteAnimationDirection}.
     * @category Objects > Animations
     */
    type SpriteDirectionData = {
        /** Time between each frame, in seconds. */
        timeBetweenFrames: float;
        /** Is the animation looping? */
        looping: boolean;
        /** The list of frames. */
        sprites: Array<SpriteFrameData>;
    };
    /**
     * Represents the data of a {@link gdjs.SpriteAnimation}.
     * @category Objects > Animations
     */
    type SpriteAnimationData = {
        /** The name of the animation. */
        name: string;
        /** Does the animation use multiple {@link gdjs.SpriteAnimationDirection}? */
        useMultipleDirections: boolean;
        /** The list of {@link SpriteDirectionData} representing {@link gdjs.SpriteAnimationDirection} instances. */
        directions: Array<SpriteDirectionData>;
    };
    /**
     * Represents all the information needed to synchronize the animations of an object.
     * @category Objects > Animations
     */
    type SpriteAnimatorNetworkSyncData = {
        an: integer;
        di: integer;
        fr: integer;
        et: float;
        ss: float;
        pa: boolean;
    };
    /**
     * Abstraction from graphic libraries texture classes.
     * @category Objects > Animations
     */
    interface AnimationFrameTextureManager<T> {
        getAnimationFrameTexture(imageName: string): T;
        getAnimationFrameWidth(pixiTexture: T): any;
        getAnimationFrameHeight(pixiTexture: T): any;
    }
    /**
     * A frame used by a SpriteAnimation in a {@link gdjs.SpriteRuntimeObject}.
     *
     * It contains the texture displayed as well as information like the points position
     * or the collision mask.
     * @category Objects > Animations
     */
    class SpriteAnimationFrame<T> {
        image: string;
        texture: T;
        center: SpritePoint;
        origin: SpritePoint;
        hasCustomHitBoxes: boolean;
        customHitBoxes: gdjs.Polygon[];
        points: Hashtable<SpritePoint>;
        /**
         * @param frameData The frame data used to initialize the frame
         * @param textureManager The game image manager
         */
        constructor(frameData: SpriteFrameData, textureManager: gdjs.AnimationFrameTextureManager<T>);
        /**
         * @param frameData The frame data used to initialize the frame
         * @param textureManager The game image manager
         */
        reinitialize(frameData: SpriteFrameData, textureManager: gdjs.AnimationFrameTextureManager<T>): void;
        /**
         * Get a point of the frame.<br>
         * If the point does not exist, the origin is returned.
         * @param name The point's name
         * @return The requested point. If it doesn't exists returns the origin point.
         */
        getPoint(name: string): SpritePoint;
    }
    /**
     * Represents a direction of an animation of a {@link gdjs.SpriteRuntimeObject}.
     * @category Objects > Animations
     */
    class SpriteAnimationDirection<T> {
        timeBetweenFrames: float;
        loop: boolean;
        frames: SpriteAnimationFrame<T>[];
        /**
         * @param directionData The direction data used to initialize the direction
         * @param textureManager The game image manager
         */
        constructor(directionData: SpriteDirectionData, textureManager: gdjs.AnimationFrameTextureManager<T>);
        /**
         * @param directionData The direction data used to initialize the direction
         * @param textureManager The game image manager
         */
        reinitialize(directionData: SpriteDirectionData, textureManager: gdjs.AnimationFrameTextureManager<T>): void;
    }
    /**
     * Represents an animation of a {@link SpriteRuntimeObject}.
     * @category Objects > Animations
     */
    class SpriteAnimation<T> {
        hasMultipleDirections: boolean;
        name: string;
        directions: gdjs.SpriteAnimationDirection<T>[];
        /**
         * @param animData The animation data used to initialize the animation
         * @param textureManager The game image manager
         */
        constructor(animData: SpriteAnimationData, textureManager: gdjs.AnimationFrameTextureManager<T>);
        /**
         * @param animData The animation data used to initialize the animation
         * @param textureManager The game image manager
         */
        reinitialize(animData: SpriteAnimationData, textureManager: gdjs.AnimationFrameTextureManager<T>): void;
    }
    /**
     * Image-base animation model.
     * @category Objects > Animations
     */
    class SpriteAnimator<T> implements gdjs.Animatable {
        _animations: gdjs.SpriteAnimation<T>[];
        _textureManager: gdjs.AnimationFrameTextureManager<T>;
        /**
         * Reference to the current SpriteAnimationFrame that is displayed.
         * Can be null, so ensure that this case is handled properly.
         */
        private _animationFrame;
        private _animationFrameDirty;
        private _currentAnimation;
        private _currentDirection;
        private _currentFrameIndex;
        /** In seconds */
        private _animationElapsedTime;
        private _animationSpeedScale;
        private _animationPaused;
        private _onFrameChange;
        /**
         * @param animations The animation list data used to initialize the animator
         * @param textureManager The game image manager
         */
        constructor(animations: Array<SpriteAnimationData>, textureManager: gdjs.AnimationFrameTextureManager<T>);
        invalidateFrame(): void;
        reinitialize(animations: Array<SpriteAnimationData>): void;
        updateFromObjectData(oldAnimations: Array<SpriteAnimationData>, newAnimations: Array<SpriteAnimationData>): boolean;
        getNetworkSyncData(): SpriteAnimatorNetworkSyncData;
        updateFromNetworkSyncData(networkSyncData: SpriteAnimatorNetworkSyncData): void;
        /**
         * @returns Returns the current frame or null if the current animation doesn't have any frame.
         */
        getCurrentFrame(): gdjs.SpriteAnimationFrame<T> | null;
        /**
         * Update the current frame of the object according to the elapsed time on the scene.
         * @param timeDelta in seconds
         */
        step(timeDelta: float): boolean;
        /**
         * Register a listener to frame changes.
         *
         * It's useful for custom objects as they don't drive this class themselves.
         *
         * @param callback Called each time {@link getCurrentFrame} changes.
         */
        setOnFrameChangeCallback(callback: () => void): void;
        getAnimationIndex(): integer;
        setAnimationIndex(newAnimation: integer): boolean;
        getAnimationName(): string;
        setAnimationName(newAnimationName: string): boolean;
        hasAnimationEnded(): boolean;
        isAnimationPaused(): boolean;
        pauseAnimation(): void;
        resumeAnimation(): void;
        getAnimationSpeedScale(): number;
        setAnimationSpeedScale(ratio: float): void;
        /**
         * Change the current frame displayed by the animation
         * @param newFrameIndex The index of the frame to be displayed
         */
        setAnimationFrameIndex(newFrameIndex: integer): boolean;
        /**
         * Get the index of the current frame displayed by the animation
         * @return newFrame The index of the frame being displayed
         */
        getAnimationFrameIndex(): integer;
        getAnimationElapsedTime(): float;
        setAnimationElapsedTime(time: float): boolean;
        getAnimationDuration(): float;
        getAnimationFrameCount(): integer;
        /**
         * Change the angle (or direction index) of the object
         * @param oldValue The old angle
         * @param newValue The new angle (or direction index) to be applied
         * @deprecated
         */
        setDirectionOrAngle(oldValue: float, newValue: float): float | null;
        /**
         * @deprecated
         */
        getDirectionOrAngle(angle: float): float;
        /**
         * @deprecated
         */
        getAngle(angle: float): float;
        /**
         * @deprecated
         */
        setAngle(oldAngle: float, angle: float): float | null;
        /**
         * @deprecated
         * Return true if animation has ended.
         * Prefer using {@link hasAnimationEnded}. This method returns true as soon as
         * the animation enters the last frame, not at the end of the last frame.
         */
        hasAnimationEndedLegacy(): boolean;
    }
}
