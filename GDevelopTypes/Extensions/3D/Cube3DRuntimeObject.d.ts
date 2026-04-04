declare namespace gdjs {
    /**
     * Base parameters for {@link gdjs.Cube3DRuntimeObject}
     * @category Objects > 3D Box
     */
    export interface Cube3DObjectData extends Object3DData {
        /** The base parameters of the Cube3D object */
        content: Object3DDataContent & {
            enableTextureTransparency: boolean | undefined;
            facesOrientation: 'Y' | 'Z' | undefined;
            frontFaceResourceName: string;
            backFaceResourceName: string;
            backFaceUpThroughWhichAxisRotation: 'X' | 'Y' | undefined;
            leftFaceResourceName: string;
            rightFaceResourceName: string;
            topFaceResourceName: string;
            bottomFaceResourceName: string;
            frontFaceResourceRepeat: boolean | undefined;
            backFaceResourceRepeat: boolean | undefined;
            leftFaceResourceRepeat: boolean | undefined;
            rightFaceResourceRepeat: boolean | undefined;
            topFaceResourceRepeat: boolean | undefined;
            bottomFaceResourceRepeat: boolean | undefined;
            frontFaceVisible: boolean;
            backFaceVisible: boolean;
            leftFaceVisible: boolean;
            rightFaceVisible: boolean;
            topFaceVisible: boolean;
            bottomFaceVisible: boolean;
            tint: string | undefined;
            isCastingShadow: boolean;
            isReceivingShadow: boolean;
            materialType: 'Basic' | 'StandardWithoutMetalness';
        };
    }
    type FaceName = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
    type Cube3DObjectNetworkSyncDataType = {
        fo: 'Y' | 'Z';
        bfu: 'X' | 'Y';
        vfb: integer;
        trfb: integer;
        frn: [string, string, string, string, string, string];
        mt: number;
        tint: string;
    };
    type Cube3DObjectNetworkSyncData = Object3DNetworkSyncData & Cube3DObjectNetworkSyncDataType;
    /**
     * Shows a 3D box object.
     * @category Objects > 3D Box
     */
    export class Cube3DRuntimeObject extends gdjs.RuntimeObject3D {
        private _renderer;
        private _facesOrientation;
        private _backFaceUpThroughWhichAxisRotation;
        private _shouldUseTransparentTexture;
        private _visibleFacesBitmask;
        private _textureRepeatFacesBitmask;
        private _faceResourceNames;
        _materialType: gdjs.Cube3DRuntimeObject.MaterialType;
        _tint: string;
        _isCastingShadow: boolean;
        _isReceivingShadow: boolean;
        constructor(instanceContainer: gdjs.RuntimeInstanceContainer, objectData: Cube3DObjectData, instanceData?: InstanceData);
        /**
         * Sets the visibility of a face of the 3D box.
         *
         * @param faceName - The name of the face to set visibility for.
         * @param enable - The visibility value to set.
         */
        setFaceVisibility(faceName: FaceName, enable: boolean): void;
        /**
         * Sets the texture repeat of a face of the 3D box.
         *
         * @param faceName - The name of the face to set visibility for.
         * @param enable - The visibility value to set.
         */
        setRepeatTextureOnFace(faceName: FaceName, enable: boolean): void;
        isFaceVisible(faceName: FaceName): boolean;
        /** @internal */
        isFaceAtIndexVisible(faceIndex: any): boolean;
        /** @internal */
        shouldRepeatTextureOnFaceAtIndex(faceIndex: any): boolean;
        setFaceResourceName(faceName: FaceName, resourceName: string): void;
        setColor(tint: string): void;
        getColor(): string;
        /** @internal */
        getFaceAtIndexResourceName(faceIndex: integer): string;
        getRenderer(): gdjs.RuntimeObject3DRenderer;
        getBackFaceUpThroughWhichAxisRotation(): 'X' | 'Y';
        setBackFaceUpThroughWhichAxisRotation(axis: 'X' | 'Y'): void;
        getFacesOrientation(): 'Y' | 'Z';
        setFacesOrientation(orientation: 'Y' | 'Z'): void;
        updateFromObjectData(oldObjectData: Cube3DObjectData, newObjectData: Cube3DObjectData): boolean;
        getNetworkSyncData(syncOptions: GetNetworkSyncDataOptions): Cube3DObjectNetworkSyncData;
        updateFromNetworkSyncData(networkSyncData: Cube3DObjectNetworkSyncData, options: UpdateFromNetworkSyncDataOptions): void;
        /**
         * Return true if the texture transparency should be enabled.
         */
        shouldUseTransparentTexture(): boolean;
        _convertMaterialType(materialTypeString: string): gdjs.Cube3DRuntimeObject.MaterialType;
        setMaterialType(materialTypeString: string): void;
        updateShadowCasting(value: boolean): void;
        updateShadowReceiving(value: boolean): void;
    }
    /** @category Objects > 3D Box */
    export namespace Cube3DRuntimeObject {
        enum MaterialType {
            Basic = 0,
            StandardWithoutMetalness = 1
        }
    }
    export {};
}
