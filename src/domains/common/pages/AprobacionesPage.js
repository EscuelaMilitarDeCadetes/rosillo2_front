// src/domains/common/pages/AprobacionesPage.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { TabView, TabPanel } from 'primereact/tabview';
import AprobacionesPendientesTable from '../components/aprobacion/AprobacionesPendientesTable';
import AprobacionesTable from '../components/aprobacion/AprobacionesTable';
import AprobacionesPorUsuarioPanel from '../components/aprobacion/AprobacionesPorUsuarioPanel';
import SolicitarAprobacionModal from '../components/aprobacion/SolicitarAprobacionModal';


const AprobacionesPage = () => {
  const { roles } = useSelector((state) => state.auth);
  const [modalVisible, setModalVisible] = useState(false);

  // aprobar/rechazar solo lo permite el backend a Decano y Supervisor
  const esAdministrador = roles?.some((r) => ['DECANO', 'SUPERVISOR'].includes(r));

  return (
    <div className="container-fluid mt-4">
      <div className="card">
        <TabView>
          <TabPanel header="Mis Pendientes">
            <AprobacionesPendientesTable />
          </TabPanel>
          {esAdministrador && (
            <TabPanel header="Todas las Aprobaciones">
              <AprobacionesTable onNuevaSolicitud={() => setModalVisible(true)} />
              <SolicitarAprobacionModal visible={modalVisible} onHide={() => setModalVisible(false)} />
            </TabPanel>
          )}
          {esAdministrador && (
            <TabPanel header="Turnos por Usuario">
              <AprobacionesPorUsuarioPanel />
            </TabPanel>
          )}
        </TabView>
      </div>
    </div>
  );
};

export default AprobacionesPage;