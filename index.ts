import axios, { AxiosRequestConfig } from 'axios'
import proxyAgent from 'proxy-agent'
import cheerio from 'cheerio'
import { Crawler, Page, logger } from '@ljw1412/web-crawler'
import { CallbackData } from '@ljw1412/web-crawler/types/core/base'

interface CrawlerClass {
  prototype: Crawler
}

async function axiosRequest(page: Page, cbData: CallbackData) {
  const {
    id,
    type,
    url,
    timeout,
    headers,
    proxy,
    method,
    data,
    query,
    emitter
  } = page

  emitter.infoLog('Before Request', `#${id} axios:${url}`, { page })
  const options: AxiosRequestConfig = { timeout, headers }
  if (['image', 'file'].includes(type)) options.responseType = 'arraybuffer'
  if (proxy) {
    options.httpAgent = new proxyAgent(proxy)
    options.httpsAgent = new proxyAgent(proxy)
    emitter.warnLog('Request Proxy', `#${id} ${url} -> ${proxy}`, { page })
  }

  let resp
  if (method === 'POST') {
    resp = await axios.post(url, data, options)
  } else {
    resp = await axios.get(url, Object.assign(options, { params: query }))
  }
  cbData.raw = resp.data

  switch (type) {
    case 'html':
      cbData.$ = cheerio.load(cbData.raw)
      break
    case 'json':
      if (typeof cbData.raw === 'object') {
        cbData.json = cbData.raw
        break
      }
      try {
        cbData.json = JSON.parse(cbData.raw)
      } catch (error) {
        emitter.errorLog(
          'SyntaxError',
          `#${id} ${url}\n$JSON解析错误: ${error.message}`,
          { error, page }
        )
      }
      break
    case 'image':
    case 'file':
      cbData.buffer = resp.data
      break
  }
}

export const webCrawlerAxiosPlugin = function(Crawler: CrawlerClass) {
  const defaultFn = Crawler.prototype._getDefaultConfig
  Crawler.prototype._getDefaultConfig = function() {
    const defaultConfig = defaultFn()
    defaultConfig.request = axiosRequest
    defaultConfig.requestMethodName = 'axios'
    return defaultConfig
  }
}

export default webCrawlerAxiosPlugin
