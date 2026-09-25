// src/domains/formativa/pages/EtapasFlujoPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import EtapaFlujoTable from '../components/etapaFlujo/EtapaFlujoTable';
import EtapaFlujoFormModal from '../components/etapaFlujo/EtapaFlujoFormModal';

const EtapasFlujoPage = () => {
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
        <h4 className="m-0">Etapas de Flujo</h4>
        <Button label="Nueva Etapa" icon="pi pi-plus" onClick={handleNew} />
      </div>
      <div className="card">
        <EtapaFlujoTable onEdit={handleEdit} />
      </div>
      <EtapaFlujoFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default EtapasFlujoPage;