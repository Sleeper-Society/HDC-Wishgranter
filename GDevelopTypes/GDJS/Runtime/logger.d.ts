declare namespace gdjs {
    /**
     * A LoggerOutput specifies a single method to be called to display
     * or register a log.
     * @category Utils > Logger
     */
    export interface LoggerOutput {
        log(group: string, message: string, type: 'info' | 'warning' | 'error', internal?: boolean): void;
    }
    /**
     * The default logging output: uses the JavaScript console.
     */
    class ConsoleLoggerOutput implements LoggerOutput {
        private readonly discardedConsoleGroups;
        discardGroup(groupName: string): void;
        enableGroup(groupName: string): void;
        log(group: string, message: string, type?: 'info' | 'warning' | 'error', internal?: boolean): void;
    }
    /**
     * A Console API like class for logging in a GDevelop game.
     * @category Utils > Logger
     */
    export class Logger {
        private readonly group;
        private enabled;
        /**
         * Create a new logger with the given group name.
         * You can then use log, info, warn and error on this object.
         */
        constructor(group: string);
        log(...messages: any[]): void;
        info(...messages: any[]): void;
        warn(...messages: any[]): void;
        error(...messages: any[]): void;
        enable(enabled: boolean): gdjs.Logger;
        /**
         * Give access to the console output used by default by the logger.
         * This can be useful to restore the default log method if you overrode it
         * or to disable some logging in the console.
         */
        static getDefaultConsoleLoggerOutput(): ConsoleLoggerOutput;
        /**
         * Return the current logger output (common to all gdjs.Logger instances).
         */
        static getLoggerOutput(): LoggerOutput;
        /**
         * Change the logger output (common to all gdjs.Logger instances).
         */
        static setLoggerOutput(newLoggerOutput: LoggerOutput): void;
    }
    export {};
}
