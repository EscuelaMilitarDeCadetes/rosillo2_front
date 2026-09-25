// src/domains/institucional/pages/PersonaXGrupoPage.js
import React, { useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import ConGrupoTable from '../components/personaXGrupo/ConGrupoTable';
import PersonaVinculacionesPanel from '../components/personaXGrupo/PersonaVinculacionesPanel';

const PersonaXGrupoPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="container-fluid mt-4">
      <div className="card p-3">
        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
          <TabPanel header="Con grupo (gestión)">
            <ConGrupoTable />
          </TabPanel>
          <TabPanel header="Perfil por persona (consulta)">
            <PersonaVinculacionesPanel />
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
};

export default PersonaXGrupoPage;