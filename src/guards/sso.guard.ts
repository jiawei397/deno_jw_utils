import { ajax } from "../tools/ajax.ts";
/**
 * sso守卫
 */
import { CanActivate, Context, UnauthorizedException } from "../../deps.ts";
import { Logger } from "../types.ts";

export function SSOGuard(options: {
  logger?: Logger;
  ssoApi?: string;
  ssoUserAgent?: string;
  referer?: string;
  cacheTimeout?: number;
} = {}) {
  const {
    logger = console,
    ssoApi,
    ssoUserAgent,
    referer,
    cacheTimeout = 60 * 60 * 1000,
  } = options;
  return class Guard implements CanActivate {
    async canActivate(context: Context) {
      const b = await this.validateRequest(context);
      if (!b) {
        throw new UnauthorizedException("Unauthorized");
      }
      return b;
    }

    async getSSO(context: Context) {
      const request: any = context.request;
      const headers = request.headers;
      const userInfo = await ajax.get("/api/user/userinfo", null, {
        baseURL: ssoApi || Deno.env.get("ssoApi"),
        headers: {
          cookie: headers.get("cookie") || "",
          "user-agent": headers.get("user-agent") || ssoUserAgent ||
            Deno.env.get("ssoUserAgent") || "",
          referer: headers.get("referer") || referer || "",
        },
        cacheTimeout,
      });
      request.userInfo = userInfo;
    }

    async validateRequest(context: Context) {
      try {
        await this.getSSO(context);
        return true;
      } catch (e) {
        logger.error(`【sso guard】校验信息未通过，原因是：${e.message}`);
        return false;
      }
    }
  };
}
