// PUPPETEER_PRODUCT=chrome deno run -A --unstable https://deno.land/x/puppeteer@16.2.0/install.ts
// deno run -A --unstable mod.ts
import puppeteer, {
  Browser,
  BrowserConnectOptions,
  Page,
  Product,
} from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import {
  ChromeArgOptions,
  LaunchOptions,
} from "https://deno.land/x/puppeteer@16.2.0/src/deno/LaunchOptions.ts";

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

export {
  Browser,
  type BrowserConnectOptions,
  type ChromeArgOptions,
  type LaunchOptions,
  Page,
};
export default puppeteer;
