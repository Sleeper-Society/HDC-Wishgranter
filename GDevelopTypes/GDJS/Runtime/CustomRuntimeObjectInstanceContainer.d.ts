declare namespace gdjs {
    /**
     * The instance container of a custom object, containing instances of objects rendered on screen.
     *
     * @see gdjs.CustomRuntimeObject
     * @category Core Engine > Instance Container
     */
    class CustomRuntimeObjectInstanceContainer extends gdjs.RuntimeInstanceContainer {
        _debuggerRenderer: gdjs.DebuggerRenderer;
        _runtimeScene: gdjs.RuntimeScene;
        /** The parent container that contains the object associated with this container. */
        _parent: gdjs.RuntimeInstanceContainer;
        /** The object that is built with the instances of this container. */
        _customObject: gdjs.CustomRuntimeObject;
        _isLoaded: boolean;
        /**
         * The default size defined by users in the custom object initial instances editor.
         *
         * Don't modify it as it would affect every instance.
         *
         * @see gdjs.CustomRuntimeObject._innerArea
         **/
        _initialInnerArea: {
            min: [float, float, float];
            max: [float, float, float];
        } | null;
        /**
         * @param parent the parent container that contains the object associated
         * with this container.
         * @param customObject the object that is built with the instances of this
         * container.
         */
        constructor(parent: gdjs.RuntimeInstanceContainer, customObject: gdjs.CustomRuntimeObject);
        addLayer(layerData: LayerData): void;
        _unloadContent(): void;
        createObject(objectName: string, instanceData?: InstanceData): gdjs.RuntimeObject | null;
        /**
         * Load the container from the given initial configuration.
         * @param customObjectData An object containing the parent object data.
         * @param eventsBasedObjectVariantData An object containing the container data.
         * @see gdjs.RuntimeGame#getSceneAndExtensionsData
         */
        loadFrom(customObjectData: ObjectData & CustomObjectConfiguration, eventsBasedObjectVariantData: EventsBasedObjectVariantData): void;
        /**
         * Check if the custom object has a children configuration overriding that
         * should be used instead of the variant's objects configurations.
         * @param customObjectData An object containing the parent object data.
         * @param eventsBasedObjectVariantData An object containing the container data.
         * @returns
         */
        static hasChildrenConfigurationOverriding(customObjectData: CustomObjectConfiguration, eventsBasedObjectVariantData: EventsBasedObjectVariantData): boolean;
        /**
         * Initialize `_initialInnerArea` if it doesn't exist.
         * `_initialInnerArea` is shared by every instance to save memory.
         */
        private _setOriginalInnerArea;
        /**
         * Called when the associated object is destroyed (because it is removed
         * from its parent container or the scene is being unloaded).
         *
         * @param instanceContainer The container owning the object.
         */
        onDeletedFromScene(instanceContainer: gdjs.RuntimeInstanceContainer): void;
        _destroy(): void;
        /**
         * Called to update visibility of the renderers of objects
         * rendered on the scene ("culling"), update effects (of visible objects)
         * and give a last chance for objects to update before rendering.
         *
         * Visibility is set to false if object is hidden, or if
         * object is too far from the camera of its layer ("culling").
         */
        _updateObjectsPreRender(): void;
        /**
         * Update the objects before launching the events.
         */
        _updateObjectsPreEvents(): void;
        /**
         * Get the renderer associated to the RuntimeScene.
         */
        getRenderer(): gdjs.CustomRuntimeObject2DRenderer | gdjs.CustomRuntimeObject3DRenderer;
        getDebuggerRenderer(): DebuggerPixiRenderer;
        getGame(): RuntimeGame;
        getScene(): RuntimeScene;
        getOwner(): gdjs.CustomRuntimeObject;
        getAsyncTasksManager(): AsyncTasksManager;
        getUnrotatedViewportMinX(): float;
        getUnrotatedViewportMinY(): float;
        getUnrotatedViewportMaxX(): float;
        getUnrotatedViewportMaxY(): float;
        getInitialUnrotatedViewportMinX(): float;
        getInitialUnrotatedViewportMinY(): float;
        getInitialUnrotatedViewportMaxX(): float;
        getInitialUnrotatedViewportMaxY(): float;
        _getInitialInnerAreaDepth(): float;
        getViewportWidth(): float;
        getViewportHeight(): float;
        getViewportOriginX(): float;
        getViewportOriginY(): float;
        onChildrenLocationChanged(): void;
        convertCoords(x: float, y: float, result: FloatPoint): FloatPoint;
        convertInverseCoords(sceneX: float, sceneY: float, result: FloatPoint): FloatPoint;
        /**
         * Return the time elapsed since the last frame,
         * in milliseconds, for objects on the layer.
         */
        getElapsedTime(): float;
    }
}
