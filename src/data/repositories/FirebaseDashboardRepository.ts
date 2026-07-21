import { DashboardData } from '../../domain/entities/DashboardData';
import { IDashboardRepository } from '../../domain/repositories/IDashboardRepository';
import { db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export class FirebaseDashboardRepository implements IDashboardRepository {
  async getDashboardData(): Promise<DashboardData> {
    // Aquí implementaremos la lectura real desde Firestore una vez que subamos el Excel.
    // Por ahora, simularemos que intentamos leer y, si no existe, 
    // lanzamos un error para que la UI sepa que aún no hay datos en la BD.
    
    try {
      const docRef = doc(db, 'estadisticas', 'dashboard_data');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // En el futuro, mapearemos docSnap.data() hacia nuestra interfaz DashboardData
        return docSnap.data() as DashboardData;
      } else {
        throw new Error('No se encontraron datos en Firestore. Sube el archivo Excel primero.');
      }
    } catch (error) {
      console.error("Error obteniendo datos de Firebase:", error);
      throw error;
    }
  }
}
