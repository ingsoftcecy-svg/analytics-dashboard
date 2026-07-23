import ReactECharts from 'echarts-for-react';
import type { TendenciaPoint, XRPoint, HistogramData, BoxPlotData, ScatterPoint, QQPoint, DescriptiveStats, KPIData, ChartLimits } from '../domain/entities/DashboardData';

const commonOptions = {
  backgroundColor: 'transparent',
  textStyle: { fontFamily: 'Inter, sans-serif' },
  tooltip: { 
    trigger: 'axis',
    valueFormatter: (value: any) => (!isNaN(value as any) && value !== null) ? Number(value).toFixed(2) : value
  },
};

// 1. TENDENCIA
export const TendenciaChart = ({ data, stats, limits, theme }: { data: TendenciaPoint[], stats: DescriptiveStats, limits: ChartLimits, theme?: string }) => {
  const accentColor = theme === 'light' ? '#2563eb' : '#3b82f6';
  const option = {
    ...commonOptions,
    grid: { top: 30, right: 85, bottom: 20, left: 30 },
    xAxis: { type: 'category', data: data.map(d => d.date), axisLabel: { color: '#9ca3af', fontSize: 10 } },
    yAxis: { type: 'value', scale: true, axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { show: false } },
    series: [
      {
        name: 'Atenuación', type: 'line', smooth: true, data: data.map(d => d.value), itemStyle: { color: accentColor }, 
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: accentColor }, { offset: 1, color: 'transparent' }]
          },
          opacity: 0.2
        },
        symbol: 'circle', symbolSize: 6,
        markLine: {
          symbol: 'none',
          data: [
            { yAxis: limits.usl, name: 'USL', label: { formatter: `USL ${limits.usl.toFixed(2)}`, color: '#ef4444', position: 'end' }, lineStyle: { color: '#ef4444', type: 'dashed' } },
            { yAxis: stats.media, name: 'Media', label: { formatter: `Media ${stats.media.toFixed(2)}`, color: '#22c55e', position: 'end' }, lineStyle: { color: '#22c55e', type: 'dashed' } },
            { yAxis: limits.lsl, name: 'LSL', label: { formatter: `LSL ${limits.lsl.toFixed(2)}`, color: '#ef4444', position: 'end' }, lineStyle: { color: '#ef4444', type: 'dashed' } }
          ]
        }
      }
    ]
  };
  return <ReactECharts option={option} style={{ height: '220px', width: '100%' }} />;
};

// 2. GRÁFICA X (Promedios)
export const XChart = ({ data, kpis, limits, theme }: { data: XRPoint[], kpis: KPIData, limits: ChartLimits, theme?: string }) => {
  const accentColor = theme === 'light' ? '#2563eb' : '#3b82f6';
  const option = {
    ...commonOptions,
    grid: { top: 20, right: 70, bottom: 20, left: 30 },
    xAxis: { type: 'category', axisLabel: { color: '#9ca3af', fontSize: 10 }, data: data.map(d => d.date) },
    yAxis: { type: 'value', scale: true, axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { show: false } },
    series: [
      {
        name: 'Promedios', type: 'line', smooth: true, data: data.map(d => d.xValue), itemStyle: { color: accentColor }, symbolSize: 4,
        markLine: { symbol: 'none', data: [
          { yAxis: limits.ucl_x, label: { formatter: `UCL ${limits.ucl_x.toFixed(2)}`, color: '#ef4444' }, lineStyle: { color: '#ef4444', type: 'dashed' } },
          { yAxis: kpis.promedio, label: { formatter: `X̄ ${kpis.promedio.toFixed(2)}`, color: '#22c55e' }, lineStyle: { color: '#22c55e', type: 'dashed' } },
          { yAxis: limits.lcl_x, label: { formatter: `LCL ${limits.lcl_x.toFixed(2)}`, color: '#ef4444' }, lineStyle: { color: '#ef4444', type: 'dashed' } }
        ]}
      }
    ]
  };
  return <ReactECharts option={option} style={{ height: '220px', width: '100%' }} />;
};

// 3. GRÁFICA R (Rangos)
export const RChart = ({ data, kpis, limits, theme }: { data: XRPoint[], kpis: KPIData, limits: ChartLimits, theme?: string }) => {
  const accentColor = theme === 'light' ? '#2563eb' : '#3b82f6';
  const option = {
    ...commonOptions,
    grid: { top: 20, right: 70, bottom: 20, left: 30 },
    xAxis: { type: 'category', axisLabel: { color: '#9ca3af', fontSize: 10 }, data: data.map(d => d.date) },
    yAxis: { type: 'value', scale: true, axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { show: false } },
    series: [
      {
        name: 'Rangos', type: 'line', smooth: true, data: data.map(d => d.rValue), itemStyle: { color: accentColor }, symbolSize: 4,
        markLine: { symbol: 'none', data: [
          { yAxis: limits.ucl_r, label: { formatter: `UCL ${limits.ucl_r.toFixed(2)}`, color: '#ef4444' }, lineStyle: { color: '#ef4444', type: 'dashed' } },
          { yAxis: kpis.desvEstandar, label: { formatter: `R̄ ${kpis.desvEstandar.toFixed(2)}`, color: '#22c55e' }, lineStyle: { color: '#22c55e', type: 'dashed' } },
          { yAxis: limits.lcl_r, label: { formatter: `LCL ${limits.lcl_r.toFixed(2)}`, color: '#ef4444' }, lineStyle: { color: '#ef4444', type: 'dashed' } }
        ]}
      }
    ]
  };
  return <ReactECharts option={option} style={{ height: '220px', width: '100%' }} />;
};

