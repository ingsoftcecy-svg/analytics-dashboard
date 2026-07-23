import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { collection, writeBatch, doc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Upload, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import './UploadData.css';

export const UploadData = ({ onBack }: { onBack: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage('Leyendo archivo Excel...');
    setError('');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const validSheets = ['Safety', 'Calidad', 'Ambiental', 'Gente', 'Gestion', 'Mantto', 'Productividad'];
      
      const medicionesRef = collection(db, 'mediciones');
      let batch = writeBatch(db);
      let count = 0;

      for (const sheetName of workbook.SheetNames) {
        if (validSheets.includes(sheetName)) {
          const worksheet = workbook.Sheets[sheetName];
          // Leer como arreglo de arreglos para encontrar los encabezados
          const rawData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: "" });
          
          let headerRowIndex = -1;
          // Buscar la fila que tenga las palabras clave ignorando mayúsculas y espacios
          for (let i = 0; i < Math.min(20, rawData.length); i++) {
            const row = rawData[i];
            if (row && Array.isArray(row)) {
              const hasHeader = row.some(cell => {
                if (typeof cell !== 'string') return false;
                const c = cell.toLowerCase().trim();
                return c === 'indicador' || c === 'area' || c === 'área' || c === 'etapa' || c === 'proceso' || c === 'consecutivo';
              });
              if (hasHeader) {
                headerRowIndex = i;
                break;
              }
            }
          }

          if (headerRowIndex === -1) {
            console.warn(`Se saltó la hoja "${sheetName}" porque no se encontró la fila de encabezados (estructura vacía o diferente).`);
            continue; // Saltamos a la siguiente hoja sin crashear
          }

          const headers = rawData[headerRowIndex];

          for (let i = headerRowIndex + 1; i < rawData.length; i++) {
            const rowArray = rawData[i];
            if (!rowArray || rowArray.length === 0 || rowArray.every((cell: any) => cell === "" || cell === null || cell === undefined)) continue;

            const rowData: any = { Pilar: sheetName };
            headers.forEach((header: any, index: number) => {
              if (header && typeof header === 'string') {
                let cleanHeader = header.trim();
                if (cleanHeader.toLowerCase() === "área" || cleanHeader.toLowerCase() === "area") cleanHeader = "Area";
                if (cleanHeader.toLowerCase() === "indicador") cleanHeader = "Indicador";
                if (cleanHeader.toLowerCase() === "proceso") cleanHeader = "Proceso";
                if (cleanHeader.toLowerCase() === "marca") cleanHeader = "Marca";
                if (cleanHeader.toLowerCase() === "etapa") cleanHeader = "Etapa";
                if (cleanHeader.toLowerCase() === "puesto") cleanHeader = "Puesto";
                if (cleanHeader.toLowerCase() === "producto") cleanHeader = "Producto";
                if (cleanHeader.toLowerCase() === "resultado") cleanHeader = "Resultado";
                if (cleanHeader.toLowerCase() === "fermentador") cleanHeader = "Fermentador";
                if (cleanHeader.toLowerCase() === "um" || cleanHeader.toLowerCase() === "unidad") cleanHeader = "UM";
                
                // Extraer el valor de la celda
                let cellValue = rowArray[index];
                if (typeof cellValue === 'string') cellValue = cellValue.trim();
                
                rowData[cleanHeader] = cellValue;
              }
            });

            // Si no tiene Área o Indicador, saltar porque probablemente es una fila vacía de formato
            if (!rowData.Area && !rowData.Indicador && !rowData.Consecutivo) continue;

            const newDocRef = doc(medicionesRef);
            batch.set(newDocRef, rowData);
            count++;
            
            if (count % 450 === 0) {
              await batch.commit();
              batch = writeBatch(db);
            }
          }
        }
      }

      if (count === 0) {
        throw new Error('No se encontraron datos en la hoja esperada (Calidad).');
      }
        

      
      if (count % 450 !== 0) {
        await batch.commit();
      }

      setMessage(`¡Éxito! ${count} registros subidos correctamente. Volviendo al dashboard...`);
      
      // Regresar al dashboard después de 2 segundos automáticamente
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al procesar el archivo');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar TODOS los registros? Esto dejará el dashboard en blanco.")) return;
    
    setLoading(true);
    setMessage('Eliminando datos...');
    setError('');

    try {
      const medicionesRef = collection(db, 'mediciones');
      const snapshot = await getDocs(medicionesRef);
      let batch = writeBatch(db);
      let count = 0;
      
      for (const document of snapshot.docs) {
        batch.delete(document.ref);
        count++;
        if (count % 450 === 0) {
          await batch.commit();
          batch = writeBatch(db);
        }
      }
      if (count % 450 !== 0) {
        await batch.commit();
      }
      setMessage(`¡Listo! Se eliminaron ${count} registros. Ya puedes subir tu nuevo Excel.`);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar datos');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2>Cargar Datos (Excel)</h2>
          <button onClick={onBack} className="back-btn">Volver al Dashboard</button>
        </div>
        
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Sube tu tabla maestra para alimentar el Dashboard Dinámico con nuevos indicadores.</p>
        
        <div className="upload-area">
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleFileUpload} 
            id="excel-upload"
            className="file-input"
            disabled={loading}
          />
          <label htmlFor="excel-upload" className="file-label">
            <Upload size={48} style={{ color: 'var(--accent-blue)', marginBottom: '16px' }} />
            <span style={{ fontSize: '16px', fontWeight: 500 }}>Haz clic para seleccionar el archivo Excel</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Soporta .xlsx con la estructura estándar</span>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <button 
            onClick={handleClearData} 
            disabled={loading}
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--accent-red)', 
              color: 'var(--accent-red)', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Trash2 size={16} /> Borrar todos los datos actuales
          </button>
        </div>

        {loading && <div className="status-message loading">{message}</div>}
        {error && <div className="status-message error"><AlertTriangle size={16}/> {error}</div>}
        {!loading && message && !error && <div className="status-message success"><CheckCircle size={16}/> {message}</div>}
      </div>
    </div>
  );
};
