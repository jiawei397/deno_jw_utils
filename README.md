# jw_utils

This is some private utils for my project.

## e2e

```bash
PUPPETEER_PRODUCT=chrome deno run -A --unstable https://deno.land/x/puppeteer@16.2.0/install.ts
```

use

```ts
import { launch } from "https://deno.land/x/jw_utils@v1.0.3/src/puppeteer.ts";

const browser = await launch({
  // headless: false,
  // devtools: true,
});
const page = await browser.newPage();
await page.goto("https://www.baidu.com");

await page.screenshot({ path: "example.png" });

await browser.close();

console.info("E2E sucessfully end");
```