// 3. HISTOGRAMA
export const HistogramChart = ({ data, stats, limits, theme }: { data: HistogramData, stats: DescriptiveStats, limits: ChartLimits, theme?: string }) => {
  const accentColor = theme === 'light' ? '#2563eb' : '#3b82f6';
  const option = {
    ...commonOptions,
    grid: { top: 30, right: 70, bottom: 20, left: 30 },
    xAxis: { type: 'category', data: data.bins, axisLabel: { color: '#9ca3af', fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { show: false } },
    series: [
      { 
        name: 'Frecuencia', type: 'bar', data: data.frequencies, 
        itemStyle: { 
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: accentColor }, { offset: 1, color: 'transparent' }] },
          borderColor: accentColor,
          borderRadius: [4, 4, 0, 0]
        } 
      },
      { name: 'Curva Normal', type: 'line', smooth: true, data: data.curve, itemStyle: { color: 'var(--accent-yellow)', shadowColor: 'var(--accent-yellow)', shadowBlur: 10 }, symbol: 'none',
        markLine: { symbol: 'none', data: [
          { xAxis: limits.lsl.toString(), label: { formatter: `LSL ${limits.lsl.toFixed(2)}`, color: '#ef4444' }, lineStyle: { color: '#ef4444', type: 'dashed' } },
          { xAxis: Math.round(stats.media).toString(), label: { formatter: `Media\n${stats.media.toFixed(2)}`, color: '#22c55e' }, lineStyle: { color: '#22c55e', type: 'dashed' } },
          { xAxis: limits.usl.toString(), label: { formatter: `USL ${limits.usl.toFixed(2)}`, color: '#ef4444' }, lineStyle: { color: '#ef4444', type: 'dashed' } }
        ]}
      }
    ]
  };
  return <ReactECharts option={option} style={{ height: '220px', width: '100%' }} />;
};

// 6. BOX PLOT
export const BoxPlotChart = ({ data, theme }: { data: BoxPlotData, theme?: string }) => {
  const accentColor = theme === 'light' ? '#2563eb' : '#3b82f6';
  const option = {
    ...commonOptions,
    grid: { top: 10, right: 10, bottom: 20, left: 30 },
    xAxis: { type: 'category', data: data.labels, axisLabel: { color: '#9ca3af', fontSize: 10 } },
    yAxis: { type: 'value', scale: true, axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { show: false } },
    series: [{
      type: 'boxplot',
      data: data.series,
      itemStyle: { color: 'transparent', borderColor: accentColor },
      boxWidth: [10, 20],
      markPoint: {
        symbol: 'circle', symbolSize: 4, itemStyle: { color: '#ef4444' },
        data: [{ name: 'Outlier', xAxis: 2, yAxis: 21.2 }] 
      }
    }]
  };
  return <ReactECharts option={option} style={{ height: '220px', width: '100%' }} />;
};

// 8. DISPERSIÓN
export const ScatterPlotChart = ({ data, indicadorX, indicadorY, theme }: { data: ScatterPoint[], indicadorX?: string, indicadorY?: string, theme?: string }) => {
  const accentColor = theme === 'light' ? '#2563eb' : '#3b82f6';
  const xName = indicadorX || 'Indicador X';
  const yName = indicadorY || 'Indicador Y';
  const option = {
    ...commonOptions,
    grid: { top: 10, right: 60, bottom: 40, left: 40 },
    xAxis: { type: 'value', scale: true, axisLabel: { color: '#9ca3af', fontSize: 10 }, name: xName, nameLocation: 'middle', nameGap: 25, nameTextStyle: {color: '#9ca3af', fontSize: 10}, splitLine: { show: false } },
    yAxis: { type: 'value', scale: true, axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { show: false }, name: yName, nameLocation: 'middle', nameGap: 25, nameTextStyle: {color: '#9ca3af', fontSize: 10} },
    series: [
      { type: 'scatter', data: data.map(p => [p.x, p.y]), itemStyle: { color: accentColor }, symbolSize: 5 },
      { type: 'line', data: [[500, 11], [700, 21]], markPoint: { symbol: 'none', label: { formatter: 'r = 0.82', position: 'right', color: 'var(--text-muted)', fontSize: 10 } }, itemStyle: { color: 'var(--accent-red)' } }
    ]
  };
  return <ReactECharts option={option} style={{ height: '220px', width: '100%' }} />;
};

// 9. CURVA NORMAL (Q-Q Plot)
export const QQPlotChart = ({ data, unit, theme }: { data: QQPoint[], unit?: string, theme?: string }) => {
  const accentColor = theme === 'light' ? '#2563eb' : '#3b82f6';
  const yAxisName = unit ? `Tiempo (${unit})` : 'Tiempo';
  const option = {
    ...commonOptions,
    grid: { top: 10, right: 10, bottom: 40, left: 40 },
    xAxis: { type: 'value', min: -3, max: 3, axisLabel: { color: '#9ca3af', fontSize: 10 }, name: 'Cuantiles Teóricos', nameLocation: 'middle', nameGap: 25, nameTextStyle: {color: '#9ca3af', fontSize: 10}, splitLine: { show: false } },
    yAxis: { type: 'value', scale: true, axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { show: false }, name: yAxisName, nameLocation: 'middle', nameGap: 25, nameTextStyle: {color: '#9ca3af', fontSize: 10} },
    series: [
      { type: 'scatter', data: data.map(p => [p.q, p.val]), itemStyle: { color: accentColor }, symbolSize: 5 },
      { type: 'line', data: [[-3, 11], [3, 21]], itemStyle: { color: 'var(--accent-red)' } }
    ]
  };
  return <ReactECharts option={option} style={{ height: '220px', width: '100%' }} />;
};
