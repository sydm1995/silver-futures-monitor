import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import './KLineChart.css';

function KLineChart({ klines = [], period = '5', indicators = null }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // 初始化图表
    useEffect(() => {
        if (!chartRef.current) return;

        // 创建ECharts实例
        chartInstance.current = echarts.init(chartRef.current);

        // 响应式
        const handleResize = () => {
            chartInstance.current?.resize();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chartInstance.current?.dispose();
        };
    }, []);

    // 更新图表数据
    useEffect(() => {
        if (!chartInstance.current || !klines || klines.length === 0) return;

        // 准备数据
        const dates = klines.map(k => new Date(k.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        }));

        const candleData = klines.map(k => [k.open, k.close, k.low, k.high]);
        const volumeData = klines.map((k, index) => ({
            value: k.volume,
            itemStyle: {
                color: k.close >= k.open ? '#10b981' : '#ef4444'
            }
        }));

        // 计算均线
        const ma5 = calculateMA(klines, 5);
        const ma10 = calculateMA(klines, 10);
        const ma20 = calculateMA(klines, 20);

        // 配置图表
        const option = {
            backgroundColor: 'transparent',
            animation: true,
            legend: {
                data: ['K线', 'MA5', 'MA10', 'MA20'],
                textStyle: {
                    color: '#d1d5db'
                },
                top: 10
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                textStyle: {
                    color: '#f9fafb'
                },
                formatter: function (params) {
                    const dataIndex = params[0].dataIndex;
                    const kline = klines[dataIndex];
                    return `
            <div style="padding: 8px;">
              <div style="margin-bottom: 8px; font-weight: 600;">${params[0].axisValue}</div>
              <div style="display: grid; grid-template-columns: auto auto; gap: 8px 16px;">
                <span>开盘:</span><span style="color: #f9fafb;">${kline.open.toFixed(0)}</span>
                <span>收盘:</span><span style="color: ${kline.close >= kline.open ? '#10b981' : '#ef4444'}; font-weight: 600;">${kline.close.toFixed(0)}</span>
                <span>最高:</span><span style="color: #f9fafb;">${kline.high.toFixed(0)}</span>
                <span>最低:</span><span style="color: #f9fafb;">${kline.low.toFixed(0)}</span>
                <span>成交量:</span><span style="color: #9ca3af;">${kline.volume.toLocaleString()}</span>
              </div>
            </div>
          `;
                }
            },
            grid: [
                {
                    left: '3%',
                    right: '3%',
                    top: '15%',
                    height: '55%'
                },
                {
                    left: '3%',
                    right: '3%',
                    top: '75%',
                    height: '15%'
                }
            ],
            xAxis: [
                {
                    type: 'category',
                    data: dates,
                    scale: true,
                    boundaryGap: true,
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    axisLabel: {
                        color: '#9ca3af'
                    },
                    splitLine: {
                        show: false
                    },
                    min: 'dataMin',
                    max: 'dataMax'
                },
                {
                    type: 'category',
                    gridIndex: 1,
                    data: dates,
                    scale: true,
                    boundaryGap: true,
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    axisLabel: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    }
                }
            ],
            yAxis: [
                {
                    scale: true,
                    splitArea: {
                        show: false
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    axisLabel: {
                        color: '#9ca3af'
                    },
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                },
                {
                    scale: true,
                    gridIndex: 1,
                    splitNumber: 2,
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    axisLabel: {
                        color: '#9ca3af',
                        formatter: function (value) {
                            return (value / 1000).toFixed(0) + 'k';
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                }
            ],
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: [0, 1],
                    start: 50,
                    end: 100
                },
                {
                    show: true,
                    xAxisIndex: [0, 1],
                    type: 'slider',
                    bottom: '2%',
                    start: 50,
                    end: 100,
                    textStyle: {
                        color: '#9ca3af'
                    },
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    fillerColor: 'rgba(102, 126, 234, 0.2)',
                    handleStyle: {
                        color: '#667eea'
                    }
                }
            ],
            series: [
                {
                    name: 'K线',
                    type: 'candlestick',
                    data: candleData,
                    itemStyle: {
                        color: '#10b981',
                        color0: '#ef4444',
                        borderColor: '#10b981',
                        borderColor0: '#ef4444'
                    },
                    emphasis: {
                        itemStyle: {
                            borderWidth: 2
                        }
                    }
                },
                {
                    name: 'MA5',
                    type: 'line',
                    data: ma5,
                    smooth: true,
                    lineStyle: {
                        width: 1.5,
                        color: '#3b82f6'
                    },
                    showSymbol: false
                },
                {
                    name: 'MA10',
                    type: 'line',
                    data: ma10,
                    smooth: true,
                    lineStyle: {
                        width: 1.5,
                        color: '#8b5cf6'
                    },
                    showSymbol: false
                },
                {
                    name: 'MA20',
                    type: 'line',
                    data: ma20,
                    smooth: true,
                    lineStyle: {
                        width: 1.5,
                        color: '#f59e0b'
                    },
                    showSymbol: false
                },
                {
                    name: '成交量',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: volumeData,
                    barWidth: '60%'
                }
            ]
        };

        chartInstance.current.setOption(option);
    }, [klines]);

    // 计算移动平均线
    const calculateMA = (data, period) => {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                result.push('-');
            } else {
                const sum = data.slice(i - period + 1, i + 1).reduce((acc, k) => acc + k.close, 0);
                result.push((sum / period).toFixed(2));
            }
        }
        return result;
    };

    const periodNames = {
        '1': '1分钟',
        '5': '5分钟',
        '15': '15分钟',
        '30': '30分钟',
        '60': '60分钟',
    };

    return (
        <div className="kline-chart-container">
            <div className="chart-header">
                <h3>白银期货 K线图 - {periodNames[period] || period}</h3>
                <div className="chart-legend">
                    <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                        数据: {klines?.length || 0} 条 | 支持缩放、拖拽、十字光标
                    </span>
                </div>
            </div>

            <div
                ref={chartRef}
                className="chart-canvas"
                style={{ width: '100%', height: '600px' }}
            />

            {(!klines || klines.length === 0) && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#9ca3af',
                    textAlign: 'center'
                }}>
                    <p>正在加载K线数据...</p>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        请稍候
                    </p>
                </div>
            )}
        </div>
    );
}

export default KLineChart;
