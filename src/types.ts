// deno-lint-ignore-file camelcase no-explicit-any no-unused-vars
export type MsgCallback = (...msg: unknown[]) => unknown;

export interface Logger {
  error: MsgCallback;
  warn: MsgCallback;

  info: MsgCallback;
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

export interface Cookies {
  set(key: string, value: string, options?: any): Promise<this>;
  get(key: string, options?: any): Promise<string | undefined>;
}

export interface Request {
  headers: Headers;
  cookies: Cookies;
  userInfo?: SSOUserInfo | User | {
    userId: string;
    username: string;
    token: string;
  };
}

export type Context = {
  request: Request;
  response: Response;
  cookies: Cookies;
};

export abstract class CanActivate {
  constructor(...args: any[]) {}
  canActivate(context: Context): boolean | Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}

export interface User {
  id: string;
  username: string; // 中文名
  enName: string; // 英文名
  email: string;
  state: string;
  external: boolean;
  avatar: string; //图标
  groups?: string[]; //组路径
}

export interface Token {
  id: string;
  userId: string;
  username: string;
  host: string;
  ip?: string;
  userAgent: string;
  expires?: Date;
}

export type AuthGuardOptions = {
  logger?: Logger;
  authApi?: string;
  cacheTimeout?: number;
  isPrivateTokenField?: string;
  privateTokenField?: string;
  checkUserField?: string;
  tokenField?: string;
};
