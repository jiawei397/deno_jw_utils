
import { connect, yellow, Redis } from "../deps.ts";
import { stringify, jsonParse } from "./utils.ts";


export class CacheService {
    db: string;
    client!: Redis;

    constructor(db: any) {
        this.db = db;
        connect(db).then((client) => {
            this.client = client;
            console.info('connect to redis success', yellow(stringify(db)));
        }).catch(err => console.error(`connect to redis error`, err));
    }
    //设置值的方法
    async set(key: string, value: any, seconds?: number) {
        value = stringify(value);
        if (!seconds) {
            await this.client.set(key, value);
        } else {
            await this.client.set(key, value, {
                ex: seconds,
            });
        }
    }

    //获取值的方法
    async get(key: string) {
        const data = await this.client.get(key);
        if (!data) return;
        return jsonParse(data);
    }

    //推送到数组
    async push(key: string, value: any) {
        value = stringify(value);
        await this.client.rpush(key, value);
    }

    //推送到数组第一项
    async unshift(key: string, value: any) {
        value = stringify(value);
        await this.client.lpush(key, value);
    }

    //去掉第一个
    async shift(key: string) {
        const data = await this.client.lpop(key);
        if (!data) return;
        return jsonParse(data);
    }

    //删除最后一个
    async pop(key: string) {
        const data = await this.client.rpop(key);
        if (!data) return;
        return jsonParse(data);
    }

    //根据索引获取
    async index(key: string, index: number) {
        const data = await this.client.lindex(key, index);
        if (!data) return;
        return jsonParse(data);
    }

    async size(key: string) {
        return await this.client.llen(key);
    }

    async isEmpty(key: string) {
        const len = await this.size(key);
        return len === 0;
    }
}
