import { CheckUrlTask } from "../src/e2e/check_urls.ts";

const baseURL = "https://x.thingjs.com";
const task = new CheckUrlTask({
  baseURL,
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
if (task.errorPages.length > 0) {
  console.info("存在错误页面");
  await Deno.writeTextFile(
    "error_pages.json",
    JSON.stringify(task.errorPages, null, 2),
  );
  Deno.exit(1);
}
