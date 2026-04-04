declare namespace gdjs {
    /**
     * Base parameters for {@link gdjs.BBTextRuntimeObject}
     * @category Objects > BBText
     */
    type BBTextObjectDataType = {
        /** The base parameters of the BBText */
        content: {
            /** The opacity of the BBText */
            opacity: number;
            /** Deprecated - Is the text visible? */
            visible: boolean;
            /** Content of the text */
            text: string;
            /** The color of the text */
            color: string;
            /** The font of the text */
            fontFamily: string;
            /** The size of the text */
            fontSize: number;
            /** Activate word wrap if set to true */
            wordWrap: boolean;
            /** Alignment of the text: "left", "center" or "right" */
            align: 'left' | 'center' | 'right';
            verticalTextAlignment: 'top' | 'center' | 'bottom';
        };
    };
    /**
     * @category Objects > BBText
     */
    type BBTextObjectData = ObjectData & BBTextObjectDataType;
    /**
     * @category Objects > BBText
     */
    type BBTextObjectNetworkSyncDataType = {
        text: string;
        o: float;
        c: number[];
        ff: string;
        fs: number;
        wwrap: boolean;
        wwidth: float;
        align: string;
        vta: string;
        hidden: boolean;
    };
    /**
     * @category Objects > BBText
     */
    type BBTextObjectNetworkSyncData = ObjectNetworkSyncData & BBTextObjectNetworkSyncDataType;
    /**
     * Displays a rich text using BBCode markup (allowing to set parts of the text as bold, italic, use different colors and shadows).
     * @category Objects > BBText
     */
    class BBTextRuntimeObject extends gdjs.RuntimeObject implements gdjs.OpacityHandler {
        _opacity: float;
        _text: string;
        /** color in format [r, g, b], where each component is in the range [0, 255] */
        _color: integer[];
        _fontFamily: string;
        _fontSize: float;
        _wrapping: boolean;
        _wrappingWidth: float;
        _textAlign: string;
        _verticalTextAlignment: string;
        _renderer: gdjs.BBTextRuntimeObjectRenderer;
        hidden: boolean;
        /**
         * @param instanceContainer The container the object belongs to.
         * @param objectData The object data used to initialize the object
         */
        constructor(instanceContainer: gdjs.RuntimeInstanceContainer, objectData: BBTextObjectData, instanceData?: InstanceData);
        getRendererObject(): MultiStyleText;
        updateFromObjectData(oldObjectData: BBTextObjectDataType, newObjectData: BBTextObjectDataType): boolean;
        getNetworkSyncData(syncOptions: GetNetworkSyncDataOptions): BBTextObjectNetworkSyncData;
        updateFromNetworkSyncData(networkSyncData: BBTextObjectNetworkSyncData, options: UpdateFromNetworkSyncDataOptions): void;
        extraInitializationFromInitialInstance(initialInstanceData: InstanceData): void;
        onDestroyed(): void;
        /**
         * Set the markup text to display.
         */
        setBBText(text: string): void;
        /**
         * Get the markup text displayed by the object.
         */
        getBBText(): string;
        setColor(rgbColorString: string): void;
        /**
         * Get the base color.
         * @return The color as a "R;G;B" string, for example: "255;0;0"
         */
        getColor(): string;
        setFontSize(fontSize: float): void;
        getFontSize(): number;
        setFontFamily(fontFamily: string): void;
        getFontFamily(): string;
        /**
         * @deprecated Use `setTextAlignment` instead
         */
        setAlignment(align: string): void;
        setTextAlignment(align: string): void;
        /**
         * @deprecated Use `getTextAlignment` instead
         */
        getAlignment(): string;
        getTextAlignment(): string;
        /**
         * Set the text alignment on Y axis for multiline text objects.
         * @param alignment The text alignment.
         */
        setVerticalTextAlignment(alignment: string): void;
        /**
         * Get the text alignment on Y axis of text object.
         * @return The text alignment.
         */
        getVerticalTextAlignment(): string;
        setX(x: float): void;
        setY(y: float): void;
        setAngle(angle: float): void;
        /**
         * Set object opacity.
         * @param opacity The new opacity of the object (0-255).
         */
        setOpacity(opacity: float): void;
        /**
         * Get object opacity.
         */
        getOpacity(): number;
        /**
         * Set the width.
         * @param width The new width in pixels.
         */
        setWrappingWidth(width: float): void;
        /**
         * Get the wrapping width of the object.
         */
        getWrappingWidth(): float;
        setWrapping(wordWrap: boolean): void;
        isWrapping(): boolean;
        getWidth(): float;
        getHeight(): float;
        setWidth(width: float): void;
        getDrawableY(): float;
    }
}
