// src/domains/formativa/pages/RequisitosModalidadPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import RequisitoModalidadTable from '../components/requisitoModalidad/RequisitoModalidadTable';
import RequisitoModalidadFormModal from '../components/requisitoModalidad/RequisitoModalidadFormModal';

const RequisitosModalidadPage = () => {
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
        <h4 className="m-0">Requisitos de Modalidad</h4>
        <Button label="Nuevo Requisito" icon="pi pi-plus" onClick={handleNew} />
      </div>
      <div className="card">
        <RequisitoModalidadTable onEdit={handleEdit} />
      </div>
      <RequisitoModalidadFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default RequisitosModalidadPage;