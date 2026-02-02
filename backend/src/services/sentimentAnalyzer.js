/**
 * 市场情绪分析器
 * 基于成交量、持仓量、价格波动等数据分析市场情绪
 */
class SentimentAnalyzer {
    constructor() {
        this.sentimentHistory = [];
        this.maxHistoryLength = 20;
    }

    /**
     * 分析市场情绪
     * @param {Array} klines - K线数据
     * @param {Object} tick - 实时tick数据
     * @returns {Object} 情绪分析结果
     */
    analyzeSentiment(klines, tick) {
        if (!klines || klines.length < 20) {
            return this.getDefaultSentiment();
        }

        let sentimentScore = 50; // 基础分数 (0-100)
        const factors = [];

        // 1. 成交量分析 (25分)
        const volumeScore = this.analyzeVolume(klines);
        sentimentScore += (volumeScore - 50) * 0.5;
        factors.push({
            name: '成交量',
            score: volumeScore,
            description: this.getVolumeDescription(volumeScore)
        });

        // 2. 价格波动率分析 (25分)
        const volatilityScore = this.analyzeVolatility(klines);
        sentimentScore += (volatilityScore - 50) * 0.5;
        factors.push({
            name: '波动率',
            score: volatilityScore,
            description: this.getVolatilityDescription(volatilityScore)
        });

        // 3. 持仓量分析 (20分)
        const positionScore = this.analyzePosition(klines, tick);
        sentimentScore += (positionScore - 50) * 0.4;
        factors.push({
            name: '持仓量',
            score: positionScore,
            description: this.getPositionDescription(positionScore)
        });

        // 4. 价格动能分析 (20分)
        const momentumScore = this.analyzeMomentum(klines);
        sentimentScore += (momentumScore - 50) * 0.4;
        factors.push({
            name: '价格动能',
            score: momentumScore,
            description: this.getMomentumDescription(momentumScore)
        });

        // 5. 涨跌比分析 (10分)
        const ratioScore = this.analyzeRatio(klines);
        sentimentScore += (ratioScore - 50) * 0.2;
        factors.push({
            name: '涨跌比',
            score: ratioScore,
            description: this.getRatioDescription(ratioScore)
        });

        // 限制在0-100范围
        sentimentScore = Math.max(0, Math.min(100, sentimentScore));

        // 确定情绪等级
        const sentiment = this.getSentimentLevel(sentimentScore);

        // 保存历史
        this.sentimentHistory.push({
            timestamp: Date.now(),
            score: sentimentScore,
            level: sentiment.level
        });

        if (this.sentimentHistory.length > this.maxHistoryLength) {
            this.sentimentHistory.shift();
        }

        return {
            score: Math.round(sentimentScore),
            level: sentiment.level,
            description: sentiment.description,
            recommendation: sentiment.recommendation,
            color: sentiment.color,
            factors,
            trend: this.getSentimentTrend(),
            timestamp: Date.now()
        };
    }

    /**
     * 成交量分析
     */
    analyzeVolume(klines) {
        const recent = klines.slice(-10);
        const earlier = klines.slice(-20, -10);

        const recentAvg = recent.reduce((sum, k) => sum + k.volume, 0) / recent.length;
        const earlierAvg = earlier.reduce((sum, k) => sum + k.volume, 0) / earlier.length;

        const changePercent = ((recentAvg - earlierAvg) / earlierAvg) * 100;

        // 成交量放大 -> 市场活跃 -> 偏向贪婪
        if (changePercent > 50) return 75;
        if (changePercent > 20) return 65;
        if (changePercent > 0) return 55;
        if (changePercent > -20) return 45;
        if (changePercent > -50) return 35;
        return 25;
    }

    /**
     * 波动率分析
     */
    analyzeVolatility(klines) {
        const recent = klines.slice(-10);

        // 计算平均波动幅度
        const volatilities = recent.map(k => {
            const range = k.high - k.low;
            const avgPrice = (k.high + k.low) / 2;
            return (range / avgPrice) * 100;
        });

        const avgVolatility = volatilities.reduce((sum, v) => sum + v, 0) / volatilities.length;

        // 高波动 -> 市场恐慌或极度贪婪
        // 低波动 -> 市场平静
        if (avgVolatility > 2.0) return 80; // 极度贪婪/恐慌
        if (avgVolatility > 1.5) return 70;
        if (avgVolatility > 1.0) return 60;
        if (avgVolatility > 0.5) return 50;
        if (avgVolatility > 0.3) return 40;
        return 30; // 极度平静
    }

    /**
     * 持仓量分析
     */
    analyzePosition(klines, tick) {
        if (!tick || !tick.openInterest) {
            return 50; // 无数据，返回中性
        }

        const recent = klines.slice(-5);
        const avgPrice = recent.reduce((sum, k) => sum + k.close, 0) / recent.length;
        const currentPrice = tick.price;

        // 价格上涨 + 持仓增加 = 多头增仓 (贪婪)
        // 价格下跌 + 持仓增加 = 空头增仓 (恐慌)
        const priceChange = ((currentPrice - avgPrice) / avgPrice) * 100;

        if (priceChange > 1) return 70; // 价格上涨，偏贪婪
        if (priceChange > 0) return 60;
        if (priceChange > -1) return 40;
        return 30; // 价格下跌，偏恐慌
    }

