// src/domains/crm/pages/EntidadesExternasPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import EntidadExternaTable from '../components/entidadExterna/EntidadExternaTable';
import EntidadExternaFormModal from '../components/entidadExterna/EntidadExternaFormModal';

const EntidadesExternasPage = () => {
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
        <h4 className="m-0">Entidades Externas</h4>
        <Button label="Nueva Entidad Externa" icon="pi pi-plus" onClick={handleNew} />
      </div>
      <div className="card">
        <EntidadExternaTable onEdit={handleEdit} />
      </div>
      <EntidadExternaFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default EntidadesExternasPage;