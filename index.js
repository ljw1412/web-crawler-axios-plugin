"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const proxy_agent_1 = __importDefault(require("proxy-agent"));
const cheerio_1 = __importDefault(require("cheerio"));
const web_crawler_1 = require("@ljw1412/web-crawler");
async function axiosRequest(page, data) {
    const { id, type, url, timeout, headers, proxy } = page;
    const options = { timeout, headers };
    if (['image', 'file'].includes(type))
        options.responseType = 'arraybuffer';
    if (proxy) {
        options.httpAgent = new proxy_agent_1.default(proxy);
        options.httpsAgent = new proxy_agent_1.default(proxy);
        web_crawler_1.logger.warn('[请求代理]', url, '->', proxy);
    }
    web_crawler_1.logger.info(`[${id}|发起请求]axios:`, url);
    const resp = await axios_1.default.get(url, options);
    data.raw = resp.data;
    switch (type) {
        case 'html':
            data.$ = cheerio_1.default.load(data.raw);
            break;
        case 'json':
            try {
                data.json = JSON.parse(data.raw);
            }
            catch (err) {
                web_crawler_1.logger.error(`[${id}|JSON解析错误]`, data.page.url, '\n', err);
            }
            break;
        case 'image':
        case 'file':
            data.buffer = resp.data;
            break;
    }
}
exports.webCrawlerAxiosPlugin = function (Crawler) {
    const defaultFn = Crawler.prototype._getDefaultConfig;
    Crawler.prototype._getDefaultConfig = function () {
        const defaultConfig = defaultFn();
        defaultConfig.request = axiosRequest;
        return defaultConfig;
    };
};
exports.default = exports.webCrawlerAxiosPlugin;
