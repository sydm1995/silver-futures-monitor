import Indicators from './indicators.js';

/**
 * 交易信号分析器
 */
class SignalAnalyzer {
    constructor() {
        this.signalHistory = [];
    }

    /**
     * 分析交易信号
     * @param {Array} klines - K线数组
     * @param {Object} indicators - 技术指标
     */
    analyzeSignal(klines, indicators) {
        if (!klines || klines.length < 30 || !indicators) {
            return {
                signal: 'WAIT',
                strength: 0,
                direction: 'NEUTRAL',
                reasons: ['数据不足，等待更多K线数据']
            };
        }

        const currentPrice = klines[klines.length - 1].close;
        const prevKline = klines[klines.length - 2];

        let longScore = 0;
        let shortScore = 0;
        const reasons = [];

        // 1. MACD分析 (25分)
        if (indicators.macd) {
            const { dif, dea, macd } = indicators.macd;

            // MACD金叉
            if (dif > dea && macd > 0) {
                longScore += 15;
                reasons.push('✓ MACD金叉，DIF上穿DEA');
            }
            // DIF上穿0轴
            if (dif > 0 && macd > 0) {
                longScore += 10;
                reasons.push('✓ DIF在0轴上方，多头趋势');
            }

            // MACD死叉
            if (dif < dea && macd < 0) {
                shortScore += 15;
                reasons.push('✗ MACD死叉，DIF下穿DEA');
            }
            // DIF下穿0轴
            if (dif < 0 && macd < 0) {
                shortScore += 10;
                reasons.push('✗ DIF在0轴下方，空头趋势');
            }
        }

        // 2. KDJ分析 (20分)
        if (indicators.kdj) {
            const { k, d, j } = indicators.kdj;

            // KDJ金叉且在超卖区
            if (k > d && j < 20) {
                longScore += 20;
                reasons.push('✓ KDJ金叉且J值<20，超卖反弹');
            } else if (k > d && j < 50) {
                longScore += 10;
                reasons.push('✓ KDJ金叉，多头信号');
            }

            // KDJ死叉且在超买区
            if (k < d && j > 80) {
                shortScore += 20;
                reasons.push('✗ KDJ死叉且J值>80，超买回调');
            } else if (k < d && j > 50) {
                shortScore += 10;
                reasons.push('✗ KDJ死叉，空头信号');
            }
        }

        // 3. RSI分析 (15分)
        if (indicators.rsi) {
            const rsi = indicators.rsi;

            if (rsi < 30) {
                longScore += 15;
                reasons.push('✓ RSI<30，超卖区域');
            } else if (rsi > 30 && rsi < 50) {
                longScore += 8;
                reasons.push('✓ RSI从超卖区回升');
            }

            if (rsi > 70) {
                shortScore += 15;
                reasons.push('✗ RSI>70，超买区域');
            } else if (rsi < 70 && rsi > 50) {
                shortScore += 8;
                reasons.push('✗ RSI从超买区回落');
            }
        }

        // 4. 布林带分析 (20分)
        if (indicators.boll) {
            const { upper, middle, lower } = indicators.boll;

            // 价格突破中轨向上
            if (currentPrice > middle && prevKline.close <= middle) {
                longScore += 20;
                reasons.push('✓ 价格突破布林中轨向上');
            } else if (currentPrice > middle) {
                longScore += 10;
                reasons.push('✓ 价格在布林中轨上方');
            }

            // 价格跌破中轨向下
            if (currentPrice < middle && prevKline.close >= middle) {
                shortScore += 20;
                reasons.push('✗ 价格跌破布林中轨向下');
            } else if (currentPrice < middle) {
                shortScore += 10;
                reasons.push('✗ 价格在布林中轨下方');
            }

            // 触及上轨
            if (currentPrice >= upper * 0.99) {
                shortScore += 5;
                reasons.push('⚠ 价格接近布林上轨，注意回调');
            }

            // 触及下轨
            if (currentPrice <= lower * 1.01) {
                longScore += 5;
                reasons.push('⚠ 价格接近布林下轨，注意反弹');
            }
        }

        // 5. 成交量分析 (10分)
        const recentVolumes = klines.slice(-10).map(k => k.volume);
        const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
        const currentVolume = klines[klines.length - 1].volume;

        if (currentVolume > avgVolume * 1.5) {
            if (longScore > shortScore) {
                longScore += 10;
                reasons.push('✓ 成交量放大确认多头');
            } else {
                shortScore += 10;
                reasons.push('✗ 成交量放大确认空头');
            }
        }

        // 6. 均线分析 (10分)
        if (indicators.ma5 && indicators.ma10 && indicators.ma20) {
            // 多头排列
            if (indicators.ma5 > indicators.ma10 && indicators.ma10 > indicators.ma20) {
                longScore += 10;
                reasons.push('✓ 均线多头排列');
            }

            // 空头排列
            if (indicators.ma5 < indicators.ma10 && indicators.ma10 < indicators.ma20) {
                shortScore += 10;
                reasons.push('✗ 均线空头排列');
            }
        }

        // 计算最终信号
        const totalScore = Math.max(longScore, shortScore);
        let signal = 'WAIT';
        let strength = 0;
        let direction = 'NEUTRAL';

        if (longScore > shortScore) {
            direction = 'LONG';
            strength = longScore;

            if (longScore >= 75) {
                signal = 'STRONG_LONG';
            } else if (longScore >= 60) {
                signal = 'LONG';
            } else if (longScore >= 40) {
                signal = 'WEAK_LONG';
            } else {
                signal = 'WAIT';
            }
        } else if (shortScore > longScore) {
            direction = 'SHORT';
            strength = shortScore;

            if (shortScore >= 75) {
                signal = 'STRONG_SHORT';
            } else if (shortScore >= 60) {
                signal = 'SHORT';
            } else if (shortScore >= 40) {
                signal = 'WEAK_SHORT';
            } else {
                signal = 'WAIT';
            }
        }

        return {
            signal,
            strength,
            direction,
            longScore,
            shortScore,
            reasons,
            timestamp: Date.now()
        };
    }

    /**
     * 获取信号描述
     */
    getSignalDescription(signal) {
        const descriptions = {
            'STRONG_LONG': '强烈建议做多',
            'LONG': '建议做多',
            'WEAK_LONG': '弱多信号，谨慎操作',
            'STRONG_SHORT': '强烈建议做空',
            'SHORT': '建议做空',
            'WEAK_SHORT': '弱空信号，谨慎操作',
            'WAIT': '观望等待，暂不操作'
        };

        return descriptions[signal] || '无明确信号';
    }
}

export default SignalAnalyzer;
