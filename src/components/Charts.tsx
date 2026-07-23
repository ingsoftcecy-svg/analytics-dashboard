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
      { 
        name: 'Curva Normal', 
        type: 'line', 
        smooth: true, 
        data: data.curve, 
        color: '#facc15', // Usar HEX directamente porque Canvas no siempre lee var()
        lineStyle: { color: '#facc15', shadowColor: '#facc15', shadowBlur: 10, width: 2 }, 
        itemStyle: { color: '#facc15' },
        symbol: 'none',
        markLine: { symbol: 'none', data: (() => {
          // Calculate fractional index for the category axis
          const minBin = data.bins.length > 0 ? parseFloat(data.bins[0]) : 0;
          const step = data.bins.length > 1 ? parseFloat(data.bins[1]) - minBin : 1;
          const getIndex = (v: number) => step > 0 ? (v - minBin) / step : 0;

          return [
            { xAxis: getIndex(limits.lsl), label: { formatter: `LSL ${limits.lsl.toFixed(2)}`, color: '#ef4444' }, lineStyle: { color: '#ef4444', type: 'dashed' } },
            { xAxis: getIndex(stats.media), label: { formatter: `Media\n${stats.media.toFixed(2)}`, color: '#22c55e' }, lineStyle: { color: '#22c55e', type: 'dashed' } },
            { xAxis: getIndex(limits.usl), label: { formatter: `USL ${limits.usl.toFixed(2)}`, color: '#ef4444' }, lineStyle: { color: '#ef4444', type: 'dashed' } }
          ];
        })() }
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
    tooltip: {
      trigger: 'item',
      backgroundColor: 'var(--panel-bg)',
      borderColor: 'var(--border-color)',
      textStyle: { color: 'var(--text-main)' },
      formatter: function (params: any) {
        if (params.seriesType === 'boxplot') {
          // Si echarts prepends index, los valores están desplazados por 1.
          // Revisamos si el primer elemento coincide con el índice de params.dataIndex
          const d = params.data;
          let min, q1, median, q3, max, mean, count;
          if (d.length > 6 && d[0] === params.dataIndex) {
            [, min, q1, median, q3, max, mean, count] = d;
          } else {
            [min, q1, median, q3, max, mean, count] = d;
          }
          
          return `
            <div style="font-family: Inter, sans-serif; min-width: 160px;">
              <div style="font-weight: 600; font-size: 13px; margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">
                ${params.name}
              </div>
              <div style="font-size: 11px; margin-bottom: 8px; color: var(--text-muted);">
                Muestras: <strong>${count ?? '-'}</strong>
              </div>
              <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
                <tr><td style="padding: 2px 0;">Máx:</td><td style="text-align: right; font-weight: 500;">${max?.toFixed(2) ?? '-'}</td></tr>
                <tr><td style="padding: 2px 0;">Q3 (75%):</td><td style="text-align: right; font-weight: 500;">${q3?.toFixed(2) ?? '-'}</td></tr>
                <tr><td style="padding: 2px 0; color: #ef4444;">Mediana:</td><td style="text-align: right; font-weight: 600; color: #ef4444;">${median?.toFixed(2) ?? '-'}</td></tr>
                <tr><td style="padding: 2px 0; color: #3b82f6;">Promedio:</td><td style="text-align: right; font-weight: 600; color: #3b82f6;">${mean?.toFixed(2) ?? '-'}</td></tr>
                <tr><td style="padding: 2px 0;">Q1 (25%):</td><td style="text-align: right; font-weight: 500;">${q1?.toFixed(2) ?? '-'}</td></tr>
                <tr><td style="padding: 2px 0;">Mín:</td><td style="text-align: right; font-weight: 500;">${min?.toFixed(2) ?? '-'}</td></tr>
              </table>
            </div>
          `;
        }
        return '';
      }
    },
    series: [{
      type: 'boxplot',
      data: data.series,
      itemStyle: { 
        color: 'transparent', // Make the box body transparent
        borderColor: accentColor,
        borderWidth: 2
      },
      boxWidth: [15, 25],
    }]
  };
  return <ReactECharts option={option} style={{ height: '220px', width: '100%' }} />;
};

