// src/domains/formativa/pages/ValidacionesAntiplagioPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import ValidacionAntiplagioTable from '../components/validacionAntiplagio/ValidacionAntiplagioTable';
import ValidacionAntiplagioFormModal from '../components/validacionAntiplagio/ValidacionAntiplagioFormModal';

const ValidacionesAntiplagioPage = () => {
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
        <h4 className="m-0">Validaciones de Antiplagio</h4>
        <Button label="Nueva Validación" icon="pi pi-plus" onClick={handleNew} />
      </div>
      <div className="card">
        <ValidacionAntiplagioTable onEdit={handleEdit} />
      </div>
      <ValidacionAntiplagioFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default ValidacionesAntiplagioPage;