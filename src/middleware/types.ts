export type MsgCallback = (...msg: string[]) => unknown;

export interface Logger {
    error: MsgCallback;
    warn: MsgCallback;
    info: MsgCallback;
    debug: MsgCallback;
}