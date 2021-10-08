# jw_utils

This is some private utils for my project.

## a service for Redis

```typescript
import { RedisService } from "https://deno.land/x/jw_utils/mod.ts";

export const redisService = new RedisService({
  hostname: "localhost",
  port: 6379,
});
```
