// src/domains/formativa/pages/SegundasInstanciasPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import SegundaInstanciaTable from '../components/segundaInstancia/SegundaInstanciaTable';
import SegundaInstanciaFormModal from '../components/segundaInstancia/SegundaInstanciaFormModal';

const SegundasInstanciasPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">Segundas Instancias</h4>
        <div className="flex gap-2">
          <Button label="Nueva Segunda Instancia" icon="pi pi-plus" onClick={() => setIsModalVisible(true)} />
        </div>
      </div>
      <div className="card">
        <SegundaInstanciaTable />
      </div>
      <SegundaInstanciaFormModal visible={isModalVisible} onHide={() => setIsModalVisible(false)} />
    </div>
  );
};

export default SegundasInstanciasPage;