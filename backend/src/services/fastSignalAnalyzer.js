import Indicators from './indicators.js';

/**
 * 快速信号分析器
 * 基于实时tick数据和短周期K线，提供即时交易建议
 */
class FastSignalAnalyzer {
    constructor() {
        this.signalHistory = [];
        this.maxHistoryLength = 10;
    }

    /**
     * 分析多时间框架信号
     * @param {Object} klines - 多周期K线数据 {1: [], 5: [], 15: []}
     * @param {Object} tick - 实时tick数据
     * @returns {Object} 综合信号分析结果
     */
    analyzeMultiTimeframe(klines, tick) {
        const signals = {};

        // 分析各个时间框架
        if (klines['1'] && klines['1'].length >= 20) {
            signals.m1 = this.analyzeTimeframe(klines['1'], '1分钟');
        }

        if (klines['5'] && klines['5'].length >= 20) {
            signals.m5 = this.analyzeTimeframe(klines['5'], '5分钟');
        }

        if (klines['15'] && klines['15'].length >= 20) {
            signals.m15 = this.analyzeTimeframe(klines['15'], '15分钟');
        }

        // 综合评估
        const finalSignal = this.synthesizeSignals(signals, tick);

        // 保存历史
        this.signalHistory.push({
            timestamp: Date.now(),
            signal: finalSignal
        });

        if (this.signalHistory.length > this.maxHistoryLength) {
            this.signalHistory.shift();
        }

        return finalSignal;
    }

    /**
     * 分析单个时间框架
     */
    analyzeTimeframe(klines, timeframe) {
        const indicators = Indicators.calculateAll(klines);
        const latest = klines[klines.length - 1];

        let score = 50; // 基础分数
        const reasons = [];

        // 1. 趋势分析 (30分)
        if (indicators.ma && indicators.ma.ma5 && indicators.ma.ma10 && indicators.ma.ma20) {
            const ma5 = indicators.ma.ma5[indicators.ma.ma5.length - 1];
            const ma10 = indicators.ma.ma10[indicators.ma.ma10.length - 1];
            const ma20 = indicators.ma.ma20[indicators.ma.ma20.length - 1];

            if (ma5 > ma10 && ma10 > ma20) {
                score += 30;
                reasons.push(`${timeframe}多头排列`);
            } else if (ma5 < ma10 && ma10 < ma20) {
                score -= 30;
                reasons.push(`${timeframe}空头排列`);
            } else if (ma5 > ma20) {
                score += 15;
                reasons.push(`${timeframe}趋势偏多`);
            } else {
                score -= 15;
                reasons.push(`${timeframe}趋势偏空`);
            }
        }

        // 2. MACD分析 (25分)
        if (indicators.macd) {
            const macdData = indicators.macd;
            const len = macdData.dif.length;
            const currentDif = macdData.dif[len - 1];
            const currentDea = macdData.dea[len - 1];
            const currentMacd = macdData.macd[len - 1];
            const prevDif = macdData.dif[len - 2];
            const prevDea = macdData.dea[len - 2];

            // 金叉死叉
            if (prevDif <= prevDea && currentDif > currentDea) {
                score += 25;
                reasons.push(`${timeframe}MACD金叉`);
            } else if (prevDif >= prevDea && currentDif < currentDea) {
                score -= 25;
                reasons.push(`${timeframe}MACD死叉`);
            }

            // DIF位置
            if (currentDif > 0 && currentMacd > 0) {
                score += 10;
            } else if (currentDif < 0 && currentMacd < 0) {
                score -= 10;
            }
        }

        // 3. RSI分析 (20分)
        if (indicators.rsi && indicators.rsi.length > 0) {
            const rsi = indicators.rsi[indicators.rsi.length - 1];

            if (rsi < 30) {
                score += 20;
                reasons.push(`${timeframe}RSI超卖(${rsi.toFixed(1)})`);
            } else if (rsi > 70) {
                score -= 20;
                reasons.push(`${timeframe}RSI超买(${rsi.toFixed(1)})`);
            } else if (rsi < 40) {
                score += 10;
            } else if (rsi > 60) {
                score -= 10;
            }
        }

        // 4. KDJ分析 (15分)
        if (indicators.kdj) {
            const len = indicators.kdj.k.length;
            const k = indicators.kdj.k[len - 1];
            const d = indicators.kdj.d[len - 1];
            const j = indicators.kdj.j[len - 1];
            const prevK = indicators.kdj.k[len - 2];
            const prevD = indicators.kdj.d[len - 2];

            if (prevK <= prevD && k > d && j < 20) {
                score += 15;
                reasons.push(`${timeframe}KDJ低位金叉`);
            } else if (prevK >= prevD && k < d && j > 80) {
                score -= 15;
                reasons.push(`${timeframe}KDJ高位死叉`);
            }
        }

        // 5. 价格动能 (10分)
        const recentKlines = klines.slice(-5);
        const upCount = recentKlines.filter(k => k.close > k.open).length;
        if (upCount >= 4) {
            score += 10;
            reasons.push(`${timeframe}连续上涨`);
        } else if (upCount <= 1) {
            score -= 10;
            reasons.push(`${timeframe}连续下跌`);
        }

        return {
            timeframe,
            score: Math.max(0, Math.min(100, score)),
            reasons,
            indicators
        };
    }

