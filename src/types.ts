export type MsgCallback = (...msg: unknown[]) => unknown;

export interface Logger {
  error: MsgCallback;
  // warn: MsgCallback;

  // info: MsgCallback;
  debug: MsgCallback;
}