    /**
     * 价格动能分析
     */
    analyzeMomentum(klines) {
        const recent = klines.slice(-10);

        // 计算连续涨跌
        let consecutiveUp = 0;
        let consecutiveDown = 0;

        for (let i = recent.length - 1; i >= 0; i--) {
            if (recent[i].close > recent[i].open) {
                consecutiveUp++;
                if (consecutiveDown > 0) break;
            } else if (recent[i].close < recent[i].open) {
                consecutiveDown++;
                if (consecutiveUp > 0) break;
            } else {
                break;
            }
        }

        // 连续上涨 -> 贪婪
        // 连续下跌 -> 恐慌
        if (consecutiveUp >= 5) return 80;
        if (consecutiveUp >= 3) return 70;
        if (consecutiveUp >= 2) return 60;
        if (consecutiveDown >= 5) return 20;
        if (consecutiveDown >= 3) return 30;
        if (consecutiveDown >= 2) return 40;
        return 50;
    }

    /**
     * 涨跌比分析
     */
    analyzeRatio(klines) {
        const recent = klines.slice(-20);
        const upCount = recent.filter(k => k.close > k.open).length;
        const downCount = recent.filter(k => k.close < k.open).length;

        const ratio = upCount / (upCount + downCount);

        // 涨多跌少 -> 贪婪
        if (ratio > 0.7) return 75;
        if (ratio > 0.6) return 65;
        if (ratio > 0.5) return 55;
        if (ratio > 0.4) return 45;
        if (ratio > 0.3) return 35;
        return 25;
    }

    /**
     * 确定情绪等级
     */
    getSentimentLevel(score) {
        if (score >= 80) {
            return {
                level: '极度贪婪',
                description: '市场过度乐观，可能接近顶部',
                recommendation: '谨慎追高，考虑获利了结或做空',
                color: '#ef4444'
            };
        } else if (score >= 65) {
            return {
                level: '贪婪',
                description: '市场情绪偏向乐观',
                recommendation: '注意风险，适当减仓',
                color: '#f97316'
            };
        } else if (score >= 55) {
            return {
                level: '偏向贪婪',
                description: '市场情绪略显乐观',
                recommendation: '保持谨慎，观察为主',
                color: '#fbbf24'
            };
        } else if (score >= 45) {
            return {
                level: '中性',
                description: '市场情绪平衡',
                recommendation: '等待明确信号',
                color: '#9ca3af'
            };
        } else if (score >= 35) {
            return {
                level: '偏向恐慌',
                description: '市场情绪略显悲观',
                recommendation: '关注抄底机会',
                color: '#60a5fa'
            };
        } else if (score >= 20) {
            return {
                level: '恐慌',
                description: '市场情绪偏向悲观',
                recommendation: '可考虑逐步建仓',
                color: '#34d399'
            };
        } else {
            return {
                level: '极度恐慌',
                description: '市场过度悲观，可能接近底部',
                recommendation: '优质做多机会，分批建仓',
                color: '#10b981'
            };
        }
    }

    /**
     * 获取情绪趋势
     */
    getSentimentTrend() {
        if (this.sentimentHistory.length < 3) {
            return 'insufficient_data';
        }

        const recent = this.sentimentHistory.slice(-3);
        const scores = recent.map(h => h.score);

        if (scores[2] > scores[1] && scores[1] > scores[0]) {
            return 'increasing'; // 越来越贪婪
        } else if (scores[2] < scores[1] && scores[1] < scores[0]) {
            return 'decreasing'; // 越来越恐慌
        } else {
            return 'stable'; // 稳定
        }
    }

    /**
     * 获取默认情绪
     */
    getDefaultSentiment() {
        return {
            score: 50,
            level: '中性',
            description: '数据不足，无法分析',
            recommendation: '等待更多数据',
            color: '#9ca3af',
            factors: [],
            trend: 'insufficient_data',
            timestamp: Date.now()
        };
    }

    // 描述生成方法
    getVolumeDescription(score) {
        if (score > 65) return '成交量显著放大';
        if (score > 55) return '成交量温和放大';
        if (score > 45) return '成交量平稳';
        if (score > 35) return '成交量温和萎缩';
        return '成交量显著萎缩';
    }

    getVolatilityDescription(score) {
        if (score > 70) return '波动剧烈';
        if (score > 60) return '波动较大';
        if (score > 50) return '波动正常';
        if (score > 40) return '波动较小';
        return '波动极小';
    }

    getPositionDescription(score) {
        if (score > 60) return '多头占优';
        if (score > 50) return '多头略占优';
        if (score > 40) return '空头略占优';
        return '空头占优';
    }

    getMomentumDescription(score) {
        if (score > 70) return '强劲上涨动能';
        if (score > 60) return '温和上涨动能';
        if (score > 50) return '动能中性';
        if (score > 40) return '温和下跌动能';
        return '强劲下跌动能';
    }

    getRatioDescription(score) {
        if (score > 65) return '涨多跌少';
        if (score > 55) return '涨略多于跌';
        if (score > 45) return '涨跌均衡';
        if (score > 35) return '跌略多于涨';
        return '跌多涨少';
    }
}

export default SentimentAnalyzer;
