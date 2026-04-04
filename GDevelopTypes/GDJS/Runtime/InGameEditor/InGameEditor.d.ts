declare namespace gdjs {
    /** @category In-Game Editor */
    export type InGameEditorSettings = {
        theme: {
            iconButtonSelectedBackgroundColor: string;
            iconButtonSelectedColor: string;
            toolbarBackgroundColor: string;
            toolbarSeparatorColor: string;
            textColorPrimary: string;
        };
    };
    type Point3D = [float, float, float];
    type AABB3D = {
        min: Point3D;
        max: Point3D;
    };
    /** @category In-Game Editor */
    export class InGameEditor {
        private _editorId;
        private _runtimeGame;
        private _currentScene;
        private _editedInstanceContainer;
        private _editedInstanceDataList;
        private _editedLayerDataList;
        private _selectedLayerName;
        private _innerArea;
        private _threeInnerArea;
        private _unregisterContextLostListener;
        private _tempVector2d;
        private _raycaster;
        private _isVisible;
        private _timeSinceLastInteraction;
        private _isFirstFrame;
        private _editorCamera;
        /** Keep track of the focus to know if the game was blurred since the last frame. */
        private _windowHadFocus;
        private _selectionControls;
        private _transformControlsMode;
        private _editorGrid;
        private _selectionControlsMovementTotalDelta;
        private _hasSelectionActuallyMoved;
        private _isTransformControlsHovered;
        private _wasMovingSelectionLastFrame;
        private _selectionBox;
        private _selectionBoxElement;
        private _selectionBoxStartCursorX;
        private _selectionBoxStartCursorY;
        private _selection;
        private _selectionBoxes;
        private _objectMover;
        private _wasMouseLeftButtonPressed;
        private _wasMouseRightButtonPressed;
        private _wasMouseMiddleButtonPressed;
        private _pressedOriginalCursorX;
        private _pressedOriginalCursorY;
        private _previousCursorX;
        private _previousCursorY;
        private _pressedRightButtonTime;
        private _pressedMiddleButtonTime;
        private _lastClickOnObjectUnderCursor;
        private _draggedNewObject;
        private _draggedSelectedObject;
        private _draggedSelectedObjectInitialX;
        private _draggedSelectedObjectInitialY;
        private _draggedSelectedObjectInitialZ;
        private _draggedSelectedObjectTotalDelta;
        private _instancesEditorSettings;
        private _toolbar;
        private _inGameEditorSettings;
        constructor(game: RuntimeGame, projectData: ProjectData, inGameEditorSettings: InGameEditorSettings | null);
        private _setupWebGLContextLostListener;
        dispose(): void;
        private _applyInGameEditorSettings;
        setInGameEditorSettings(inGameEditorSettings: InGameEditorSettings): void;
        getRuntimeGame(): RuntimeGame;
        onProjectDataChange(projectData: ProjectData): void;
        onLayersDataChange(layersData: Array<LayerData>, areEffectsHiddenInEditor: boolean): void;
        /**
         * Modify the layer data accordingly.
         * `gdjs.HotReloader.hotReloadRuntimeSceneLayers` must be run for the
         * changes to be applied.
         */
        setEffectsHiddenInEditor(areEffectsHiddenInEditor: boolean): void;
        areEffectsHidden(): boolean;
        getEditorId(): string;
        getEditedInstanceDataList(): InstanceData[];
        getEditedLayerDataList(): LayerData[];
        getEditedInstanceContainer(): gdjs.RuntimeInstanceContainer | null;
        getCurrentScene(): gdjs.RuntimeScene | null;
        /**
         * Return the layer to be used for camera calculus.
         * @see getEditorLayer
         */
        private getCameraLayer;
        /**
         * Return the layer which contains the objects.
         * @see getCameraLayer
         */
        private getEditorLayer;
        /**
         * Called by the RuntimeGame when the game resolution is changed.
         * Useful to notify scene and layers that resolution is changed, as they
         * might be caching it.
         */
        onGameResolutionResized(): void;
        switchToSceneOrVariant(editorId: string | null, sceneName: string | null, externalLayoutName: string | null, eventsBasedObjectType: string | null, eventsBasedObjectVariantName: string | null, editorCamera3D: EditorCameraState | null): Promise<void>;
        private _createSceneWithCustomObject;
        updateInnerArea(areaMinX: float, areaMinY: float, areaMinZ: float, areaMaxX: float, areaMaxY: float, areaMaxZ: float): void;
        setSelectedLayerName(layerName: string): void;
        setInstancesEditorSettings(instancesEditorSettings: InstancesEditorSettings): void;
        updateInstancesEditorSettings(instancesEditorSettings: InstancesEditorSettings): void;
        private _getTempVector2d;
        zoomToInitialPosition(visibleScreenArea: {
            minX: number;
            minY: number;
            maxX: number;
            maxY: number;
        }): void;
        zoomToFitContent(visibleScreenArea: {
            minX: number;
            minY: number;
            maxX: number;
            maxY: number;
        }): void;
        zoomToFitSelection(visibleScreenArea: {
            minX: number;
            minY: number;
            maxX: number;
            maxY: number;
        }): void;
        zoomToFitObjects(objects: Array<RuntimeObject>, visibleScreenArea: {
            minX: number;
            minY: number;
            maxX: number;
            maxY: number;
        }, margin: float): void;
        zoomToFitArea(sceneArea: {
            minX: number;
            minY: number;
            minZ: number;
            maxX: number;
            maxY: number;
            maxZ: number;
        }, visibleScreenArea: {
            minX: number;
            minY: number;
            maxX: number;
            maxY: number;
        }, margin: float): void;
        zoomBy(zoomFactor: float): void;
        setZoom(zoom: float): void;
        getSelectionAABB(): AABB3D | null;
        setSelectedObjects(persistentUuids: Array<string>): void;
        centerViewOnLastSelectedInstance(): void;
        private _focusOnSelection;
        private _handleCameraMovement;
        moveSelectionUnderCursor(): void;
        private _shouldDragSelectedObject;
        private _handleSelectedObjectDragging;
        private _duplicateSelectedObjects;
        private _handleSelectionMovement;
        private _updateSelectionBox;
        private _handleSelection;
        private _updateSelectionOutline;
        private _createBoundingBoxIfNeeded;
        private _getTransformControlsMode;
        private _setTransformControlsMode;
        private _forceUpdateSelectionControls;
        private _updateSelectionControls;
        private _updateDummyLocation;
        private _removeSelectionControls;
        activate(enable: boolean): void;
        setVisibleStatus(visible: boolean): void;
        private _sendSelectionUpdate;
        private getInstanceDataFromRuntimeObject;
        private _removeInstances;
        private _updateInstances;
        private _getInstanceData;
        isInstanceLocked(object: gdjs.RuntimeObject): boolean;
        isInstanceSealed(object: gdjs.RuntimeObject): boolean;
        private _addInstances;
        private _updateInnerAreaOutline;
        private _handleContextMenu;
        private _hasCursorStayedStillWhilePressed;
        private _sendOpenContextMenu;
        private _handleShortcuts;
        private _sendUndo;
        private _sendRedo;
        private _sendCopy;
        private _sendPaste;
        private _sendCut;
        private _forwardShortcutsToEditor;
        cancelDragNewInstance(): void;
        dragNewInstance({ name, dropped, isAltPressed, }: {
            name: string;
            dropped: boolean;
            isAltPressed: boolean;
        }): void;
        /**
         * @returns The cursor projected on the plane Z = 0 or `null` if the cursor is in the sky.
         */
        _getProjectedCursor(): FloatPoint | null;
        reloadInstances(instances: Array<InstanceData>): void;
        addInstances(instances: Array<InstanceData>): void;
        deleteSelection(): void;
        private _getClosestIntersectionUnderCursor;
        private _getCursorIn3D;
        private _getNormalizedScreenX;
        private _getNormalizedScreenY;
        getObjectUnderCursor(): gdjs.RuntimeObject | null;
        private _getObject3D;
        getCameraState(): EditorCameraState;
        restoreCameraState(editorCamera3D: EditorCameraState): void;
        private _updateMouseCursor;
        private _handleTransformControlsMode;
        private _handlePointerLock;
        updateTargetFramerate(elapsedTime: float): void;
        updateAndRender(): void;
        private _getEditorCamera;
    }
    /** @category In-Game Editor */
    export type EditorCameraState = {
        cameraMode: 'free' | 'orbit';
        positionX: float;
        positionY: float;
        positionZ: float;
        rotationAngle: float;
        elevationAngle: float;
        distance: float;
    };
    export {};
}
