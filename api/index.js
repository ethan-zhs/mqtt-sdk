const createAPI = require('./create-api');

function initAPI(options) {
    const callApi = createAPI(options);

    function createImUserForBrowser(browserId) {
        return callApi.post(`/liveservice/v2/createImUserForWeb/${browserId}`, undefined, options.headerOptions);
    }

    function createImUserForClient() {
        return callApi.post('/liveservice/v3/createImUser', undefined, options.headerOptions);
    }

    function getMqttHostConfig() {
        return callApi.get('/liveservice/v1/mqttConfig', undefined, options.headerOptions);
    }
    
    function sendMessage({
        chatRoomId,	  // 聊天室ID
        mediaLivePk,  // 直播ID
        msgType,      // 消息类型
        content,      // 消息体（送礼消息该字段为礼物消息详情
        nickName,     // 用户昵称
        userAvatar,   // 肖像路径
        fromUserId,   // 发言人标识，给客户端做去重
        gender,       // 性别，0未知，1男，2女
        messageId     // 消息编号
    }) {
        return callApi.post('/liveservice/v1/topicMessage', {
            chatRoomId,
            mediaLivePk,
            msgType,
            content,
            nickName,
            userAvatar,
            fromUserId,
            gender,
            messageId
        }, options.headerOptions);
    }

    return ({
        createImUserForBrowser,
        createImUserForClient,
        sendMessage,
        getMqttHostConfig
    });
}

module.exports = initAPI
