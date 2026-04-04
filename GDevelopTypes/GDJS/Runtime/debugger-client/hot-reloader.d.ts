declare namespace gdjs {
    /**
     * @category Debugging > Hot reloader
     */
    export type HotReloaderLog = {
        message: string;
        kind: 'fatal' | 'error' | 'warning' | 'info';
    };
    /**
     * @category Debugging > Hot reloader
     */
    export type ChangedRuntimeBehavior = {
        oldBehaviorConstructor: Function;
        newBehaviorConstructor: Function;
        behaviorTypeName: string;
    };
    type HotReloadOptions = {
        shouldReloadResources: boolean;
        projectData: ProjectData;
        runtimeGameOptions: RuntimeGameOptions;
    };
    /**
     * Reload scripts/data of an exported game and applies the changes
     * to the running runtime game.
     * @category Debugging > Hot reloader
     */
    export class HotReloader {
        _runtimeGame: gdjs.RuntimeGame;
        _reloadedScriptElement: Record<string, HTMLScriptElement>;
        _logs: HotReloaderLog[];
        _alreadyLoadedScriptFiles: Record<string, boolean>;
        _existingScriptFiles: RuntimeGameOptionsScriptFile[] | null;
        _isHotReloadingSince: number | null;
        _hotReloadsQueue: Array<{
            hotReloadId: number;
            onDone: (logs: HotReloaderLog[]) => void;
            options: HotReloadOptions;
        }>;
        /**
         * @param runtimeGame - The `gdjs.RuntimeGame` to be hot-reloaded.
         */
        constructor(runtimeGame: gdjs.RuntimeGame);
        static indexByPersistentUuid<ObjectWithPersistentId extends {
            persistentUuid: string | null;
        }>(objectsWithPersistentId: ObjectWithPersistentId[]): Map<string, ObjectWithPersistentId>;
        static indexByName<E extends {
            name: string | null;
        }>(objectsWithName: E[]): Map<string, E>;
        _canReloadScriptFile(srcFilename: string): boolean;
        _reloadScript(srcFilename: string): Promise<void>;
        /**
         * Trigger a hot-reload of the game.
         * The hot-reload is added to a queue and processed in order.
         *
         * This allows the editor to trigger multiple hot-reloads in a row (even if
         * it's sub-optimal) and not miss any (one could for example be reloading libraries
         * or code, while other are just reloading resources).
         */
        hotReload(options: HotReloadOptions): Promise<HotReloaderLog[]>;
        private _processHotReloadsQueue;
        _computeChangedRuntimeBehaviors(oldBehaviorConstructors: Record<string, Function>, newBehaviorConstructors: Record<string, Function>): ChangedRuntimeBehavior[];
        reloadScriptFiles(newProjectData: ProjectData, oldScriptFiles: RuntimeGameOptionsScriptFile[] | null, newScriptFiles: RuntimeGameOptionsScriptFile[] | undefined, shouldGenerateScenesEventsCode: boolean): Promise<void[]>;
        _hotReloadRuntimeGame(oldProjectData: ProjectData, newProjectData: ProjectData, changedRuntimeBehaviors: ChangedRuntimeBehavior[], runtimeGame: gdjs.RuntimeGame): Promise<void>;
        _hotReloadVariablesContainer(oldVariablesData: RootVariableData[], newVariablesData: RootVariableData[], variablesContainer: gdjs.VariablesContainer): void;
        _hotReloadStructureVariable(oldChildren: RootVariableData[], newChildren: RootVariableData[], variable: gdjs.Variable): void;
        _hotReloadRuntimeScene(oldProjectData: ProjectData, newProjectData: ProjectData, oldLayoutData: LayoutData, newLayoutData: LayoutData, changedRuntimeBehaviors: ChangedRuntimeBehavior[], runtimeScene: gdjs.RuntimeScene): void;
        /**
         * Add the children object data into every custom object data.
         *
         * At the runtime, this is done at the object instantiation.
         * For hot-reloading, it's done before hands to optimize.
         *
         * @param projectData The project data
         * @param objectDatas The object datas to modify
         * @returns
         */
        static resolveCustomObjectConfigurations(projectData: ProjectData, objectDatas: ObjectData[]): ObjectData[];
        _hotReloadRuntimeInstanceContainer(oldProjectData: ProjectData, newProjectData: ProjectData, oldLayoutData: InstanceContainerData, newLayoutData: InstanceContainerData, changedRuntimeBehaviors: ChangedRuntimeBehavior[], runtimeInstanceContainer: gdjs.RuntimeInstanceContainer): void;
        _hotReloadRuntimeSceneBehaviorsSharedData(oldBehaviorsSharedData: BehaviorSharedData[], newBehaviorsSharedData: BehaviorSharedData[], runtimeScene: gdjs.RuntimeScene): void;
        _reinstantiateRuntimeSceneRuntimeBehaviors(changedRuntimeBehaviors: ChangedRuntimeBehavior[], newObjects: ObjectData[], runtimeInstanceContainer: gdjs.RuntimeInstanceContainer): void;
        _reinstantiateRuntimeObjectRuntimeBehavior(behaviorData: BehaviorData, runtimeObject: gdjs.RuntimeObject): void;
        hotReloadRuntimeSceneObjects(updatedObjects: Array<ObjectData>, runtimeInstanceContainer: gdjs.RuntimeInstanceContainer): void;
        _hotReloadRuntimeSceneObjects(oldObjects: Array<ObjectData | null>, newObjects: ObjectData[], runtimeInstanceContainer: gdjs.RuntimeInstanceContainer): void;
        _hotReloadRuntimeSceneObject(oldObjectData: ObjectData, newObjectData: ObjectData, runtimeInstanceContainer: gdjs.RuntimeInstanceContainer): void;
        _hotReloadRuntimeObjectsBehaviors(oldBehaviors: BehaviorData[], newBehaviors: BehaviorData[], runtimeObjects: gdjs.RuntimeObject[]): void;
        _hotReloadRuntimeObjectsEffects(oldEffects: EffectData[], newEffects: EffectData[], runtimeObjects: RuntimeObject[]): void;
        /**
         * @returns true if hot-reload succeeded, false otherwise.
         */
        _hotReloadRuntimeBehavior(oldBehaviorData: BehaviorData, newBehaviorData: BehaviorData, runtimeBehavior: gdjs.RuntimeBehavior): boolean;
        hotReloadRuntimeSceneLayers(newLayers: LayerData[], oldLayers: LayerData[], runtimeInstanceContainer: gdjs.RuntimeInstanceContainer): void;
        _hotReloadRuntimeSceneLayers(oldLayers: LayerData[], newLayers: LayerData[], runtimeInstanceContainer: gdjs.RuntimeInstanceContainer): void;
        _hotReloadRuntimeLayer(oldLayer: LayerData, newLayer: LayerData, runtimeLayer: gdjs.RuntimeLayer): void;
        _hotReloadRuntimeLayerEffects(oldEffectsData: EffectData[], newEffectsData: EffectData[], runtimeLayer: gdjs.RuntimeLayer): void;
        _hotReloadRuntimeLayerEffect(oldEffectData: EffectData, newEffectData: EffectData, runtimeLayer: gdjs.RuntimeLayer, effectName: string): void;
        hotReloadRuntimeInstances(oldInstances: InstanceData[], newInstances: InstanceData[], runtimeInstanceContainer: RuntimeInstanceContainer): void;
        _hotReloadRuntimeSceneInstances(oldProjectData: ProjectData, newProjectData: ProjectData, changedRuntimeBehaviors: ChangedRuntimeBehavior[], oldObjects: ObjectData[], newObjects: ObjectData[], oldInstances: InstanceData[], newInstances: InstanceData[], runtimeInstanceContainer: gdjs.RuntimeInstanceContainer): void;
        _hotReloadRuntimeInstance(oldProjectData: ProjectData, newProjectData: ProjectData, changedRuntimeBehaviors: ChangedRuntimeBehavior[], oldObjectData: ObjectData, newObjectData: ObjectData, oldInstance: InstanceData, newInstance: InstanceData, runtimeObject: gdjs.RuntimeObject): void;
        _mergeObjectVariablesData(objectVariablesData: RootVariableData[], instanceVariablesData: RootVariableData[]): RootVariableData[];
        /**
         * Deep check equality between the two objects/arrays/primitives.
         *
         * Inspired from https://github.com/epoberezkin/fast-deep-equal
         * @param a The first object/array/primitive to compare
         * @param b The second object/array/primitive to compare
         */
        static deepEqual(a: any, b: any): boolean;
        static assignOrDelete(target: any, source: any, ignoreKeys?: string[]): void;
    }
    export {};
}
