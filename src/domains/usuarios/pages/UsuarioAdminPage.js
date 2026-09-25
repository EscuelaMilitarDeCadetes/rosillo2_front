// src/domains/usuarios/pages/UsuarioAdminPage.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { TabView, TabPanel } from 'primereact/tabview';
import UsuarioAdminTable from '../components/usuarioAdmin/UsuarioAdminTable';
import UsuariosInactivosTable from '../components/usuarioAdmin/UsuariosInactivosTable';
import AdminDashboardPanel from '../components/usuarioAdmin/AdminDashboardPanel';
import MisUsuariosCreadosTable from '../components/usuarioAdmin/MisUsuariosCreadosTable';   

const UsuarioAdminPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { roles } = useSelector((state) => state.auth);                                          
  const esFacultad = (roles || []).includes('FACULTAD');                                         

  return (
    <div className="container-fluid mt-4">
      <div className="card p-3">
        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
          <TabPanel header="Dashboard">
            <AdminDashboardPanel />
          </TabPanel>
          <TabPanel header="Todos los usuarios">
            <UsuarioAdminTable />
          </TabPanel>
          <TabPanel header="Inactivos">
            <UsuariosInactivosTable />
          </TabPanel>
          {esFacultad && (                                                                        
            <TabPanel header="Mis usuarios">
              <MisUsuariosCreadosTable />
            </TabPanel>
          )}
        </TabView>
      </div>
    </div>
  );
};

export default UsuarioAdminPage;