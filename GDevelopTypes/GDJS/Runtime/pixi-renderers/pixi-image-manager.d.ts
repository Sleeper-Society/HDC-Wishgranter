declare namespace gdjs {
    /**
     * PixiImageManager loads and stores textures that can be used by the Pixi.js renderers.
     * @category Resources > Images/Textures
     */
    class PixiImageManager implements gdjs.ResourceManager {
        /**
         * The invalid texture is a 8x8 PNG file filled with magenta (#ff00ff), to be
         * easily spotted if rendered on screen.
         */
        private _invalidTexture;
        /**
         * Map associating a resource name to the loaded PixiJS texture.
         */
        private _loadedTextures;
        /**
         * Map associating a resource name to the loaded Three.js texture.
         */
        private _loadedThreeTextures;
        private _loadedThreeMaterials;
        private _loadedThreeCubeTextures;
        private _loadedThreeCubeTextureKeysByResourceName;
        private _diskTextures;
        private _rectangleTextures;
        private _scaledTextures;
        private _resourceLoader;
        /**
         * @param resourceLoader The resources loader of the game.
         */
        constructor(resourceLoader: gdjs.ResourceLoader);
        getResourceKinds(): ResourceKind[];
        /**
         * Return the PIXI texture associated to the specified resource name.
         * Returns a placeholder texture if not found.
         * @param resourceName The name of the resource
         * @returns The requested texture, or a placeholder if not found.
         */
        getPIXITexture(resourceName: string): PIXI.Texture;
        /**
         * Return the PIXI texture associated to the specified resource name.
         * If not found in the loaded textures, this method will try to load it.
         * Warning: this method should only be used in specific cases that cannot rely on
         * the initial resources loading of the game, such as the splashscreen.
         * @param resourceName The name of the resource
         * @returns The requested texture, or a placeholder if not valid.
         */
        getOrLoadPIXITexture(resourceName: string): PIXI.Texture;
        /**
         * Return the three.js texture associated to the specified resource name.
         * Returns a placeholder texture if not found.
         * @param resourceName The name of the resource
         * @returns The requested texture, or a placeholder if not found.
         */
        getThreeTexture(resourceName: string): THREE.Texture;
        private _getImageSource;
        /**
         * Return the three.js texture associated to the specified resource name.
         * Returns a placeholder texture if not found.
         * @param xPositiveResourceName The name of the resource
         * @returns The requested cube texture, or a placeholder if not found.
         */
        getThreeCubeTexture(xPositiveResourceName: string, xNegativeResourceName: string, yPositiveResourceName: string, yNegativeResourceName: string, zPositiveResourceName: string, zNegativeResourceName: string): THREE.CubeTexture;
        /**
         * Return the three.js material associated to the specified resource name.
         * @param resourceName The name of the resource
         * @param options
         * @returns The requested material.
         */
        getThreeMaterial(resourceName: string, options: {
            useTransparentTexture: boolean;
            forceBasicMaterial: boolean;
            vertexColors: boolean;
        }): THREE.Material;
        /**
         * Return the PIXI video texture associated to the specified resource name.
         * Returns a placeholder texture if not found.
         * @param resourceName The name of the resource to get.
         */
        getPIXIVideoTexture(resourceName: string): import("pixi.js").Texture<import("pixi.js").Resource>;
        private _getImageResource;
        /**
         * Return a PIXI texture which can be used as a placeholder when no
         * suitable texture can be found.
         */
        getInvalidPIXITexture(): import("pixi.js").Texture<import("pixi.js").Resource>;
        /**
         * Load the specified resources, so that textures are loaded and can then be
         * used by calling `getPIXITexture`.
         */
        loadResource(resourceName: string): Promise<void>;
        processResource(resourceName: string): Promise<void>;
        /**
         * Load the specified resources, so that textures are loaded and can then be
         * used by calling `getPIXITexture`.
         * @param onProgress Callback called each time a new file is loaded.
         */
        _loadTexture(resource: ResourceData): Promise<void>;
        /**
         * Return a texture containing a circle filled with white.
         * @param radius The circle radius
         * @param pixiRenderer The renderer used to generate the texture
         */
        getOrCreateDiskTexture(radius: float, pixiRenderer: PIXI.Renderer): PIXI.Texture;
        /**
         * Return a texture filled with white.
         * @param width The texture width
         * @param height The texture height
         * @param pixiRenderer The renderer used to generate the texture
         */
        getOrCreateRectangleTexture(width: float, height: float, pixiRenderer: PIXI.Renderer): PIXI.Texture;
        /**
         * Return a texture rescaled according to given dimensions.
         * @param width The texture width
         * @param height The texture height
         * @param pixiRenderer The renderer used to generate the texture
         */
        getOrCreateScaledTexture(imageResourceName: string, width: float, height: float, pixiRenderer: PIXI.Renderer): PIXI.Texture;
        /**
         * To be called when the game is disposed.
         * Clear caches of loaded textures and materials.
         */
        dispose(): void;
        unloadResource(resourceData: ResourceData): void;
    }
    /** @category Resources > Images/Textures */
    const ImageManager: typeof PixiImageManager;
    /** @category Resources > Images/Textures */
    type ImageManager = gdjs.PixiImageManager;
}
