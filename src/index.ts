import { genSignature, rejectUtil, checkObjProps, verifyJson } from "./utils"
import axios from "axios";

export interface IConfig {
    sid: string,
    callback: string,
    followup?: string
}

export interface IResponse {
    loginUrl: string,
    lp: string,
    qr: string,
    code: number,
    result: string,
    desc: string,
    description: string
}

export interface ILongResponse {
    location: string
}

export class ScanLogin {
    static TARGET = "https://account.xiaomi.com/longPolling/loginUrl";
    public config: IConfig;

    // 初始化配置
    constructor(config: IConfig) {
        checkObjProps(config);
        this.config = config;
    }

    // 发送登陆请求，获取长链接等参数
    async getLongPollParams() {
        let { followup = "", callback, sid } = this.config;
        const IGNOREPARAMS = new Set(['_nonce']);
        let map = new Map();
        map.set("followup", followup);
        const Sign = genSignature("", "", map, "", IGNOREPARAMS);
        const BaseParams = new URLSearchParams([
            ['sign', Sign],
            ['followup', followup]
        ]);
        const CallBack = `${callback}?${BaseParams.toString()}`;

        const searchParams = new URLSearchParams([
            ['sid', sid],
            ['callback', CallBack]
        ]);
        let target = `${ScanLogin.TARGET}?${searchParams.toString()}`;
        const result = await axios(target);
        if (result.status == 200) {
            const text = result.data.slice(11);
            const json: IResponse = await JSON.parse(text);
            // 数据校验
            return verifyJson(json) ? json : Promise.reject(json);
        } else {
            return Promise.reject({ message: "request failed" })
        }


    }

    // 建立长链接，并获取扫码后的响应
    async getLongPollRes(longTarget: string) {
        if(!longTarget) {
            return rejectUtil("请传递用于建立长链接的地址")
        }
        // 建立长链接
        let res = await axios(longTarget, {
            headers: {
                connection: "keep-alive"
            }
        })


        if (res.status == 200) {
            // 获取重定向地址
            const text_temp = res.data;
            const text = text_temp.slice(11);
            const json: ILongResponse = await JSON.parse(text);
            // 数据校验
            return verifyJson(json) ? json : Promise.reject(json);
        }

        return Promise.reject({ message: "二维码已过期或其他问题，建议重新获取二维码等信息" });
    }

    // 根据重定向地址，获取cookie
    async getCookie(location: string) {
        if(!location) {
            return rejectUtil("请传递用于获取cookie的回调地址")
        }
        try {
            // 获取登陆凭证
            await axios(location, {maxRedirects: 0});
        } catch (e: any) {
            if(e.response && e.response.headers) {
                let cookie = e.response.headers['set-cookie'];

                return cookie && cookie.join("");
            }
            return rejectUtil("获取cookie失败");
        }
    }
}