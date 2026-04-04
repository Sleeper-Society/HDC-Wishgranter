declare namespace gdjs {
    /** @category Renderers */
    abstract class RuntimeObject3DRenderer {
        protected _object: gdjs.RuntimeObject3D;
        private _threeObject3D;
        constructor(runtimeObject: gdjs.RuntimeObject3D, instanceContainer: gdjs.RuntimeInstanceContainer, threeObject3D: THREE.Object3D);
        get3DRendererObject(): THREE.Object3D<THREE.Object3DEventMap>;
        updatePosition(): void;
        updateRotation(): void;
        updateSize(): void;
        updateVisibility(): void;
    }
}
