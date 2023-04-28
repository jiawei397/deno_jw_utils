// PUPPETEER_PRODUCT=chrome deno run -A --unstable https://deno.land/x/puppeteer@16.2.0/install.ts
// deno run -A --unstable mod.ts
import puppeteer, {
  BrowserConnectOptions,
  type ChromeArgOptions,
  type LaunchOptions,
  Product,
} from "./deps.ts";

export const isLinux = Deno.build.os === "linux";
export const defaultArgs = isLinux
  ? ["--no-sandbox", "--disable-setuid-sandbox"]
  : [];

export type LaunchParams =
  & LaunchOptions
  & ChromeArgOptions
  & BrowserConnectOptions
  & {
    product?: Product;
    extraPrefsFirefox?: Record<string, unknown>;
  };

export function launch(options: LaunchParams = {}) {
  return puppeteer.launch({
    // headless: true,
    // devtools: true,
    // executablePath: "/chrome-mac/Chromium.app",
    // args: ["--no-sandbox", "--disable-setuid-sandbox"],
    args: defaultArgs,
    ...options,
  });
}

export * from "./deps.ts";
