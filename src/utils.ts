import * as sha1 from 'crypto-js/sha1';
import * as Base64 from 'crypto-js/enc-base64';

const PARAMS = ['sid', 'followup', 'callback'];

function genSHA1Signature(joined: string): string {
    let encryptStr = sha1(joined);

    return Base64.stringify(encryptStr);
}
/**
 * 生成签名
 * @param method null
 * @param uriPath null
 * @param req 一个map，键为followup， 值为https://developer.hybrid.xiaomi.com/
 * @param salt null 
 * @param ignoreParam set，值为ignoreParam.add("_nonce");
 * @returns 
 */
export function genSignature(method: string, uriPath: string, req: Map<string, string>, salt: string, ignoreParam: Set<string>): string {
    let exps: string[] = [];
    if (method.length > 0) {
        exps.push(method.toUpperCase());
    }
    if (uriPath.length > 0) {
        exps.push(uriPath);
    }
    if (req != null && req.size > 0) {
        for (let val of req.entries()) {
            let ignore = (ignoreParam != null) && ignoreParam.has(val[0]);
            if (val[0] == null || ignore) {
                continue;
            }
            exps.push(`${val[0]}=${val[1]}`);
        }
    }
    if (salt.length > 0) {
        exps.push(salt);
    }

    let joined = exps.join("&");
    return genSHA1Signature(joined);
}

export function rejectUtil(message: string) {
    return Promise.reject(new Error(message));
}

export function checkObjProps(obj: any) {
    if(typeof obj === 'object') {
        for(let key of PARAMS) {
            if(!obj[key]) {
                return rejectUtil("参数有误")
            }
        }
    }else {
        return rejectUtil("参数有误");
    }
}

export function verifyJson(obj: {[key: string]: any}) {
    if(obj && obj['result'] === 'error') {
        return false;
    }
    return true;
}