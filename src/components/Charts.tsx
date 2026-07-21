import ReactECharts from 'echarts-for-react';
import type { TendenciaPoint, XRPoint, HistogramData, BoxPlotData, ScatterPoint, QQPoint, DescriptiveStats, KPIData } from '../domain/entities/DashboardData';

const commonOptions = {
  backgroundColor: 'transparent',
  textStyle: { fontFamily: 'Inter, sans-serif' },
  tooltip: { trigger: 'axis' },
};

// 1. TENDENCIA
export const TendenciaChart = ({ data, stats }: { data: TendenciaPoint[], stats: DescriptiveStats }) => {
  const option = {
    ...commonOptions,
    grid: { top: 30, right: 85, bottom: 20, left: 30 },
    xAxis: { type: 'category', data: data.map(d => d.date), axisLabel: { color: '#9ca3af', fontSize: 10 } },
    yAxis: { type: 'value', min: 72, max: 84, axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { show: false } },
    series: [
      {
        name: 'Atenuación', type: 'line', data: data.map(d => d.value), itemStyle: { color: '#0284c7' }, symbol: 'circle', symbolSize: 6,
        markLine: {
          symbol: 'none',
          data: [
            { yAxis: 82, name: 'USL', label: { formatter: 'USL 82.00', color: '#ef4444', position: 'end' }, lineStyle: { color: '#ef4444', type: 'dashed' } },
            { yAxis: stats.media, name: 'Media', label: { formatter: `Media ${stats.media.toFixed(2)}`, color: '#22c55e', position: 'end' }, lineStyle: { color: '#22c55e', type: 'dashed' } },
            { yAxis: 75, name: 'LSL', label: { formatter: 'LSL 75.00', color: '#ef4444', position: 'end' }, lineStyle: { color: '#ef4444', type: 'dashed' } }
          ]
        }
      }
    ]
  };
  return <ReactECharts option={option} style={{ height: '220px', width: '100%' }} />;
};

// 2. GRÁFICA X - R
export const XRChart = ({ data, kpis }: { data: XRPoint[], kpis: KPIData }) => {
  const option = {
    ...commonOptions,
    title: {
      text: 'Carta R (Rangos)', top: '52%', left: 0, textStyle: { color: '#9ca3af', fontSize: 11, fontWeight: 'normal' }
    },
    grid: [
      { top: 20, right: 70, bottom: '60%', left: 30 },
      { top: '60%', right: 70, bottom: 20, left: 30 }
    ],
    xAxis: [
      { gridIndex: 0, type: 'category', axisLabel: { color: '#9ca3af', fontSize: 10 }, data: data.map(d => d.date) },
      { gridIndex: 1, type: 'category', axisLabel: { color: '#9ca3af', fontSize: 10 }, data: data.map(d => d.date) }
    ],
    yAxis: [
      { gridIndex: 0, type: 'value', min: 76, max: 82, axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { show: false } },
      { gridIndex: 1, type: 'value', min: 0, max: 4, axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { show: false } }
    ],
    series: [
      {
        name: 'Promedios', type: 'line', xAxisIndex: 0, yAxisIndex: 0, data: data.map(d => d.xValue), itemStyle: { color: '#0284c7' }, symbolSize: 4,
        markLine: { symbol: 'none', data: [
          { yAxis: 80.15, label: { formatter: 'UCL 80.15', color: '#ef4444' }, lineStyle: { color: '#ef4444', type: 'dashed' } },
          { yAxis: kpis.promedio, label: { formatter: `X̄ ${kpis.promedio.toFixed(2)}`, color: '#22c55e' }, lineStyle: { color: '#22c55e', type: 'dashed' } },
          { yAxis: 77.13, label: { formatter: 'LCL 77.13', color: '#ef4444' }, lineStyle: { color: '#ef4444', type: 'dashed' } }
        ]}
      },
      {
        name: 'Rangos', type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: data.map(d => d.rValue), itemStyle: { color: '#0284c7' }, symbolSize: 4,
        markLine: { symbol: 'none', data: [
          { yAxis: 3.35, label: { formatter: 'UCL 3.35', color: '#ef4444' }, lineStyle: { color: '#ef4444', type: 'dashed' } },
          { yAxis: kpis.desvEstandar, label: { formatter: `R̄ ${kpis.desvEstandar.toFixed(2)}`, color: '#22c55e' }, lineStyle: { color: '#22c55e', type: 'dashed' } },
          { yAxis: 0, label: { formatter: 'LCL 0.00', color: '#ef4444' }, lineStyle: { color: '#ef4444', type: 'dashed' } }
        ]}
      }
    ]
  };
  return <ReactECharts option={option} style={{ height: '350px', width: '100%' }} />;
};

