# jw_utils

This is some private utils for my project.

## an exception middleware for oak

```typescript
import { anyExceptionFilter } from "https://deno.land/x/jw_utils@v0.4.1/mod.ts";
import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new App();
app.use(anyExceptionFilter({
  logger: console,
  isHeaderResponseTime: true,
}));

await app.listen(":80");
```
