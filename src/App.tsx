import React, { useMemo, useState, useEffect } from 'react';
import './App.css';
import { Filter, LogOut } from 'lucide-react';
import { XRChart, HistogramChart, BoxPlotChart, ScatterPlotChart, QQPlotChart, TendenciaChart } from './components/Charts';
import { useDashboardData } from './presentation/hooks/useDashboardData';
import { MockDashboardRepository } from './data/repositories/MockDashboardRepository';
import { Login } from './presentation/components/Login';
import { auth } from './firebase/config';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';

const getColorForCorr = (val: number) => {
  // -1 to 0 (Red gradient)
  if (val < 0) {
    const intensity = Math.abs(val);
    return `rgba(220, 38, 38, ${intensity})`; // Red
  }
  // 0 to 1 (Blue gradient)
  if (val > 0) {
    const intensity = val;
    return `rgba(37, 99, 235, ${intensity})`; // Blue
  }
  return 'transparent';
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const repository = useMemo(() => new MockDashboardRepository(), []);
  const { data, isLoading, error } = useDashboardData(repository);

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-main)', backgroundColor: 'var(--bg-color)' }}>
        <h2>Verificando sesión...</h2>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-main)' }}>
        <h2>Cargando Dashboard...</h2>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--accent-red)' }}>
        <h2>Error cargando los datos.</h2>
      </div>
    );
  }

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <img src="/BREWMAN.jpeg" alt="Brewman" style={{ height: '40px', borderRadius: '4px' }} />
          </div>
          <div className="header-title" style={{ marginLeft: '12px' }}>
            <h1>DASHBOARD DE ANÁLISIS ESTADÍSTICO </h1>
            <h2>Indicadores</h2>
          </div>
        </div>
        <div className="header-filters">
          <div className="filter-group">
            <label>Planta</label>
            <select><option>Todas</option></select>
          </div>
          <div className="filter-group">
            <label>Marca</label>
            <select><option>Todas</option></select>
          </div>
          <div className="filter-group">
            <label>Producto</label>
            <select><option>Todas</option></select>
          </div>
          <div className="filter-group">
            <label>Fermentador</label>
            <select><option>Todos</option></select>
          </div>
          <div className="filter-group" style={{ flexDirection: 'row', alignItems: 'flex-end', gap: '8px' }}>
            <input type="date" defaultValue="2024-05-01" />
            <input type="date" defaultValue="2024-05-31" />
          </div>
          <button className="filter-btn">
            <Filter size={14} /> Filtros
          </button>
          <button className="filter-btn" onClick={handleLogout} style={{ color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}>
            <LogOut size={14} /> Salir
          </button>
        </div>
      </header>

      {/* KPIs */}
      <div className="kpi-bar">
        <div className="kpi-item">
          <span className="kpi-label">Promedio</span>
          <span className="kpi-value">{data.kpis.promedio.toFixed(2)} <span>%</span></span>
        </div>
        <div className="kpi-item">
          <span className="kpi-label">Desv. Estándar</span>
          <span className="kpi-value neutral">{data.kpis.desvEstandar.toFixed(2)} <span>%</span></span>
        </div>
        <div className="kpi-item">
          <span className="kpi-label">Cp</span>
          <span className="kpi-value">{data.kpis.cp.toFixed(2)}</span>
        </div>
        <div className="kpi-item">
          <span className="kpi-label">Cpk</span>
          <span className="kpi-value">{data.kpis.cpk.toFixed(2)}</span>
        </div>
        <div className="kpi-item">
          <span className="kpi-label">Pp</span>
          <span className="kpi-value">{data.kpis.pp.toFixed(2)}</span>
        </div>
        <div className="kpi-item">
          <span className="kpi-label">Ppk</span>
          <span className="kpi-value neutral">{data.kpis.ppk.toFixed(2)}</span>
        </div>
        <div className="kpi-item">
          <span className="kpi-label">% Fuera de Esp.</span>
          <span className="kpi-value">{data.kpis.fueraEsp.toFixed(2)}%</span>
        </div>
        <div className="kpi-item">
          <span className="kpi-label">N° de Muestras</span>
          <span className="kpi-value neutral">{data.kpis.muestras}</span>
        </div>
      </div>

      {/* Grid Content */}
      <div className="dashboard-grid">
        
        {/* Column 1 */}
        <div className="col">
           {/* 1. TENDENCIA */}
          <div className="panel">
            <div className="panel-header">1. TENDENCIA</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>Atenuación (%) vs Tiempo</div>
            <div className="panel-content" id="tendencia-chart">
              <TendenciaChart data={data.tendencia} stats={data.stats} />
            </div>
          </div>

          {/* 2. GRÁFICA X - R */}
          <div className="panel">
            <div className="panel-header" style={{ marginBottom: '4px' }}>2. GRÁFICA X̄ - R</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>Carta X̄ (Promedios)</div>
            <div className="panel-content tall" id="xr-chart">
              <XRChart data={data.xr} kpis={data.kpis} />
            </div>
          </div>

          {/* 8. DISPERSIÓN */}
          <div className="panel">
            <div className="panel-header">8. DISPERSIÓN: TEMPERATURA vs ATENUACIÓN</div>
            <div className="panel-content" id="dispersion-chart">
               <ScatterPlotChart data={data.scatter} />
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="col">
          {/* 3. HISTOGRAMA */}
          <div className="panel">
            <div className="panel-header">3. HISTOGRAMA + CURVA NORMAL</div>
            <div className="panel-content" id="histogram-chart">
               <HistogramChart data={data.histogram} stats={data.stats} />
            </div>
          </div>

          <div className="nested-grid">
            {/* 4. ESTADÍSTICA */}
            <div className="panel">
              <div className="panel-header">4. ESTADÍSTICA DESCRIPTIVA</div>
              <div className="panel-content short">
                <table>
                  <thead>
                    <tr>
                      <th>Indicador</th>
                      <th className="text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>N</td><td className="text-right">{data.stats.n}</td></tr>
                    <tr><td>Media</td><td className="text-right">{data.stats.media.toFixed(2)}</td></tr>
                    <tr><td>Mediana</td><td className="text-right">{data.stats.mediana.toFixed(2)}</td></tr>
                    <tr><td>Mínimo</td><td className="text-right">{data.stats.min.toFixed(2)}</td></tr>
                    <tr><td>Máximo</td><td className="text-right">{data.stats.max.toFixed(2)}</td></tr>
                    <tr><td>Desv. Estándar</td><td className="text-right">{data.stats.desvEstandar.toFixed(2)}</td></tr>
                    <tr><td>CV %</td><td className="text-right">{data.stats.cv.toFixed(2)}%</td></tr>
                    <tr><td>Asimetría</td><td className="text-right">{data.stats.asimetria.toFixed(2)}</td></tr>
                    <tr><td>Curtosis</td><td className="text-right">{data.stats.curtosis.toFixed(2)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. CAPACIDAD */}
            <div className="panel">
              <div className="panel-header">5. CAPACIDAD DEL PROCESO</div>
              <div className="panel-content short">
                <table>
                  <thead>
                    <tr>
                      <th>Índice</th>
                      <th className="text-center">Valor</th>
                      <th className="text-center">Evaluación</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Cp</td><td className="text-center" style={{color: 'var(--accent-green-bright)'}}>{data.kpis.cp.toFixed(2)}</td><td className="text-center"><span className="status-dot green"></span></td></tr>
                    <tr><td>Cpk</td><td className="text-center" style={{color: 'var(--accent-green-bright)'}}>{data.kpis.cpk.toFixed(2)}</td><td className="text-center"><span className="status-dot green"></span></td></tr>
                    <tr><td>Pp</td><td className="text-center" style={{color: 'var(--accent-green-bright)'}}>{data.kpis.pp.toFixed(2)}</td><td className="text-center"><span className="status-dot green"></span></td></tr>
                    <tr><td>Ppk</td><td className="text-center" style={{color: 'var(--text-main)'}}>{data.kpis.ppk.toFixed(2)}</td><td className="text-center"><span className="status-dot yellow"></span></td></tr>
                  </tbody>
                </table>
                <div style={{ fontSize: '10px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}><span className="status-dot green"></span> &gt; 1.67 Excelente</div>
                  <div style={{ display: 'flex', gap: '8px' }}><span className="status-dot yellow"></span> 1.33 - 1.67 Bueno</div>
                  <div style={{ display: 'flex', gap: '8px' }}><span className="status-dot red" style={{backgroundColor: '#f97316'}}></span> 1.00 - 1.33 Riesgo</div>
                  <div style={{ display: 'flex', gap: '8px' }}><span className="status-dot red"></span> &lt; 1.00 No capaz</div>
                </div>
              </div>
            </div>
          </div>

          {/* 9. CURVA NORMAL */}
          <div className="panel">
            <div className="panel-header">9. CURVA NORMAL DE PROBABILIDAD</div>
            <div className="panel-content" id="qq-chart">
               <QQPlotChart data={data.qq} />
            </div>
          </div>
        </div>

        {/* Column 3 */}
        <div className="col">
          {/* 6. BOX PLOT */}
          <div className="panel">
            <div className="panel-header">6. BOX PLOT POR FERMENTADOR</div>
            <div className="panel-content" id="boxplot-chart">
               <BoxPlotChart data={data.boxplot} />
            </div>
          </div>

          {/* 7. MATRIZ DE CORRELACIONES */}
          <div className="panel">
            <div className="panel-header">7. MATRIZ DE CORRELACIONES</div>
            <div className="panel-content">
               <table className="corr-table">
                 <thead>
                   <tr>
                     <th></th>
                     <th>pH</th>
                     <th>Temp. (°C)</th>
                     <th>FAN</th>
                     <th>O₂ (ppb)</th>
                     <th>Tiempo</th>
                     <th>Atenuación</th>
                     <th>Ésteres</th>
                   </tr>
                 </thead>
                 <tbody>
                   {data.correlations.map((row, i) => (
                     <tr key={i}>
                       <td style={{ textAlign: 'left', fontWeight: 500, color: 'var(--text-muted)' }}>{row.variable}</td>
                       {[row.ph, row.temp, row.fan, row.o2, row.tiempo, row.atenuacion, row.esteres].map((v, j) => (
                         <td key={j} style={{ backgroundColor: getColorForCorr(v), color: Math.abs(v) > 0.5 ? '#fff' : 'var(--text-main)' }}>
                           {v.toFixed(2)}
                         </td>
                       ))}
                     </tr>
                   ))}
                 </tbody>
               </table>
               
               {/* Color Bar Legend */}
               <div style={{ marginTop: '20px' }}>
                 <div style={{ height: '6px', background: 'linear-gradient(to right, rgba(220, 38, 38, 1), transparent 50%, rgba(37, 99, 235, 1))', borderRadius: '3px', marginBottom: '6px' }}></div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-main)', fontWeight: 500 }}>
                   <span>-1.00</span>
                   <span>0.00</span>
                   <span>1.00</span>
                 </div>
               </div>
            </div>
          </div>

          {/* 10. INDICADOR DE SALUD */}
          <div className="panel">
            <div className="panel-header">10. INDICADOR DE SALUD DEL PROCESO</div>
            <div className="panel-content short" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent-green)' }}></div>
                 </div>
                 <h3 style={{ color: 'var(--accent-green-bright)', fontSize: '14px', margin: 0 }}>PROCESO ESTABLE Y CAPAZ</h3>
               </div>
               <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                 El proceso presenta un Cpk de {data.kpis.cpk.toFixed(2)}, estable estadísticamente. Se detectan 2 valores atípicos en el fermentador F-08.<br/>
                 Existe una correlación fuerte (r=0.83) entre temperatura de fermentación y atenuación.
               </p>
               <div style={{ marginTop: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>
                 Última actualización: 31/05/2024 10:30 AM
               </div>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER DE CRÉDITOS */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 8px', opacity: 0.6 }}>
        <div className="credits-info" style={{ textAlign: 'right' }}>
          <h3>CERVECERIA ZACATECAS</h3>
          <p>Creado: Ing. en Soft. Cecilia Solis</p>
        </div>
      </div>

    </div>
  );
}

export default App;
