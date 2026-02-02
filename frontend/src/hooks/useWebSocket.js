import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * WebSocket Hook
 */
export function useWebSocket(url) {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const [tick, setTick] = useState(null);
    const [klines, setKlines] = useState({});
    const [indicators, setIndicators] = useState(null);
    const [signal, setSignal] = useState(null);
    const [fastSignal, setFastSignal] = useState(null);
    const [sentiment, setSentiment] = useState(null);
    const [contractInfo, setContractInfo] = useState(null);

    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const connect = useCallback(() => {
        try {
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket 已连接');
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    setLastMessage(message);

                    switch (message.type) {
                        case 'initial':
                            setKlines(message.data.klines || {});
                            setContractInfo(message.data.contractInfo);
                            break;

                        case 'tick':
                            setTick(message.data);
                            break;

                        case 'kline_update':
                            setKlines(message.data.klines || {});
                            setIndicators(message.data.indicators);
                            setSignal(message.data.signal);
                            setFastSignal(message.data.fastSignal);
                            setSentiment(message.data.sentiment);
                            break;

                        case 'risk_calculation':
                            // 风险计算结果会通过回调处理
                            break;

                        default:
                            console.log('未知消息类型:', message.type);
                    }
                } catch (error) {
                    console.error('解析消息失败:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket 错误:', error);
            };

            ws.onclose = () => {
                console.log('WebSocket 已断开');
                setIsConnected(false);

                // 5秒后重连
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('尝试重新连接...');
                    connect();
                }, 5000);
            };
        } catch (error) {
            console.error('WebSocket 连接失败:', error);
        }
    }, [url]);

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connect]);

    const sendMessage = useCallback((message) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.error('WebSocket 未连接');
        }
    }, []);

    const calculateRisk = useCallback((params, callback) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.error('WebSocket 未连接');
            return;
        }

        // 发送风险计算请求
        wsRef.current.send(JSON.stringify({
            type: 'calculate_risk',
            data: params
        }));

        // 监听响应
        const handleMessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'risk_calculation') {
                    callback(message.data);
                    wsRef.current.removeEventListener('message', handleMessage);
                }
            } catch (error) {
                console.error('处理风险计算响应失败:', error);
            }
        };

        wsRef.current.addEventListener('message', handleMessage);
    }, []);

    return {
        isConnected,
        lastMessage,
        tick,
        klines,
        indicators,
        signal,
        fastSignal,
        sentiment,
        contractInfo,
        sendMessage,
        calculateRisk
    };
}