// 8. DISPERSIÓN
export const ScatterPlotChart = ({ data, indicadorX, indicadorY, theme }: { data: ScatterPoint[], indicadorX?: string, indicadorY?: string, theme?: string }) => {
  const accentColor = theme === 'light' ? '#2563eb' : '#3b82f6';
  const xName = indicadorX || 'Indicador X';
  const yName = indicadorY || 'Indicador Y';
  
  let r = 0;
  let trendlineData: number[][] = [];
  
  if (data.length > 1) {
    const meanX = data.reduce((sum, p) => sum + p.x, 0) / data.length;
    const meanY = data.reduce((sum, p) => sum + p.y, 0) / data.length;
    let num = 0;
    let denX = 0;
    let denY = 0;
    data.forEach(p => {
      const dx = p.x - meanX;
      const dy = p.y - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    });
    if (denX > 0 && denY > 0) {
      r = num / Math.sqrt(denX * denY);
      const m = num / denX;
      const b = meanY - m * meanX;
      
      const minX = Math.min(...data.map(p => p.x));
      const maxX = Math.max(...data.map(p => p.x));
      trendlineData = [
        [minX, m * minX + b],
        [maxX, m * maxX + b]
      ];
    }
  }

  const option = {
    ...commonOptions,
    grid: { top: 10, right: 60, bottom: 40, left: 40 },
    xAxis: { type: 'value', scale: true, axisLabel: { color: '#9ca3af', fontSize: 10 }, name: xName, nameLocation: 'middle', nameGap: 25, nameTextStyle: {color: '#9ca3af', fontSize: 10}, splitLine: { show: false } },
    yAxis: { type: 'value', scale: true, axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { show: false }, name: yName, nameLocation: 'middle', nameGap: 25, nameTextStyle: {color: '#9ca3af', fontSize: 10} },
    series: [
      { type: 'scatter', data: data.map(p => [p.x, p.y]), itemStyle: { color: accentColor }, symbolSize: 5 },
      ...(trendlineData.length > 0 ? [{ 
        type: 'line', 
        data: trendlineData, 
        endLabel: { show: true, formatter: `r = ${r.toFixed(2)}`, color: 'var(--text-main)', fontSize: 10 }, 
        itemStyle: { color: 'var(--accent-red)' },
        lineStyle: { type: 'dashed' },
        symbol: 'none'
      }] : [])
    ]
  };
  return <ReactECharts option={option} style={{ height: '220px', width: '100%' }} />;
};

// 9. CURVA NORMAL (Q-Q Plot)
export const QQPlotChart = ({ data, unit, theme }: { data: QQPoint[], unit?: string, theme?: string }) => {
  const accentColor = theme === 'light' ? '#2563eb' : '#3b82f6';
  const yAxisName = unit ? `Tiempo (${unit})` : 'Tiempo';
  
  let refLine: number[][] = [];
  if (data.length > 1) {
    const mean = data.reduce((sum, p) => sum + p.val, 0) / data.length;
    const variance = data.reduce((sum, p) => sum + Math.pow(p.val - mean, 2), 0) / (data.length - 1);
    const std = Math.sqrt(variance);
    
    // Theoretical line: y = mean + std * Z
    // Z typically ranges from -3 to 3 for standard normal quantiles
    refLine = [
      [-3, mean - 3 * std],
      [3, mean + 3 * std]
    ];
  }

  const option = {
    ...commonOptions,
    grid: { top: 10, right: 10, bottom: 40, left: 40 },
    xAxis: { type: 'value', min: -3, max: 3, axisLabel: { color: '#9ca3af', fontSize: 10 }, name: 'Cuantiles Teóricos', nameLocation: 'middle', nameGap: 25, nameTextStyle: {color: '#9ca3af', fontSize: 10}, splitLine: { show: false } },
    yAxis: { type: 'value', scale: true, axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { show: false }, name: yAxisName, nameLocation: 'middle', nameGap: 25, nameTextStyle: {color: '#9ca3af', fontSize: 10} },
    series: [
      { type: 'scatter', data: data.map(p => [p.q, p.val]), itemStyle: { color: accentColor }, symbolSize: 5 },
      ...(refLine.length > 0 ? [{ 
        type: 'line', 
        data: refLine, 
        itemStyle: { color: 'var(--accent-red)' },
        lineStyle: { type: 'dashed', width: 2 },
        symbol: 'none'
      }] : [])
    ]
  };
  return <ReactECharts option={option} style={{ height: '220px', width: '100%' }} />;
};
