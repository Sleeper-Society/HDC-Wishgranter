declare namespace gdjs {
    /**
     * This debugger client connects to the parent window, exchanging
     * and receiving messages using `postMessage` and the `message` event listener.
     * @category Debugging > Debugger Client
     */
    class WindowMessageDebuggerClient extends gdjs.AbstractDebuggerClient {
        _opener: Window | null;
        constructor(runtimeGame: RuntimeGame);
        protected _sendMessage(message: string): void;
    }
    /** @category Debugging > Debugger Client */
    const DebuggerClient: typeof WindowMessageDebuggerClient;
}
