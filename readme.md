### 小米账号扫码登陆sdk

### Usage
##### 使用之前，请准备好以下信息
`sid`：业务在帐号组注册的service ID

`callback`：业务在帐号组注册的callback 或 符合协议的下发serviceToken的callback

`followup`：登录成功后跳转的目标地址(可不填写)

详情请查看官方文档：http://passport.d.xiaomi.net/doc/sso/QR_Login.html

```ts
import  { ScanLogin } from "xiaomi-auth-sdk";

// 实例化对象
let test = new ScanLogin({
    sid: 'xxx',
    callback: 'xxxx',
    followup: 'xxxx'   // 该字段可以不填
})

// 获取长链接、二维码等信息
let res = await test.getLongPollParams();

// 建立长链接，监听二维码的状态
let longpollres = await test.getLongPollRes(res.lp);

// 重定向，获取cookie
let cookie = await test.getCookie(longpollres.location);
```