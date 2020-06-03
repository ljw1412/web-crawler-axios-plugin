import { Crawler } from '@ljw1412/web-crawler';
interface CrawlerClass {
    prototype: Crawler;
}
export declare const webCrawlerAxiosPlugin: (Crawler: CrawlerClass) => void;
export default webCrawlerAxiosPlugin;
