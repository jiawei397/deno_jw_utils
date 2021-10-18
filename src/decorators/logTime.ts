// deno-lint-ignore-file no-explicit-any
import { Logger } from "../types.ts";

export function LogTime(str: string, options: {
  msg?: string;
  logger?: Logger;
  level?: "debug" | "info" | "warn" | "error";
} = {}) {
  const { logger = console, msg, level = "debug" } = options;
  return function (
    _target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      const result = await originalMethod.apply(this, args);
      logger[level](
        str,
        `${propertyKey +
          (msg ? ` ${msg}` : "")}, take up time: ${(Date.now() - start) /
          1000} s`,
      );
      return result;
    };
  };
}
