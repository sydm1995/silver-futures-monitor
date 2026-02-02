import './SignalPanel.css';

function SignalPanel({ signal, indicators }) {
    if (!signal) {
        return (
            <div className="signal-panel">
                <div className="panel-header">
                    <h3>交易信号分析</h3>
                </div>
                <div className="loading-state">
                    <div className="animate-pulse">正在分析...</div>
                </div>
            </div>
        );
    }

    const getSignalBadge = (signalType) => {
        const badges = {
            'STRONG_LONG': { class: 'badge-success', text: '强烈做多', icon: '🚀' },
            'LONG': { class: 'badge-success', text: '建议做多', icon: '📈' },
            'WEAK_LONG': { class: 'badge-warning', text: '弱多信号', icon: '⚠️' },
            'STRONG_SHORT': { class: 'badge-danger', text: '强烈做空', icon: '⚡' },
            'SHORT': { class: 'badge-danger', text: '建议做空', icon: '📉' },
            'WEAK_SHORT': { class: 'badge-warning', text: '弱空信号', icon: '⚠️' },
            'WAIT': { class: 'badge-neutral', text: '观望等待', icon: '⏸️' },
        };

        return badges[signalType] || badges['WAIT'];
    };

    const badge = getSignalBadge(signal.signal);

    return (
        <div className="signal-panel">
            <div className="panel-header">
                <h3>交易信号分析</h3>
                <span className={`badge ${badge.class}`}>
                    {badge.icon} {badge.text}
                </span>
            </div>

            <div className="signal-strength">
                <div className="strength-label">
                    <span>信号强度</span>
                    <span className="strength-value">{signal.strength}/100</span>
                </div>
                <div className="strength-bar">
                    <div
                        className={`strength-fill ${signal.direction === 'LONG' ? 'long' : signal.direction === 'SHORT' ? 'short' : 'neutral'}`}
                        style={{ width: `${signal.strength}%` }}
                    ></div>
                </div>
            </div>

            <div className="signal-scores">
                <div className="score-item long">
                    <span className="score-label">做多得分</span>
                    <span className="score-value">{signal.longScore || 0}</span>
                </div>
                <div className="score-item short">
                    <span className="score-label">做空得分</span>
                    <span className="score-value">{signal.shortScore || 0}</span>
                </div>
            </div>

            <div className="signal-reasons">
                <h4>分析依据</h4>
                <ul className="reasons-list">
                    {signal.reasons && signal.reasons.map((reason, index) => (
                        <li key={index} className="reason-item">
                            {reason}
                        </li>
                    ))}
                </ul>
            </div>

            {indicators && (
                <div className="indicators-summary">
                    <h4>技术指标</h4>
                    <div className="indicators-grid">
                        {indicators.macd && (
                            <div className="indicator-item">
                                <span className="indicator-label">MACD</span>
                                <div className="indicator-values">
                                    <span>DIF: {indicators.macd.dif?.toFixed(2)}</span>
                                    <span>DEA: {indicators.macd.dea?.toFixed(2)}</span>
                                    <span className={indicators.macd.macd >= 0 ? 'text-long' : 'text-short'}>
                                        MACD: {indicators.macd.macd?.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {indicators.rsi && (
                            <div className="indicator-item">
                                <span className="indicator-label">RSI(14)</span>
                                <div className="indicator-values">
                                    <span className={
                                        indicators.rsi < 30 ? 'text-long' :
                                            indicators.rsi > 70 ? 'text-short' :
                                                'text-muted'
                                    }>
                                        {indicators.rsi.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {indicators.kdj && (
                            <div className="indicator-item">
                                <span className="indicator-label">KDJ</span>
                                <div className="indicator-values">
                                    <span>K: {indicators.kdj.k?.toFixed(2)}</span>
                                    <span>D: {indicators.kdj.d?.toFixed(2)}</span>
                                    <span>J: {indicators.kdj.j?.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        {indicators.boll && (
                            <div className="indicator-item">
                                <span className="indicator-label">BOLL</span>
                                <div className="indicator-values">
                                    <span>上轨: {indicators.boll.upper?.toFixed(0)}</span>
                                    <span>中轨: {indicators.boll.middle?.toFixed(0)}</span>
                                    <span>下轨: {indicators.boll.lower?.toFixed(0)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SignalPanel;
