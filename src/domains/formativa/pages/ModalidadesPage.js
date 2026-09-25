// src/domains/formativa/pages/ModalidadesPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import ModalidadTable from '../components/modalidad/ModalidadTable';
import ModalidadFormModal from '../components/modalidad/ModalidadFormModal';

const ModalidadesPage = () => {
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
        <h4 className="m-0">Modalidades</h4>
        <Button label="Nueva Modalidad" icon="pi pi-plus" onClick={handleNew} />
      </div>
      <div className="card">
        <ModalidadTable onEdit={handleEdit} />
      </div>
      <ModalidadFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default ModalidadesPage;