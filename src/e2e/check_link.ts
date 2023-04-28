import { type Page } from "../puppeteer/deps.ts";

type LinkFilter = (link: string) => boolean;

interface ErrorPage {
  url: string;
  parentUrl: string;
}

export class CheckTask {
  baseURL: string;
  page: Page;
  linkFilter: LinkFilter;
  errorPages: ErrorPage[];

  constructor(options: {
    baseURL: string;
    page: Page;
    linkFilter?: LinkFilter;
  }) {
    this.baseURL = options.baseURL;
    this.page = options.page;
    if (options.linkFilter) {
      this.linkFilter = options.linkFilter.bind(this);
    } else {
      this.linkFilter = (link) => link.startsWith(options.baseURL);
    }
    this.errorPages = [];
  }

  async start() {
    console.info("Check task start...");
    console.time("check_link");
    await this.page.goto(this.baseURL, {
      waitUntil: "domcontentloaded",
    });
    const checkedPages = new Set<string>();
    const errorPages = this.errorPages;
    console.info("Checking links...");
    await this.checkLinks(checkedPages);
    console.info(`Checking links End, checked all pages: ${checkedPages.size}`);
    console.timeEnd("check_link");
    if (errorPages.length > 0) {
      console.error(`Error pages count: ${errorPages.length}`);
      console.error(`Error pages: ${JSON.stringify(errorPages)}`);
      await Deno.writeTextFile(
        "errorPages.txt",
        JSON.stringify(errorPages, null, 2),
      );
      throw new Error("存在失败页面");
    }
  }

  private async checkClick() {
    const page = this.page;
    const selectors = await page.$$("[onclick]");
    for (const selector of selectors) {
      const onclick = await page.evaluate(
        (el) => el.getAttribute("onclick"),
        selector,
      );
      const funcName = onclick.match(/(\w+)\s*\(/)?.[1];
      if (funcName) {
        const exists = await page.evaluate((func) => {
          // deno-lint-ignore no-explicit-any
          if (typeof (window as any)[func] === "function") {
            return true;
          }
          if (typeof eval(func) === "function") {
            return true;
          }
          return false;
        }, funcName);
        if (exists) {
          // console.log(`Function ${funcName} exists in onclick="${onclick}"`);
        } else {
          console.error(
            `Function ${funcName} does not exist in onclick="${onclick}"`,
          );
        }
      }
    }
  }

  private async checkLinks(checkedPages: Set<string>) {
    const page = this.page;
    const parentUrl = page.url();
    const links: string[] = await page.$$eval(
      "a",
      (as) => as.map((a) => a.href),
    );
    const arr = links.filter(this.linkFilter);
    const errorPages = this.errorPages;
    for (const link of arr) {
      if (checkedPages.has(link)) {
        continue;
      }
      const ok = await this.checkOk(link, parentUrl);
      // await page.waitForTimeout(500);
      checkedPages.add(link);
      console.info(`Checked page count: ${checkedPages.size}`);
      if (!ok) {
        errorPages.push({
          url: link,
          parentUrl,
        });
      } else {
        await this.checkClick();
        // 接着查它的子页面
        await this.checkLinks(checkedPages);
      }
    }
  }

  protected async checkOk(link: string, parentUrl: string) {
    const page = this.page;
    // const currentUrl = page.url();
    try {
      const response = await page.goto(link, {
        waitUntil: "domcontentloaded",
      });
      // await page.waitForNavigation({ timeout: 30_000 }); // 等待页面加载完成
      // 判断是否成功
      if (page.url().endsWith("/404.html")) {
        console.log(
          `ParentUrl [${parentUrl}] and link [${link}] redirected to a 404 page`,
        );
        return false;
      } else if (response!.status() >= 400) {
        console.error(
          `ParentUrl [${parentUrl}] and link [${link}] returned status code ${
            response!.status()
          }`,
        );
        return false;
      } else {
        console.info(
          `Successfully checked link: ${link}, parentUrl: ${parentUrl}`,
        );
        return true;
      }
    } catch (error) {
      console.error(
        `Error clicking parentUrl [${parentUrl}] and link [${link}]: ${error}`,
      );
      if (error.name === "TimeoutError") { // 从经验上看，如果超时了，后面的也会失败
        throw error;
      }
      return false;
    }
  }
}
