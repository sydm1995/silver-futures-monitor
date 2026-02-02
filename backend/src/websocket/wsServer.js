import { WebSocketServer } from 'ws';
import SHFEDataFetcher from '../services/shfeDataFetcher.js';
import KLineGenerator from '../services/klineGenerator.js';
import Indicators from '../services/indicators.js';
import SignalAnalyzer from '../services/signalAnalyzer.js';
import FastSignalAnalyzer from '../services/fastSignalAnalyzer.js';
import SentimentAnalyzer from '../services/sentimentAnalyzer.js';
import RiskManager from '../services/riskManager.js';

class WSServer {
    constructor(server) {
        this.wss = new WebSocketServer({ server });
        this.dataFetcher = new SHFEDataFetcher();
        this.klineGenerator = new KLineGenerator();
        this.signalAnalyzer = new SignalAnalyzer();
        this.fastSignalAnalyzer = new FastSignalAnalyzer();
        this.sentimentAnalyzer = new SentimentAnalyzer();
        this.riskManager = new RiskManager();

        this.clients = new Set();
        this.klineCache = {
            '1': [],
            '5': [],
            '15': [],
            '30': [],
            '60': []
        };

        this.currentTick = null;
        this.updateInterval = null;

        this.init();
    }

    init() {
        this.wss.on('connection', (ws) => {
            console.log('客户端已连接');
            this.clients.add(ws);

            // 发送初始数据
            this.sendInitialData(ws);

            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleMessage(ws, data);
                } catch (error) {
                    console.error('处理消息失败:', error);
                }
            });

            ws.on('close', () => {
                console.log('客户端已断开');
                this.clients.delete(ws);
            });
        });

        // 启动实时数据更新
        this.startRealTimeUpdates();
    }

    async sendInitialData(ws) {
        try {
            // 获取历史K线数据
            const historicalKlines = await this.dataFetcher.fetchHistoricalKlines('1', 500);

            if (historicalKlines && historicalKlines.length > 0) {
                this.klineCache['1'] = historicalKlines;

                // 生成其他周期K线
                const allPeriods = this.klineGenerator.generateAllPeriods(historicalKlines);
                Object.keys(allPeriods).forEach(period => {
                    this.klineCache[period] = allPeriods[period];
                });
            }

            // 获取合约信息
            const contractInfo = await this.dataFetcher.fetchContractInfo();

            // 发送初始数据
            ws.send(JSON.stringify({
                type: 'initial',
                data: {
                    klines: this.klineCache,
                    contractInfo
                }
            }));
        } catch (error) {
            console.error('发送初始数据失败:', error);
        }
    }

    startRealTimeUpdates() {
        // 每2秒更新一次实时数据
        this.updateInterval = setInterval(async () => {
            try {
                const tick = await this.dataFetcher.fetchRealTimeData();

                if (tick && tick.price > 0) {
                    this.currentTick = tick;

                    // 广播实时tick数据
                    this.broadcast({
                        type: 'tick',
                        data: tick
                    });

                    // 更新K线（每分钟更新）
                    await this.updateKlines(tick);
                }
            } catch (error) {
                console.error('实时更新失败:', error);
            }
        }, 2000);
    }

    async updateKlines(tick) {
        const now = Date.now();
        const currentMinute = Math.floor(now / 60000) * 60000;

        // 检查是否需要更新K线
        const lastKline = this.klineCache['1'][this.klineCache['1'].length - 1];

        if (!lastKline || lastKline.timestamp < currentMinute) {
            // 生成新的1分钟K线
            const newKline = this.klineGenerator.generateKlineFromTick(tick);
            this.klineCache['1'].push(newKline);

            // 限制缓存大小
            if (this.klineCache['1'].length > 1000) {
                this.klineCache['1'] = this.klineCache['1'].slice(-500);
            }

            // 更新其他周期K线
            const allPeriods = this.klineGenerator.generateAllPeriods(this.klineCache['1']);
            Object.keys(allPeriods).forEach(period => {
                this.klineCache[period] = allPeriods[period];
            });

            // 计算技术指标
            const indicators = Indicators.calculateAll(this.klineCache['5']);

            // 分析交易信号（原有）
            const signal = this.signalAnalyzer.analyzeSignal(this.klineCache['5'], indicators);

            // 快速信号分析（多时间框架）
            const fastSignal = this.fastSignalAnalyzer.analyzeMultiTimeframe(this.klineCache, this.currentTick);

            // 市场情绪分析
            const sentiment = this.sentimentAnalyzer.analyzeSentiment(this.klineCache['5'], this.currentTick);

            // 广播K线更新
            this.broadcast({
                type: 'kline_update',
                data: {
                    klines: this.klineCache,
                    indicators,
                    signal,
                    fastSignal,
                    sentiment
                }
            });
        }
    }

    handleMessage(ws, message) {
        const { type, data } = message;

        switch (type) {
            case 'calculate_risk':
                this.handleRiskCalculation(ws, data);
                break;

            case 'get_klines':
                this.handleGetKlines(ws, data);
                break;

            default:
                console.log('未知消息类型:', type);
        }
    }

    handleRiskCalculation(ws, data) {
        try {
            const {
                entryPrice,
                direction,
                equity,
                balance,
                margin,
                riskLevel
            } = data;

            // 获取当前ATR
            const indicators = Indicators.calculateAll(this.klineCache['5']);
            const atr = indicators ? indicators.atr : null;

            // 计算支撑阻力
            const supportResistance = this.riskManager.calculateSupportResistance(this.klineCache['5']);

            // 计算风险管理参数
            const riskParams = this.riskManager.calculateStopLoss({
                entryPrice: parseFloat(entryPrice),
                direction,
                equity: parseFloat(equity),
                balance: parseFloat(balance),
                margin: parseFloat(margin),
                riskLevel,
                atr,
                supportResistance
            });

            // 生成风险提示
            const warnings = this.riskManager.generateRiskWarnings(riskParams);

            ws.send(JSON.stringify({
                type: 'risk_calculation',
                data: {
                    ...riskParams,
                    warnings
                }
            }));
        } catch (error) {
            console.error('风险计算失败:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: '风险计算失败'
            }));
        }
    }

    handleGetKlines(ws, data) {
        const { period } = data;

        ws.send(JSON.stringify({
            type: 'klines',
            data: {
                period,
                klines: this.klineCache[period] || []
            }
        }));
    }

    broadcast(message) {
        const data = JSON.stringify(message);
        this.clients.forEach(client => {
            if (client.readyState === 1) { // OPEN
                client.send(data);
            }
        });
    }

    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.wss.close();
    }
}

export default WSServer;
