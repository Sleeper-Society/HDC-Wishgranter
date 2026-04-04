declare namespace gdjs {
    /**
     * Does nothing apart from allowing to reporting errors.
     * @category Debugging > Debugger Client
     */
    class MinimalDebuggerClient extends gdjs.AbstractDebuggerClient {
        constructor(runtimeGame: RuntimeGame);
        protected _sendMessage(message: string): void;
    }
    /** @category Debugging > Debugger Client */
    const DebuggerClient: typeof WindowMessageDebuggerClient;
}
