// deno-lint-ignore-file no-explicit-any
import { cheerio } from "./deps.ts";

type LinkFilter = (link: string, parentUrl?: string) => boolean;

interface ErrorPage {
  url: string;
  msg: string;
  parentUrl?: string;
}

export class CheckUrlTask {
  baseURL: string;
  linkFilter: LinkFilter;
  errorPages: ErrorPage[];
  checkedUrl: Set<string>;

  constructor(options: {
    baseURL: string;
    linkFilter?: LinkFilter;
  }) {
    this.baseURL = options.baseURL;
    if (options.linkFilter) {
      this.linkFilter = options.linkFilter.bind(this);
    } else {
      this.linkFilter = (link) => link.startsWith(options.baseURL);
    }
    this.errorPages = [];
    this.checkedUrl = new Set<string>();
  }

  async start() {
    console.info("Check task start...");
    console.time("check_urls");
    await this.fetchAll(this.baseURL);
    console.info(
      `Checked task end, checked all pages: ${this.checkedUrl.size}`,
    );
    console.timeEnd("check_urls");
  }

  private async fetchAll(
    url: string,
    parentUrl?: string,
  ) {
    if (url.startsWith("/") && !url.startsWith("//")) {
      if (this.baseURL.endsWith("/")) {
        url = this.baseURL + url.substring(1);
      } else {
        url = this.baseURL + url;
      }
    }
    if (this.checkedUrl.has(url)) {
      return;
    }
    if (!this.linkFilter(url, parentUrl)) {
      // console.debug("url", url);
      return;
    }
    try {
      // console.info(`start to fetch url: ${url}`);
      const info = await this.fetchInfoByUrl(url);
      console.info(`Fetch url success: ${url}`);
      this.checkedUrl.add(url);
      if (info.links.size == 0) {
        return;
      }
      for (const link of info.links) {
        await this.fetchAll(link, url);
      }
      // await Promise.all(urls.map((url, index) => {
      //   return limit(async () => {
      //     try {
      //       await fetchInfoByUrl(url);
      //     } catch (error) {
      //     }
      //   });
      // }));
    } catch (error) {
      console.error(
        `Failed to fetch url: ${url}, parentUrl: ${parentUrl}, error: ${error}`,
      );
      this.checkedUrl.add(url);
      this.errorPages.push({
        url: url,
        parentUrl: parentUrl,
        msg: error,
      });
    }
  }

  private async request(url: string): Promise<{
    success: boolean;
    text: string;
  }> {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return {
          success: true,
          text: await res.text(),
        };
      }
      return {
        success: false,
        text: "Failed to fetch and status is " + res.status,
      };
    } catch (_error) {
      // console.error(error);
      return {
        success: false,
        text: "Failed to fetch, maybe network error",
      };
    }
  }

  private async fetchInfoByUrl(baseURL: string) {
    const result = await this.request(baseURL);
    if (!result.success) {
      return Promise.reject(result.text);
    }
    const html = result.text;
    const $ = cheerio.load(html);
    const title = $("title").text();
    const links = new Set<string>();
    $("a").each((_index: number, element: any) => {
      const link = $(element).attr("href");
      if (link) {
        links.add(link);
      }
    });
    return {
      title,
      url: baseURL,
      links,
    };
  }
}
