declare namespace gdjs {
    /**
     * Base class for 2D custom objects.
     * @category Objects > Custom Object
     */
    class CustomRuntimeObject2D extends gdjs.CustomRuntimeObject {
        constructor(parent: gdjs.RuntimeInstanceContainer, objectData: ObjectData & CustomObjectConfiguration, instanceData?: InstanceData);
        protected _createRender(): gdjs.CustomRuntimeObject2DRenderer;
        protected _reinitializeRenderer(): void;
        getRenderer(): gdjs.CustomRuntimeObject2DRenderer;
        getRendererObject(): import("pixi.js").Container<import("pixi.js").DisplayObject>;
    }
}
