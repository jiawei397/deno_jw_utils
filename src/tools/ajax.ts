import { BaseAjax, AjaxConfig } from "../../deps.ts";

class Ajax extends BaseAjax {

    protected getUniqueKey(config: AjaxConfig) {
        const headers: any = config.headers;
        const key = (config.baseURL || "") + config.url + config.method +
            (config.data ? JSON.stringify(config.data) : "");
        if (headers) {
            const cookie = headers['cookie'] || headers.get?.("cookie") || "";
            return cookie + key;
        }
        return key;
    }


    /**
     * 处理消息，具体实现可以覆盖此项
     */
    protected handleMessage(msg: string) {
        console.log("handleMessage", msg);
        super.handleMessage(msg);
    }

    /**
     * 处理错误请求
     */
    protected handleErrorResponse(response: Response) {
        console.error(
            `HTTP error, status = ${response.status}, statusText = ${response.statusText}`,
        );
    }
}

export const ajax = new Ajax();
