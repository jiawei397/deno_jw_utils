// Copyright 2021 the oak authors. All rights reserved. MIT license.
import { Context, Middleware, Request, Response, vary } from "../../deps.ts";
import { CORSHeaders, CorsOptions, MultiCORSHeaders } from "../types.ts";

export const defaults = {
  origin: true, // "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

function isString(s: unknown) {
  return typeof s === "string" || s instanceof String;
}

function isOriginAllowed(origin: any, allowedOrigin: any) {
  if (Array.isArray(allowedOrigin)) {
    for (let i = 0; i < allowedOrigin.length; ++i) {
      if (isOriginAllowed(origin, allowedOrigin[i])) {
        return true;
      }
    }
    return false;
  } else if (isString(allowedOrigin)) {
    return origin === allowedOrigin;
  } else if (allowedOrigin instanceof RegExp) {
    return allowedOrigin.test(origin);
  } else {
    return !!allowedOrigin;
  }
}

function configureOrigin(options: CorsOptions, req: Request) {
  const requestOrigin = req.headers.get("origin");
  const headers: MultiCORSHeaders[] = [];
  let isAllowed: boolean;

  if (!options.origin || options.origin === "*") {
    // allow any origin
    headers.push([{
      key: "Access-Control-Allow-Origin",
      value: "*",
    }]);
  } else if (isString(options.origin)) {
    // fixed origin
    headers.push([{
      key: "Access-Control-Allow-Origin",
      value: options.origin,
    }]);
    headers.push([{
      key: "Vary",
      value: "Origin",
    }]);
  } else {
    isAllowed = isOriginAllowed(requestOrigin, options.origin);
    headers.push([{
      key: "Access-Control-Allow-Origin",
      value: isAllowed ? requestOrigin : false,
    }]);
    headers.push([{
      key: "Vary",
      value: "Origin",
    }]);
  }

  return headers;
}

function configureMethods(options: CorsOptions) {
  let methods = options.methods;
  if (Array.isArray(methods)) {
    methods = methods.join(","); // .methods is an array, so turn it into a string
  }
  return {
    key: "Access-Control-Allow-Methods",
    value: methods,
  };
}

function configureCredentials(options: CorsOptions) {
  if (options.credentials === true) {
    return {
      key: "Access-Control-Allow-Credentials",
      value: "true",
    };
  }
  return null;
}

function configureAllowedHeaders(options: CorsOptions, req: Request) {
  let allowedHeaders = options.allowedHeaders;
  const headers = [];

  if (!allowedHeaders) {
    allowedHeaders = req.headers.get("access-control-request-headers") ||
      undefined; // .headers wasn't specified, so reflect the request headers
    headers.push([{
      key: "Vary",
      value: "Access-Control-Request-Headers",
    }]);
  } else if (Array.isArray(allowedHeaders)) {
    allowedHeaders = allowedHeaders.join(","); // .headers is an array, so turn it into a string
  }
  if (allowedHeaders?.length) {
    headers.push([{
      key: "Access-Control-Allow-Headers",
      value: allowedHeaders,
    }]);
  }

  return headers;
}

function configureExposedHeaders(options: CorsOptions) {
  let headers = options.exposedHeaders;
  if (!headers) {
    return null;
  } else if (Array.isArray(headers)) {
    headers = headers.join(","); // .headers is an array, so turn it into a string
  }
  if (headers && headers.length) {
    return {
      key: "Access-Control-Expose-Headers",
      value: headers,
    };
  }
  return null;
}

function configureMaxAge(options: CorsOptions) {
  const maxAge = (typeof options.maxAge === "number" || options.maxAge) &&
    options.maxAge.toString();
  if (maxAge && maxAge.length) {
    return {
      key: "Access-Control-Max-Age",
      value: maxAge,
    };
  }
  return null;
}

function applyHeaders(headers: CORSHeaders, res: Response) {
  if (!headers) {
    return;
  }
  for (let i = 0, n = headers.length; i < n; i++) {
    const header = headers[i];
    if (header) {
      if (Array.isArray(header)) {
        applyHeaders(header, res);
      } else if (header.key === "Vary" && header.value) {
        vary(res.headers, header.value);
      } else if (header.value) {
        res.headers.set(header.key, header.value);
      }
    }
  }
}

function cors(
  options: CorsOptions,
  req: Request,
  res: Response,
  next: () => void,
) {
  const headers: any[] = [];
  const method = req.method.toUpperCase();

  if (method === "OPTIONS") {
    // preflight
    headers.push(configureOrigin(options, req));
    headers.push(configureCredentials(options));
    headers.push(configureMethods(options));
    headers.push(configureAllowedHeaders(options, req));
    headers.push(configureMaxAge(options));
    headers.push(configureExposedHeaders(options));
    applyHeaders(headers, res);

    if (options.preflightContinue) {
      next();
    } else {
      // Safari (and potentially other browsers) need content-length 0,
      //   for 204 or they just hang waiting for a body
      if (options.optionsSuccessStatus) {
        res.status = options.optionsSuccessStatus;
        res.headers.set("Content-Length", "0");
      }
    }
  } else {
    // actual response
    headers.push(configureOrigin(options, req));
    headers.push(configureCredentials(options));
    headers.push(configureExposedHeaders(options));
    applyHeaders(headers, res);
    next();
  }
}

/** A middleware that will deal the exceptions when called, and set the response time for other middleware in
 * milliseconds as `X-Response-Time` which can be used for diagnostics and other
 * instrumentation of an application.  Utilise the middleware before the "real"
 * processing occurs.
 *
 * ```ts
 * import { CORS } from "https://deno.land/x/oak-middleware/mod.ts";
 * import { Application } from "https://deno.land/x/oak/mod.ts"
 *
 * const app = new App();
 * app.use(CORS());
 *
 * // other middleware
 *
 * await app.listen(":80");
 * ```
 */
export function CORS(options?: boolean | CorsOptions) {
  const middleware: Middleware = async function (
    ctx: Context,
    next: () => Promise<unknown>,
  ) {
    await next();
    if (options === false) { // not need cors
      return;
    }
    const headers = ctx.request.headers;
    const corsOptions: CorsOptions = Object.assign({}, defaults, options);
    if (!options || options === true) {
      corsOptions.origin = true;
    } else if (typeof options?.origin === "function") {
      const origin = options.origin(headers.get("origin")!);
      if (!origin) {
        return;
      }
      corsOptions.origin = origin;
    }
    cors(corsOptions, ctx.request, ctx.response, next);
  };
  return middleware;
}