// 3. HISTOGRAMA
export const HistogramChart = ({ data, stats }: { data: HistogramData, stats: DescriptiveStats }) => {
  const option = {
    ...commonOptions,
    grid: { top: 30, right: 70, bottom: 20, left: 30 },
    xAxis: { type: 'category', data: data.bins, axisLabel: { color: '#9ca3af', fontSize: 10 } },
    yAxis: { type: 'value', max: 30, axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { show: false } },
    series: [
      { name: 'Frecuencia', type: 'bar', data: data.frequencies, itemStyle: { color: '#3b82f6', borderColor: '#1e3a8a' } },
      { name: 'Curva Normal', type: 'line', smooth: true, data: data.curve, itemStyle: { color: '#eab308' }, symbol: 'none',
        markLine: { symbol: 'none', data: [
          { xAxis: '75', label: { formatter: 'LSL 75.00', color: '#ef4444' }, lineStyle: { color: '#ef4444', type: 'dashed' } },
          { xAxis: Math.round(stats.media).toString(), label: { formatter: `Media\n${stats.media.toFixed(2)}`, color: '#22c55e' }, lineStyle: { color: '#22c55e', type: 'dashed' } },
          { xAxis: '82', label: { formatter: 'USL 82.00', color: '#ef4444' }, lineStyle: { color: '#ef4444', type: 'dashed' } }
        ]}
      }
    ]
  };
  return <ReactECharts option={option} style={{ height: '220px', width: '100%' }} />;
};

// 6. BOX PLOT
export const BoxPlotChart = ({ data }: { data: BoxPlotData }) => {
  const option = {
    ...commonOptions,
    grid: { top: 10, right: 10, bottom: 20, left: 30 },
    xAxis: { type: 'category', data: data.labels, axisLabel: { color: '#9ca3af', fontSize: 10 } },
    yAxis: { type: 'value', min: 72, max: 84, axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { show: false } },
    series: [{
      type: 'boxplot',
      data: data.series,
      itemStyle: { color: 'rgba(59, 130, 246, 0.2)', borderColor: '#93c5fd' },
      markPoint: {
        symbol: 'circle', symbolSize: 4, itemStyle: { color: '#ef4444' },
        data: [{ name: 'Outlier', xAxis: 7, yAxis: 74.8 }] 
      }
    }]
  };
  return <ReactECharts option={option} style={{ height: '220px', width: '100%' }} />;
};

// 8. DISPERSIÓN
export const ScatterPlotChart = ({ data }: { data: ScatterPoint[] }) => {
  const option = {
    ...commonOptions,
    grid: { top: 10, right: 60, bottom: 40, left: 40 },
    xAxis: { type: 'value', min: 16, max: 25, axisLabel: { color: '#9ca3af', fontSize: 10 }, name: 'Temperatura (°C)', nameLocation: 'middle', nameGap: 25, nameTextStyle: {color: '#9ca3af', fontSize: 10}, splitLine: { show: false } },
    yAxis: { type: 'value', min: 72, max: 84, axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { show: false }, name: 'Atenuación (%)', nameLocation: 'middle', nameGap: 25, nameTextStyle: {color: '#9ca3af', fontSize: 10} },
    series: [
      { type: 'scatter', data: data.map(p => [p.x, p.y]), itemStyle: { color: '#0284c7' }, symbolSize: 4 },
      { type: 'line', data: [[17, 75.5], [24, 81]], markPoint: { symbol: 'none', label: { formatter: 'r = 0.83\nR² = 0.69', position: 'right', color: '#9ca3af', fontSize: 10 } }, itemStyle: { color: '#ef4444' } }
    ]
  };
  return <ReactECharts option={option} style={{ height: '220px', width: '100%' }} />;
};

// 9. CURVA NORMAL (Q-Q Plot)
export const QQPlotChart = ({ data }: { data: QQPoint[] }) => {
  const option = {
    ...commonOptions,
    grid: { top: 10, right: 10, bottom: 40, left: 40 },
    xAxis: { type: 'value', min: -3, max: 3, axisLabel: { color: '#9ca3af', fontSize: 10 }, name: 'Cuantiles Teóricos', nameLocation: 'middle', nameGap: 25, nameTextStyle: {color: '#9ca3af', fontSize: 10}, splitLine: { show: false } },
    yAxis: { type: 'value', min: 72, max: 84, axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { show: false }, name: 'Atenuación (%)', nameLocation: 'middle', nameGap: 25, nameTextStyle: {color: '#9ca3af', fontSize: 10} },
    series: [
      { type: 'scatter', data: data.map(p => [p.q, p.val]), itemStyle: { color: '#0284c7' }, symbolSize: 4 },
      { type: 'line', data: [[-3, 74.2], [3, 83.08]], itemStyle: { color: '#ef4444' } }
    ]
  };
  return <ReactECharts option={option} style={{ height: '220px', width: '100%' }} />;
};
