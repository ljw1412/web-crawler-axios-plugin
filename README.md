# @ljw1412/web-crawler-axios-plugin

@ljw1412/web-crawler的axios插件，用来替换默认的请求方法。

**@ljw1412/web-crawler**[![npm version](https://img.shields.io/npm/v/@ljw1412/web-crawler?style=flat-square)](https://www.npmjs.com/package/@ljw1412/web-crawler)


### 使用方法
```js
import { Crawler } from '@ljw1412/web-crawler'
import { webCrawlerAxiosPlugin } from '@ljw1412/web-crawler-axios-plugin'

Crawler.use(webCrawlerAxiosPlugin)
```