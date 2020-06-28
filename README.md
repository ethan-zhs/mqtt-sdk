## MQTT-SDK
---
用于浏览器端
基于[mqtt-js](https://github.com/mqttjs/MQTT.js#readme)封装

### features
- [x] 1. 生成browserId作为用户标识，储存在localStorage
- [x] 2. 根据browserId调用API获取用户名和聊天室密码
- [x] 3. 连接聊天室，发出订阅willTopic，发出进入聊天室message
- [x] 4. 提供sendMessage api
- [x] 5. 心跳
- [x] 6. 生产环境多个服务端源随机均衡
- [ ] 7. 连接失败时更换源

### Usage
```
// for node import
const initSdk = require('./index');
const { connectImRoom } = initSdk(isProd);

// for browser import
<script src="..."></script> 外部引入
const { connectImRoom } = window.mqttSdk(isProd);

// common
connectImRoom('testRoomId', {
    onConnect: (client, intoRoom) => {
        console.log(intoRoom);
        setTimeout(function () {
            client.sendMessage({
                msgType: 1,
                content: 'test3333333333333333333333',
            }).then(res => console.log(res));
        }, 2000);
    },
    onMessage: (topic, payload) => {
        // console.log('message: ', [topic, payload].join(': '));
    },
    onError: (err) => {
        console.log(err);
    }
})
```

### API
```
function connectImRoom(chatRoomId: String, {
    user: Object,
    onConnect: (client, intoRoomStr) => void,
    onMessage: (topic, payload.toString()) => void,
    onError: (error, client) => void,
    onOffline: (client) => void,
    onReconnect: (client) => void
}) {...}

interface connectMethod {
    connectImRoom: connectImRoom
};

function initSdk(isProd?: boolean) {...}: connectMethod;

```

### Test
```
// for browser
npm run build
http-server
const { connectImRoom } = window.mqttSdk(isProd)
...

### Release
```
npm run build
```

