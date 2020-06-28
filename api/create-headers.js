function createHeaders(method, requestUrl, bodyStream, headerOptions) {

    headers = {
        'Content-Type': 'application/json'
    };

    return headers;
}

module.exports = createHeaders;
