const mqtt = require('mqtt');
const uuidv1 = require('uuid/v1');
const initAPI = require('./api');
const promisify = require('./utils/promisify');

function initSdk(options) {
    const API = initAPI(options);
    const appId = options.appId || 'b8qx12ofqj3i';
    const willTopicRoom = `test/${appId}/IM/willTopic`;

    let globalUserType = 0

    // 获取 mqtt host
    function getMqttHost() {
        return API.getMqttHostConfig().then(res => res.data);
    }

    async function getHost() {
        try {

            // 随机选择 IM 连接地址
            const func = _h5ImHost => {
                if (Array.isArray(_h5ImHost)) {
                    const len = _h5ImHost.length;
                    return _h5ImHost[Math.floor(Math.random() * len)];
                }
                return _h5ImHost;
            }

            return getMqttHost().then(res => {
                if (res && res.h5ImHosts && Array.isArray(res.h5ImHosts) && !options.imHosts) {
                    options.imHosts = res.h5ImHosts
                }
                return func(options.imHosts);
            }).catch(_ => {
                throw new Error(JSON.stringify({ code: -20181008, message: '获取IM 地址列表失败' }));
            });
        } catch (e) {
            console.log(e);
        }
    }

    // 获得生成的唯一id
    function getBrowserId() {
        const storage = typeof localStorage != 'undefined' ? localStorage : null;
        if (storage) {
            return storage._imid || (storage._imid = `WEBM_${uuidv1()}`);
        }
        return `WEBM_${uuidv1()}`;
    }

    // 创建 IM 用户
    function createImUser(browserId) {
        return globalUserType === 0
            ? API.createImUserForBrowser(browserId).then(res => res.data)
            : API.createImUserForClient().then(res => res.data);
    }

    function heartBeat() {
        return createImUser(getBrowserId());
    }

    function sendMessage(data) {
        return API.sendMessage(data);
    }

    async function connectImRoom(chatRoomId, {
        user,
        userType, // 0为h5用户，1为客户端用户
        onConnect,
        onMessage,
        onError,
        onOffline,
        onReconnect
    } = {}) {
        let client;
        let interval;
        try {
            if (userType !== undefined) {
                globalUserType = userType;
            }

            const fullTopicId = `test/${appId}/IM/${chatRoomId}`;
            const userData = await createImUser(getBrowserId());
            
            console.log('userData:', userData);
            const assignUser = globalUserType === 0 ? userData : userData && userData.topicUserInfo
            const userInfo = user ? Object.assign({}, assignUser, user) : assignUser;
            const isInvalidWebUser = globalUserType === 0 && (!userInfo || !userInfo.userName || !userInfo.passWord);
            const isInvalidClientUser = globalUserType === 1 && (!userInfo || !userInfo.userName || !userInfo.token);

            if (isInvalidWebUser || isInvalidClientUser) {
                // 获取帐号失败，不能加入直播间
                throw new Error(JSON.stringify({ code: -20181001, message: '加入聊天室失败，聊天室已满员' }));
            }

            const host = await getHost();

            const connId = +new Date();
            client = mqtt.connect(host, {
                username: userInfo.userName,
                password: globalUserType === 0 ? userInfo.passWord : userInfo.token,
                will: {
                    topic: willTopicRoom,
                    payload: JSON.stringify({
                        subscribe: 2,
                        topicId: '',
                        userName: userInfo.userName,
                        appId,
                        messageId: +new Date(),
                        connId,
                        messageId: '' + (+new Date()),
                        client: 1 // for web
                    }),
                    qos: 1
                }
            });

            client.on('connect', async function connectFn() {
                console.log('connect: ', client.connected);
                await promisify(client.subscribe).bind(client)(fullTopicId, { qos: 1 });

                // 发送订阅信息到willTopic-统计用
                const subscribeData = {
                    subscribe: 1,
                    topicId: fullTopicId,
                    userName: userInfo.userName,
                    appId,
                    messageId: +new Date(),
                    connId,
                    messageId: '' + (+new Date()),
                    client: 1 // for web
                };
                const subscribeStr = JSON.stringify(subscribeData);
                await promisify(client.publish).bind(client)(willTopicRoom, subscribeStr, { qos: 1 });

                // 发送"进入聊天室"到targetRoom
                const intoRoomData = {
                    chatRoomId,
                    msgType: 3, // 加入聊天室
                    nickName: userInfo.nickName,
                    gender: userInfo.gender || 0,
                    messageId: +new Date(),
                    fromUserId: userInfo.userName,
                    userAvatar: userInfo.userAvatar
                };
                const intoRoomDataStr = JSON.stringify(intoRoomData);
                await promisify(client.publish).bind(client)(fullTopicId, intoRoomDataStr, { qos: 1 });

                // 心跳保持
                interval = globalUserType === 0 && setInterval(heartBeat, 10 * 60 * 1000);
                onConnect && onConnect(client, intoRoomDataStr);
            });

            onMessage && client.on('message', function (topic, payload) {
                console.log('message: ', [topic, payload].join(': '));
                onMessage(topic, payload.toString());
            });

            onOffline && client.on('offline', function () {
                console.log('offline--');
                globalUserType === 0 && clearInterval(interval);
                onOffline(client);
            });

            onError && client.on('error', function (error) {
                console.log('error--', error);
                onError(error, client);
            });

            onReconnect && client.on('reconnect', function () {
                console.log('reconnect--');
                onReconnect(client);
            });

            // client.on('packetreceive', function (packet) {
            //     console.log('packetreceive--', packet);
            // });

            // client.on('packetsend', function (packet) {
            //     console.log('packetsend--', packet);
            // });

            client.sendMessage = function ({
                content,
                msgType,
                mediaLivePk = 260
            }) {
                return sendMessage({
                    chatRoomId,
                    mediaLivePk,
                    msgType,
                    content,
                    nickName: userInfo.nickName,
                    gender: userInfo.gender || 0,
                    messageId: +new Date(),
                    fromUserId: userInfo.userName,
                    userAvatar: userInfo.userAvatar || null
                })
                    .then(res => res.data)
                    .catch(err => onError && onError(err));
            };
        } catch (err) {
            onError && onError(err);
        }
        return client;
    }

    return {
        connectImRoom
    }

}

module.exports = initSdk