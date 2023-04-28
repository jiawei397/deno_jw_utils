import { CheckTask } from "../src/e2e/check_link.ts";
import { launch } from "../src/puppeteer/mod.ts";

const browser = await launch({
  // headless: false,
  // devtools: true,
  // slowMo: 50,
  ignoreHTTPSErrors: true,
});
const page = await browser.newPage();
// const context = await browser.createIncognitoBrowserContext();
// const page = await context.newPage(); // Create new instance of puppet

await page.setBypassCSP(true);

await page.setRequestInterception(true); // Optimize (no stylesheets, images)...
page.on("request", (request) => {
  if (
    ["image", "stylesheet", "media"].includes(request.resourceType()) ||
    request.url().endsWith(".wasm")
  ) {
    request.abort();
  } else {
    // console.log("request intercepted", request.url(), request.resourceType());
    request.continue();
  }
});

const baseURL = "https://x.thingjs.com";
const task = new CheckTask({
  baseURL,
  page,
  // linkFilter(link) {
  //   if (!link.startsWith(baseURL)) {
  //     return false;
  //   }
  //   if (/\/blog\/article\/((xw)|c|C|x)\d+\.html/.test(link)) {
  //     return false;
  //   }
  //   return true;
  // },
});

await task.start();

await page.close();
await browser.close();
