import axios, { AxiosRequestConfig } from 'axios'
import proxyAgent from 'proxy-agent'
import cheerio from 'cheerio'
import { Crawler, Page, logger } from '@ljw1412/web-crawler'
import { CallbackData } from '@ljw1412/web-crawler/types/base'

interface CrawlerClass {
  prototype: Crawler
}

async function axiosRequest(page: Page, data: CallbackData) {
  const { id, type, url, timeout, headers, proxy } = page
  const options: AxiosRequestConfig = { timeout, headers }
  if (['image', 'file'].includes(type)) options.responseType = 'arraybuffer'
  if (proxy) {
    options.httpAgent = new proxyAgent(proxy)
    options.httpsAgent = new proxyAgent(proxy)
    logger.warn('[请求代理]', url, '->', proxy)
  }

  logger.info(`[${id}|发起请求]axios:`, url)
  const resp = await axios.get(url, options)
  data.raw = resp.data

  switch (type) {
    case 'html':
      data.$ = cheerio.load(data.raw)
      break
    case 'json':
      try {
        data.json = JSON.parse(data.raw)
      } catch (err) {
        logger.error(`[${id}|JSON解析错误]`, data.page.url, '\n', err)
      }
      break
    case 'image':
    case 'file':
      data.buffer = resp.data
      break
  }
}

export default function(Crawler: CrawlerClass) {
  const defaultFn = Crawler.prototype._getDefaultConfig
  Crawler.prototype._getDefaultConfig = function() {
    const defaultConfig = defaultFn()
    defaultConfig.request = axiosRequest
    return defaultConfig
  }
}
