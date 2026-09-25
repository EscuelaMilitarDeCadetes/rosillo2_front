// src/domains/formativa/pages/ProcesosFormativosPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import ProcesoFormativoTable from '../components/procesoFormativo/ProcesoFormativoTable';
import ProcesoFormativoFormModal from '../components/procesoFormativo/ProcesoFormativoFormModal';

const ProcesosFormativosPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleNew = () => {
    setSelectedItem(null);
    setIsModalVisible(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">Procesos Formativos</h4>
        <Button label="Nuevo Proceso" icon="pi pi-plus" onClick={handleNew} />
      </div>
      <div className="card">
        <ProcesoFormativoTable onEdit={handleEdit} />
      </div>
      <ProcesoFormativoFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default ProcesosFormativosPage;