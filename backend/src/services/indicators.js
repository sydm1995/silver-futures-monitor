/**
 * 技术指标计算引擎
 */

class Indicators {
    /**
     * 计算简单移动平均线 (SMA)
     * @param {Array} data - 价格数组
     * @param {number} period - 周期
     */
    static SMA(data, period) {
        if (data.length < period) return null;
        const sum = data.slice(-period).reduce((a, b) => a + b, 0);
        return sum / period;
    }

    /**
     * 计算指数移动平均线 (EMA)
     * @param {Array} data - 价格数组
     * @param {number} period - 周期
     */
    static EMA(data, period) {
        if (data.length < period) return null;

        const multiplier = 2 / (period + 1);
        let ema = this.SMA(data.slice(0, period), period);

        for (let i = period; i < data.length; i++) {
            ema = (data[i] - ema) * multiplier + ema;
        }

        return ema;
    }

    /**
     * 计算MACD指标
     * @param {Array} closes - 收盘价数组
     */
    static MACD(closes) {
        if (closes.length < 26) return null;

        const ema12 = [];
        const ema26 = [];

        // 计算EMA12和EMA26
        for (let i = 0; i < closes.length; i++) {
            if (i >= 11) {
                ema12.push(this.EMA(closes.slice(0, i + 1), 12));
            }
            if (i >= 25) {
                ema26.push(this.EMA(closes.slice(0, i + 1), 26));
            }
        }

        // 计算DIF
        const dif = [];
        for (let i = 0; i < ema26.length; i++) {
            dif.push(ema12[i + 14] - ema26[i]);
        }

        // 计算DEA (DIF的9日EMA)
        const dea = [];
        for (let i = 0; i < dif.length; i++) {
            if (i >= 8) {
                dea.push(this.EMA(dif.slice(0, i + 1), 9));
            }
        }

        // 计算MACD柱
        const macd = [];
        for (let i = 0; i < dea.length; i++) {
            macd.push((dif[i + 8] - dea[i]) * 2);
        }

        return {
            dif: dif[dif.length - 1],
            dea: dea[dea.length - 1],
            macd: macd[macd.length - 1]
        };
    }

    /**
     * 计算RSI指标
     * @param {Array} closes - 收盘价数组
     * @param {number} period - 周期，默认14
     */
    static RSI(closes, period = 14) {
        if (closes.length < period + 1) return null;

        let gains = 0;
        let losses = 0;

        // 计算初始平均涨跌
        for (let i = 1; i <= period; i++) {
            const change = closes[i] - closes[i - 1];
            if (change > 0) {
                gains += change;
            } else {
                losses += Math.abs(change);
            }
        }

        let avgGain = gains / period;
        let avgLoss = losses / period;

        // 计算后续的平滑平均
        for (let i = period + 1; i < closes.length; i++) {
            const change = closes[i] - closes[i - 1];
            if (change > 0) {
                avgGain = (avgGain * (period - 1) + change) / period;
                avgLoss = (avgLoss * (period - 1)) / period;
            } else {
                avgGain = (avgGain * (period - 1)) / period;
                avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
            }
        }

        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    /**
     * 计算KDJ指标
     * @param {Array} klines - K线数组 [{high, low, close}]
     * @param {number} period - 周期，默认9
     */
    static KDJ(klines, period = 9) {
        if (klines.length < period) return null;

        const recentKlines = klines.slice(-period);
        const close = klines[klines.length - 1].close;
        const high = Math.max(...recentKlines.map(k => k.high));
        const low = Math.min(...recentKlines.map(k => k.low));

        const rsv = ((close - low) / (high - low)) * 100;

        // 简化计算，使用前一个K值和D值（实际应用中需要保存历史值）
        const k = (2 / 3) * 50 + (1 / 3) * rsv; // 假设前一个K值为50
        const d = (2 / 3) * 50 + (1 / 3) * k;   // 假设前一个D值为50
        const j = 3 * k - 2 * d;

        return { k, d, j };
    }

    /**
     * 计算布林带 (BOLL)
     * @param {Array} closes - 收盘价数组
     * @param {number} period - 周期，默认20
     * @param {number} stdDev - 标准差倍数，默认2
     */
    static BOLL(closes, period = 20, stdDev = 2) {
        if (closes.length < period) return null;

        const recentCloses = closes.slice(-period);
        const middle = this.SMA(recentCloses, period);

        // 计算标准差
        const variance = recentCloses.reduce((sum, price) => {
            return sum + Math.pow(price - middle, 2);
        }, 0) / period;
        const std = Math.sqrt(variance);

        return {
            upper: middle + stdDev * std,
            middle: middle,
            lower: middle - stdDev * std
        };
    }

    /**
     * 计算ATR (Average True Range)
     * @param {Array} klines - K线数组 [{high, low, close}]
     * @param {number} period - 周期，默认14
     */
    static ATR(klines, period = 14) {
        if (klines.length < period + 1) return null;

        const trueRanges = [];
        for (let i = 1; i < klines.length; i++) {
            const high = klines[i].high;
            const low = klines[i].low;
            const prevClose = klines[i - 1].close;

            const tr = Math.max(
                high - low,
                Math.abs(high - prevClose),
                Math.abs(low - prevClose)
            );
            trueRanges.push(tr);
        }

        return this.SMA(trueRanges.slice(-period), period);
    }

    /**
     * 计算所有指标
     * @param {Array} klines - K线数组
     */
    static calculateAll(klines) {
        if (!klines || klines.length < 30) {
            return null;
        }

        const closes = klines.map(k => k.close);
        const highs = klines.map(k => k.high);
        const lows = klines.map(k => k.low);

        return {
            ma5: this.SMA(closes, 5),
            ma10: this.SMA(closes, 10),
            ma20: this.SMA(closes, 20),
            ma60: this.SMA(closes, 60),
            ema12: this.EMA(closes, 12),
            ema26: this.EMA(closes, 26),
            macd: this.MACD(closes),
            rsi: this.RSI(closes, 14),
            kdj: this.KDJ(klines, 9),
            boll: this.BOLL(closes, 20, 2),
            atr: this.ATR(klines, 14)
        };
    }
}

export default Indicators;
