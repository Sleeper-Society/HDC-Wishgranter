declare namespace gdjs {
    /** @category Behaviors > Default behaviors */
    interface Flippable {
        flipX(enable: boolean): void;
        flipY(enable: boolean): void;
        isFlippedX(): boolean;
        isFlippedY(): boolean;
    }
    /**
     * A behavior that forwards the Flippable interface to its object.
     * @category Behaviors > Default behaviors
     */
    class FlippableBehavior extends gdjs.RuntimeBehavior implements Flippable {
        private object;
        constructor(instanceContainer: gdjs.RuntimeInstanceContainer, behaviorData: any, owner: gdjs.RuntimeObject & Flippable);
        usesLifecycleFunction(): boolean;
        applyBehaviorOverriding(behaviorData: any): boolean;
        onDeActivate(): void;
        onDestroy(): void;
        doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer): void;
        doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer): void;
        flipX(enable: boolean): void;
        flipY(enable: boolean): void;
        isFlippedX(): boolean;
        isFlippedY(): boolean;
    }
}
