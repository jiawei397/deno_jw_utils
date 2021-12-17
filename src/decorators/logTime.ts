// deno-lint-ignore-file no-explicit-any
import { Logger } from "../types.ts";

export function logTime(options: {
  str?: string;
  msg?: string;
  logger?: Logger;
  level?: "debug" | "info" | "warn" | "error";
} = {}) {
  const { logger = console, msg, level = "debug", str = "take up time" } =
    options;
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): MethodDecorator {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      const result = await originalMethod.apply(this, args);
      logger[level](
        `[${target.constructor.name}]`,
        `${
          propertyKey +
          (msg ? ` ${msg}` : "")
        }, ${str}: ${
          (Date.now() - start) /
          1000
        } s`,
      );
      return result;
    };
    return target;
  };
}
