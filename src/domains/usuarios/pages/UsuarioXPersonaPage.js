// src/domains/usuarios/pages/UsuarioXPersonaPage.js
import React, { useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import UsuarioXPersonaTable from '../components/usuarioXPersona/UsuarioXPersonaTable';
import RotacionesTable from '../components/usuarioXPersona/RotacionesTable';

const UsuarioXPersonaPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="container-fluid mt-4">
      <div className="card p-3">
        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
          <TabPanel header="Asignaciones activas">
            <UsuarioXPersonaTable />
          </TabPanel>
          <TabPanel header="Rotaciones (reporte)">
            <RotacionesTable />
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
};

export default UsuarioXPersonaPage;