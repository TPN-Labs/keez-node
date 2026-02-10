export interface KeezLogger {
    info(message: string, ...meta: unknown[]): void;
    error(message: string, ...meta: unknown[]): void;
    warn(message: string, ...meta: unknown[]): void;
    debug(message: string, ...meta: unknown[]): void;
}

export const noopLogger: KeezLogger = {
    info: () => {},
    error: () => {},
    warn: () => {},
    debug: () => {},
};
