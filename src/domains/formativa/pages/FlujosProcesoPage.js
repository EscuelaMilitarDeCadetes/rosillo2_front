// src/domains/formativa/pages/FlujosProcesoPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import FlujoProcesoTable from '../components/flujoProceso/FlujoProcesoTable';
import FlujoProcesoFormModal from '../components/flujoProceso/FlujoProcesoFormModal';

const FlujosProcesoPage = () => {
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
        <h4 className="m-0">Flujos de Proceso</h4>
        <Button label="Nuevo Flujo" icon="pi pi-plus" onClick={handleNew} />
      </div>
      <div className="card">
        <FlujoProcesoTable onEdit={handleEdit} />
      </div>
      <FlujoProcesoFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default FlujosProcesoPage;