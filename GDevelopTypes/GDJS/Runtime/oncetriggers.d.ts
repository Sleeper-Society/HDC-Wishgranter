declare namespace gdjs {
    /**
     * OnceTriggers is used to store the status of the conditions "Trigger once",
     * that are used in events to have conditions that are only valid for one frame in a row.
     * @category Core Engine > Events interfacing
     */
    type OnceTriggersSyncData = {
        onceTriggers: Record<integer, boolean>;
        lastFrameOnceTriggers: Record<integer, boolean>;
    };
    /**
     * @category Core Engine > Events interfacing
     */
    export class OnceTriggers {
        _onceTriggers: Record<integer, boolean>;
        _lastFrameOnceTrigger: Record<integer, boolean>;
        /**
         * To be called when events begin so that "Trigger once" conditions
         * are properly handled.
         */
        startNewFrame(): void;
        /**
         * Used by "Trigger once" conditions: return true only if
         * this method was not called with the same identifier during the last frame.
         * @param triggerId The identifier of the "Trigger once" condition.
         */
        triggerOnce(triggerId: integer): boolean;
        getNetworkSyncData(): OnceTriggersSyncData;
        updateNetworkSyncData(data: OnceTriggersSyncData): void;
    }
    export {};
}
