import { Context } from "../../deps.ts";
import { assertEquals, beforeEach, describe, it } from "../../test_deps.ts";
import { CORS, defaults } from "./cors.ts";

describe("cors", () => {
  let mockContext: Context, mockNext: () => Promise<unknown>;
  const origin = "https://www.baidu.com";
  beforeEach(() => {
    mockContext = {
      response: {
        headers: new Headers(),
        status: 200,
      },
      request: {
        method: "OPTIONS",
        url: "https://pan.baidu.com/options",
        headers: {
          get(key: string) {
            if (key === "origin") {
              return origin;
            }
            return "else";
          },
        },
      },
    } as unknown as Context;
    mockNext = () => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 0);
      });
    };
  });

  it("no params", async () => {
    await CORS()(mockContext, mockNext);
    assertEquals(
      mockContext.response.headers.get("Access-Control-Allow-Origin"),
      origin,
    );
  });

  it("params is true", async () => {
    await CORS(true)(mockContext, mockNext);
    assertEquals(
      mockContext.response.headers.get("Access-Control-Allow-Origin"),
      origin,
    );
  });

  it("origin is function", async () => {
    await CORS({
      origin: (_origin) => {
        return false;
      },
    })(mockContext, mockNext);
    assertEquals(
      mockContext.response.headers.get("Access-Control-Allow-Origin"),
      null,
    );

    const origin = "https://www.google.com";
    await CORS({
      origin: () => {
        return origin;
      },
    })(mockContext, mockNext);
    assertEquals(
      mockContext.response.headers.get("Access-Control-Allow-Origin"),
      origin,
    );
  });

  describe("origin is string", () => {
    it("*", async () => {
      const origin = "*";
      await CORS({
        origin,
      })(mockContext, mockNext);
      assertEquals(
        mockContext.response.headers.get("Access-Control-Allow-Origin"),
        origin,
      );
    });
    it("simple string", async () => {
      const origin = "https://www.google.com";
      await CORS({
        origin,
      })(mockContext, mockNext);
      assertEquals(
        mockContext.response.headers.get("Access-Control-Allow-Origin"),
        origin,
      );
    });
  });

  describe("origin is RegExp", () => {
    it("right", async () => {
      const reg = /baidu\.com/;
      await CORS({
        origin: reg,
      })(mockContext, mockNext);
      assertEquals(
        mockContext.response.headers.get("Access-Control-Allow-Origin"),
        origin,
      );
    });

    it("error", async () => {
      const reg2 = /google\.com/;
      await CORS({
        origin: reg2,
      })(mockContext, mockNext);
      assertEquals(
        mockContext.response.headers.get("Access-Control-Allow-Origin"),
        null,
      );
    });
  });

  describe("OPTIONS status", () => {
    it("no params", async () => {
      await CORS()(mockContext, mockNext);
      assertEquals(
        mockContext.response.status,
        defaults.optionsSuccessStatus,
      );
    });

    it("has params", async () => {
      await CORS({
        optionsSuccessStatus: 200,
      })(mockContext, mockNext);
      assertEquals(
        mockContext.response.status,
        200,
      );
    });
  });

  it("Get status", async () => {
    mockContext = {
      response: {
        headers: new Headers(),
        status: 200,
      },
      request: {
        method: "GET",
        url: "https://pan.baidu.com/get",
        headers: {
          get(key: string) {
            if (key === "origin") {
              return origin;
            }
            return "else";
          },
        },
      },
    } as unknown as Context;

    await CORS()(mockContext, mockNext);
    assertEquals(
      mockContext.response.status,
      200,
    );
  });
});
