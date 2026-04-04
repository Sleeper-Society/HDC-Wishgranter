declare namespace gdjs {
    /**
     * The PIXI.js renderer for the BBCode Text runtime object.
     * @category Renderers > BBText
     */
    class BBTextRuntimeObjectPixiRenderer {
        _object: gdjs.BBTextRuntimeObject;
        _pixiObject: MultiStyleText;
        /**
         * @param runtimeObject The object to render
         * @param instanceContainer The gdjs.RuntimeInstanceContainer in which the object is
         */
        constructor(runtimeObject: gdjs.BBTextRuntimeObject, instanceContainer: gdjs.RuntimeInstanceContainer);
        getRendererObject(): MultiStyleText;
        updateWordWrap(): void;
        updateWrappingWidth(): void;
        updateText(): void;
        updateColor(): void;
        updateAlignment(): void;
        updateFontFamily(): void;
        updateFontSize(): void;
        updatePosition(): void;
        updateAngle(): void;
        updateOpacity(): void;
        getWidth(): float;
        getHeight(): float;
        destroy(): void;
    }
    /**
     * @category Renderers > BBText
     */
    const BBTextRuntimeObjectRenderer: typeof BBTextRuntimeObjectPixiRenderer;
    /**
     * @category Renderers > BBText
     */
    type BBTextRuntimeObjectRenderer = BBTextRuntimeObjectPixiRenderer;
}
