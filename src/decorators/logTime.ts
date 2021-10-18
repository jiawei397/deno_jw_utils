// deno-lint-ignore-file no-explicit-any
import { Logger } from "../types.ts";

export function LogTime(str: string, options: {
  msg?: string;
  logger?: Logger;
} = {}) {
  const { logger = console, msg } = options;
  return function (
    _target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      const result = await originalMethod.apply(this, args);
      logger.debug(
        `【${str}】${propertyKey} ${
          msg ? msg : ""
        }, take up time: ${(Date.now() - start) /
          1000} s`,
      );
      return result;
    };
  };
}
