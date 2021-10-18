// deno-lint-ignore-file no-explicit-any
import { encode, Hash } from "../../deps.ts";

export function isDist(): boolean {
  return Deno.env.get("NODE_ENV") === "production";
}

export function isDebug(): boolean {
  return Deno.env.get("DEBUG") === "true";
}

export class Cache extends Map {
  private timeout: number;

  constructor(timeout: number = 5 * 1000) {
    super();
    this.timeout = timeout;
  }

  set(key: string | number, val: any) {
    super.set.call(this, key, val);
    setTimeout(() => {
      this.delete(key);
    }, this.timeout);
    return this;
  }
}

export function makeID(length: number): string {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/** 单位是秒 */
export function getExpireMaxAge(day: number): number {
  return day * 24 * 60 * 60;
}

export function expireDate(day: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + day);
  return date;
}

/** 单位是ms */
export function expireTime(day: number): number {
  return Date.now() + getExpireMaxAge(day * 1000);
}

export function stringify(data: any): string {
  try {
    return JSON.stringify(data);
  } catch (err) {
    if (isDebug()) {
      console.error("stringify error", data);
      console.error(err);
    }
    return data;
  }
}

export function jsonParse(str: string): any {
  try {
    return JSON.parse(str);
  } catch (err) {
    if (isDebug()) {
      console.error("jsonParse error", str);
      console.error(err);
    }
    return str;
  }
}

export function md5(str: string) {
  return new Hash("md5").digest(encode(str)).hex();
}
