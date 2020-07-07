"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webCrawlerAxiosPlugin = void 0;
const axios_1 = __importDefault(require("axios"));
const proxy_agent_1 = __importDefault(require("proxy-agent"));
const cheerio_1 = __importDefault(require("cheerio"));
async function axiosRequest(page, cbData) {
    const { id, type, url, timeout, headers, proxy, method, data, query, emitter } = page;
    emitter.infoLog('Before Request', `#${id} axios:${url}`, { page });
    const options = { timeout, headers };
    if (['image', 'file'].includes(type))
        options.responseType = 'arraybuffer';
    if (proxy) {
        options.httpAgent = new proxy_agent_1.default(proxy);
        options.httpsAgent = new proxy_agent_1.default(proxy);
        emitter.warnLog('Request Proxy', `#${id} ${url} -> ${proxy}`, { page });
    }
    let resp;
    if (method === 'POST') {
        resp = await axios_1.default.post(url, data, options);
    }
    else {
        resp = await axios_1.default.get(url, Object.assign(options, { params: query }));
    }
    cbData.raw = resp.data;
    switch (type) {
        case 'html':
            cbData.$ = cheerio_1.default.load(cbData.raw);
            break;
        case 'json':
            if (typeof cbData.raw === 'object') {
                cbData.json = cbData.raw;
                break;
            }
            try {
                cbData.json = JSON.parse(cbData.raw);
            }
            catch (error) {
                emitter.errorLog('SyntaxError', `#${id} ${url}\n$JSON解析错误: ${error.message}`, { error, page });
            }
            break;
        case 'image':
        case 'file':
            cbData.buffer = resp.data;
            break;
    }
}
exports.webCrawlerAxiosPlugin = function (Crawler) {
    const defaultFn = Crawler.prototype._getDefaultConfig;
    Crawler.prototype._getDefaultConfig = function () {
        const defaultConfig = defaultFn();
        defaultConfig.request = axiosRequest;
        defaultConfig.requestMethodName = 'axios';
        return defaultConfig;
    };
};
exports.default = exports.webCrawlerAxiosPlugin;
