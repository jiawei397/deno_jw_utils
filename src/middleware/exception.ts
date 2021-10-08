// Copyright 2021 the oak authors. All rights reserved. MIT license.
import { Context, Middleware } from "../../deps.ts";
import { Logger } from "./types.ts";

/** A middleware that will deal the exceptions when called, and set the response time for other middleware in
 * milliseconds as `X-Response-Time` which can be used for diagnostics and other
 * instrumentation of an application.  Utilise the middleware before the "real"
 * processing occurs.
 * 
 * ```ts
 * import { anyExceptionFilter } from "https://deno.land/x/oak-middleware/mod.ts";
 * import { Application } from "https://deno.land/x/oak/mod.ts"
 * 
 * const app = new App();
 * app.use(anyExceptionFilter({
 *  logger: console,
 *  isHeaderResponseTime: true,
 * }));
 * 
 * // other middleware
 * 
 * await app.listen(":80");
 * ```
 */
export const anyExceptionFilter = (options: {
    logger?: Logger,
    isHeaderResponseTime?: boolean;
} = {}) => {
    const { logger = console, isHeaderResponseTime } = options;
    const middleware: Middleware = async function (ctx: Context, next: () => Promise<unknown>) {
        const start = Date.now();
        try {
            await next();
            // 在这里可以很方便地拦截处理响应给前台的数据
            if (ctx.response.body === undefined && ctx.response.status === 404) {
                ctx.response.body = "not found";
                ctx.response.status = 404; // TODO 这里需要重新赋一下，否则状态码变成200了
            }
        } catch (err) {
            logger.error(err);
            ctx.response.status = err.status || 500;
            ctx.response.body = err.message;
        } finally {
            const ms = Date.now() - start;
            logger.debug(
                `${ctx.request.method} ${ctx.request.url} [${ctx.response.status}] - ${ms}ms`,
            );
            if (isHeaderResponseTime) {
                ctx.response.headers.set("X-Response-Time", `${ms}ms`);
            }
        }
    };

    return middleware;
}
