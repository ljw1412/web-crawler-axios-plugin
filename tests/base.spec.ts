import { Crawler } from '@ljw1412/web-crawler'
// @ts-ignore
import { superagentRequest } from '@ljw1412/web-crawler/lib/default'
import { PageOptions } from '@ljw1412/web-crawler/types/base'
import { webCrawlerAxiosPlugin } from '../index'
import assert from 'assert'

const proxy = 'http://127.0.0.1:1087'

const getTest = (
  url: string,
  proxy: string | null,
  requestMethodName: string | undefined,
  titleName: string,
  usePlugin: boolean = false
) =>
  async function() {
    await new Promise((resolve, reject) => {
      if (usePlugin) Crawler.use(webCrawlerAxiosPlugin)
      const c = new Crawler()
      if (!usePlugin) c.default.request = superagentRequest as any

      const flag = c.default.requestMethodName === requestMethodName
      const pageOptions: PageOptions = { type: 'html', url }
      if (proxy) pageOptions.proxy = proxy

      c.addPage(pageOptions)

      c.on('data', ({ $ }) => {
        if (!$) {
          assert(false, '$ is undefined.')
          reject('$ is undefined.')
        }
        const title = $('title').text()
        assert(flag && title.includes(titleName))
        resolve()
      })

      c.on('error', error => {
        assert(false, error)
        reject(error)
      })

      c.start()
    })
  }

describe('web-crawler-axios-plugin', function() {
  this.timeout(20000)

  it(
    '[superagent]默认请求',
    getTest('http://www.baidu.com', null, undefined, '百度')
  )

  it(
    '[superagent proxy]默认请求',
    getTest('http://www.google.com', proxy, undefined, 'Google')
  )

  it(
    '[axios] 使用axios请求',
    getTest('http://www.baidu.com', null, 'axios', '百度', true)
  )

  it(
    '[axios proxy] 使用axios请求',
    getTest('http://www.google.com', proxy, 'axios', 'Google', true)
  )
})
