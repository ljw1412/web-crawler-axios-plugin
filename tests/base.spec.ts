import { Crawler } from '@ljw1412/web-crawler'
// @ts-ignore
import { superagentRequest } from '@ljw1412/web-crawler/lib/core/default'
import { PageOptions } from '@ljw1412/web-crawler/types/core/base'
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

  it('[axios Query]使用带参数的 GET 请求', async function() {
    await new Promise((resolve, reject) => {
      const c = new Crawler()
      c.addPage({
        type: 'json',
        url: 'http://api.isoyu.com/api/News/new_list',
        query: { type: 1, page: 1 },
        callback: (err, { json }) => {
          if (err) {
            reject(err)
            return assert(false, err)
          }
          if (!json) return assert(false, 'json is undefined.')
          assert(json.msg === 'success')
          resolve()
        }
      })
      c.start()
    })
  })

  it('[axios Data]使用带参数的 POST 请求', async function() {
    await new Promise((resolve, reject) => {
      const c = new Crawler()
      c.addPage({
        type: 'json',
        url:
          'https://manga.bilibili.com/twirp/comic.v1.Comic/HomeRecommend?device=pc&platform=web',
        method: 'POST',
        data: { page_num: 1, platform: 'phone', seed: 1, drag: 0 },
        callback: (err, { json }) => {
          if (err) {
            reject(err)
            return assert(false, err)
          }
          if (!json) return assert(false, 'json is undefined.')
          assert(json.code === 0)
          resolve()
        }
      })
      c.start()
    })
  })
})
