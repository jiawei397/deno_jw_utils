// apparent_age = max(0, response_time - date_value);
// response_delay = response_time - request_time;  // 强缓存的情况下，约为0
// corrected_age_value = age_value + response_delay; // 在没有age响应头时，age为0，这个值约为age
// corrected_initial_age = max(apparent_age, corrected_age_value); // 响应时间-Date，那就是now-Date，如果有age的话，这两个值取最大数
// resident_time = now - response_time; // 强缓存，这个值也接近0
// current_age = corrected_initial_age + resident_time; // now - Date

function getCurrentAge(date: Date, age: number) {
  const response_time = new Date();
  const apparent_age = Math.max(
    0,
    (response_time.getTime() - date.getTime()) / 1000,
  );
  const response_delay = 0;
  const corrected_age_value = age + response_delay;
  const corrected_initial_age = Math.max(apparent_age, corrected_age_value);
  const resident_time = 0;
  const current_age = corrected_initial_age + resident_time;
  return current_age;
}

function getFreshnessLifetime(date: Date, lastModified: Date) {
  return (date.getTime() - lastModified.getTime()) / 1000 * 0.1;
}

function getExpiredSeconds(date: string, lastModified: string, age: number) {
  const d = new Date(date);
  const l = new Date(lastModified);
  const freshnessLifeTime = getFreshnessLifetime(d, l);
  const current_age = getCurrentAge(d, age);
  console.log("freshnessLifeTime", freshnessLifeTime);
  console.log("current_age", current_age);
  return freshnessLifeTime - current_age;
}

export function getExpiredTime(
  date: string,
  lastModified: string,
  age: number,
) {
  const expiredSeconds = getExpiredSeconds(date, lastModified, age);
  if (expiredSeconds < 0) {
    console.warn("已过期" + Math.abs(expiredSeconds / 60) + "分");
  }
  const now = new Date();
  now.setSeconds(now.getSeconds() + expiredSeconds);
  return now.toLocaleString("zh-CN", { hour12: false });
}

export async function getCDNExpiredTime(url: string) {
  const res = await fetch(url);
  const date = res.headers.get("date");
  if (!date) {
    throw new Error("date is null");
  }
  const lastModified = res.headers.get("last-modified");
  if (!lastModified) {
    throw new Error("last-modified is null");
  }
  const age = res.headers.get("age");
  console.log("date:", date);
  console.log("lastModified:", lastModified);
  console.log("age:", age);
  return getExpiredTime(date, lastModified, Number(age));
}