    /**
     * 综合多时间框架信号
     */
    synthesizeSignals(signals, tick) {
        let totalScore = 0;
        let totalWeight = 0;
        const allReasons = [];

        // 权重分配：1分钟(20%), 5分钟(50%), 15分钟(30%)
        const weights = {
            m1: 0.2,
            m5: 0.5,
            m15: 0.3
        };

        Object.keys(signals).forEach(key => {
            const signal = signals[key];
            const weight = weights[key] || 0;
            totalScore += signal.score * weight;
            totalWeight += weight;
            allReasons.push(...signal.reasons);
        });

        const finalScore = totalWeight > 0 ? totalScore / totalWeight : 50;

        // 确定信号等级和建议
        let level, action, confidence, urgency, color;

        if (finalScore >= 85) {
            level = '强烈做多';
            action = '建议开多仓';
            confidence = '极高';
            urgency = '立即';
            color = '#10b981';
        } else if (finalScore >= 70) {
            level = '做多';
            action = '可考虑做多';
            confidence = '较高';
            urgency = '尽快';
            color = '#34d399';
        } else if (finalScore >= 55) {
            level = '偏多观望';
            action = '持多仓观望';
            confidence = '中等';
            urgency = '不急';
            color = '#fbbf24';
        } else if (finalScore >= 45) {
            level = '中性观望';
            action = '观望为主';
            confidence = '低';
            urgency = '不建议';
            color = '#9ca3af';
        } else if (finalScore >= 30) {
            level = '偏空观望';
            action = '持空仓观望';
            confidence = '中等';
            urgency = '不急';
            color = '#fb923c';
        } else if (finalScore >= 15) {
            level = '做空';
            action = '可考虑做空';
            confidence = '较高';
            urgency = '尽快';
            color = '#f87171';
        } else {
            level = '强烈做空';
            action = '建议开空仓';
            confidence = '极高';
            urgency = '立即';
            color = '#ef4444';
        }

        // 关键价位（基于最近K线）
        let recentHigh = 0;
        let recentLow = Infinity;
        let currentPrice = tick?.price || 0;

        // 从可用的时间框架中获取K线数据
        Object.values(signals).forEach(signal => {
            if (signal.indicators && signal.indicators.klines) {
                const klines = signal.indicators.klines.slice(-20);
                klines.forEach(k => {
                    if (k.high > recentHigh) recentHigh = k.high;
                    if (k.low < recentLow) recentLow = k.low;
                });
                if (!currentPrice && klines.length > 0) {
                    currentPrice = klines[klines.length - 1].close;
                }
            }
        });

        // 如果没有找到数据，使用默认值
        if (recentLow === Infinity) recentLow = 0;

        return {
            score: Math.round(finalScore),
            level,
            action,
            confidence,
            urgency,
            color,
            reasons: allReasons.slice(0, 8), // 最多显示8条理由
            keyLevels: {
                resistance: Math.round(recentHigh),
                support: Math.round(recentLow),
                current: Math.round(currentPrice)
            },
            timeframes: signals,
            timestamp: Date.now()
        };
    }

    /**
     * 获取信号趋势
     */
    getSignalTrend() {
        if (this.signalHistory.length < 3) {
            return 'insufficient_data';
        }

        const recent = this.signalHistory.slice(-3);
        const scores = recent.map(h => h.signal.score);

        if (scores[2] > scores[1] && scores[1] > scores[0]) {
            return 'strengthening_long';
        } else if (scores[2] < scores[1] && scores[1] < scores[0]) {
            return 'strengthening_short';
        } else {
            return 'fluctuating';
        }
    }
}

export default FastSignalAnalyzer;
