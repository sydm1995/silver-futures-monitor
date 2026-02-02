import { useEffect, useState } from 'react';
import './PricePanel.css';

function PricePanel({ tick, contractInfo, isConnected }) {
    const [priceChange, setPriceChange] = useState(null);

    useEffect(() => {
        if (tick && tick.price > 0) {
            setPriceChange(tick.price);

            // 价格闪烁效果
            const timeout = setTimeout(() => setPriceChange(null), 500);
            return () => clearTimeout(timeout);
        }
    }, [tick]);

    if (!tick || !tick.price) {
        return (
            <div className="price-panel">
                <div className="loading-state">
                    <div className="animate-pulse">等待实时数据...</div>
                </div>
            </div>
        );
    }

    const isPositive = parseFloat(tick.changePercent) >= 0;
    const changeClass = isPositive ? 'text-long' : 'text-short';

    return (
        <div className="price-panel">
            <div className="connection-status">
                <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
                <span className="status-text">
                    {isConnected ? '实时连接' : '连接断开'}
                </span>
            </div>

            <div className="price-main">
                <div className="symbol-info">
                    <h2>{tick.name || '白银期货'}</h2>
                    <span className="symbol-code">{tick.symbol || 'AG0'}</span>
                </div>

                <div className={`current-price ${priceChange ? 'price-flash' : ''}`}>
                    <span className="price-value">{tick.price.toFixed(0)}</span>
                    <span className="price-unit">元/千克</span>
                </div>

                <div className={`price-change ${changeClass}`}>
                    <span className="change-value">
                        {isPositive ? '+' : ''}{tick.change?.toFixed(0) || '0'}
                    </span>
                    <span className="change-percent">
                        ({isPositive ? '+' : ''}{tick.changePercent || '0.00'}%)
                    </span>
                </div>
            </div>

            <div className="price-details grid grid-4">
                <div className="detail-item">
                    <span className="detail-label">开盘</span>
                    <span className="detail-value">{tick.open?.toFixed(0) || '-'}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">最高</span>
                    <span className="detail-value text-long">{tick.high?.toFixed(0) || '-'}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">最低</span>
                    <span className="detail-value text-short">{tick.low?.toFixed(0) || '-'}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">昨结</span>
                    <span className="detail-value">{tick.preSettlement?.toFixed(0) || '-'}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">买价</span>
                    <span className="detail-value">{tick.bid?.toFixed(0) || '-'}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">卖价</span>
                    <span className="detail-value">{tick.ask?.toFixed(0) || '-'}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">成交量</span>
                    <span className="detail-value">{tick.volume?.toLocaleString() || '-'}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">持仓量</span>
                    <span className="detail-value">{tick.openInterest?.toLocaleString() || '-'}</span>
                </div>
            </div>

            {contractInfo && (
                <div className="contract-info">
                    <div className="info-row">
                        <span>合约乘数: {contractInfo.multiplier}千克/手</span>
                        <span>最小变动: {contractInfo.minMove}元/千克</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PricePanel;
