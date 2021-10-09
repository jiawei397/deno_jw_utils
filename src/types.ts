export type MsgCallback = (...msg: unknown[]) => unknown;

export interface Logger {
  error: MsgCallback;
  // warn: MsgCallback;

  // info: MsgCallback;
  debug: MsgCallback;
}

/**
 * SSO返回的用户信息
 */
export interface SSOUserInfo {
  id: string; // 转换的user_id，方便前台取值。后台返回的并没有
  avatar: string;
  email: string;
  internal: boolean;
  last_login: string;
  nickname: string; // 昵称
  phone: string;
  realname: string;
  user_id: number; // 比如81
  username: string;
}

export type SSOUserKey = keyof SSOUserInfo;
export type SSOUserKeys = SSOUserKey[];