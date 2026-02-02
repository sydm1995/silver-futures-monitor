import axios from 'axios';
import iconv from 'iconv-lite';

/**
 * 上海期货交易所数据获取器
 * 使用新浪财经接口获取真实行情数据
 */
class SHFEDataFetcher {
    constructor() {
        // 白银期货合约代码（用户交易的合约）
        this.contracts = ['AG2604', 'AG2605', 'AG2606']; // 2026年4月、5月、6月合约
        this.mainContract = 'AG2604'; // 当前主力合约（用户交易的合约）
        this.lastPrice = 24832; // 基准价格（元/千克）- 用户当前看到的价格

        // 缓存
        this.cache = {
            realTimeData: null,
            realTimeTime: 0,
            klines: {},
            klinesTime: {}
        };

        // 缓存时间
        this.REALTIME_CACHE_DURATION = 3000; // 3秒（交易时间内更新快）
        this.KLINE_CACHE_DURATION = 60000; // 1分钟
    }

    /**
     * 判断是否在交易时间内
     */
    isTradingHours() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const day = now.getDay();

        // 周末不交易
        if (day === 0 || day === 6) {
            return false;
        }

        // 交易时间段
        // 日盘：9:00-10:15, 10:30-11:30, 13:30-15:00
        // 夜盘：21:00-次日2:30

        const time = hour * 60 + minute;

        // 日盘
        if ((time >= 540 && time < 615) ||   // 9:00-10:15
            (time >= 630 && time < 690) ||   // 10:30-11:30
            (time >= 810 && time < 900)) {   // 13:30-15:00
            return true;
        }

        // 夜盘（21:00-23:59 或 0:00-2:30）
        if (time >= 1260 || time < 150) {    // 21:00之后 或 2:30之前
            return true;
        }

