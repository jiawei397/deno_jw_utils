// API：https://pptr.dev/guides/evaluate-javascript
import { launch } from "../src/puppeteer/mod.ts";

const browser = await launch({
  // headless: false,
  // devtools: true,
  // args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
await page.goto("https://www.baidu.com", {
  // waitUntil: "networkidle2",
});

// await new Promise((resolve) => setTimeout(resolve, 1000));

await page.screenshot({ path: "example.png" });

// await page.focus("form input");
// await page.keyboard.sendCharacter("xxx");

// // // await page.focus("form input[type=password]");
// // // await page.keyboard.sendCharacter("xx");
// // // await page.click("button[type=submit]");

await browser.close();

console.info("E2E sucessfully end");
