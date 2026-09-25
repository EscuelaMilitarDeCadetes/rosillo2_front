// src/domains/formativa/pages/ReglasFlujoPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import ReglaFlujoTable from '../components/reglaFlujo/ReglaFlujoTable';
import ReglaFlujoFormModal from '../components/reglaFlujo/ReglaFlujoFormModal';

const ReglasFlujoPage = () => {
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
        <h4 className="m-0">Reglas de Flujo</h4>
        <Button label="Nueva Regla" icon="pi pi-plus" onClick={handleNew} />
      </div>
      <div className="card">
        <ReglaFlujoTable onEdit={handleEdit} />
      </div>
      <ReglaFlujoFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default ReglasFlujoPage;