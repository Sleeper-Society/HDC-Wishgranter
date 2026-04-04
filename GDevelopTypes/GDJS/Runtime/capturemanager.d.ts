declare namespace gdjs {
    /**
     * @category Core Engine > Captures
     */
    type CaptureOptions = {
        screenshots?: Array<{
            delayTimeInSeconds: number;
            signedUrl: string;
            publicUrl: string;
        }>;
    };
    /**
     * Manage the captures (screenshots, videos, etc...) that need to be taken during the game.
     * @category Core Engine > Captures
     */
    class CaptureManager {
        _gameRenderer: gdjs.RuntimeGameRenderer;
        _captureOptions: CaptureOptions;
        constructor(renderer: gdjs.RuntimeGameRenderer, captureOptions: CaptureOptions);
        /**
         * To be called when the scene has started rendering.
         */
        setupCaptureOptions(isPreview: boolean): void;
        /**
         * Take a screenshot and upload it to the server.
         */
        takeAndUploadScreenshot(signedUrl: string): Promise<void>;
    }
}
