const axios = require('axios');
const createHeaders = require('./create-headers');

function createAPI(options) {
    const config = {
        host: options.apiHost,
        timeout: 8000
    }
    const api = {}
    const apiFunc = (method) => (url, data) => new Promise((resolve, reject) => {
        const endpoint = config.host + url;
        axios({
            method: method,
            url: endpoint,
            timeout: config.timeout,
            headers: Object.assign({}, createHeaders(method.toUpperCase(), endpoint, JSON.stringify(data), options.headerOptions)),
            data: data && JSON.stringify(data)
        }).then(res => {
            console.log(`fetched ${endpoint}`);
            resolve(res);
        }).catch(err => {
            console.log(`fetch ${endpoint} error`);
            reject(err);
        })
    });
    api.post = apiFunc('post');
    api.get = apiFunc('get');
    return api;
}

module.exports = createAPI;
