# jw_utils

This is some private utils for my project.

## a service for Redis

```typescript
import { RedisService } from "https://deno.land/x/jw_utils@v0.2.0/mod.ts";

export const redisService = new RedisService({
  hostname: "localhost",
  port: 6379,
});
```

## an exception middleware for oak

```typescript
import { anyExceptionFilter } from "https://deno.land/x/jw_utils@v0.2.0/mod.ts";
import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new App();
app.use(anyExceptionFilter({
  logger: console,
  isHeaderResponseTime: true,
}));

await app.listen(":80");
```
