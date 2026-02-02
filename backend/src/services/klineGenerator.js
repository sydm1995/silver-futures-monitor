class KLineGenerator {
    constructor() {
        this.klineBuffers = {
            '1': [],   // 1分钟
            '5': [],   // 5分钟
            '15': [],  // 15分钟
            '30': [],  // 30分钟
            '60': []   // 60分钟
        };
    }

    /**
     * 从tick数据生成1分钟K线
     * @param {Object} tick - tick数据
     */
    generateKlineFromTick(tick) {
        const timestamp = Math.floor(tick.timestamp / 60000) * 60000; // 对齐到分钟

        return {
            timestamp,
            open: tick.open || tick.price,
            high: tick.high || tick.price,
            low: tick.low || tick.price,
            close: tick.price,
            volume: tick.volume || 0,
            period: '1'
        };
    }

    /**
     * 合并K线到更大周期
     * @param {Array} klines - 1分钟K线数组
     * @param {number} period - 目标周期（分钟）
     */
    mergeKlines(klines, period) {
        if (!klines || klines.length === 0) return [];

        const merged = [];
        const periodMs = period * 60000;

        let currentKline = null;

        klines.forEach(kline => {
            const periodStart = Math.floor(kline.timestamp / periodMs) * periodMs;

            if (!currentKline || currentKline.timestamp !== periodStart) {
                if (currentKline) {
                    merged.push(currentKline);
                }
                currentKline = {
                    timestamp: periodStart,
                    open: kline.open,
                    high: kline.high,
                    low: kline.low,
                    close: kline.close,
                    volume: kline.volume,
                    period: period.toString()
                };
            } else {
                currentKline.high = Math.max(currentKline.high, kline.high);
                currentKline.low = Math.min(currentKline.low, kline.low);
                currentKline.close = kline.close;
                currentKline.volume += kline.volume;
            }
        });

        if (currentKline) {
            merged.push(currentKline);
        }

        return merged;
    }

    /**
     * 生成所有周期的K线
     * @param {Array} baseKlines - 基础K线（1分钟）
     */
    generateAllPeriods(baseKlines) {
        return {
            '1': baseKlines,
            '5': this.mergeKlines(baseKlines, 5),
            '15': this.mergeKlines(baseKlines, 15),
            '30': this.mergeKlines(baseKlines, 30),
            '60': this.mergeKlines(baseKlines, 60)
        };
    }
}

export default KLineGenerator;
