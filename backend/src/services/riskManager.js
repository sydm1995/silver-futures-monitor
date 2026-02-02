/**
 * 风险管理模块
 */
class RiskManager {
    constructor() {
        // 白银期货合约规格
        this.contractMultiplier = 15; // 15千克/手
        this.minMove = 1; // 最小变动价位：1元/千克
    }

    /**
     * 计算止损止盈
     * @param {Object} params - 参数对象
     * @param {number} params.entryPrice - 入场价格
     * @param {string} params.direction - 方向 'LONG' 或 'SHORT'
     * @param {number} params.equity - 账户权益
     * @param {number} params.balance - 可用余额
     * @param {number} params.margin - 保证金比例
     * @param {string} params.riskLevel - 风险偏好 'aggressive', 'moderate', 'conservative'
     * @param {number} params.atr - ATR值（可选）
     * @param {Object} params.supportResistance - 支撑阻力位（可选）
     */
    calculateStopLoss(params) {
        const {
            entryPrice,
            direction,
            equity,
            balance,
            margin = 0.08,
            riskLevel = 'moderate',
            atr = null,
            supportResistance = null
        } = params;

        const results = {
            entryPrice,
            direction,
            stopLoss: {},
            takeProfit: {},
            positionSize: {},
            riskReward: {}
        };

        // 1. 固定比例止损
        const stopLossRatios = {
            aggressive: 0.03,   // 3%
            moderate: 0.02,     // 2%
            conservative: 0.01  // 1%
        };

        const stopLossRatio = stopLossRatios[riskLevel] || 0.02;
        const fixedStopLoss = direction === 'LONG'
            ? entryPrice * (1 - stopLossRatio)
            : entryPrice * (1 + stopLossRatio);

        results.stopLoss.fixed = {
            price: fixedStopLoss.toFixed(0),
            distance: Math.abs(entryPrice - fixedStopLoss).toFixed(0),
            ratio: (stopLossRatio * 100).toFixed(2) + '%'
        };

        // 2. ATR动态止损
        if (atr) {
            const atrMultiplier = 2;
            const atrStopLoss = direction === 'LONG'
                ? entryPrice - (atr * atrMultiplier)
                : entryPrice + (atr * atrMultiplier);

            results.stopLoss.atr = {
                price: atrStopLoss.toFixed(0),
                distance: Math.abs(entryPrice - atrStopLoss).toFixed(0),
                multiplier: atrMultiplier
            };
        }

        // 3. 技术位止损
        if (supportResistance) {
            const { support, resistance } = supportResistance;
            const techStopLoss = direction === 'LONG'
                ? support * 0.995  // 支撑位下方0.5%
                : resistance * 1.005; // 阻力位上方0.5%

            results.stopLoss.technical = {
                price: techStopLoss.toFixed(0),
                distance: Math.abs(entryPrice - techStopLoss).toFixed(0),
                level: direction === 'LONG' ? support : resistance
            };
        }

        // 推荐止损（优先使用ATR，其次固定比例）
        const recommendedStopLoss = atr
            ? parseFloat(results.stopLoss.atr.price)
            : parseFloat(results.stopLoss.fixed.price);

        results.stopLoss.recommended = recommendedStopLoss.toFixed(0);

        // 4. 计算止盈
        const stopLossDistance = Math.abs(entryPrice - recommendedStopLoss);

        // 固定比例止盈（风险回报比2:1和3:1）
        const takeProfit2to1 = direction === 'LONG'
            ? entryPrice + stopLossDistance * 2
            : entryPrice - stopLossDistance * 2;

        const takeProfit3to1 = direction === 'LONG'
            ? entryPrice + stopLossDistance * 3
            : entryPrice - stopLossDistance * 3;

        results.takeProfit.conservative = {
            price: takeProfit2to1.toFixed(0),
            ratio: '2:1',
            distance: (stopLossDistance * 2).toFixed(0)
        };

        results.takeProfit.aggressive = {
            price: takeProfit3to1.toFixed(0),
            ratio: '3:1',
            distance: (stopLossDistance * 3).toFixed(0)
        };

        results.takeProfit.recommended = takeProfit2to1.toFixed(0);

        // 5. 分批止盈建议
        const partialTakeProfit1 = direction === 'LONG'
            ? entryPrice + stopLossDistance * 1.5
            : entryPrice - stopLossDistance * 1.5;

        const partialTakeProfit2 = direction === 'LONG'
            ? entryPrice + stopLossDistance * 2.5
            : entryPrice - stopLossDistance * 2.5;

        results.takeProfit.partial = [
            {
                price: partialTakeProfit1.toFixed(0),
                percentage: '50%',
                description: '达到1.5倍止损距离时平仓50%'
            },
            {
                price: partialTakeProfit2.toFixed(0),
                percentage: '50%',
                description: '达到2.5倍止损距离时平仓剩余50%'
            }
        ];

        // 6. 计算仓位大小
        const riskPercentages = {
            aggressive: 0.02,   // 2%
            moderate: 0.015,    // 1.5%
            conservative: 0.01  // 1%
        };

        const riskPercentage = riskPercentages[riskLevel] || 0.015;
        const riskAmount = equity * riskPercentage;

        // 单手保证金
        const marginPerContract = entryPrice * this.contractMultiplier * margin;

        // 单手风险金额
        const riskPerContract = stopLossDistance * this.contractMultiplier;

        // 建议手数（基于风险）
        const suggestedLots = Math.floor(riskAmount / riskPerContract);

        // 最大手数（基于保证金）
        const maxLots = Math.floor(balance / marginPerContract);

        // 实际建议手数（取较小值）
        const recommendedLots = Math.min(suggestedLots, maxLots);

        results.positionSize = {
            recommended: recommendedLots,
            maxByMargin: maxLots,
            maxByRisk: suggestedLots,
            marginRequired: (recommendedLots * marginPerContract).toFixed(2),
            riskAmount: riskAmount.toFixed(2),
            riskPercentage: (riskPercentage * 100).toFixed(2) + '%'
        };

        // 7. 风险回报分析
        const potentialLoss = recommendedLots * riskPerContract;
        const potentialProfit2to1 = recommendedLots * stopLossDistance * 2 * this.contractMultiplier;
        const potentialProfit3to1 = recommendedLots * stopLossDistance * 3 * this.contractMultiplier;

        results.riskReward = {
            potentialLoss: potentialLoss.toFixed(2),
            potentialProfit2to1: potentialProfit2to1.toFixed(2),
            potentialProfit3to1: potentialProfit3to1.toFixed(2),
            ratio2to1: '2:1',
            ratio3to1: '3:1'
        };

        return results;
    }

    /**
     * 计算支撑阻力位
     * @param {Array} klines - K线数组
     */
    calculateSupportResistance(klines) {
        if (!klines || klines.length < 20) return null;

        const recentKlines = klines.slice(-20);
        const highs = recentKlines.map(k => k.high);
        const lows = recentKlines.map(k => k.low);

        // 简单计算：最近20根K线的最高和最低
        const resistance = Math.max(...highs);
        const support = Math.min(...lows);

        return { support, resistance };
    }

    /**
     * 生成风险提示
     */
    generateRiskWarnings(params) {
        const warnings = [];
        const { positionSize, equity, balance } = params;

        if (positionSize.recommended === 0) {
            warnings.push('⚠️ 警告：可用余额不足，无法开仓');
        }

        const marginRatio = parseFloat(positionSize.marginRequired) / balance;
        if (marginRatio > 0.5) {
            warnings.push('⚠️ 警告：保证金占用超过50%，仓位过重');
        }

        if (positionSize.recommended < positionSize.maxByRisk) {
            warnings.push('💡 提示：可用余额限制了仓位大小');
        }

        return warnings;
    }
}

export default RiskManager;
