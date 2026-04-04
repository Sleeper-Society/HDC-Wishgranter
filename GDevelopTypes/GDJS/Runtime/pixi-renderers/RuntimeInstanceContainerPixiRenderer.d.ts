declare namespace gdjs {
    /**
     * A render for instance container.
     *
     * @see gdjs.RuntimeInstanceContainer
     * @category Renderers > Instance Container
     */
    interface RuntimeInstanceContainerPixiRenderer {
        /**
         * Change the position of a layer.
         *
         * @param layer The layer to reorder
         * @param index The new position in the list of layers
         *
         * @see gdjs.RuntimeInstanceContainer.setLayerIndex
         */
        setLayerIndex(layer: gdjs.RuntimeLayer, index: integer): void;
        getRendererObject(): PIXI.Container | null;
        get3DRendererObject(): THREE.Object3D | null;
    }
    /**
     * @category Renderers > Instance Container
     */
    type RuntimeInstanceContainerRenderer = gdjs.RuntimeInstanceContainerPixiRenderer;
}
