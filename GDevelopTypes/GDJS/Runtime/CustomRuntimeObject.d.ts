declare namespace gdjs {
    /**
     * @category Objects > Custom Object
     */
    type ObjectConfiguration = {
        content: any;
    };
    /**
     * @category Objects > Custom Object
     */
    type CustomObjectConfiguration = ObjectConfiguration & {
        animatable?: SpriteAnimationData[];
        variant: string;
        childrenContent?: {
            [objectName: string]: ObjectConfiguration & any;
        };
        isInnerAreaFollowingParentSize: boolean;
    };
    /**
     * @category Objects > Custom Object
     */
    type CustomObjectNetworkSyncDataType = {
        anim?: SpriteAnimatorNetworkSyncData;
        ifx: boolean;
        ify: boolean;
        sx: float;
        sy: float;
        op: float;
        cc?: [float, float];
    };
    /**
     * @category Objects > Custom Object
     */
    type CustomObjectNetworkSyncData = ObjectNetworkSyncData & CustomObjectNetworkSyncDataType;
    /**
     * An object that contains other object.
     *
     * This is the base class for objects generated from EventsBasedObject.
     *
     * @see gdjs.CustomRuntimeObjectInstanceContainer
     * @category Objects > Custom Object
     */
    abstract class CustomRuntimeObject extends gdjs.RuntimeObject implements gdjs.Resizable, gdjs.Scalable, gdjs.Flippable, gdjs.OpacityHandler {
        _renderer: gdjs.CustomRuntimeObject2DRenderer | gdjs.CustomRuntimeObject3DRenderer;
        /** It contains the children of this object. */
        _instanceContainer: gdjs.CustomRuntimeObjectInstanceContainer;
        _isUntransformedHitBoxesDirty: boolean;
        /** It contains shallow copies of the children hitboxes */
        private _untransformedHitBoxes;
        /** The dimension of this object is calculated from its children AABBs. */
        private _unrotatedAABB;
        /**
         * The bounds of the object content before any transformation.
         * @see gdjs.CustomRuntimeObjectInstanceContainer._initialInnerArea
         **/
        protected _innerArea: {
            min: [float, float, float];
            max: [float, float, float];
        } | null;
        /**
         * When the parent dimensions change:
         * - if `false`, the object is stretch proportionally while children local
         *   positions stay the same ({@link gdjs.CustomRuntimeObject._innerArea} don't change).
         * - if `true`, the children local positions need to be adapted by events
         *   to follow their parent size.
         */
        protected _isInnerAreaFollowingParentSize: boolean;
        private _scaleX;
        private _scaleY;
        private _flippedX;
        private _flippedY;
        private opacity;
        private _customCenter;
        private _localTransformation;
        private _localInverseTransformation;
        private _isLocalTransformationDirty;
        _type: string;
        /**
         * @param parent The container the object belongs to
         * @param objectData The object data used to initialize the object
         */
        constructor(parent: gdjs.RuntimeInstanceContainer, objectData: ObjectData & CustomObjectConfiguration, instanceData: InstanceData | undefined);
        private _initializeFromObjectData;
        protected abstract _createRender(): gdjs.CustomRuntimeObject2DRenderer | gdjs.CustomRuntimeObject3DRenderer;
        protected abstract _reinitializeRenderer(): void;
        reinitialize(objectData: ObjectData & CustomObjectConfiguration): void;
        private _reinitializeContentFromObjectData;
        updateFromObjectData(oldObjectData: ObjectData & CustomObjectConfiguration, newObjectData: ObjectData & CustomObjectConfiguration): boolean;
        getNetworkSyncData(syncOptions: GetNetworkSyncDataOptions): CustomObjectNetworkSyncData;
        updateFromNetworkSyncData(networkSyncData: CustomObjectNetworkSyncData, options: UpdateFromNetworkSyncDataOptions): void;
        extraInitializationFromInitialInstance(initialInstanceData: InstanceData): void;
        onDeletedFromScene(): void;
        onDestroyed(): void;
        update(parent: gdjs.RuntimeInstanceContainer): void;
        stepBehaviorsPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer): void;
        /**
         * This method is called when the preview is being hot-reloaded.
         *
         * Custom objects implement this method with code generated from events.
         */
        onHotReloading(parent: gdjs.RuntimeInstanceContainer): void;
        doStepPreEvents(parent: gdjs.RuntimeInstanceContainer): void;
        /**
         * This method is called each tick after events are done.
         *
         * Custom objects implement this method with code generated from events.
         * @param parent The instanceContainer owning the object
         */
        doStepPostEvents(parent: gdjs.RuntimeInstanceContainer): void;
        /**
         * This method is called when the object is being removed from its parent
         * container and is about to be destroyed/reused later.
         *
         * Custom objects implement this method with code generated from events.
         */
        onDestroy(parent: gdjs.RuntimeInstanceContainer): void;
        updatePreRender(parent: gdjs.RuntimeInstanceContainer): void;
        getRenderer(): gdjs.CustomRuntimeObject2DRenderer | gdjs.CustomRuntimeObject3DRenderer;
        getChildrenContainer(): gdjs.RuntimeInstanceContainer;
        onChildrenLocationChanged(): void;
        updateHitBoxes(): void;
        /**
         * Merge the hitboxes of the children.
         */
        _updateUntransformedHitBoxes(): void;
        /**
         * Return an array containing the coordinates of the point passed as parameter
         * in parent coordinate coordinates (as opposed to the object local coordinates).
         *
         * All transformations (flipping, scale, rotation) are supported.
         *
         * @param x The X position of the point, in object coordinates.
         * @param y The Y position of the point, in object coordinates.
         * @param destination Array that will be updated with the result
         * (x and y position of the point in parent coordinates).
         */
        applyObjectTransformation(x: float, y: float, destination: FloatPoint): void;
        /**
         * Return the affine transformation that represents
         * flipping, scale, rotation and translation of the object.
         * @returns the affine transformation.
         */
        getLocalTransformation(): gdjs.AffineTransformation;
        getLocalInverseTransformation(): gdjs.AffineTransformation;
        _updateLocalTransformation(): void;
        /**
         * Return an array containing the coordinates of the point passed as parameter
         * in object local coordinates (as opposed to the parent coordinate coordinates).
         *
         * All transformations (flipping, scale, rotation) are supported.
         *
         * @param x The X position of the point, in parent coordinates.
         * @param y The Y position of the point, in parent coordinates.
         * @param destination Array that will be updated with the result
         * (x and y position of the point in object coordinates).
         */
        applyObjectInverseTransformation(x: float, y: float, destination: FloatPoint): void;
        getDrawableX(): float;
        getDrawableY(): float;
        /**
         * @return the internal left bound of the object according to its children.
         */
        getInnerAreaMinX(): number;
        /**
         * @return the internal top bound of the object according to its children.
         */
        getInnerAreaMinY(): number;
        /**
         * @return the internal right bound of the object according to its children.
         */
        getInnerAreaMaxX(): number;
        /**
         * @return the internal bottom bound of the object according to its children.
         */
        getInnerAreaMaxY(): number;
        getOriginalWidth(): float;
        getOriginalHeight(): float;
        /**
         * @return the internal width of the object according to its children.
         */
        getUnscaledWidth(): float;
        /**
         * @return the internal height of the object according to its children.
         */
        getUnscaledHeight(): float;
        /**
         * @returns the center X from the local origin (0;0).
         */
        getUnscaledCenterX(): float;
        /**
         * @returns the center Y from the local origin (0;0).
         */
        getUnscaledCenterY(): float;
        /**
         * The center of rotation is defined relatively to the origin (the object
         * position).
         * This avoids the center to move when children push the bounds.
         *
         * When no custom center is defined, it will move
         * to stay at the center of the children bounds.
         *
         * @param x coordinate of the custom center
         * @param y coordinate of the custom center
         */
        setRotationCenter(x: float, y: float): void;
        hasCustomRotationCenter(): boolean;
        getCenterX(): float;
        getCenterY(): float;
        getWidth(): float;
        getHeight(): float;
        setWidth(newWidth: float): void;
        setHeight(newHeight: float): void;
        /**
         * Change the size of the object.
         *
         * @param newWidth The new width of the object, in pixels.
         * @param newHeight The new height of the object, in pixels.
         */
        setSize(newWidth: float, newHeight: float): void;
        setX(x: float): void;
        setY(y: float): void;
        setAngle(angle: float): void;
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
        setOpacity(opacity: float): void;
        getOpacity(): number;
        hide(enable: boolean): void;
        flipX(enable: boolean): void;
        flipY(enable: boolean): void;
        isFlippedX(): boolean;
        isFlippedY(): boolean;
        /**
         * Return the sprite animator.
         *
         * It returns `null` when custom objects don't have the Animatable capability.
         */
        getAnimator(): gdjs.SpriteAnimator<any> | null;
    }
}
