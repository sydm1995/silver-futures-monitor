import { useState } from 'react';
import './RiskCalculator.css';

function RiskCalculator({ tick, contractInfo, calculateRisk }) {
    const [formData, setFormData] = useState({
        direction: 'LONG',
        entryPrice: '',
        equity: '',
        balance: '',
        margin: '0.08',
        riskLevel: 'moderate'
    });

    const [riskResult, setRiskResult] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCalculate = () => {
        if (!formData.entryPrice || !formData.equity || !formData.balance) {
            alert('请填写完整信息');
            return;
        }

        setIsCalculating(true);

        calculateRisk(formData, (result) => {
            setRiskResult(result);
            setIsCalculating(false);
        });
    };

    const handleUseCurrentPrice = () => {
        if (tick && tick.price) {
            setFormData(prev => ({
                ...prev,
                entryPrice: tick.price.toString()
            }));
        }
    };

    return (
        <div className="risk-calculator">
            <div className="panel-header">
                <h3>风险管理计算器</h3>
            </div>

            <div className="calculator-form">
                <div className="form-row">
                    <div className="form-group">
                        <label className="label">交易方向</label>
                        <select
                            name="direction"
                            value={formData.direction}
                            onChange={handleChange}
                            className="input"
                        >
                            <option value="LONG">做多</option>
                            <option value="SHORT">做空</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="label">入场价格</label>
                        <div className="input-with-button">
                            <input
                                type="number"
                                name="entryPrice"
                                value={formData.entryPrice}
                                onChange={handleChange}
                                placeholder="输入价格"
                                className="input"
                            />
                            <button onClick={handleUseCurrentPrice} className="btn-secondary">
                                当前价
                            </button>
                        </div>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="label">账户权益</label>
                        <input
                            type="number"
                            name="equity"
                            value={formData.equity}
                            onChange={handleChange}
                            placeholder="输入权益"
                            className="input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">可用余额</label>
                        <input
                            type="number"
                            name="balance"
                            value={formData.balance}
                            onChange={handleChange}
                            placeholder="输入余额"
                            className="input"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="label">保证金比例</label>
                        <input
                            type="number"
                            name="margin"
                            value={formData.margin}
                            onChange={handleChange}
                            step="0.01"
                            placeholder="0.08"
                            className="input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">风险偏好</label>
                        <select
                            name="riskLevel"
                            value={formData.riskLevel}
                            onChange={handleChange}
                            className="input"
                        >
                            <option value="conservative">保守</option>
                            <option value="moderate">稳健</option>
                            <option value="aggressive">激进</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleCalculate}
                    className="btn btn-primary calculate-btn"
                    disabled={isCalculating}
                >
                    {isCalculating ? '计算中...' : '计算风险参数'}
                </button>
            </div>

            {riskResult && (
                <div className="risk-results animate-fade-in">
                    <div className="result-section">
                        <h4>止损建议</h4>
                        <div className="result-grid">
                            <div className="result-item highlight">
                                <span className="result-label">推荐止损价</span>
                                <span className="result-value">{riskResult.stopLoss.recommended}</span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">固定比例止损</span>
                                <span className="result-value">
                                    {riskResult.stopLoss.fixed.price} ({riskResult.stopLoss.fixed.ratio})
                                </span>
                            </div>
                            {riskResult.stopLoss.atr && (
                                <div className="result-item">
                                    <span className="result-label">ATR动态止损</span>
                                    <span className="result-value">{riskResult.stopLoss.atr.price}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="result-section">
                        <h4>止盈建议</h4>
                        <div className="result-grid">
                            <div className="result-item highlight">
                                <span className="result-label">推荐止盈价</span>
                                <span className="result-value">{riskResult.takeProfit.recommended}</span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">保守止盈 (2:1)</span>
                                <span className="result-value">{riskResult.takeProfit.conservative.price}</span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">激进止盈 (3:1)</span>
                                <span className="result-value">{riskResult.takeProfit.aggressive.price}</span>
                            </div>
                        </div>

                        {riskResult.takeProfit.partial && (
                            <div className="partial-profit">
                                <span className="partial-label">分批止盈策略：</span>
                                {riskResult.takeProfit.partial.map((p, i) => (
                                    <div key={i} className="partial-item">
                                        <span>{p.description}</span>
                                        <span className="partial-price">{p.price}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="result-section">
                        <h4>仓位管理</h4>
                        <div className="result-grid">
                            <div className="result-item highlight">
                                <span className="result-label">建议开仓手数</span>
                                <span className="result-value text-long">{riskResult.positionSize.recommended} 手</span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">所需保证金</span>
                                <span className="result-value">¥{riskResult.positionSize.marginRequired}</span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">风险金额</span>
                                <span className="result-value text-short">¥{riskResult.positionSize.riskAmount}</span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">风险比例</span>
                                <span className="result-value">{riskResult.positionSize.riskPercentage}</span>
                            </div>
                        </div>
                    </div>

                    <div className="result-section">
                        <h4>风险回报分析</h4>
                        <div className="result-grid">
                            <div className="result-item">
                                <span className="result-label">潜在亏损</span>
                                <span className="result-value text-short">¥{riskResult.riskReward.potentialLoss}</span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">潜在盈利 (2:1)</span>
                                <span className="result-value text-long">¥{riskResult.riskReward.potentialProfit2to1}</span>
                            </div>
                            <div className="result-item">
                                <span className="result-label">潜在盈利 (3:1)</span>
                                <span className="result-value text-long">¥{riskResult.riskReward.potentialProfit3to1}</span>
                            </div>
                        </div>
                    </div>

                    {riskResult.warnings && riskResult.warnings.length > 0 && (
                        <div className="warnings-section">
                            {riskResult.warnings.map((warning, i) => (
                                <div key={i} className="warning-item">
                                    {warning}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default RiskCalculator;
