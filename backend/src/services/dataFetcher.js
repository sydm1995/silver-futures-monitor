import axios from 'axios';

class DataFetcher {
    constructor() {
        this.symbol = 'XAG/USD'; // 国际银价
        this.lastPrice = 31.5; // 基准价格 $31.5/盎司

        // 缓存机制
        this.cache = {
            realTimeData: null,
            realTimeTime: 0,
            klines: {},
            klinesTime: {}
        };

        // 缓存有效期（大幅增加以减少API请求）
        this.REALTIME_CACHE_DURATION = 60000; // 60秒（从10秒增加到60秒）
        this.KLINE_CACHE_DURATION = 300000; // 5分钟（从1分钟增加到5分钟）

        // API请求节流
        this.lastApiCall = 0;
        this.MIN_API_INTERVAL = 5000; // 最小API调用间隔：5秒
        this.apiCallCount = 0;
        this.apiCallResetTime = Date.now();
        this.MAX_CALLS_PER_MINUTE = 10; // 每分钟最多10次API调用
    }

    /**
     * 检查是否可以进行API调用（节流控制）
     */
    canMakeApiCall() {
        const now = Date.now();

        // 重置计数器（每分钟）
        if (now - this.apiCallResetTime > 60000) {
            this.apiCallCount = 0;
            this.apiCallResetTime = now;
        }

        // 检查是否超过频率限制
        if (this.apiCallCount >= this.MAX_CALLS_PER_MINUTE) {
            console.log('⚠ API调用频率限制，使用缓存数据');
            return false;
        }

        // 检查最小间隔
        if (now - this.lastApiCall < this.MIN_API_INTERVAL) {
            return false;
        }

        return true;
    }

    /**
     * 记录API调用
     */
    recordApiCall() {
        this.lastApiCall = Date.now();
        this.apiCallCount++;
    }

    /**
     * 获取实时国际银价数据（优化版）
     */
    async fetchRealTimeData() {
        const now = Date.now();

        // 1. 检查缓存是否有效
        if (this.cache.realTimeData && (now - this.cache.realTimeTime) < this.REALTIME_CACHE_DURATION) {
            return this.cache.realTimeData;
        }

        // 2. 检查是否可以进行API调用
        if (!this.canMakeApiCall()) {
            // 如果有缓存数据（即使过期），继续使用
            if (this.cache.realTimeData) {
                return this.cache.realTimeData;
            }
            // 没有缓存，使用模拟数据
            return this.generateMockTick();
        }

        // 3. 尝试从CoinGecko获取真实数据
        try {
            this.recordApiCall();

            const url = 'https://api.coingecko.com/api/v3/simple/price';
            const response = await axios.get(url, {
                params: {
                    ids: 'silver',
                    vs_currencies: 'usd',
                    include_24hr_change: 'true'
                },
                timeout: 3000
            });

            if (response.data && response.data.silver && response.data.silver.usd) {
                const price = response.data.silver.usd;
                const change24h = response.data.silver.usd_24h_change || 0;
                this.lastPrice = price;

                const data = {
                    symbol: 'XAG/USD',
                    name: '国际银价',
                    timestamp: Date.now(),
                    price: price,
                    open: price / (1 + change24h / 100),
                    high: price * 1.002,
                    low: price * 0.998,
                    volume: 0,
                    change: price * change24h / 100,
                    changePercent: change24h.toFixed(2)
                };

                // 更新缓存
                this.cache.realTimeData = data;
                this.cache.realTimeTime = now;

                console.log(`✓ 从CoinGecko获取到国际银价: $${price.toFixed(2)}`);
                return data;
            }
        } catch (error) {
            // API失败，使用缓存或模拟数据
            if (error.response && error.response.status === 429) {
                console.log('⚠ API请求过于频繁，使用缓存数据');
            }
        }

        // 4. API失败，使用缓存数据（即使过期）
        if (this.cache.realTimeData) {
            console.log('⚠ API失败，使用缓存数据');
            return this.cache.realTimeData;
        }

        // 5. 没有缓存，生成模拟数据
        const mockData = this.generateMockTick();
        this.cache.realTimeData = mockData;
        this.cache.realTimeTime = now;
        return mockData;
    }

