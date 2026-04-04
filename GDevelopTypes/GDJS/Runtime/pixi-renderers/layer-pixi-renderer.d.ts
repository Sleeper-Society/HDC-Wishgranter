declare namespace gdjs {
    /**
     * The renderer for a gdjs.Layer using Pixi.js.
     * @category Renderers > Layers
     */
    class LayerPixiRenderer {
        private _pixiContainer;
        private _layer;
        /** For a lighting layer, the sprite used to display the render texture. */
        private _lightingSprite;
        private _isLightingLayer;
        private _clearColor;
        /**
         * The render texture where the whole 2D layer is rendered.
         * The render texture is then used for lighting (if it's a light layer)
         * or to be rendered in a 3D scene (for a 2D+3D layer).
         */
        private _renderTexture;
        private _oldWidth;
        private _oldHeight;
        private _threeGroup;
        private _threeScene;
        private _threeCamera;
        private _threeCameraDirty;
        private _threeEffectComposer;
        private _threePlaneTexture;
        private _threePlaneGeometry;
        private _threePlaneMaterial;
        private _threePlaneMesh;
        private _threePlaneMeshDebugOutline;
        /**
         * Pixi doesn't sort children with zIndex == 0.
         */
        private static readonly zeroZOrderForPixi;
        private static vectorForProjections;
        /**
         * @param layer The layer
         * @param runtimeInstanceContainerRenderer The scene renderer
         */
        constructor(layer: gdjs.RuntimeLayer, runtimeInstanceContainerRenderer: gdjs.RuntimeInstanceContainerRenderer, runtimeGameRenderer: gdjs.RuntimeGameRenderer);
        onCreated(): void;
        onGameResolutionResized(): void;
        private _update3DCameraAspectAndPosition;
        getRendererObject(): PIXI.Container;
        getThreeScene(): THREE.Scene | null;
        getThreeGroup(): THREE.Group | null;
        getThreeCamera(): THREE.PerspectiveCamera | THREE.OrthographicCamera | null;
        getThreeEffectComposer(): THREE_ADDONS.EffectComposer | null;
        addPostProcessingPass(pass: THREE_ADDONS.Pass): void;
        removePostProcessingPass(pass: THREE_ADDONS.Pass): void;
        hasPostProcessingPass(): boolean;
        /**
         * The sprite, displaying the "render texture" of the layer, to display
         * for a lighting layer.
         */
        getLightingSprite(): PIXI.Sprite | null;
        /**
         * Create, or re-create, Three.js objects for 3D rendering of this layer.
         */
        private _setup3DRendering;
        setCamera3DNearPlaneDistance(distance: number): void;
        getCamera3DNearPlaneDistance(): float;
        setCamera3DFarPlaneDistance(distance: number): void;
        getCamera3DFarPlaneDistance(): float;
        setCamera3DFieldOfView(angle: number): void;
        getCamera3DFieldOfView(): float;
        show2DRenderingPlane(enable: boolean): void;
        /**
         * Enable or disable the drawing of an outline of the 2D rendering plane.
         * Useful to visually see where the 2D rendering is done in the 3D world.
         */
        show2DRenderingPlaneDebugOutline(enable: boolean): void;
        /** Maximum size of the 2D plane, in pixels. */
        private _2DPlaneMaxDrawingDistance;
        /** Tilt degrees below which the 2D plane is not clamped. */
        private _2DPlaneClampFreeTiltDeg;
        /** Tilt degrees below which the 2D plane is fully clamped. */
        private _2DPlaneClampHardTiltDeg;
        private _2DPlaneClampRampPower;
        /**
         * Set the maximum "drawing distance", in pixels, of the 2D when in the 3D world.
         * This corresponds to the "height" of the 2D plane.
         * Used when the 3D camera is tilted on the X or Y axis (instead of looking down the Z axis,
         * as it's done by default for 2D games).
         * This is useful to avoid the 2D plane being too big when the camera is tilted.
         */
        set2DPlaneMaxDrawingDistance(h: float): void;
        get2DPlaneMaxDrawingDistance(): float;
        /**
         * Set the tilt degrees below which the 2D plane is not clamped.
         */
        set2DPlaneClampFreeTiltDegrees(d: number): void;
        /**
         * Set the tilt degrees below which the 2D plane is clamped (see `set2DPlaneMaxDrawingDistance`).
         */
        set2DPlaneClampHardTiltDegrees(d: number): void;
        /**
         * Set the ramp power of the 2D plane clamping (see `set2DPlaneMaxDrawingDistance`). Used
         * for smoother transition between clamped and unclamped.
         */
        set2DPlaneClampRampPower(p: number): void;
        /**
         * Get the size of the 2D plane, in the world coordinates.
         */
        private _get2DPlaneSize;
        private _get2DPlanePosition;
        updatePosition(): void;
        updateResolution(): void;
        isCameraRotatedIn3D(): boolean | null;
        transformTo3DWorld(screenX: float, screenY: float, worldZ: float, cameraId: integer, result: FloatPoint): FloatPoint;
        updateVisibility(visible: boolean): void;
        updatePreRender(): void;
        /**
         * Add a child to the pixi container associated to the layer.
         * All objects which are on this layer must be children of this container.
         *
         * @param pixiChild The child (PIXI object) to be added.
         * @param zOrder The z order of the associated object.
         */
        addRendererObject(pixiChild: any, zOrder: float): void;
        /**
         * Change the z order of a child associated to an object.
         *
         * @param pixiChild The child (PIXI object) to be modified.
         * @param newZOrder The z order of the associated object.
         */
        changeRendererObjectZOrder(pixiChild: any, newZOrder: float): void;
        /**
         * Remove a child from the internal pixi container.
         * Should be called when an object is deleted or removed from the layer.
         *
         * @param child The child (PIXI object) to be removed.
         */
        removeRendererObject(child: any): void;
        has3DObjects(): boolean;
        has2DObjects(): boolean;
        add3DRendererObject(object: THREE.Object3D): void;
        remove3DRendererObject(object: THREE.Object3D): void;
        updateClearColor(): void;
        /**
         * Create the PixiJS RenderTexture used to display the whole layer.
         * Can be used either for lighting or for rendering the layer in a texture
         * so it can then be consumed by Three.js to render it in 3D.
         */
        private _createPixiRenderTexture;
        /**
         * Render the layer of the PixiJS RenderTexture, so that it can be then displayed
         * with a blend mode (for a lighting layer) or consumed by Three.js (for 2D+3D layers).
         */
        renderOnPixiRenderTexture(pixiRenderer: PIXI.Renderer): void;
        /**
         * Set the texture of the 2D plane in the 3D world to be the same WebGL texture
         * as the PixiJS RenderTexture - so that the 2D rendering can be shown in the 3D world.
         */
        updateThreePlaneTextureFromPixiRenderTexture(threeRenderer: THREE.WebGLRenderer, pixiRenderer: PIXI.Renderer): void;
        /**
         * Enable the use of a PIXI.RenderTexture to render the PIXI.Container
         * of the layer and, in the scene PIXI container, replace the container
         * of the layer by a sprite showing this texture.
         * used only in lighting for now as the sprite could have MULTIPLY blend mode.
         */
        private _setupLightingRendering;
    }
    /**
     * @category Renderers > Layers
     */
    type LayerRenderer = gdjs.LayerPixiRenderer;
    /**
     * @category Renderers > Layers
     */
    const LayerRenderer: typeof LayerPixiRenderer;
}
