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
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
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
