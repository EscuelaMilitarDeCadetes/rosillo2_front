// src/domains/formativa/pages/VinculosProyectoPage.js
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import VinculoProyectoTable from '../components/procesoFormativoXProyecto/VinculoProyectoTable';
import VinculoProyectoFormModal from '../components/procesoFormativoXProyecto/VinculoProyectoFormModal';

const VinculosProyectoPage = () => {
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
        <h4 className="m-0">Vinculaciones Proceso-Proyecto Formal</h4>
        <Button label="Nueva Vinculación" icon="pi pi-plus" onClick={handleNew} />
      </div>
      <div className="card">
        <VinculoProyectoTable onEdit={handleEdit} />
      </div>
      <VinculoProyectoFormModal
        visible={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default VinculosProyectoPage;