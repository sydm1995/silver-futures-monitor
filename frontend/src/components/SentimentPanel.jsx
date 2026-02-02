import { useEffect, useState } from 'react';
import './SentimentPanel.css';

function SentimentPanel({ sentiment, fastSignal }) {
    const [trendIcon, setTrendIcon] = useState('');

    useEffect(() => {
        if (sentiment?.trend === 'increasing') {
            setTrendIcon('↗️');
        } else if (sentiment?.trend === 'decreasing') {
            setTrendIcon('↘️');
        } else {
            setTrendIcon('→');
        }
    }, [sentiment]);

    if (!sentiment && !fastSignal) {
        return (
            <div className="sentiment-panel">
                <div className="panel-header">
                    <h3>市场情绪与快速信号</h3>
                </div>
                <div className="panel-content">
                    <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>
                        等待数据...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="sentiment-panel">
            {/* 快速信号部分 */}
            {fastSignal && (
                <div className="fast-signal-section">
                    <div className="section-header">
                        <h3>🚀 快速交易信号</h3>
                        <span className="signal-badge" style={{ background: fastSignal.color }}>
                            {fastSignal.level}
                        </span>
                    </div>

                    <div className="signal-score-container">
                        <div className="score-circle" style={{ borderColor: fastSignal.color }}>
                            <div className="score-value" style={{ color: fastSignal.color }}>
                                {fastSignal.score}
                            </div>
                            <div className="score-label">综合评分</div>
                        </div>

                        <div className="signal-details">
                            <div className="detail-item">
                                <span className="detail-label">建议操作:</span>
                                <span className="detail-value" style={{ color: fastSignal.color, fontWeight: '600' }}>
                                    {fastSignal.action}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">置信度:</span>
                                <span className="detail-value">{fastSignal.confidence}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">紧急度:</span>
                                <span className="detail-value">{fastSignal.urgency}</span>
                            </div>
                        </div>
                    </div>

                    {/* 关键价位 */}
                    {fastSignal.keyLevels && (
                        <div className="key-levels">
                            <div className="level-item">
                                <span>阻力位</span>
                                <span className="level-value resistance">{fastSignal.keyLevels.resistance}</span>
                            </div>
                            <div className="level-item">
                                <span>当前价</span>
                                <span className="level-value current">{fastSignal.keyLevels.current}</span>
                            </div>
                            <div className="level-item">
                                <span>支撑位</span>
                                <span className="level-value support">{fastSignal.keyLevels.support}</span>
                            </div>
                        </div>
                    )}

                    {/* 多时间框架分析 */}
                    {fastSignal.timeframes && (
                        <div className="timeframes">
                            <h4>多周期分析</h4>
                            <div className="timeframe-grid">
                                {Object.values(fastSignal.timeframes).map((tf, index) => (
                                    <div key={index} className="timeframe-item">
                                        <div className="timeframe-name">{tf.timeframe}</div>
                                        <div className="timeframe-score" style={{
                                            color: tf.score >= 60 ? '#10b981' : tf.score >= 40 ? '#fbbf24' : '#ef4444'
                                        }}>
                                            {tf.score}分
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 分析依据 */}
                    {fastSignal.reasons && fastSignal.reasons.length > 0 && (
                        <div className="signal-reasons">
                            <h4>分析依据</h4>
                            <ul>
                                {fastSignal.reasons.slice(0, 6).map((reason, index) => (
                                    <li key={index}>{reason}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* 市场情绪部分 */}
            {sentiment && (
                <div className="sentiment-section">
                    <div className="section-header">
                        <h3>📊 市场情绪指数</h3>
                        <span className="trend-indicator">{trendIcon}</span>
                    </div>

                    <div className="sentiment-meter">
                        <div className="meter-label">
                            <span>极度恐慌</span>
                            <span>极度贪婪</span>
                        </div>
                        <div className="meter-bar">
                            <div
                                className="meter-fill"
                                style={{
                                    width: `${sentiment.score}%`,
                                    background: sentiment.color
                                }}
                            />
                            <div
                                className="meter-pointer"
                                style={{ left: `${sentiment.score}%` }}
                            >
                                <div className="pointer-value">{sentiment.score}</div>
                            </div>
                        </div>
                        <div className="meter-scale">
                            <span>0</span>
                            <span>25</span>
                            <span>50</span>
                            <span>75</span>
                            <span>100</span>
                        </div>
                    </div>

                    <div className="sentiment-info">
                        <div className="sentiment-level" style={{ color: sentiment.color }}>
                            {sentiment.level}
                        </div>
                        <div className="sentiment-description">
                            {sentiment.description}
                        </div>
                        <div className="sentiment-recommendation">
                            💡 {sentiment.recommendation}
                        </div>
                    </div>

                    {/* 情绪因素 */}
                    {sentiment.factors && sentiment.factors.length > 0 && (
                        <div className="sentiment-factors">
                            <h4>情绪因素</h4>
                            <div className="factors-grid">
                                {sentiment.factors.map((factor, index) => (
                                    <div key={index} className="factor-item">
                                        <div className="factor-header">
                                            <span className="factor-name">{factor.name}</span>
                                            <span className="factor-score">{factor.score}</span>
                                        </div>
                                        <div className="factor-bar">
                                            <div
                                                className="factor-fill"
                                                style={{
                                                    width: `${factor.score}%`,
                                                    background: factor.score >= 60 ? '#10b981' : factor.score >= 40 ? '#fbbf24' : '#ef4444'
                                                }}
                                            />
                                        </div>
                                        <div className="factor-description">{factor.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SentimentPanel;
