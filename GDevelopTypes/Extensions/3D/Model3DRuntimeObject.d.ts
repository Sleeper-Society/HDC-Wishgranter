declare namespace gdjs {
    type Model3DAnimation = {
        name: string;
        source: string;
        loop: boolean;
    };
    type Model3DObjectNetworkSyncDataType = {
        mt: number;
        op: LocationPoint | null;
        cp: LocationPoint | null;
        anis: Model3DAnimation[];
        ai: integer;
        ass: float;
        aet: float;
        ap: boolean;
        cfd: float;
    };
    type Model3DObjectNetworkSyncData = Object3DNetworkSyncData & Model3DObjectNetworkSyncDataType;
    /**
     * Base parameters for {@link gdjs.Model3DRuntimeObject}
     * @category Objects > 3D Model
     */
    export interface Model3DObjectData extends Object3DData {
        /** The base parameters of the Model3D object */
        content: Object3DDataContent & {
            modelResourceName: string;
            rotationX: number;
            rotationY: number;
            rotationZ: number;
            keepAspectRatio: boolean;
            materialType: 'Basic' | 'StandardWithoutMetalness' | 'KeepOriginal';
            originLocation: 'ModelOrigin' | 'ObjectCenter' | 'BottomCenterZ' | 'BottomCenterY' | 'TopLeft';
            centerLocation: 'ModelOrigin' | 'ObjectCenter' | 'CenteredOnZ' | 'BottomCenterZ' | 'BottomCenterY';
            animations: Model3DAnimation[];
            crossfadeDuration: float;
            isCastingShadow: boolean;
            isReceivingShadow: boolean;
        };
    }
    type LocationPoint = [float | null, float | null, float | null];
    /**
     * A 3D object which displays a 3D model.
     * @category Objects > 3D Model
     */
    export class Model3DRuntimeObject extends gdjs.RuntimeObject3D implements gdjs.Animatable {
        _renderer: gdjs.Model3DRuntimeObjectRenderer;
        _modelResourceName: string;
        _materialType: gdjs.Model3DRuntimeObject.MaterialType;
        /**
         * The local point of the model that will be at the object position.
         *
         * Coordinates are between 0 and 1.
         *
         * Its value is `null` when the point is configured to `"ModelOrigin"`
         * because the model origin needs to be evaluated according to the object
         * configuration.
         * @see gdjs.Model3DRuntimeObject3DRenderer.getOriginPoint
         */
        _originPoint: LocationPoint;
        /**
         * The local point of the model that is used as rotation center.
         *
         * Coordinates are between 0 and 1.
         *
         * Its value is `null` when the point is configured to `"ModelOrigin"`
         * because the model origin needs to be evaluated according to the object
         * configuration.
         * @see gdjs.Model3DRuntimeObject3DRenderer.getCenterPoint
         */
        _centerPoint: LocationPoint;
        _animations: Model3DAnimation[];
        _currentAnimationIndex: integer;
        _animationSpeedScale: float;
        _animationPaused: boolean;
        _crossfadeDuration: float;
        _isCastingShadow: boolean;
        _isReceivingShadow: boolean;
        _data: Model3DObjectData;
        constructor(instanceContainer: gdjs.RuntimeInstanceContainer, objectData: Model3DObjectData, instanceData?: InstanceData);
        /**
         * To be called after the renderer loaded a Model resource:
         * - After the renderer was instantiated
         * - After reloading the model
         */
        private onModelChanged;
        updateOriginalDimensionsFromObjectData(oldObjectData: Object3DData, newObjectData: Object3DData): void;
        updateFromObjectData(oldObjectData: Model3DObjectData, newObjectData: Model3DObjectData): boolean;
        getNetworkSyncData(syncOptions: GetNetworkSyncDataOptions): Model3DObjectNetworkSyncData;
        updateFromNetworkSyncData(networkSyncData: Model3DObjectNetworkSyncData, options: UpdateFromNetworkSyncDataOptions): void;
        _reloadModel(objectData: Model3DObjectData): void;
        _updateModel(objectData: Model3DObjectData): void;
        getRenderer(): RuntimeObject3DRenderer;
        _convertMaterialType(materialTypeString: string): gdjs.Model3DRuntimeObject.MaterialType;
        update(instanceContainer: gdjs.RuntimeInstanceContainer): void;
        /**
         * Get the index of the animation being played.
         * @return The index of the new animation being played
         */
        getAnimationIndex(): number;
        /**
         * Change the animation being played.
         * @param animationIndex The index of the new animation to be played
         */
        setAnimationIndex(animationIndex: number): void;
        /**
         * Get the name of the animation being played.
         * @return The name of the new animation being played
         */
        getAnimationName(): string;
        /**
         * Change the animation being played.
         * @param newAnimationName The name of the new animation to be played
         */
        setAnimationName(newAnimationName: string): void;
        isCurrentAnimationName(name: string): boolean;
        /**
         * Return true if animation has ended.
         * The animation had ended if:
         * - it's not configured as a loop;
         * - the current frame is the last frame;
         * - the last frame has been displayed long enough.
         */
        hasAnimationEnded(): boolean;
        setIsCastingShadow(value: boolean): void;
        setIsReceivingShadow(value: boolean): void;
        setCrossfadeDuration(duration: number): void;
        isAnimationPaused(): boolean;
        pauseAnimation(): void;
        resumeAnimation(): void;
        getAnimationSpeedScale(): number;
        setAnimationSpeedScale(ratio: float): void;
        getAnimationElapsedTime(): float;
        setAnimationElapsedTime(time: float): void;
        getAnimationDuration(): float;
        getCenterX(): float;
        getCenterY(): float;
        getCenterZ(): float;
        getDrawableX(): float;
        getDrawableY(): float;
        getDrawableZ(): float;
    }
    /** @category Objects > 3D Model */
    export namespace Model3DRuntimeObject {
        enum MaterialType {
            Basic = 0,
            StandardWithoutMetalness = 1,
            KeepOriginal = 2
        }
    }
    export {};
}
