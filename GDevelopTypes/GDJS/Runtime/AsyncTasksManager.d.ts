declare namespace gdjs {
    /**
     * @category Core Engine > Async Tasks
     */
    type WaitTaskNetworkSyncData = {
        type: 'wait';
        duration: float;
        timeElapsedOnScene: float;
    };
    /**
     * @category Core Engine > Async Tasks
     */
    type ResolveTaskNetworkSyncData = null;
    /**
     * @category Core Engine > Async Tasks
     */
    type PromiseTaskNetworkSyncData = null;
    /**
     * @category Core Engine > Async Tasks
     */
    type ManuallyResolvableTaskNetworkSyncData = null;
    /**
     * @category Core Engine > Async Tasks
     */
    type TaskGroupNetworkSyncData = {
        type: 'group';
        tasks: AsyncTaskNetworkSyncData[];
    };
    /**
     * @category Core Engine > Async Tasks
     */
    type AsyncTaskNetworkSyncData = WaitTaskNetworkSyncData | TaskGroupNetworkSyncData | PromiseTaskNetworkSyncData | ManuallyResolvableTaskNetworkSyncData | ResolveTaskNetworkSyncData;
    /**
     * @category Core Engine > Async Tasks
     */
    type AsyncTasksManagerNetworkSyncData = {
        tasks: Array<{
            callbackId: string;
            asyncTask: AsyncTaskNetworkSyncData;
            objectsList: gdjs.LongLivedObjectsListNetworkSyncData;
        }>;
    };
    /**
     * This stores all asynchronous tasks waiting to be completed,
     * for a given scene.
     * @see {@link RuntimeScene.getAsyncTasksManager}.
     * @category Core Engine > Async Tasks
     */
    class AsyncTasksManager {
        /**
         * Maps a task to the callback to be executed once it is finished.
         */
        private tasksWithCallback;
        /**
         * Run all pending asynchronous tasks.
         */
        processTasks(runtimeScene: RuntimeScene): void;
        /**
         * Adds a task to be processed between frames and a callback for when it is done to the manager.
         * @param asyncTask The {@link AsyncTask} to run.
         * @param callback The callback to execute once the task is finished.
         */
        addTask(asyncTask: AsyncTask, callback: (runtimeScene: RuntimeScene, longLivedObjectsList: gdjs.LongLivedObjectsList) => void, callbackId: string, longLivedObjectsList: gdjs.LongLivedObjectsList): void;
        /**
         * For testing only - removes all tasks.
         * @internal
         */
        clearTasks(): void;
        getNetworkSyncData(syncOptions: GetNetworkSyncDataOptions): AsyncTasksManagerNetworkSyncData;
        updateFromNetworkSyncData(syncData: AsyncTasksManagerNetworkSyncData, idToCallbackMap: Map<string, (runtimeScene: gdjs.RuntimeScene, asyncObjectsList: gdjs.LongLivedObjectsList) => void>, runtimeScene: gdjs.RuntimeScene, syncOptions: UpdateFromNetworkSyncDataOptions): void;
    }
    /**
     * An asynchronous task to be run between frames.
     * @category Core Engine > Async Tasks
     */
    abstract class AsyncTask {
        /**
         * Called every frame where the scene is active.
         * @param runtimeScene - The scene the task runs on.
         * @return True if the task is finished, false if it needs to continue running.
         */
        abstract update(runtimeScene: RuntimeScene): boolean;
        abstract getNetworkSyncData(): AsyncTaskNetworkSyncData;
        abstract updateFromNetworkSyncData(syncData: AsyncTaskNetworkSyncData): void;
    }
    /**
     * @category Core Engine > Async Tasks
     */
    class TaskGroup extends AsyncTask {
        private tasks;
        addTask(task: AsyncTask): void;
        update(runtimeScene: gdjs.RuntimeScene): boolean;
        getNetworkSyncData(): TaskGroupNetworkSyncData;
        updateFromNetworkSyncData(syncData: TaskGroupNetworkSyncData): void;
    }
    /**
     * @category Core Engine > Async Tasks
     */
    class ResolveTask extends AsyncTask {
        update(): boolean;
        getNetworkSyncData(): AsyncTaskNetworkSyncData;
        updateFromNetworkSyncData(syncData: AsyncTaskNetworkSyncData): void;
    }
    /**
     * A task that resolves with a promise.
     * @category Core Engine > Async Tasks
     */
    class PromiseTask<ResultType = void> extends AsyncTask {
        private isResolved;
        promise: Promise<ResultType>;
        constructor(promise: Promise<ResultType>);
        update(): boolean;
        getNetworkSyncData(): AsyncTaskNetworkSyncData;
        updateFromNetworkSyncData(syncData: AsyncTaskNetworkSyncData): void;
    }
    /**
     * @category Core Engine > Async Tasks
     */
    class ManuallyResolvableTask extends AsyncTask {
        private isResolved;
        resolve(): void;
        update(): boolean;
        getNetworkSyncData(): AsyncTaskNetworkSyncData;
        updateFromNetworkSyncData(syncData: AsyncTaskNetworkSyncData): void;
    }
}
