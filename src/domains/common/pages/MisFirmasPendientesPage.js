// src/domains/common/pages/MisFirmasPendientesPage.js
import React from 'react';
import { useSelector } from 'react-redux';
import { TabView, TabPanel } from 'primereact/tabview';
import MisFirmasPendientesTable from '../components/documentoFirma/MisFirmasPendientesTable';
import FirmasPendientesPorUsuarioPanel from '../components/documentoFirma/FirmasPendientesPorUsuarioPanel';

const ROLES_VISIBILIDAD_AMPLIADA = ['SOPORTE', 'CINTERNO', 'FACULTAD', 'GRUPO', 'CEXTERNO'];

const MisFirmasPendientesPage = () => {
  const { roles } = useSelector((state) => state.auth);
  const puedeConsultarTerceros = roles?.some((r) => ROLES_VISIBILIDAD_AMPLIADA.includes(r));

  return (
    <div className="container-fluid mt-4">
      <div className="card">
        <TabView>
          <TabPanel header="Mis Firmas Pendientes">
            <MisFirmasPendientesTable />
          </TabPanel>
          {puedeConsultarTerceros && (
            <TabPanel header="Consultar Firmas de Otro Usuario">
              <FirmasPendientesPorUsuarioPanel />
            </TabPanel>
          )}
        </TabView>
      </div>
    </div>
  );
};

export default MisFirmasPendientesPage;