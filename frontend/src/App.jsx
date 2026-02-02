import { useState } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import KLineChart from './components/KLineChart';
import PricePanel from './components/PricePanel';
import SignalPanel from './components/SignalPanel';
import SentimentPanel from './components/SentimentPanel';
import RiskCalculator from './components/RiskCalculator';
import './App.css';

const WS_URL = 'ws://localhost:3000';

function App() {
  const [selectedPeriod, setSelectedPeriod] = useState('5');
  const {
    isConnected,
    tick,
    klines,
    indicators,
    signal,
    fastSignal,
    sentiment,
    contractInfo,
    calculateRisk
  } = useWebSocket(WS_URL);

  const periods = [
    { value: '1', label: '1分钟' },
    { value: '5', label: '5分钟' },
    { value: '15', label: '15分钟' },
    { value: '30', label: '30分钟' },
    { value: '60', label: '60分钟' },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>⚡ 白银期货实时监测与分析系统</h1>
            <p className="header-subtitle">上海期货交易所 (SHFE) - 白银期货 AG 主力合约</p>
          </div>
          <div className="period-selector">
            {periods.map(period => (
              <button
                key={period.value}
                className={`period-btn ${selectedPeriod === period.value ? 'active' : ''}`}
                onClick={() => setSelectedPeriod(period.value)}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="app-main container">
        <div className="main-grid">
          <div className="left-column">
            <PricePanel tick={tick} isConnected={isConnected} />
            <SignalPanel signal={signal} indicators={indicators} />
          </div>

          <div className="center-column">
            <KLineChart
              klines={klines[selectedPeriod] || []}
              period={selectedPeriod}
              indicators={indicators}
            />
            <SentimentPanel sentiment={sentiment} fastSignal={fastSignal} />
          </div>

          <div className="right-column">
            <RiskCalculator
              currentPrice={tick?.price}
              contractInfo={contractInfo}
              calculateRisk={calculateRisk}
            />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>⚠️ 风险提示：期货交易具有高风险，本系统仅供参考，不构成投资建议</p>
          <p className="footer-info">
            数据来源：新浪财经、东方财富 | 更新频率：1-3秒 |
            <span className={isConnected ? 'text-success' : 'text-danger'}>
              {isConnected ? ' ● 已连接' : ' ● 未连接'}
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
