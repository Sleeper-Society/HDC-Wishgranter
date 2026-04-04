declare namespace gdjs {
    export interface PixiImageManager {
        _threeAnimationFrameTextureManager: ThreeAnimationFrameTextureManager;
    }
    /**
     * The renderer for a {@link gdjs.CustomRuntimeObject3D} using Three.js.
     * @category Renderers > Custom Object 3D
     */
    export class CustomRuntimeObject3DRenderer implements gdjs.RuntimeInstanceContainerRenderer {
        _object: gdjs.CustomRuntimeObject3D;
        _instanceContainer: gdjs.CustomRuntimeObjectInstanceContainer;
        _isContainerDirty: boolean;
        _threeGroup: THREE.Group;
        constructor(object: gdjs.CustomRuntimeObject3D, instanceContainer: gdjs.CustomRuntimeObjectInstanceContainer, parent: gdjs.RuntimeInstanceContainer);
        get3DRendererObject(): THREE.Object3D;
        getRendererObject(): null;
        reinitialize(object: gdjs.CustomRuntimeObject3D, parent: gdjs.RuntimeInstanceContainer): void;
        _updateThreeGroup(): void;
        /**
         * Call this to make sure the object is ready to be rendered.
         */
        ensureUpToDate(): void;
        update(): void;
        updateX(): void;
        updateY(): void;
        updateAngle(): void;
        updatePosition(): void;
        updateRotation(): void;
        updateSize(): void;
        updateVisibility(): void;
        updateOpacity(): void;
        setLayerIndex(layer: gdjs.RuntimeLayer, index: float): void;
        static getAnimationFrameTextureManager(imageManager: gdjs.PixiImageManager): ThreeAnimationFrameTextureManager;
    }
    class ThreeAnimationFrameTextureManager implements gdjs.AnimationFrameTextureManager<THREE.Material> {
        private _imageManager;
        constructor(imageManager: gdjs.PixiImageManager);
        getAnimationFrameTexture(imageName: string): THREE.Material;
        getAnimationFrameWidth(material: THREE.Material): any;
        getAnimationFrameHeight(material: THREE.Material): any;
    }
    export {};
}
