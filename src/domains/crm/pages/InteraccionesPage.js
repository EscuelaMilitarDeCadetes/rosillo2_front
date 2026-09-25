// src/domains/crm/pages/InteraccionesPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import InteraccionTable from '../components/interaccion/InteraccionTable';
import InteraccionFormModal from '../components/interaccion/InteraccionFormModal';

const InteraccionesPage = () => {
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
        <h4 className="m-0">Interacciones</h4>
        <Button label="Nueva Interacción" icon="pi pi-plus" onClick={handleNew} />
      </div>
      <div className="card">
        <InteraccionTable onEdit={handleEdit} />
      </div>
      <InteraccionFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default InteraccionesPage;