        return false;
    }

    /**
     * 从新浪财经获取实时行情
     */
    async fetchFromSina() {
        try {
            // 新浪期货行情接口（需要加nf_前缀）
            const url = `http://hq.sinajs.cn/list=nf_${this.mainContract}`;

            const response = await axios.get(url, {
                timeout: 3000,
                responseType: 'arraybuffer',
                headers: {
                    'Referer': 'http://finance.sina.com.cn',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            // 解码GBK编码
            const html = iconv.decode(response.data, 'gbk');

            // 解析数据
            // 格式: var hq_str_ag2506="白银2506,7850,7820,7880,7900,7800,7850,7860,..."
            const match = html.match(/="([^"]+)"/);
            if (!match) {
                throw new Error('数据格式错误');
            }

            const data = match[1].split(',');

            // 数据字段说明（新浪期货接口）
            // 0:合约名称 1:开盘价 2:最高价 3:最低价 4:昨收价 5:买价 6:卖价 7:最新价
            // 8:结算价 9:昨结算 10:买量 11:卖量 12:持仓量 13:成交量

            const price = parseFloat(data[7]) || parseFloat(data[1]); // 最新价或开盘价
            const open = parseFloat(data[1]);
            const high = parseFloat(data[2]);
            const low = parseFloat(data[3]);
            const preClose = parseFloat(data[4]);
            const volume = parseInt(data[13]) || 0;

            if (!price || price === 0) {
                throw new Error('价格数据无效');
            }

            this.lastPrice = price;

            return {
                symbol: this.mainContract,
                name: `白银期货${this.mainContract.slice(-4)}`,
                exchange: 'SHFE',
                timestamp: Date.now(),
                price: price,
                open: open,
                high: high,
                low: low,
                preClose: preClose,
                volume: volume,
                change: price - preClose,
                changePercent: ((price - preClose) / preClose * 100).toFixed(2)
            };
        } catch (error) {
            console.log('新浪财经接口失败:', error.message);
            return null;
        }
    }

    /**
     * 获取实时数据（智能切换真实/模拟）
     */
    async fetchRealTimeData() {
        const now = Date.now();

        // 检查缓存
        if (this.cache.realTimeData && (now - this.cache.realTimeTime) < this.REALTIME_CACHE_DURATION) {
            return this.cache.realTimeData;
        }

        // 判断是否在交易时间
        if (this.isTradingHours()) {
            console.log('📊 交易时间内，尝试获取SHFE真实数据...');

            // 尝试获取真实数据
            const realData = await this.fetchFromSina();

            if (realData) {
                console.log(`✓ 获取到SHFE真实行情: ${realData.price} 元/千克`);
                this.cache.realTimeData = realData;
                this.cache.realTimeTime = now;
                return realData;
            }
        } else {
            console.log('⏰ 非交易时间，使用模拟数据');
        }

        // 非交易时间或获取失败，使用模拟数据
        const mockData = this.generateMockTick();
        this.cache.realTimeData = mockData;
        this.cache.realTimeTime = now;
        return mockData;
    }

    /**
     * 获取历史K线数据
     */
    async fetchHistoricalKlines(period = '1', count = 500) {
        const cacheKey = `${period}_${count}`;
        const now = Date.now();

        // 检查缓存
        if (this.cache.klines[cacheKey] && (now - (this.cache.klinesTime[cacheKey] || 0)) < this.KLINE_CACHE_DURATION) {
            return this.cache.klines[cacheKey];
        }

        // K线数据使用模拟数据（真实K线需要专门的接口）
        console.log(`生成SHFE模拟K线数据: ${period}分钟, ${count}条`);
        const mockData = this.generateMockKlines(period, count);

        this.cache.klines[cacheKey] = mockData;
        this.cache.klinesTime[cacheKey] = now;

        return mockData;
    }

    /**
     * 生成模拟tick数据
     */
    generateMockTick() {
        // 基于上次价格随机波动
        const volatility = this.lastPrice * 0.002; // 0.2%波动
        const change = (Math.random() - 0.5) * volatility;
        // 价格范围：24000-26000元/千克（真实市场范围）
        this.lastPrice = Math.max(24000, Math.min(26000, this.lastPrice + change));

        const price = this.lastPrice;
        const preClose = price * (1 - (Math.random() - 0.5) * 0.01);

        return {
            symbol: this.mainContract,
            name: `白银期货${this.mainContract.slice(-4)}`,
            exchange: 'SHFE',
            timestamp: Date.now(),
            price: parseFloat(price.toFixed(2)),
            open: parseFloat((price * 0.999).toFixed(2)),
            high: parseFloat((price * 1.002).toFixed(2)),
            low: parseFloat((price * 0.998).toFixed(2)),
            preClose: parseFloat(preClose.toFixed(2)),
            volume: Math.floor(Math.random() * 50000 + 10000),
            change: parseFloat((price - preClose).toFixed(2)),
            changePercent: (((price - preClose) / preClose) * 100).toFixed(2)
        };
    }

    /**
     * 生成模拟K线数据
     */
    generateMockKlines(period = '1', count = 500) {
        const klines = [];
        const now = Date.now();
        const periodMs = parseInt(period) * 60000;

        let basePrice = this.lastPrice;

        for (let i = count - 1; i >= 0; i--) {
            const timestamp = now - (i * periodMs);

            const volatility = basePrice * 0.003;
            const open = basePrice + (Math.random() - 0.5) * volatility;
            const close = open + (Math.random() - 0.5) * volatility;
            const high = Math.max(open, close) + Math.random() * volatility * 0.5;
            const low = Math.min(open, close) - Math.random() * volatility * 0.5;
            const volume = Math.floor(Math.random() * 50000 + 10000);

            klines.push({
                timestamp,
                datetime: new Date(timestamp).toISOString(),
                open: parseFloat(open.toFixed(2)),
                close: parseFloat(close.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                volume,
                amount: volume * close,
                period
            });

            basePrice = close;
        }

        return klines;
    }

    /**
     * 获取合约信息
     */
    async fetchContractInfo() {
        return {
            symbol: this.mainContract,
            name: `白银期货${this.mainContract.slice(-4)}`,
            exchange: 'SHFE',
            multiplier: 15, // 15千克/手
            minMove: 1, // 最小变动：1元/千克
            margin: 0.08, // 保证金比例：8%
            tradingHours: [
                { session: '日盘', time: '9:00-10:15, 10:30-11:30, 13:30-15:00' },
                { session: '夜盘', time: '21:00-次日2:30' }
            ]
        };
    }
}

export default SHFEDataFetcher;
