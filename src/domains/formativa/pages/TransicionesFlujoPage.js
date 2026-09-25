// src/domains/formativa/pages/TransicionesFlujoPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import TransicionFlujoTable from '../components/transicionFlujo/TransicionFlujoTable';
import TransicionFlujoFormModal from '../components/transicionFlujo/TransicionFlujoFormModal';

const TransicionesFlujoPage = () => {
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
        <h4 className="m-0">Transiciones de Flujo</h4>
        <Button label="Nueva Transición" icon="pi pi-plus" onClick={handleNew} />
      </div>
      <div className="card">
        <TransicionFlujoTable onEdit={handleEdit} />
      </div>
      <TransicionFlujoFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default TransicionesFlujoPage;