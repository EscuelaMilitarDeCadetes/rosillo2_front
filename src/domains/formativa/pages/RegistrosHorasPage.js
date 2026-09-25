// src/domains/formativa/pages/RegistrosHorasPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import RegistroHorasTable from '../components/registroHoras/RegistroHorasTable';
import RegistroHorasFormModal from '../components/registroHoras/RegistroHorasFormModal';

const RegistrosHorasPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">Control de Horas</h4>
        <Button label="Nuevo Control" icon="pi pi-plus" onClick={() => setIsModalVisible(true)} />
      </div>
      <div className="card">
        <RegistroHorasTable />
      </div>
      <RegistroHorasFormModal visible={isModalVisible} onHide={() => setIsModalVisible(false)} />
    </div>
  );
};

export default RegistrosHorasPage;