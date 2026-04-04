declare namespace gdjs {
    export interface PixiImageManager {
        _pixiAnimationFrameTextureManager: PixiAnimationFrameTextureManager;
    }
    /**
     * The renderer for a gdjs.SpriteRuntimeObject using PixiJS.
     * @category Renderers > Sprite
     */
    export class SpriteRuntimeObjectPixiRenderer {
        _object: gdjs.SpriteRuntimeObject;
        _spriteDirty: boolean;
        _textureDirty: boolean;
        _sprite: PIXI.Sprite;
        _cachedWidth: float;
        _cachedHeight: float;
        /**
         * @param runtimeObject The object
         * @param instanceContainer The scene
         */
        constructor(runtimeObject: gdjs.SpriteRuntimeObject, instanceContainer: gdjs.RuntimeInstanceContainer);
        reinitialize(runtimeObject: gdjs.SpriteRuntimeObject, instanceContainer: gdjs.RuntimeInstanceContainer): void;
        getRendererObject(): import("pixi.js").Sprite;
        /**
         * Update the internal PIXI.Sprite position, angle...
         */
        _updatePIXISprite(): void;
        /**
         * Call this to make sure the sprite is ready to be rendered.
         */
        ensureUpToDate(): void;
        /**
         * Update the internal texture of the PIXI sprite.
         */
        updateFrame(animationFrame: gdjs.SpriteAnimationFrame<PIXI.Texture>): void;
        update(): void;
        updateX(): void;
        updateY(): void;
        updateAngle(): void;
        updateOpacity(): void;
        updateVisibility(): void;
        setColor(rgbOrHexColor: string): void;
        getColor(): string;
        getWidth(): float;
        getHeight(): float;
        getUnscaledWidth(): float;
        getUnscaledHeight(): float;
        static getAnimationFrameTextureManager(imageManager: gdjs.PixiImageManager): PixiAnimationFrameTextureManager;
    }
    /**
     * @category Renderers > Sprite
     */
    class PixiAnimationFrameTextureManager implements gdjs.AnimationFrameTextureManager<PIXI.Texture> {
        private _imageManager;
        constructor(imageManager: gdjs.PixiImageManager);
        getAnimationFrameTexture(imageName: string): import("pixi.js").Texture<import("pixi.js").Resource>;
        getAnimationFrameWidth(pixiTexture: PIXI.Texture): number;
        getAnimationFrameHeight(pixiTexture: PIXI.Texture): number;
    }
    /**
     * @category Renderers > Sprite
     */
    export const SpriteRuntimeObjectRenderer: typeof SpriteRuntimeObjectPixiRenderer;
    /**
     * @category Renderers > Sprite
     */
    export type SpriteRuntimeObjectRenderer = SpriteRuntimeObjectPixiRenderer;
    export {};
}
