// src/domains/formal/pages/AdminConvocatoriasPage.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import ConvocatoriaTable from '../components/convocatorias/ConvocatoriaTable';
import NewConvocatoriaModal from '../components/convocatorias/NewConvocatoriaModal';
import ProjectsByConvocatoriaModal from '../components/convocatorias/ProjectsByConvocatoriaModal';

const AdminConvocatoriasPage = () => {
  const [isNewConvocatoriaModalVisible, setIsNewConvocatoriaModalVisible] = useState(false);
  const [isProjectsByConvocatoriaModalVisible, setIsProjectsByConvocatoriaModalVisible] = useState(false);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState(null);
  const { roles } = useSelector((state) => state.auth);

  const handleViewProjects = (convocatoria) => {
    setSelectedConvocatoria(convocatoria);
    setIsProjectsByConvocatoriaModalVisible(true);
  };

  return (
    <div className="container-fluid mt-4">
      {roles?.includes('ASESOR') && (
        <Button label="Nueva Convocatoria" icon="pi pi-plus" onClick={() => setIsNewConvocatoriaModalVisible(true)} />
      )}
      <div className="card">
        <ConvocatoriaTable
          onViewProjects={handleViewProjects}
        />
      </div>
      <NewConvocatoriaModal
        visible={isNewConvocatoriaModalVisible}
        onHide={() => setIsNewConvocatoriaModalVisible(false)}
      />
      <ProjectsByConvocatoriaModal
        visible={isProjectsByConvocatoriaModalVisible}
        onHide={() => setIsProjectsByConvocatoriaModalVisible(false)}
        convocatoria={selectedConvocatoria}
      />
    </div>
  );
};

export default AdminConvocatoriasPage;