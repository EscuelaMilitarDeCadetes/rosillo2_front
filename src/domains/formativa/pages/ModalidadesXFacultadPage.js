// src/domains/formativa/pages/ModalidadesXFacultadPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import ModalidadXFacultadTable from '../components/modalidadXFacultad/ModalidadXFacultadTable';
import ModalidadXFacultadFormModal from '../components/modalidadXFacultad/ModalidadXFacultadFormModal';

const ModalidadesXFacultadPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">Modalidades por Facultad</h4>
        <Button label="Habilitar Modalidad" icon="pi pi-plus" onClick={() => setIsModalVisible(true)} />
      </div>
      <div className="card">
        <ModalidadXFacultadTable />
      </div>
      <ModalidadXFacultadFormModal visible={isModalVisible} onHide={() => setIsModalVisible(false)} />
    </div>
  );
};

export default ModalidadesXFacultadPage;