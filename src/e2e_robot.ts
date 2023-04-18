/**
 * 企业微信通知机器人
 * 默认发送失败提醒
 * 1. 要发送成功提醒：deno run -A e2e_robot.ts -S true
 * 2. 自定义信息：deno run -A e2e_robot.ts -M "消息内容"
 */
import { parse } from "../deps.ts";
import { sendMarkdownMessage } from "./utils.ts";

function getMessage(successs: boolean) {
  const title = Deno.env.get("CI_PROJECT_TITLE")!;
  const jobUrl = Deno.env.get("CI_JOB_URL")!;
  const user = Deno.env.get("GITLAB_USER_NAME")!;
  if (successs) {
    return `<font color="info">『${title}』</font>恭喜
    > <font color="info">@${user}</font> 您的[流水线任务](${jobUrl})成功了！`;
  } else {
    return `<font color="warning">『${title}』</font>提醒
    > <font color="info">@${user}</font> 您的流水线有个[任务](${jobUrl})失败了，请注意查看哦。
    > 链接地址：${jobUrl}`;
  }
}

export interface Params {
  _: string[];
  S: boolean;
  successs: boolean; // 是否成功
  U?: string;
  robotUrl?: string;
  M?: string;
  message?: string; // 自定义消息
}

if (import.meta.main) {
  const params = parse(Deno.args) as Params;
  const robotUrl = Deno.env.get("ROBOT_URL") || params.robotUrl || params.U;
  if (!robotUrl) {
    console.error("not find ROBOT_URL");
    Deno.exit(1);
  }
  const successs = params.S ?? params.successs ?? false;
  const msg = params.message || getMessage(successs);
  await sendMarkdownMessage(robotUrl, msg);
}
