// src/domains/formativa/pages/HomologacionesPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import HomologacionTable from '../components/homologacion/HomologacionTable';
import HomologacionFormModal from '../components/homologacion/HomologacionFormModal';

const HomologacionesPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">Homologaciones</h4>
        <Button label="Nueva Solicitud" icon="pi pi-plus" onClick={() => setIsModalVisible(true)} />
      </div>
      <div className="card">
        <HomologacionTable />
      </div>
      <HomologacionFormModal visible={isModalVisible} onHide={() => setIsModalVisible(false)} />
    </div>
  );
};

export default HomologacionesPage;