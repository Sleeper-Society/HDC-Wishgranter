declare namespace gdjs {
    /**
     * This debugger client connects to a websocket server, exchanging
     * and receiving messages with this server.
     * @category Debugging > Debugger Client
     */
    class WebsocketDebuggerClient extends gdjs.AbstractDebuggerClient {
        _ws: WebSocket | null;
        constructor(runtimeGame: RuntimeGame);
        private hasLoggedError;
        protected _sendMessage(message: string): void;
    }
    /** @category Debugging > Debugger Client */
    const DebuggerClient: typeof WebsocketDebuggerClient;
}
