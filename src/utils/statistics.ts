export function calculateMean(data: number[]): number {
  if (data.length === 0) return 0;
  return data.reduce((sum, val) => sum + val, 0) / data.length;
}

export function calculateStdDev(data: number[], mean?: number): number {
  if (data.length < 2) return 0;
  const m = mean ?? calculateMean(data);
  const variance = data.reduce((acc, val) => acc + Math.pow(val - m, 2), 0) / (data.length - 1);
  return Math.sqrt(variance);
}

export function calculateMedian(data: number[]): number {
  if (data.length === 0) return 0;
  return calculatePercentile(data, 0.5);
}

export function calculateSkewness(data: number[], mean?: number, std?: number): number {
  if (data.length < 3) return 0;
  const m = mean ?? calculateMean(data);
  const s = std ?? calculateStdDev(data, m);
  if (s === 0) return 0;
  
  let sum3 = 0;
  for (const val of data) {
    sum3 += Math.pow((val - m) / s, 3);
  }
  const n = data.length;
  // Sample skewness formula (same as Excel)
  return (n / ((n - 1) * (n - 2))) * sum3;
}

export function calculateKurtosis(data: number[], mean?: number, std?: number): number {
  if (data.length < 4) return 0;
  const m = mean ?? calculateMean(data);
  const s = std ?? calculateStdDev(data, m);
  if (s === 0) return 0;
  
  let sum4 = 0;
  for (const val of data) {
    sum4 += Math.pow((val - m) / s, 4);
  }
  const n = data.length;
  // Sample excess kurtosis formula (same as Excel)
  const coeff1 = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3));
  const coeff2 = (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
  return coeff1 * sum4 - coeff2;
}

export function calculatePercentile(data: number[], p: number): number {
  if (data.length === 0) return 0;
  const sorted = [...data].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * p;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
}

export function calculateCpCpk(data: number[], lsl: number, usl: number, mean?: number, std?: number) {
  const m = mean ?? calculateMean(data);
  const s = std ?? calculateStdDev(data, m);
  if (s === 0) return { cp: 0, cpk: 0, pp: 0, ppk: 0 };

  const cp = (usl - lsl) / (6 * s);
  const cpl = (m - lsl) / (3 * s);
  const cpu = (usl - m) / (3 * s);
  const cpk = Math.min(cpl, cpu);

  // In this simple model, Pp/Ppk are treated similarly to Cp/Cpk 
  // (usually Pp uses population stdev, Cp uses sample stdev or R-bar/d2)
  return { cp, cpk, pp: cp, ppk: cpk };
}

export function generateHistogram(data: number[], min: number, max: number, binsCount = 10) {
  if (data.length === 0) return { bins: [], frequencies: [], curve: [] };
  
  const step = (max - min) / binsCount || 1;
  const bins: string[] = [];
  const frequencies: number[] = new Array(binsCount).fill(0);
  
  for (let i = 0; i < binsCount; i++) {
    bins.push((min + (i * step)).toFixed(2));
  }
  
  data.forEach(val => {
    let binIndex = Math.floor((val - min) / step);
    if (binIndex >= binsCount) binIndex = binsCount - 1;
    if (binIndex < 0) binIndex = 0;
    frequencies[binIndex]++;
  });

  const mean = calculateMean(data);
  const std = calculateStdDev(data, mean);
  const maxFreq = Math.max(...frequencies, 1);
  
  const curve = bins.map(b => {
    const x = parseFloat(b);
    if (std === 0) return 0;
    const z = (x - mean) / std;
    const pdf = Math.exp(-0.5 * z * z) / (std * Math.sqrt(2 * Math.PI));
    return pdf * data.length * step; // Factor de escalado real para curva normal sobre histograma
  });

  return { bins, frequencies, curve };
}
