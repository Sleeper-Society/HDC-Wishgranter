declare const _exports: {
    new (t: any, e: any): {
        [x: string]: any;
        styles: any;
        handleInteraction(t: any): void;
        textStyles: {} | undefined;
        setTagStyle(t: any, e: any): void;
        deleteTagStyle(t: any): void;
        getTagRegex(t: any, e: any): RegExp;
        getPropertyRegex(): RegExp;
        getBBcodePropertyRegex(): RegExp;
        _getTextDataPerLine(t: any): {
            text: any;
            style: any;
            width: number;
            height: number;
            fontProperties: undefined;
            tag: any;
        }[][];
        getFontString(t: any): any;
        createTextData(t: any, e: any, s: any): {
            text: any;
            style: any;
            width: number;
            height: number;
            fontProperties: undefined;
            tag: any;
        };
        getDropShadowPadding(): number;
        withPrivateMembers(): any;
        updateText(): void;
        hitboxes: any[] | undefined;
        wordWrap(t: any): string;
        updateTexture(): void;
        assign(t: any, ...e: any[]): any;
    };
    [x: string]: any;
    DEFAULT_TAG_STYLE: {
        align: string;
        breakWords: boolean;
        dropShadow: boolean;
        dropShadowAngle: number;
        dropShadowBlur: number;
        dropShadowColor: string;
        dropShadowDistance: number;
        fill: string;
        fillGradientType: any;
        fontFamily: string;
        fontSize: number;
        fontStyle: string;
        fontVariant: string;
        fontWeight: string;
        letterSpacing: number;
        lineHeight: number;
        lineJoin: string;
        miterLimit: number;
        padding: number;
        stroke: string;
        strokeThickness: number;
        textBaseline: string;
        valign: string;
        wordWrap: boolean;
        wordWrapWidth: number;
        tagStyle: string;
    };
    debugOptions: {
        spans: {
            enabled: boolean;
            baseline: string;
            top: string;
            bottom: string;
            bounding: string;
            text: boolean;
        };
        objects: {
            enabled: boolean;
            bounding: string;
            text: boolean;
        };
    };
};
export = _exports;
