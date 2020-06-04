declare module 'mocha' {
  import { Crawler } from '@ljw1412/web-crawler'
  interface Context {
    crawler: Crawler
  }
}
