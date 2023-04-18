export async function sendMarkdownMessage(
  robotUrl: string,
  content: string,
) {
  const json = {
    "msgtype": "markdown",
    "markdown": {
      "content": content,
    },
  };
  const res = await fetch(robotUrl, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(json),
    method: "POST",
  });
  console.info(await res.text());
}
