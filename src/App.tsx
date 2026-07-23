import React, { useMemo, useState, useEffect } from 'react';
import './App.css';
import { Filter, LogOut, Upload, Sun, Moon } from 'lucide-react';
import { TendenciaChart, XChart, RChart, HistogramChart, BoxPlotChart, ScatterPlotChart, QQPlotChart } from './components/Charts';
import { useDashboardData } from './presentation/hooks/useDashboardData';
import { FirebaseDashboardRepository } from './data/repositories/FirebaseDashboardRepository';
import { Login } from './presentation/components/Login';
import { UploadData } from './presentation/components/UploadData';
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
  const [currentView, setCurrentView] = useState<'dashboard' | 'upload'>('dashboard');
  const [activeArea, setActiveArea] = useState('Productividad'); // Pilar
  const [areaPlanta, setAreaPlanta] = useState('Todas'); // Área de planta
  const [indicadorFilter, setIndicadorFilter] = useState('Tiempo de Calentamiento');
  const [indicadorCorrelacion, setIndicadorCorrelacion] = useState('Tiempo de Llenado');
  
  // Nuevos estados para filtros
  const [procesoFilter, setProcesoFilter] = useState('Todos');
  const [marcaFilter, setMarcaFilter] = useState('Todas');
  const [etapaFilter, setEtapaFilter] = useState('Todas');
  const [puestoFilter, setPuestoFilter] = useState('Todos');
  const [productoFilter, setProductoFilter] = useState('Todos');
  const [fermentadorFilter, setFermentadorFilter] = useState('Todos');

  const [theme, setTheme] = useState<'dark'|'light'>(() => {
    return (localStorage.getItem('brewman-theme') as 'dark'|'light') || 'light';
  });
  const [lslInput, setLslInput] = useState('');
  const [uslInput, setUslInput] = useState('');
  const [appliedLSL, setAppliedLSL] = useState<number | undefined>(undefined);
  const [appliedUSL, setAppliedUSL] = useState<number | undefined>(undefined);

  const [uclXInput, setUclXInput] = useState('');
  const [lclXInput, setLclXInput] = useState('');
  const [uclRInput, setUclRInput] = useState('');
  const [lclRInput, setLclRInput] = useState('');
  const [appliedUCL_X, setAppliedUCL_X] = useState<number | undefined>(undefined);
  const [appliedLCL_X, setAppliedLCL_X] = useState<number | undefined>(undefined);
  const [appliedUCL_R, setAppliedUCL_R] = useState<number | undefined>(undefined);
  const [appliedLCL_R, setAppliedLCL_R] = useState<number | undefined>(undefined);

  useEffect(() => {
    document.body.classList.toggle('light-mode', theme === 'light');
    localStorage.setItem('brewman-theme', theme);
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const repository = useMemo(() => new FirebaseDashboardRepository(), []);
  const { data, isLoading, error } = useDashboardData(repository, { 
    pilar: activeArea,
    area: areaPlanta,
    indicador: indicadorFilter,
    indicadorCorrelacion: indicadorCorrelacion,
    proceso: procesoFilter,
    marca: marcaFilter,
    etapa: etapaFilter,
    puesto: puestoFilter,
    producto: productoFilter,
    fermentador: fermentadorFilter,
    planta: 'Planta 1',
    customLSL: appliedLSL,
    customUSL: appliedUSL,
    customUCL_X: appliedUCL_X,
    customLCL_X: appliedLCL_X,
    customUCL_R: appliedUCL_R,
    customLCL_R: appliedLCL_R
  });

  // Efecto para auto-seleccionar un indicador válido si el actual no existe en las opciones dinámicas
  useEffect(() => {
    if (data?.options?.indicadores && data.options.indicadores.length > 0) {
      if (!data.options.indicadores.includes(indicadorFilter)) {
        setIndicadorFilter(data.options.indicadores[0]);
      }
      if (!data.options.indicadores.includes(indicadorCorrelacion)) {
        setIndicadorCorrelacion(data.options.indicadores[0]);
      }
    }
  }, [data?.options?.indicadores, indicadorFilter, indicadorCorrelacion]);

  // Manejador genérico para renderizar opciones
  const renderOptions = (options: string[] | undefined, includeAll = true) => {
    const list = options || [];
    return (
      <>
        {includeAll && <option value={includeAll ? "Todas" : ""}>{includeAll ? "Todas" : "Seleccionar"}</option>}
        {list.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </>
    );
  };
  const renderOptionsTodos = (options: string[] | undefined) => {
    const list = options || [];
    return (
      <>
        <option value="Todos">Todos</option>
        {list.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </>
    );
  };

  // Extraer la unidad de medida dinámicamente de los datos si existe
  const unit = data?.unit || '';

  const getCapabilityStatus = (val: number) => {
    if (val > 1.67) return { textColor: 'var(--accent-green-bright)', dotColor: '#22c55e' };
    if (val >= 1.33) return { textColor: 'var(--accent-yellow)', dotColor: '#eab308' };
    if (val >= 1.00) return { textColor: '#f97316', dotColor: '#f97316' };
    return { textColor: '#ef4444', dotColor: '#ef4444' };
  };

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

  if (currentView === 'upload') {
    return <UploadData onBack={() => setCurrentView('dashboard')} />;
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
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--accent-red)' }}>
        <h2>{error?.message || 'Error cargando los datos.'}</h2>
        <button className="filter-btn" onClick={() => setCurrentView('upload')} style={{ marginTop: '16px' }}>
          Subir datos de Excel
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="header" style={{ borderBottom: 'none', paddingBottom: 0, gap: '20px', flexDirection: 'column', alignItems: 'stretch' }}>
        <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div className="header-left">
            <img src="/BREWMAN.jpeg" alt="Brewman Logo" className="logo" style={{ height: '40px', borderRadius: '4px' }} />
            <div className="header-title">
              <h1>DASHBOARD DE ANÁLISIS ESTADÍSTICO</h1>
              <h2>Área: {activeArea} | {indicadorFilter} vs {indicadorCorrelacion}</h2>
            </div>
          </div>
          
          <div className="header-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="filter-btn" onClick={() => setCurrentView('upload')} style={{ color: 'var(--header-text)', borderColor: 'var(--header-muted)' }}>
              <Upload size={14} /> Subir Excel
            </button>
            <button className="filter-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Cambiar Tema" style={{ color: 'var(--header-text)', borderColor: 'var(--header-muted)' }}>
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />} Tema
            </button>
            <button className="filter-btn" style={{ color: 'var(--header-text)', borderColor: 'var(--header-muted)' }}>
              <Filter size={14} /> Filtros
            </button>
            <button className="filter-btn" onClick={handleLogout} style={{ color: '#ef4444', borderColor: '#ef4444' }}>
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>

        {/* Área Tabs */}
        <div className="area-tabs" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px' }}>
          {['Safety', 'Calidad', 'Ambiental', 'Gente', 'Gestion', 'Mantto', 'Productividad'].map(area => (
            <button 
              key={area} 
              onClick={() => setActiveArea(area)}
              style={{
                background: activeArea === area ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                color: activeArea === area ? '#ffffff' : 'var(--header-muted)',
                border: '1px solid ' + (activeArea === area ? 'rgba(255,255,255,0.3)' : 'transparent'),
                padding: '6px 16px',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeArea === area ? 500 : 400,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {area}
            </button>
          ))}
        </div>

        <div className="filter-bar" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end', paddingTop: '8px' }}>
          <div className="filter-group">
            <label>Área de Planta</label>
            <select value={areaPlanta} onChange={(e) => setAreaPlanta(e.target.value)}>
              {renderOptions(data?.options?.areas, true)}
            </select>
          </div>
          <div className="filter-group">
            <label>Indicador Principal</label>
            <select value={indicadorFilter} onChange={(e) => setIndicadorFilter(e.target.value)}>
              {data?.options?.indicadores?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Indicador a Comparar (Correlación)</label>
            <select value={indicadorCorrelacion} onChange={(e) => setIndicadorCorrelacion(e.target.value)}>
              {data?.options?.indicadores?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Proceso</label>
            <select value={procesoFilter} onChange={(e) => setProcesoFilter(e.target.value)}>
              {renderOptionsTodos(data?.options?.procesos)}
            </select>
          </div>
          <div className="filter-group">
            <label>Marca</label>
            <select value={marcaFilter} onChange={(e) => setMarcaFilter(e.target.value)}>
              {renderOptions(data?.options?.marcas, true)}
            </select>
          </div>
          <div className="filter-group">
            <label>Etapa</label>
            <select value={etapaFilter} onChange={(e) => setEtapaFilter(e.target.value)}>
              {renderOptions(data?.options?.etapas, true)}
            </select>
          </div>
          <div className="filter-group">
            <label>Puesto</label>
            <select value={puestoFilter} onChange={(e) => setPuestoFilter(e.target.value)}>
              {renderOptionsTodos(data?.options?.puestos)}
            </select>
          </div>
          <div className="filter-group">
            <label>Producto</label>
            <select value={productoFilter} onChange={(e) => setProductoFilter(e.target.value)}>
              {renderOptionsTodos(data?.options?.productos)}
            </select>
          </div>
          <div className="filter-group">
            <label>Fermentador</label>
            <select value={fermentadorFilter} onChange={(e) => setFermentadorFilter(e.target.value)}>
              {renderOptionsTodos(data?.options?.fermentadores)}
            </select>
          </div>
          <div className="filter-group" style={{ flexDirection: 'row', alignItems: 'flex-end', gap: '8px' }}>
            <input type="date" defaultValue="2024-05-01" />
            <input type="date" defaultValue="2024-05-31" />
          </div>
        </div>
      </header>

      {/* KPIs */}
      <div className="kpi-bar">
        <div className="kpi-item">
          <span className="kpi-label">Promedio</span>
          <span className="kpi-value">{data.kpis.promedio.toFixed(2)} <span>{unit}</span></span>
        </div>
        <div className="kpi-item">
          <span className="kpi-label">Desv. Estándar</span>
          <span className="kpi-value neutral">{data.kpis.desvEstandar.toFixed(2)} <span>{unit}</span></span>
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
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>1. TENDENCIA</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="number" value={lslInput} onChange={e => setLslInput(e.target.value)} placeholder="LSL (Min)" title="Límite Inferior (LSL)" style={{ height: '24px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', padding: '0 8px', width: '70px' }} />
                <input type="number" value={uslInput} onChange={e => setUslInput(e.target.value)} placeholder="USL (Max)" title="Límite Superior (USL)" style={{ height: '24px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', padding: '0 8px', width: '70px' }} />
                <button className="filter-btn" onClick={() => { setAppliedLSL(lslInput ? Number(lslInput) : undefined); setAppliedUSL(uslInput ? Number(uslInput) : undefined); }} style={{ color: 'var(--accent-green)', borderColor: 'var(--accent-green)', height: '24px', fontSize: '11px', padding: '0 8px', margin: 0 }}>
                  Aplicar
                </button>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px', marginTop: '4px' }}>{indicadorFilter} {unit ? `(${unit})` : ''} vs Lote</div>
            <div className="panel-content" id="tendencia-chart">
              <TendenciaChart data={data.tendencia} stats={data.stats} limits={data.limits} theme={theme} />
            </div>
          </div>

          {/* 2. GRÁFICA X - R */}
          <div className="panel">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>2. CARTA X̄ (Promedios)</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="number" value={lclXInput} onChange={e => setLclXInput(e.target.value)} placeholder="LCL" title="Límite Control Inferior (X)" style={{ height: '24px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', padding: '0 8px', width: '55px' }} />
                <input type="number" value={uclXInput} onChange={e => setUclXInput(e.target.value)} placeholder="UCL" title="Límite Control Superior (X)" style={{ height: '24px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', padding: '0 8px', width: '55px' }} />
                <button className="filter-btn" onClick={() => { setAppliedLCL_X(lclXInput ? Number(lclXInput) : undefined); setAppliedUCL_X(uclXInput ? Number(uclXInput) : undefined); }} style={{ color: 'var(--accent-green)', borderColor: 'var(--accent-green)', height: '24px', fontSize: '11px', padding: '0 8px', margin: 0, marginLeft: '4px' }}>
                  Aplicar
                </button>
              </div>
            </div>
            <div className="panel-content" id="x-chart">
              <XChart data={data.xr} kpis={data.kpis} limits={data.limits} theme={theme} />
            </div>

            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <span>CARTA R (Rangos)</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="number" value={lclRInput} onChange={e => setLclRInput(e.target.value)} placeholder="LCL" title="Límite Control Inferior (R)" style={{ height: '24px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', padding: '0 8px', width: '55px' }} />
                <input type="number" value={uclRInput} onChange={e => setUclRInput(e.target.value)} placeholder="UCL" title="Límite Control Superior (R)" style={{ height: '24px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)', padding: '0 8px', width: '55px' }} />
                <button className="filter-btn" onClick={() => { setAppliedLCL_R(lclRInput ? Number(lclRInput) : undefined); setAppliedUCL_R(uclRInput ? Number(uclRInput) : undefined); }} style={{ color: 'var(--accent-green)', borderColor: 'var(--accent-green)', height: '24px', fontSize: '11px', padding: '0 8px', margin: 0, marginLeft: '4px' }}>
                  Aplicar
                </button>
              </div>
            </div>
            <div className="panel-content" id="r-chart">
              <RChart data={data.xr} kpis={data.kpis} limits={data.limits} theme={theme} />
            </div>
          </div>

          {/* 8. DISPERSIÓN */}
          <div className="panel">
            <div className="panel-header">8. CORRELACIÓN: {indicadorFilter.toUpperCase()} vs {indicadorCorrelacion.toUpperCase()}</div>
            <div className="panel-content" id="dispersion-chart">
               <ScatterPlotChart data={data.scatter} indicadorX={indicadorFilter} indicadorY={indicadorCorrelacion} theme={theme} />
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="col">
          {/* 3. HISTOGRAMA */}
          <div className="panel">
            <div className="panel-header">3. HISTOGRAMA + CURVA NORMAL</div>
            <div className="panel-content" id="histogram-chart">
               <HistogramChart data={data.histogram} stats={data.stats} limits={data.limits} theme={theme} />
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
                    <tr><td>Cp</td><td className="text-center" style={{color: getCapabilityStatus(data.kpis.cp).textColor}}>{data.kpis.cp.toFixed(2)}</td><td className="text-center"><span className="status-dot" style={{backgroundColor: getCapabilityStatus(data.kpis.cp).dotColor}}></span></td></tr>
                    <tr><td>Cpk</td><td className="text-center" style={{color: getCapabilityStatus(data.kpis.cpk).textColor}}>{data.kpis.cpk.toFixed(2)}</td><td className="text-center"><span className="status-dot" style={{backgroundColor: getCapabilityStatus(data.kpis.cpk).dotColor}}></span></td></tr>
                    <tr><td>Pp</td><td className="text-center" style={{color: getCapabilityStatus(data.kpis.pp).textColor}}>{data.kpis.pp.toFixed(2)}</td><td className="text-center"><span className="status-dot" style={{backgroundColor: getCapabilityStatus(data.kpis.pp).dotColor}}></span></td></tr>
                    <tr><td>Ppk</td><td className="text-center" style={{color: getCapabilityStatus(data.kpis.ppk).textColor}}>{data.kpis.ppk.toFixed(2)}</td><td className="text-center"><span className="status-dot" style={{backgroundColor: getCapabilityStatus(data.kpis.ppk).dotColor}}></span></td></tr>
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
               <QQPlotChart data={data.qq} unit={unit} theme={theme} />
            </div>
          </div>
        </div>

        {/* Column 3 */}
        <div className="col">
          {/* 6. BOX PLOT */}
          <div className="panel">
            <div className="panel-header">6. BOX PLOT POR OLLA</div>
            <div className="panel-content" id="boxplot-chart">
               <BoxPlotChart data={data.boxplot} theme={theme} />
            </div>
          </div>

          {/* 7. MATRIZ DE CORRELACIONES */}
          <div className="panel">
            <div className="panel-header">7. MATRIZ DE CORRELACIONES</div>
            <div className="panel-content" style={{ overflow: 'auto', maxHeight: '350px' }}>
               <table className="corr-table" style={{ borderCollapse: 'collapse', fontSize: '11px', width: 'max-content', minWidth: '100%' }}>
                 <thead>
                   <tr>
                     <th style={{ position: 'sticky', top: 0, left: 0, zIndex: 2, background: 'var(--panel-bg)', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}></th>
                     {data.correlations?.labels?.map((label, i) => (
                       <th key={i} style={{ position: 'sticky', top: 0, background: 'var(--panel-bg)', padding: '6px 10px', textAlign: 'center', fontWeight: 500, zIndex: 1, borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                         {label}
                       </th>
                     ))}
                   </tr>
                 </thead>
                 <tbody>
                   {data.correlations?.matrix?.length > 0 ? (
                     data.correlations.matrix.map((row, i) => (
                       <tr key={i}>
                         <td style={{ position: 'sticky', left: 0, background: 'var(--panel-bg)', fontWeight: 500, color: 'var(--text-main)', borderRight: '1px solid var(--border-color)', padding: '6px 10px', zIndex: 1, whiteSpace: 'nowrap' }}>
                           {data.correlations.labels[i]}
                         </td>
                         {row.map((val, j) => (
                           <td key={j} style={{ 
                             backgroundColor: val !== null ? getColorForCorr(val) : 'var(--bg-color)', 
                             color: val !== null && Math.abs(val) > 0.5 ? '#fff' : 'var(--text-main)',
                             textAlign: 'center',
                             padding: '6px',
                             minWidth: '50px',
                             border: '1px solid rgba(128,128,128,0.1)'
                           }}>
                             {val !== null ? val.toFixed(2) : '-'}
                           </td>
                         ))}
                       </tr>
                     ))
                   ) : (
                     <tr>
                       <td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '12px' }}>
                         Sube un archivo de Excel con datos para ver la matriz de correlación.
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
               
               {/* Color Bar Legend - Solo mostrar si hay datos */}
               {data.correlations?.labels?.length > 0 && (
                 <div style={{ marginTop: '20px', padding: '0 10px' }}>
                   <div style={{ height: '6px', background: 'linear-gradient(to right, rgba(37, 99, 235, 1), #ffffff 50%, rgba(220, 38, 38, 1))', borderRadius: '3px', marginBottom: '6px' }}></div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-main)', fontWeight: 500 }}>
                     <span>-1.00</span>
                     <span>0.00</span>
                     <span>1.00</span>
                   </div>
                 </div>
               )}
            </div>
          </div>

          {/* 10. INDICADOR DE SALUD */}
          <div className="panel">
            <div className="panel-header">10. INDICADOR DE SALUD DEL PROCESO</div>
            <div className="panel-content short" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: data.kpis.cpk > 1.67 ? 'rgba(34, 197, 94, 0.2)' : data.kpis.cpk >= 1.33 ? 'rgba(234, 179, 8, 0.2)' : data.kpis.cpk >= 1.0 ? 'rgba(249, 115, 22, 0.2)' : 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: data.kpis.cpk > 1.67 ? '#22c55e' : data.kpis.cpk >= 1.33 ? '#eab308' : data.kpis.cpk >= 1.0 ? '#f97316' : '#ef4444' }}></div>
                 </div>
                 <h3 style={{ color: data.kpis.cpk > 1.67 ? 'var(--accent-green-bright)' : data.kpis.cpk >= 1.33 ? 'var(--accent-yellow)' : data.kpis.cpk >= 1.0 ? '#f97316' : '#ef4444', fontSize: '14px', margin: 0 }}>
                   {data.kpis.cpk > 1.67 ? 'PROCESO ESTABLE Y MUY CAPAZ' : data.kpis.cpk >= 1.33 ? 'PROCESO ACEPTABLE' : data.kpis.cpk >= 1.0 ? 'PROCESO EN RIESGO' : 'PROCESO INESTABLE / NO CAPAZ'}
                 </h3>
               </div>
               <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                 El proceso presenta un Cpk de <strong>{data.kpis.cpk.toFixed(2)}</strong>, lo cual indica que es {data.kpis.cpk >= 1.33 ? 'altamente capaz y estable' : data.kpis.cpk >= 1.0 ? 'aceptable pero con oportunidad de mejora' : 'inestable estadísticamente, requiere atención'}.<br/>
                 {data.kpis.fueraEsp > 0 ? `Se detecta un ${data.kpis.fueraEsp.toFixed(2)}% de valores atípicos o fuera de especificación.` : 'No se detectan valores fuera de los límites de especificación.'}
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
