declare namespace gdjs {
    type CustomObject3DNetworkSyncDataType = {
        z: float;
        d: float;
        rx: float;
        ry: float;
        ifz: boolean;
        ccz: float;
    };
    type CustomObject3DNetworkSyncData = CustomObjectNetworkSyncData & CustomObject3DNetworkSyncDataType;
    /**
     * Base class for 3D custom objects.
     * @category Objects > Custom Object 3D
     */
    export class CustomRuntimeObject3D extends gdjs.CustomRuntimeObject implements gdjs.Base3DHandler {
        /**
         * Position on the Z axis.
         */
        private _z;
        private _minZ;
        private _maxZ;
        private _scaleZ;
        private _flippedZ;
        /**
         * Euler angle with the `ZYX` order.
         *
         * Note that `_rotationZ` is `angle` from `gdjs.RuntimeObject`.
         */
        private _rotationX;
        /**
         * Euler angle with the `ZYX` order.
         *
         * Note that `_rotationZ` is `angle` from `gdjs.RuntimeObject`.
         */
        private _rotationY;
        private _customCenterZ;
        private static _temporaryVector;
        constructor(parent: gdjs.RuntimeInstanceContainer, objectData: gdjs.Object3DData & gdjs.CustomObjectConfiguration, instanceData?: InstanceData);
        protected _createRender(): CustomRuntimeObject3DRenderer;
        protected _reinitializeRenderer(): void;
        getRenderer(): gdjs.CustomRuntimeObject3DRenderer;
        get3DRendererObject(): THREE.Object3D<THREE.Object3DEventMap>;
        extraInitializationFromInitialInstance(initialInstanceData: InstanceData): void;
        getNetworkSyncData(syncOptions: GetNetworkSyncDataOptions): CustomObject3DNetworkSyncData;
        updateFromNetworkSyncData(networkSyncData: CustomObject3DNetworkSyncData, options: UpdateFromNetworkSyncDataOptions): void;
        /**
         * Set the object position on the Z axis.
         */
        setZ(z: float): void;
        /**
         * Get the object position on the Z axis.
         */
        getZ(): float;
        /**
         * Get the Z position of the rendered object.
         *
         * For most objects, this will returns the same value as getZ(). But if the
         * object has an origin that is not the same as the point (0,0,0) of the
         * object displayed, getDrawableZ will differ.
         *
         * @return The Z position of the rendered object.
         */
        getDrawableZ(): float;
        /**
         * Return the Z position of the object center, **relative to the object Z
         * position** (`getDrawableX`).
         *
         * Use `getCenterZInScene` to get the position of the center in the scene.
         *
         * @return the Z position of the object center, relative to
         * `getDrawableZ()`.
         */
        getCenterZ(): float;
        getCenterZInScene(): float;
        setCenterZInScene(z: float): void;
        /**
         * Return the bottom Z of the object.
         * Rotations around X and Y are not taken into account.
         */
        getUnrotatedAABBMinZ(): number;
        /**
         * Return the top Z of the object.
         * Rotations around X and Y are not taken into account.
         */
        getUnrotatedAABBMaxZ(): number;
        /**
         * Set the object rotation on the X axis.
         *
         * This is an Euler angle. Objects use the `ZYX` order.
         */
        setRotationX(angle: float): void;
        /**
         * Set the object rotation on the Y axis.
         *
         * This is an Euler angle. Objects use the `ZYX` order.
         */
        setRotationY(angle: float): void;
        /**
         * Get the object rotation on the X axis.
         *
         * This is an Euler angle. Objects use the `ZYX` order.
         */
        getRotationX(): float;
        /**
         * Get the object rotation on the Y axis.
         *
         * This is an Euler angle. Objects use the `ZYX` order.
         */
        getRotationY(): float;
        /**
         * Turn the object around the scene x axis at its center.
         * @param deltaAngle the rotation angle
         */
        turnAroundX(deltaAngle: float): void;
        /**
         * Turn the object around the scene y axis at its center.
         * @param deltaAngle the rotation angle
         */
        turnAroundY(deltaAngle: float): void;
        /**
         * Turn the object around the scene z axis at its center.
         * @param deltaAngle the rotation angle
         */
        turnAroundZ(deltaAngle: float): void;
        /**
         * @return the internal top bound of the object according to its children.
         */
        getInnerAreaMinZ(): number;
        /**
         * @return the internal bottom bound of the object according to its children.
         */
        getInnerAreaMaxZ(): number;
        /**
         * @return the internal width of the object according to its children.
         */
        getUnscaledDepth(): float;
        getOriginalDepth(): float;
        _updateUntransformedHitBoxes(): void;
        /**
         * @returns the center Z from the local origin (0;0).
         */
        getUnscaledCenterZ(): float;
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
        setRotationCenter3D(x: float, y: float, z: float): void;
        /**
         * Get the object size on the Z axis (called "depth").
         */
        getDepth(): float;
        /**
         * Set the object size on the Z axis (called "depth").
         */
        setDepth(depth: float): void;
        /**
         * Change the scale on X, Y and Z axis of the object.
         *
         * @param newScale The new scale (must be greater than 0).
         */
        setScale(newScale: number): void;
        /**
         * Change the scale on Z axis of the object (changing its height).
         *
         * @param newScale The new scale (must be greater than 0).
         */
        setScaleZ(newScale: number): void;
        /**
         * Get the scale of the object (or the geometric average of X, Y and Z scale in case they are different).
         *
         * @return the scale of the object (or the geometric average of X, Y and Z scale in case they are different).
         */
        getScale(): number;
        /**
         * Get the scale of the object on Z axis.
         *
         * @return the scale of the object on Z axis
         */
        getScaleZ(): float;
        flipZ(enable: boolean): void;
        isFlippedZ(): boolean;
    }
    export {};
}
