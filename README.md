# jw_utils

私人工具。

## e2e

```bash
PUPPETEER_PRODUCT=chrome deno run -A --unstable https://deno.land/x/puppeteer@16.2.0/install.ts
```

样例：

```ts
import { launch } from "https://deno.land/x/jw_utils@v1.1.2/src/puppeteer/mod.ts";

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

## 企业微信机器人通知

需要配置环境变量`ROBOT_URL`。

默认失败通知：

```bash
deno run -A https://deno.land/x/jw_utils@v1.1.2/src/robot/mod.ts
```

如果要成功通知：

```bash
deno run -A https://deno.land/x/jw_utils@v1.1.2/src/robot/mod.ts -S
```

支持以下命令行参数：

| 选项       | 别名 | 类型   | 默认值            | 说明       |
| ---------- | ---- | ------ | ----------------- | ---------- |
| --success  | -S   | 布尔值 | false             | 是否成功   |
| --robotUrl | -U   | 字符串 | 环境变量ROBOT_URL | 机器人 URL |
| --message  | -M   | 字符串 | 无                | 自定义消息 |