    /**
     * 获取历史K线数据（优化版）
     */
    async fetchHistoricalKlines(period = '1', count = 500) {
        const cacheKey = `${period}_${count}`;
        const now = Date.now();

        // 1. 检查缓存
        if (this.cache.klines[cacheKey] && (now - (this.cache.klinesTime[cacheKey] || 0)) < this.KLINE_CACHE_DURATION) {
            return this.cache.klines[cacheKey];
        }

        // 2. K线数据更新频率较低，直接使用模拟数据
        // （避免频繁调用API，K线数据对实时性要求不高）
        console.log(`生成国际银价模拟K线数据: ${period}分钟, ${count}条`);
        const mockData = this.generateMockKlines(period, count);

        // 更新缓存
        this.cache.klines[cacheKey] = mockData;
        this.cache.klinesTime[cacheKey] = now;

        return mockData;
    }

    /**
     * 生成模拟tick数据（基于国际银价）
     */
    generateMockTick() {
        // 在上次价格基础上随机波动
        const volatility = this.lastPrice * 0.002; // 0.2%波动
        const change = (Math.random() - 0.5) * volatility;
        this.lastPrice = Math.max(30, Math.min(33, this.lastPrice + change)); // 限制在$30-$33

        const price = this.lastPrice;

        return {
            symbol: 'XAG/USD',
            name: '国际银价',
            timestamp: Date.now(),
            price: parseFloat(price.toFixed(3)),
            open: parseFloat((price * 0.999).toFixed(3)),
            high: parseFloat((price * 1.001).toFixed(3)),
            low: parseFloat((price * 0.998).toFixed(3)),
            volume: Math.floor(Math.random() * 50000 + 10000),
            change: parseFloat(change.toFixed(3)),
            changePercent: ((change / price) * 100).toFixed(2)
        };
    }

    /**
     * 生成模拟历史K线数据（基于国际银价）
     */
    generateMockKlines(period = '1', count = 500) {
        const klines = [];
        const now = Date.now();
        const periodMs = parseInt(period) * 60000;

        // 基准价格（国际银价约 $31-$32 每盎司）
        let basePrice = 31.5 + Math.random();

        for (let i = count - 1; i >= 0; i--) {
            const timestamp = now - (i * periodMs);

            // 生成随机价格波动
            const volatility = basePrice * 0.003; // 0.3%波动
            const open = basePrice + (Math.random() - 0.5) * volatility;
            const close = open + (Math.random() - 0.5) * volatility;
            const high = Math.max(open, close) + Math.random() * volatility * 0.5;
            const low = Math.min(open, close) - Math.random() * volatility * 0.5;
            const volume = Math.floor(Math.random() * 50000 + 10000);

            klines.push({
                timestamp,
                datetime: new Date(timestamp).toISOString(),
                open: parseFloat(open.toFixed(3)),
                close: parseFloat(close.toFixed(3)),
                high: parseFloat(high.toFixed(3)),
                low: parseFloat(low.toFixed(3)),
                volume,
                amount: volume * close,
                period
            });

            // 下一根K线的基准价格是当前收盘价
            basePrice = close;
        }

        return klines;
    }

    /**
     * 获取合约信息
     */
    async fetchContractInfo() {
        return {
            symbol: 'XAG/USD',
            name: '国际银价',
            exchange: 'International',
            multiplier: 1, // 1盎司
            minMove: 0.001, // 最小变动：0.001美元
            margin: 0.05, // 默认保证金比例：5%
            tradingHours: [
                { session: '全天候', time: '24小时交易（周末除外）' }
            ]
        };
    }
}

export default DataFetcher;
